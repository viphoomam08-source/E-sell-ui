'use client';

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { Bell, CheckCheck, PackageCheck, X } from 'lucide-react';

type OrderSummary = {
  order_code: string;
  status: string;
};

type OrderStatusUpdate = {
  order_code: string;
  status: string;
  updated_at: string;
};

type BuyerNotification = {
  id: string;
  orderCode: string;
  status: string;
  createdAt: string;
  read: boolean;
};

type BuyerSession = {
  isBuyer: boolean;
  storageKey: string | null;
};

const NOTIFICATIONS_CHANGED_EVENT = 'frontstore-order-notifications-changed';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  shipped: 'On the way',
  shipping: 'On the way',
  delivering: 'On the way',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getNotificationStorageKey(): string | null {
  try {
    const user: unknown = JSON.parse(localStorage.getItem('user') || 'null');
    if (!isRecord(user)) return null;

    const buyer = isRecord(user.buyers) ? user.buyers : null;
    const identity = user.id || user.buyer_id || buyer?.id || user.email || buyer?.email || user.username;
    return typeof identity === 'string' || typeof identity === 'number'
      ? `frontstore-order-notifications:${identity}`
      : null;
  } catch (error) {
    console.error('Unable to read the signed-in buyer profile:', error);
    return null;
  }
}

function getBuyerSessionSnapshot(): string {
  if (typeof window === 'undefined') return '';

  const token = localStorage.getItem('access_token')
    || localStorage.getItem('token')
    || localStorage.getItem('jwt_token');
  return JSON.stringify({
    isBuyer: localStorage.getItem('user_role') === 'buyer' && Boolean(token),
    storageKey: getNotificationStorageKey(),
  });
}

function subscribeToBuyerSession(onChange: () => void) {
  window.addEventListener('storage', onChange);
  return () => window.removeEventListener('storage', onChange);
}

function parseBuyerSession(snapshot: string): BuyerSession {
  if (!snapshot) return { isBuyer: false, storageKey: null };

  try {
    const parsed: unknown = JSON.parse(snapshot);
    if (isRecord(parsed)) {
      return {
        isBuyer: parsed.isBuyer === true,
        storageKey: typeof parsed.storageKey === 'string' ? parsed.storageKey : null,
      };
    }
  } catch (error) {
    console.error('Unable to read the buyer session:', error);
  }

  return { isBuyer: false, storageKey: null };
}

function parseOrderList(payload: unknown): OrderSummary[] {
  if (!isRecord(payload) || !Array.isArray(payload.data)) return [];

  return payload.data.filter(
    (order): order is OrderSummary =>
      isRecord(order) &&
      typeof order.order_code === 'string' &&
      typeof order.status === 'string',
  );
}

function parseNotifications(value: string | null): BuyerNotification[] {
  if (!value) return [];

  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (notification): notification is BuyerNotification =>
        isRecord(notification) &&
        typeof notification.id === 'string' &&
        typeof notification.orderCode === 'string' &&
        typeof notification.status === 'string' &&
        typeof notification.createdAt === 'string' &&
        typeof notification.read === 'boolean',
    );
  } catch (error) {
    console.error('Unable to read saved order notifications:', error);
    return [];
  }
}

