'use client';

import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { Bell, Check, PackageCheck } from 'lucide-react';

type SellerSession = {
  sellerId: string;
  token: string;
  storageKey: string;
};

type SellerOrderNotification = {
  id: string;
  orderCode: string;
  buyerName: string;
  items: string[];
  createdAt: string;
  read: boolean;
};

type SellerOrderPlaced = {
  order_code: string;
  buyer_name: string;
  created_at: string;
  items: { product_name: string; quantity: number }[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readSellerSession(): SellerSession | null {
  const role = localStorage.getItem('user_role');
  const token = localStorage.getItem('access_token')
    || localStorage.getItem('token')
    || localStorage.getItem('jwt_token');

  if (role !== 'seller' || !token) return null;

  try {
    const user: unknown = JSON.parse(localStorage.getItem('user') || 'null');
    if (!isRecord(user)) return null;

    const seller = isRecord(user.seller) ? user.seller : user;
    const id = seller.id || seller.seller_id;
    if (typeof id !== 'string' && typeof id !== 'number') return null;

    const sellerId = String(id);
    return {
      sellerId,
      token,
      storageKey: `frontstore-seller-order-notifications:${sellerId}`,
    };
  } catch (error) {
    console.error('Unable to read the signed-in seller profile:', error);
    return null;
  }
}

function getSellerSessionSnapshot(): string {
  if (typeof window === 'undefined') return '';
  const session = readSellerSession();
  return session ? JSON.stringify(session) : '';
}

function subscribeToSellerSession(onChange: () => void) {
  window.addEventListener('storage', onChange);
  return () => window.removeEventListener('storage', onChange);
}

function parseSellerSession(snapshot: string): SellerSession | null {
  if (!snapshot) return null;

  try {
    const value: unknown = JSON.parse(snapshot);
    if (
      isRecord(value)
      && typeof value.sellerId === 'string'
      && typeof value.token === 'string'
      && typeof value.storageKey === 'string'
    ) {
      return {
        sellerId: value.sellerId,
        token: value.token,
        storageKey: value.storageKey,
      };
    }
  } catch (error) {
    console.error('Unable to read the seller session:', error);
  }

  return null;
}

function readNotifications(storageKey: string): SellerOrderNotification[] {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(storageKey) || '[]');
    if (!Array.isArray(saved)) return [];

    return saved.filter(
      (item): item is SellerOrderNotification =>
        isRecord(item)
        && typeof item.id === 'string'
        && typeof item.orderCode === 'string'
        && typeof item.buyerName === 'string'
        && Array.isArray(item.items)
        && item.items.every((name) => typeof name === 'string')
        && typeof item.createdAt === 'string'
        && typeof item.read === 'boolean',
    );
  } catch (error) {
    console.error('Unable to read saved seller order notifications:', error);
    return [];
  }
}

function isSellerOrderPlaced(value: unknown): value is SellerOrderPlaced {
  return isRecord(value)
    && typeof value.order_code === 'string'
    && typeof value.buyer_name === 'string'
    && typeof value.created_at === 'string'
    && Array.isArray(value.items)
    && value.items.every((item) =>
      isRecord(item)
      && typeof item.product_name === 'string'
      && typeof item.quantity === 'number',
    );
}

