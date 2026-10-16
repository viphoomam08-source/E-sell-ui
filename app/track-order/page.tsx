'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { PackageSearch, Search, Truck } from 'lucide-react';
import Footer from '../component/Footer';

type OrderRecord = Record<string, unknown>;
type OrderStatusUpdate = {
  order_code: string;
  status: string;
  updated_at: string;
};

function isRecord(value: unknown): value is OrderRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getOrderRecord(payload: unknown): OrderRecord | null {
  if (!isRecord(payload)) return null;

  const data = isRecord(payload.data) ? payload.data : null;
  const candidates = [
    payload.order,
    data?.order,
    data?.data,
    payload.data,
    payload,
  ];

  return candidates.find(
    (candidate): candidate is OrderRecord =>
      isRecord(candidate) &&
      ['order_code', 'tracking_code', 'status', 'order_status', 'shipping_address'].some(
        (key) => key in candidate,
      ),
  ) ?? null;
}

function getText(record: OrderRecord, keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value;
    if (typeof value === 'number') return String(value);
  }
  return '';
}

async function lookupOrder(code: string): Promise<OrderRecord> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '');
  if (!baseUrl) {
    throw new Error('Order tracking is unavailable because the API URL is not configured.');
  }

  const response = await fetch(
    `${baseUrl}/api/track-order/${encodeURIComponent(code)}`,
    { headers: { Accept: 'application/json' } },
  );
  const payload: unknown = await response.json();

  if (!response.ok) {
    const message = isRecord(payload) && typeof payload.message === 'string'
      ? payload.message
      : response.status === 404
        ? 'No order was found with that tracking code.'
        : 'Unable to retrieve this order right now.';
    throw new Error(message);
  }

  const orderRecord = getOrderRecord(payload);
  if (!orderRecord) {
    const message = isRecord(payload) && typeof payload.message === 'string'
      ? payload.message
      : 'The tracking service returned no order details.';
    throw new Error(message);
  }

  return orderRecord;
}

