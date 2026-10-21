'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import Image from 'next/image';
import { CheckCircle2, Clock, PackageCheck, PackageSearch, Truck, XCircle } from 'lucide-react';
import logoImage from '@/app/image/e.png';

type OrderRecord = Record<string, unknown>;

const ORDER_CODE_KEY = 'latest_order_code';
const DISMISSED_ORDER_KEY = 'latest_order_progress_dismissed';
const ORDER_CODE_EVENT = 'latest-order-code-changed';

const steps = [
  { id: 1, title: 'Pending', description: 'រង់ចាំពិនិត្យ', icon: Clock },
  { id: 2, title: 'Confirmed', description: 'បានបញ្ជាក់', icon: CheckCircle2 },
  { id: 3, title: 'Shipping', description: 'កំពុងដឹកជញ្ជូន', icon: Truck },
  { id: 4, title: 'Delivered', description: 'បានប្រគល់', icon: PackageCheck },
  { id: 5, title: 'Cancelled', description: 'បានបោះបង់', icon: XCircle },
];

function subscribeToOrderCode(onChange: () => void) {
  window.addEventListener('storage', onChange);
  window.addEventListener(ORDER_CODE_EVENT, onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(ORDER_CODE_EVENT, onChange);
  };
}

function getOrderCodeSnapshot() {
  return window.localStorage.getItem(ORDER_CODE_KEY)?.trim() ?? '';
}

function getDismissedSnapshot() {
  return window.localStorage.getItem(DISMISSED_ORDER_KEY) === 'true';
}

function getServerOrderCodeSnapshot() {
  return '';
}

function isRecord(value: unknown): value is OrderRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getOrderRecord(payload: unknown): OrderRecord | null {
  if (!isRecord(payload) || !isRecord(payload.data)) return null;
  return payload.data;
}