export default function SellerOrderNotifications({
  onOpenOrders,
}: {
  onOpenOrders: () => void;
}) {
  const sessionSnapshot = useSyncExternalStore(
    subscribeToSellerSession,
    getSellerSessionSnapshot,
    () => '',
  );
  const session = useMemo(() => parseSellerSession(sessionSnapshot), [sessionSnapshot]);
  const [notifications, setNotifications] = useState<SellerOrderNotification[]>([]);
  const [latestNotification, setLatestNotification] = useState<SellerOrderNotification | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [connectionError, setConnectionError] = useState('');

  useEffect(() => {
    if (!session) return;

    const syncNotifications = () => {
      setNotifications(readNotifications(session.storageKey));
    };

    syncNotifications();
    window.addEventListener('storage', syncNotifications);
    return () => window.removeEventListener('storage', syncNotifications);
  }, [session]);

  useEffect(() => {
    if (!session) return;

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '');
    const reverbKey = process.env.NEXT_PUBLIC_REVERB_APP_KEY;
    if (!apiBaseUrl || !reverbKey) return;

    let cancelled = false;
    let echo: import('laravel-echo').default<'reverb'> | null = null;

    const connect = async () => {
      const [{ default: Echo }, { default: PusherClient }] = await Promise.all([
        import('laravel-echo'),
        import('pusher-js'),
      ]);
      if (cancelled) return;

      const scheme = process.env.NEXT_PUBLIC_REVERB_SCHEME || 'http';
      const websocketPort = Number(process.env.NEXT_PUBLIC_REVERB_PORT || 8082);
      echo = new Echo({
        broadcaster: 'reverb',
        client: new PusherClient(reverbKey, {
          cluster: 'mt1',
          wsHost: process.env.NEXT_PUBLIC_REVERB_HOST || new URL(apiBaseUrl).hostname,
          wsPort: websocketPort,
          wssPort: websocketPort,
          forceTLS: scheme === 'https',
          enabledTransports: scheme === 'https' ? ['wss'] : ['ws'],
          authEndpoint: `${apiBaseUrl}/seller/broadcasting/auth`,
          auth: {
            headers: { Authorization: `Bearer ${session.token}` },
          },
        }),
      });

      echo.private(`sellers.${session.sellerId}.orders`)
        .listen('.seller.order.placed', (payload: unknown) => {
          if (!isSellerOrderPlaced(payload)) {
            console.error('Received an invalid seller order notification payload.');
            return;
          }

          const notification: SellerOrderNotification = {
            id: `${payload.order_code}:${payload.created_at}`,
            orderCode: payload.order_code,
            buyerName: payload.buyer_name,
            items: payload.items.map((item) => `${item.product_name} × ${item.quantity}`),
            createdAt: payload.created_at,
            read: false,
          };

          const currentNotifications = readNotifications(session.storageKey);
          if (currentNotifications.some((item) => item.id === notification.id)) return;

          const nextNotifications = [notification, ...currentNotifications].slice(0, 30);
          localStorage.setItem(session.storageKey, JSON.stringify(nextNotifications));
          setNotifications(nextNotifications);
          setLatestNotification(notification);
          window.setTimeout(() => {
            setLatestNotification((current) => current?.id === notification.id ? null : current);
          }, 7000);
        });
      setConnectionError('');
    };

    void connect().catch((error: unknown) => {
      console.error('Unable to connect to live seller order notifications:', error);
      if (!cancelled) {
        setConnectionError('Could not connect to live order alerts. Check the API and Reverb servers.');
      }
    });

    return () => {
      cancelled = true;
      echo?.disconnect();
    };
  }, [session]);

  if (!session) return null;

  const unreadCount = notifications.filter((notification) => !notification.read).length;
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '');
  const reverbKey = process.env.NEXT_PUBLIC_REVERB_APP_KEY;
  const configurationError = !apiBaseUrl || !reverbKey
    ? 'Live order alerts are not configured.'
    : '';

  const openOrder = (id: string) => {
    const next = notifications.map((notification) =>
      notification.id === id ? { ...notification, read: true } : notification,
    );
    setNotifications(next);
    localStorage.setItem(session.storageKey, JSON.stringify(next));
    setIsOpen(false);
    onOpenOrders();
  };

  return (
    <>
      {latestNotification && (
        <div
          role="status"
          aria-live="polite"
          className="fixed right-4 top-4 z-[10000] flex w-[min(24rem,calc(100vw-2rem))] items-start gap-3 rounded-2xl border border-emerald-100 bg-white p-4 text-slate-800 shadow-2xl"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <PackageCheck className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-bold">New order received</p>
            <p className="mt-1 text-xs text-slate-600">
              {latestNotification.orderCode} from {latestNotification.buyerName}
            </p>
          </div>
        </div>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          aria-label={`Seller order notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
          aria-expanded={isOpen}
          className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-rose-600 px-1 text-[10px] font-bold leading-5 text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {isOpen && (
          <div className="absolute right-0 z-[100] mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-800 shadow-xl">
            <div className="border-b border-slate-100 px-4 py-3">
              <h2 className="text-sm font-bold">New orders</h2>
              {(connectionError || configurationError) && (
                <p className="mt-1 text-xs text-rose-600">{connectionError || configurationError}</p>
              )}
            </div>
            {notifications.length === 0 ? (
              <p className="p-5 text-center text-sm text-slate-500">No new orders yet.</p>
            ) : (
              <ul className="max-h-80 overflow-y-auto">
                {notifications.map((notification) => (
                  <li key={notification.id} className="border-b border-slate-100 last:border-0">
                    <button
                      type="button"
                      onClick={() => openOrder(notification.id)}
                      className={`w-full px-4 py-3 text-left transition hover:bg-slate-50 ${
                        notification.read ? 'bg-white' : 'bg-emerald-50/50'
                      }`}
                    >
                      <span className="flex items-center justify-between gap-2 text-sm font-semibold">
                        <span>{notification.orderCode}</span>
                        {!notification.read && <span className="h-2 w-2 rounded-full bg-emerald-600" />}
                      </span>
                      <span className="mt-1 block text-xs text-slate-600">
                        {notification.buyerName} ordered {notification.items.join(', ')}
                      </span>
                      <span className="mt-2 flex items-center gap-1 text-xs font-medium text-blue-600">
                        <Check className="h-3 w-3" /> View orders
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </>
  );
}