function TrackingContent() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get('code')?.trim() ?? '';
  const [orderCode, setOrderCode] = useState(initialCode);
  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [loading, setLoading] = useState(Boolean(initialCode));
  const [error, setError] = useState('');
  const [liveNotice, setLiveNotice] = useState('');
  const currentStatusRef = useRef('');

  const trackOrder = async (code: string) => {
    setLoading(true);
    setError('');
    setLiveNotice('');
    setOrder(null);

    try {
      setOrder(await lookupOrder(code));
    } catch (trackingError) {
      console.error('Order tracking failed:', trackingError);
      setError(
        trackingError instanceof Error
          ? trackingError.message
          : 'Unable to retrieve this order right now.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialCode) return;

    let cancelled = false;
    const loadOrder = async () => {
      try {
        const result = await lookupOrder(initialCode);
        if (!cancelled) setOrder(result);
      } catch (trackingError) {
        console.error('Order tracking failed:', trackingError);
        if (!cancelled) {
          setError(
            trackingError instanceof Error
              ? trackingError.message
              : 'Unable to retrieve this order right now.',
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadOrder();
    return () => {
      cancelled = true;
    };
  }, [initialCode]);

  const trackedOrderCode = order
    ? getText(order, ['order_code', 'tracking_code']) || orderCode
    : '';
  const buyerId = order ? getText(order, ['buyer_id']) : '';
  const currentOrderStatus = order ? getText(order, ['status', 'order_status']) : '';

  useEffect(() => {
    currentStatusRef.current = currentOrderStatus;
  }, [currentOrderStatus]);

  useEffect(() => {
    if (!trackedOrderCode) return;

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '');
    if (!apiBaseUrl) return;

    let cancelled = false;
    let echo: import('laravel-echo').default<'reverb'> | null = null;

    const updateStatus = (status: string, isRealtime = false) => {
      if (cancelled || !status || status === currentStatusRef.current) return;

      currentStatusRef.current = status;
      setOrder((currentOrder) => currentOrder
        ? { ...currentOrder, status }
        : currentOrder);
      setLiveNotice(
        `${isRealtime ? 'Live update' : 'Order status refreshed'}: order ${trackedOrderCode} is now ${status}.`,
      );
    };

    const refreshOrder = async () => {
      try {
        const latestOrder = await lookupOrder(trackedOrderCode);
        if (!cancelled) {
          updateStatus(getText(latestOrder, ['status', 'order_status']));
        }
      } catch (refreshError) {
        console.error('Order status refresh failed:', refreshError);
      }
    };

    const refreshTimer = window.setInterval(() => {
      void refreshOrder();
    }, 15000);

    const connectToLiveUpdates = async () => {
      const token = localStorage.getItem('access_token')
        || localStorage.getItem('token')
        || localStorage.getItem('jwt_token');
      const reverbKey = process.env.NEXT_PUBLIC_REVERB_APP_KEY;

      if (!token || !buyerId || !reverbKey) return;

      try {
        const [{ default: Echo }, { default: PusherClient }] = await Promise.all([
          import('laravel-echo'),
          import('pusher-js'),
        ]);
        if (cancelled) return;

        const scheme = process.env.NEXT_PUBLIC_REVERB_SCHEME || 'http';
        const apiHost = new URL(apiBaseUrl).hostname;
        const websocketPort = Number(process.env.NEXT_PUBLIC_REVERB_PORT || 8080);

        echo = new Echo({
          broadcaster: 'reverb',
          client: new PusherClient(reverbKey, {
            cluster: 'mt1',
            wsHost: process.env.NEXT_PUBLIC_REVERB_HOST || apiHost,
            wsPort: websocketPort,
            wssPort: websocketPort,
            forceTLS: scheme === 'https',
            enabledTransports: scheme === 'https' ? ['wss'] : ['ws'],
            authEndpoint: `${apiBaseUrl}/broadcasting/auth`,
            auth: {
              headers: { Authorization: `Bearer ${token}` },
            },
          }),
        });

        echo
          .private(`orders.${trackedOrderCode}`)
          .listen('.order.status.changed', (event: OrderStatusUpdate) => {
            if (event.order_code === trackedOrderCode) updateStatus(event.status, true);
          });
      } catch (connectionError) {
        console.error('Live order updates failed to connect:', connectionError);
      }
    };

    void connectToLiveUpdates();

    return () => {
      cancelled = true;
      window.clearInterval(refreshTimer);
      if (echo) {
        echo.leave(`orders.${trackedOrderCode}`);
        echo.disconnect();
      }
    };
  }, [trackedOrderCode, buyerId]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const code = orderCode.trim();
    if (code) void trackOrder(code);
  };

  const status = order ? getText(order, ['status', 'order_status']) : '';
  const details = order
    ? [
        { label: 'Order code', value: getText(order, ['order_code', 'tracking_code']) || orderCode },
        { label: 'Shipping address', value: getText(order, ['shipping_address', 'address']) },
        { label: 'Total', value: getText(order, ['total_amount', 'total']) },
        { label: 'Order date', value: getText(order, ['created_at', 'order_date']) },
      ].filter((item) => item.value)
    : [];

  return (
    <>
      <main className="min-h-[65vh] bg-slate-50 px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
              <PackageSearch className="h-7 w-7" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">មើលស្ថានភាពការorder របស់អ្នក</h1>
            <p className="mt-2 text-sm text-slate-600">
              វាយ លេខ order ដែលអ្នកបានទទួលបានពីការ checkout.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
            <label className="sr-only" htmlFor="order-code">Order tracking code</label>
            <input
              id="order-code"
              value={orderCode}
              onChange={(event) => setOrderCode(event.target.value)}
              placeholder="e.g. ORD-12345"
              required
              className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
            <button
              type="submit"
              disabled={loading || !orderCode.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Search className="h-4 w-4" />
              {loading ? 'Checking...' : 'Track order'}
            </button>
          </form>

          {loading && (
            <div role="status" className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5 text-center text-sm text-blue-800">
              Looking up your order...
            </div>
          )}

          {error && (
            <div role="alert" className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
              {error}
            </div>
          )}

          {liveNotice && (
            <div role="status" aria-live="polite" className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
              {liveNotice}
            </div>
          )}

          {order && !loading && (
            <section aria-live="polite" className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50 px-5 py-4">
                <Truck className="h-5 w-5 text-blue-600" />
                <div>
                  <h2 className="font-semibold text-slate-900">Order status</h2>
                  <p className="text-sm text-slate-600">{status || 'Status not available'}</p>
                </div>
              </div>
              <dl className="divide-y divide-slate-100 px-5">
                {details.map(({ label, value }) => (
                  <div key={label} className="flex flex-col gap-1 py-4 sm:flex-row sm:justify-between">
                    <dt className="text-sm text-slate-500">{label}</dt>
                    <dd className="break-words text-sm font-medium text-slate-900 sm:max-w-[65%] sm:text-right">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="min-h-[65vh] bg-slate-50" />}>
      <TrackingContent />
    </Suspense>
  );
}