async function fetchBuyerOrders(apiBaseUrl: string, token: string): Promise<OrderSummary[]> {
  const response = await fetch(`${apiBaseUrl}/api/buyer-orders`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  const payload: unknown = await response.json();

  if (!response.ok) {
    const message = isRecord(payload) && typeof payload.message === 'string'
      ? payload.message
      : 'Unable to load your order notifications.';
    throw new Error(message);
  }

  return parseOrderList(payload);
}

export default function OrderNotifications() {
  const sessionSnapshot = useSyncExternalStore(
    subscribeToBuyerSession,
    getBuyerSessionSnapshot,
    () => '',
  );
  const { isBuyer, storageKey } = parseBuyerSession(sessionSnapshot);
  const [isOpen, setIsOpen] = useState(false);
  const [latestNotification, setLatestNotification] = useState<BuyerNotification | null>(null);
  const [error, setError] = useState('');
  const subscribeToNotifications = useCallback((onChange: () => void) => {
    window.addEventListener('storage', onChange);
    window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, onChange);
    return () => {
      window.removeEventListener('storage', onChange);
      window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, onChange);
    };
  }, []);
  const getNotificationsSnapshot = useCallback(
    () => storageKey ? localStorage.getItem(storageKey) || '[]' : '[]',
    [storageKey],
  );
  const notificationSnapshot = useSyncExternalStore(
    subscribeToNotifications,
    getNotificationsSnapshot,
    () => '[]',
  );
  const notifications = parseNotifications(notificationSnapshot);

  const saveNotifications = useCallback((
    update: (current: BuyerNotification[]) => BuyerNotification[],
  ) => {
    if (!storageKey) return;

    const currentNotifications = parseNotifications(localStorage.getItem(storageKey));
    const nextNotifications = update(currentNotifications);
    localStorage.setItem(storageKey, JSON.stringify(nextNotifications));
    window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED_EVENT));
  }, [storageKey]);

  useEffect(() => {
    if (!isBuyer) return;

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '');
    const token = localStorage.getItem('access_token')
      || localStorage.getItem('token')
      || localStorage.getItem('jwt_token');

    if (!apiBaseUrl || !token) {
      return;
    }

    let cancelled = false;
    let echo: import('laravel-echo').default<'reverb'> | null = null;
    let syncTimer: number | undefined;
    const orderStatuses = new Map<string, string>();

    const receiveStatus = (update: OrderStatusUpdate) => {
      if (cancelled || !update.order_code || !update.status) return;

      const previousStatus = orderStatuses.get(update.order_code);
      orderStatuses.set(update.order_code, update.status);

      if (!previousStatus || previousStatus === update.status) return;

      const notification: BuyerNotification = {
        id: `${update.order_code}:${update.status}:${update.updated_at}`,
        orderCode: update.order_code,
        status: update.status,
        createdAt: update.updated_at || new Date().toISOString(),
        read: false,
      };

      saveNotifications((current) => {
        return current.some((item) => item.id === notification.id)
          ? current
          : [notification, ...current].slice(0, 30);
      });
      setLatestNotification(notification);
      window.setTimeout(() => {
        setLatestNotification((current) => current?.id === notification.id ? null : current);
      }, 7000);
    };

    const syncOrders = async (subscribeToUpdates: boolean) => {
      const orders = await fetchBuyerOrders(apiBaseUrl, token);
      if (cancelled) return;

      orders.forEach((order) => {
        const previousStatus = orderStatuses.get(order.order_code);
        if (previousStatus) {
          receiveStatus({
            order_code: order.order_code,
            status: order.status,
            updated_at: new Date().toISOString(),
          });
        } else {
          orderStatuses.set(order.order_code, order.status);
        }
      });

      if (!subscribeToUpdates) return;

      const reverbKey = process.env.NEXT_PUBLIC_REVERB_APP_KEY;
      if (!reverbKey) {
        setError('Live notifications are not configured. Check the Reverb settings.');
        return;
      }

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
          authEndpoint: `${apiBaseUrl}/broadcasting/auth`,
          auth: {
            headers: { Authorization: `Bearer ${token}` },
          },
        }),
      });

      orders.forEach(({ order_code }) => {
        echo?.private(`orders.${order_code}`)
          .listen('.order.status.changed', receiveStatus);
      });

      syncTimer = window.setInterval(() => {
        void syncOrders(false).catch((syncError: unknown) => {
          console.error('Order notification refresh failed:', syncError);
        });
      }, 15000);
    };

    void Promise.resolve().then(() => {
      if (!apiBaseUrl || !token) {
        throw new Error('Order notifications are unavailable. Check your API configuration and sign-in.');
      }

      return syncOrders(true);
    }).catch((loadError: unknown) => {
      console.error('Unable to initialize buyer order notifications:', loadError);
      if (!cancelled) {
        setError(loadError instanceof Error
          ? loadError.message
          : 'Unable to load your order notifications.');
      }
    });

    return () => {
      cancelled = true;
      if (syncTimer !== undefined) window.clearInterval(syncTimer);
      echo?.disconnect();
    };
  }, [isBuyer, saveNotifications, storageKey]);

  if (!isBuyer) return null;

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  const markAsRead = (id: string) => {
    saveNotifications((current) =>
      current.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    );
  };

  const markAllAsRead = () => {
    saveNotifications((current) =>
      current.map((notification) => ({ ...notification, read: true })),
    );
  };

  return (
    <>
      {latestNotification && (
        <div
          role="status"
          aria-live="polite"
          className="fixed right-4 top-20 z-[10000] flex w-[min(24rem,calc(100vw-2rem))] items-start gap-3 rounded-2xl border border-blue-100 bg-white p-4 text-slate-800 shadow-2xl"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <PackageCheck className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold">Order status updated</p>
            <p className="mt-1 text-xs text-slate-600">
              {latestNotification.orderCode} is now {STATUS_LABELS[latestNotification.status] || latestNotification.status}.
            </p>
            <Link
              href={`/track-order?code=${encodeURIComponent(latestNotification.orderCode)}`}
              className="mt-2 inline-block text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Track this order
            </Link>
          </div>
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => setLatestNotification(null)}
            className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
          aria-expanded={isOpen}
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white transition hover:bg-white/20"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-blue-700">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {isOpen && (
          <>
            <button
              type="button"
              aria-label="Close notifications"
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[9997] cursor-default"
            />
            <section
              aria-label="Order notifications"
              className="absolute right-0 z-[9998] mt-3 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-800 shadow-2xl"
            >
              <header className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <div>
                  <h2 className="text-sm font-bold">Notifications</h2>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {unreadCount > 0 ? `${unreadCount} unread order update${unreadCount === 1 ? '' : 's'}` : 'Your order updates appear here'}
                  </p>
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    Mark all read
                  </button>
                )}
              </header>

              {error && (
                <p role="alert" className="border-b border-amber-100 bg-amber-50 px-4 py-3 text-xs text-amber-800">
                  {error}
                </p>
              )}

              {notifications.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <Bell className="mx-auto h-7 w-7 text-slate-300" />
                  <p className="mt-3 text-sm font-semibold text-slate-700">No notifications yet</p>
                  <p className="mt-1 text-xs text-slate-500">Order status updates will show up here.</p>
                </div>
              ) : (
                <ul className="max-h-[min(60vh,24rem)] divide-y divide-slate-100 overflow-y-auto">
                  {notifications.map((notification) => (
                    <li key={notification.id}>
                      <Link
                        href={`/track-order?code=${encodeURIComponent(notification.orderCode)}`}
                        onClick={() => {
                          markAsRead(notification.id);
                          setIsOpen(false);
                        }}
                        className={`flex gap-3 px-4 py-3 transition hover:bg-slate-50 ${
                          notification.read ? 'bg-white' : 'bg-blue-50/60'
                        }`}
                      >
                        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                          <PackageCheck className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-slate-800">Order status updated</span>
                            {!notification.read && <span className="h-2 w-2 shrink-0 rounded-full bg-blue-600" />}
                          </span>
                          <span className="mt-1 block truncate text-xs text-slate-600">
                            {notification.orderCode} is now {STATUS_LABELS[notification.status] || notification.status}.
                          </span>
                          <time className="mt-1 block text-[10px] text-slate-400">
                            {new Date(notification.createdAt).toLocaleString()}
                          </time>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </>
  );
}