export default function Progress() {
  const orderCode = useSyncExternalStore(
    subscribeToOrderCode,
    getOrderCodeSnapshot,
    getServerOrderCodeSnapshot,
  );
  const isDismissed = useSyncExternalStore(
    subscribeToOrderCode,
    getDismissedSnapshot,
    () => false,
  );
  const [orderResult, setOrderResult] = useState({ orderCode: '', status: '', error: '' });
  const [showDeliveredAlert, setShowDeliveredAlert] = useState(false);
  const [showCancelledAlert, setShowCancelledAlert] = useState(false);
  const [alertedOrderCode, setAlertedOrderCode] = useState('');
  const cancellationAlertOrderCode = useRef('');

  useEffect(() => {
    if (!orderCode) return;

    let cancelled = false;
    const refreshOrder = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '');
        if (!baseUrl) {
          throw new Error('Order tracking is unavailable because the API URL is not configured.');
        }

        const response = await fetch(
          `${baseUrl}/api/track-order/${encodeURIComponent(orderCode)}`,
          { headers: { Accept: 'application/json' }, cache: 'no-store' },
        );
        const payload: unknown = await response.json();
        if (!response.ok) {
          const message = isRecord(payload) && typeof payload.message === 'string'
            ? payload.message
            : 'Unable to retrieve this order right now.';
          throw new Error(message);
        }

        const order = getOrderRecord(payload);
        if (!order || typeof order.status !== 'string') {
          throw new Error('The tracking service returned no order status.');
        }

        if (!cancelled) {
          setOrderResult({ orderCode, status: order.status, error: '' });
          if (order.status.toLowerCase() === 'delivered' && alertedOrderCode !== orderCode) {
            setAlertedOrderCode(orderCode);
            setShowDeliveredAlert(true);
          }
        }
      } catch (trackingError) {
        console.error('Order tracking failed:', trackingError);
        if (!cancelled) {
          setOrderResult({
            orderCode,
            status: '',
            error: trackingError instanceof Error
              ? trackingError.message
              : 'Unable to retrieve this order right now.',
          });
        }
      }
    };

    void refreshOrder();
    const timer = window.setInterval(() => void refreshOrder(), 15000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [alertedOrderCode, orderCode]);

  const status = orderResult.orderCode === orderCode ? orderResult.status : '';
  const error = orderResult.orderCode === orderCode ? orderResult.error : '';
  const normalizedStatus = status.toLowerCase();
  const isCancelled = normalizedStatus.includes('cancel') || normalizedStatus.includes('បោះបង់');
  const isDelivered = normalizedStatus === 'delivered';
  const currentStep = !orderCode
    ? 0
    : isCancelled
      ? 5
      : normalizedStatus.includes('deliver') || normalizedStatus.includes('complete')
      ? 4
      : normalizedStatus.includes('ship')
        ? 3
        : normalizedStatus.includes('confirm') || normalizedStatus.includes('process')
          ? 2
          : 1;
  const progressWidth = Math.max(0, ((currentStep - 1) / (steps.length - 1)) * 100);
  const displayStatus = isCancelled
    ? 'បានបោះបង់'
    : isDelivered
      ? 'បានដឹកជញ្ជូន'
      : status;

  const dismissOrderProgress = () => {
    window.localStorage.setItem(DISMISSED_ORDER_KEY, 'true');
    window.localStorage.removeItem(ORDER_CODE_KEY);
    window.dispatchEvent(new Event(ORDER_CODE_EVENT));
    setShowDeliveredAlert(false);
    setShowCancelledAlert(false);
  };

  useEffect(() => {
    if (!isCancelled || !orderCode || cancellationAlertOrderCode.current === orderCode) return;

    cancellationAlertOrderCode.current = orderCode;
    let dismissTimer: number | undefined;
    const showTimer = window.setTimeout(() => {
      setShowCancelledAlert(true);
      dismissTimer = window.setTimeout(dismissOrderProgress, 7000);
    }, 0);
    return () => {
      window.clearTimeout(showTimer);
      if (dismissTimer !== undefined) window.clearTimeout(dismissTimer);
    };
  }, [isCancelled, orderCode]);

  if (isDismissed) return null;

  return (
    <section
      aria-label={orderCode ? `Order ${orderCode} progress: ${displayStatus}` : 'Order progress'}
      className="w-full rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-500 sm:p-6"
    >
      <div className="mb-6 flex items-center justify-between gap-4 border-b border-gray-100 pb-3">
        <div>
          <h3 className="flex items-center gap-2 text-base font-bold text-gray-900">
            <span className="h-5 w-2 rounded-full bg-blue-600" />
            ស្ថានភាពការបញ្ជាទិញ (Order Tracking)
          </h3>
          <p className="mt-0.5 text-[11px] text-gray-400">
            {orderCode ? `Order ID: #${orderCode}` : 'Your latest order progress will appear here.'}
          </p>
        </div>
        <div className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600">
          {displayStatus || (orderCode ? 'Loading status...' : 'No order yet')}
        </div>
      </div>

      {!orderCode && (
        <div className="flex items-center gap-2 py-2 text-sm text-slate-500">
          <PackageSearch className="h-5 w-5 text-blue-500" />
          Place an order and its progress will show here.
        </div>
      )}

      {error && (
        <p role="alert" className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      )}

      <div className="relative my-6 px-3 sm:px-6">
        <div className="absolute left-0 top-1/3 z-0 h-1.5 w-full -translate-y-1/2 rounded-full bg-gray-200" />
        {orderCode && !isCancelled && (
          <>
            <div
              className="absolute left-0 top-1/3 z-0 h-1.5 -translate-y-1/2 rounded-full bg-gradient-to-r from-yellow-400 via-blue-500 to-blue-600 transition-all duration-700 ease-in-out"
              style={{ width: `${progressWidth}%` }}
            />
            <div
              className="absolute top-1/3 z-20 -translate-y-1/2 transition-all duration-700 ease-in-out"
              style={{ left: `calc(${progressWidth}% - 24px)` }}
            >
              <div className="flex h-12 w-12 animate-bounce items-center justify-center overflow-hidden rounded-full border-2 border-blue-500 bg-white p-1 shadow-lg">
                <Image
                  src={logoImage}
                  alt="Order progress"
                  width={44}
                  height={44}
                  className="h-full w-full object-contain"
                />
              </div>
            </div>
          </>
        )}

        <div className="relative z-10 flex w-full items-center justify-between">
          {steps.map((step) => {
            const Icon = step.icon;
            const isCompleted = !isCancelled && step.id < currentStep;
            const isCurrent = step.id === currentStep;

            return (
              <div key={step.id} className="group flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border shadow-xs transition-all duration-500 ease-in-out sm:h-11 sm:w-11 ${
                    isCurrent && isCancelled
                      ? 'scale-105 animate-pulse border-rose-300 bg-rose-500 text-white shadow-md shadow-rose-400/30'
                      : isCurrent
                        ? 'scale-105 animate-pulse border-amber-300 bg-amber-400 text-slate-900 shadow-md shadow-amber-400/30'
                      : isCompleted
                        ? 'scale-100 border-blue-600 bg-blue-600 text-white'
                        : 'border-gray-200 bg-white text-gray-400'
                  }`}
                >
                  <Icon className={`h-5 w-5 transition-transform duration-300 ${isCurrent ? 'scale-110' : ''}`} />
                </div>
                <div className="mt-2 text-center">
                  <p className={`text-xs font-bold transition-colors duration-300 sm:text-sm ${
                    isCurrent && isCancelled
                      ? 'text-rose-600'
                      : isCurrent
                        ? 'text-amber-600'
                        : isCompleted
                          ? 'text-blue-600'
                          : 'text-gray-400'
                  }`}>
                    {step.title}
                  </p>
                  <p className="mt-0.5 hidden text-[10px] font-medium text-gray-400 sm:block">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showCancelledAlert && isCancelled && !isDismissed && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="cancelled-alert-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
            <XCircle className="mx-auto mb-3 h-12 w-12 text-rose-600" />
            <h2 id="cancelled-alert-title" className="text-lg font-bold text-slate-900">
              ការបញ្ជាទិញរបស់អ្នកត្រូវបានបោះបង់
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              សូមអភ័យទោស ការបញ្ជាទិញនេះត្រូវបានអ្នកលក់បោះបង់។
            </p>
            <p className="mt-3 text-xs text-slate-500">
              សារនេះនឹងបិទដោយស្វ័យប្រវត្តិក្នុងរយៈពេល ៧ វិនាទី។
            </p>
          </div>
        </div>
      )}

      {showDeliveredAlert && isDelivered && !isDismissed && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="delivered-alert-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
            <PackageCheck className="mx-auto mb-3 h-12 w-12 text-emerald-600" />
            <h2 id="delivered-alert-title" className="text-lg font-bold text-slate-900">
              ទំនិញរបស់អ្នកត្រូវបានដឹកជញ្ជូនដល់ហើយ!
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              សូមអរគុណសម្រាប់ការបញ្ជាទិញ។ សង្ឃឹមថាអ្នកពេញចិត្តនឹងផលិតផលរបស់យើង។
            </p>
            <button
              type="button"
              onClick={dismissOrderProgress}
              className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              យល់ព្រម
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
