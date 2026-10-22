'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import Image from 'next/image';
import { CheckCircle2, Clock, PackageCheck, PackageSearch, Truck, XCircle, Star, Check, Bell, BellRing } from 'lucide-react';
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

  // 🌟 States សម្រាប់ Sound, Review Popup និង Telegram
  const [rating, setRating] = useState<number>(5);
  const [review, setReview] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isTelegramSubscribed, setIsTelegramSubscribed] = useState(false);
  const [telegramLoading, setTelegramLoading] = useState(false);

  // 🔊 មុខងារលេងសំឡេង (Sound Effect Helper)
  const playSound = (type: 'click' | 'success') => {
    try {
      const audioPath = type === 'success' 
        ? 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3' 
        : 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3';
        
      const audio = new Audio(audioPath);
      audio.volume = 0.4;
      audio.play().catch((e) => console.log("Audio play blocked by browser:", e));
    } catch (error) {
      console.log("Audio error:", error);
    }
  };

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
            playSound('success');
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
    playSound('click');
  };

  // 📱 មុខងារភ្ជាប់ Telegram
  const handleToggleTelegram = async () => {
    setTelegramLoading(true);
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '');
      
      const chatId = prompt("សូមបញ្ចូល Telegram Chat ID របស់អ្នក (ឧទាហរណ៍ទទួលបានពី @userinfobot):");
      if (!chatId) {
        setTelegramLoading(false);
        return;
      }

      const res = await fetch(`${baseUrl}/api/buyer/update-telegram`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ telegram_chat_id: chatId })
      });

      const data = await res.json();
      if (data.status) {
        setIsTelegramSubscribed(true);
        playSound('success');
        alert("ភ្ជាប់ Telegram ទទួលបានដំណឹងជោគជ័យ!");
      } else {
        alert(data.message || "មានបញ្ហាខុសឆ្គង!");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTelegramLoading(false);
    }
  };

  useEffect(() => {
    if (!isCancelled || !orderCode || cancellationAlertOrderCode.current === orderCode) return;

    cancellationAlertOrderCode.current = orderCode;
    let dismissTimer: number | undefined;
    const showTimer = window.setTimeout(() => {
      setShowCancelledAlert(true);
      playSound('success');
      dismissTimer = window.setTimeout(dismissOrderProgress, 7000);
    }, 0);
    return () => {
      window.clearTimeout(showTimer);
      if (dismissTimer !== undefined) window.clearTimeout(dismissTimer);
    };
  }, [isCancelled, orderCode]);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    playSound('success');
    setIsSubmitted(true);
  };

  if (isDismissed) return null;

  return (
    <section
      aria-label={orderCode ? `Order ${orderCode} progress: ${displayStatus}` : 'Order progress'}
      className="w-full rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-500 sm:p-6 font-['Kantumruy_Pro']"
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

      {/* Progress Bar Container */}
      <div className="relative my-6 px-3 sm:px-6">
        <div className="absolute left-0 top-1/3 z-0 h-1.5 w-full -translate-y-1/2 rounded-full bg-gray-200" />
        {orderCode && !isCancelled && (
          <>
            <div
              className="absolute left-0 top-1/3 z-0 h-1.5 -translate-y-1/2 rounded-full bg-gradient-to-r from-yellow-400 via-blue-500 to-blue-600 transition-all duration-700 ease-in-out"
              style={{ width: `${progressWidth}%` }}
            />
            {/* 🎯 Custom Logo (e.png) រត់តាមបន្ទាត់ Progress */}
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

      {/* 🔔 Telegram Alert Toggle Button */}
      {orderCode && (
        <div className="mt-6 p-4 bg-blue-50/60 rounded-2xl border border-blue-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isTelegramSubscribed ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 border border-blue-200'}`}>
              {isTelegramSubscribed ? <BellRing size={20} /> : <Bell size={20} />}
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">ទទួលដំណឹងតាម Telegram</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {isTelegramSubscribed ? 'បានបើកដំណើរការទទួលដំណឹងស្វ័យប្រវត្តិ' : 'ទទួលបានសារแจ้งเตือนពេល Status ផ្លាស់ប្ដូរ'}
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={telegramLoading}
            onClick={handleToggleTelegram}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              isTelegramSubscribed ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {telegramLoading ? 'កំពុងដំណើរការ...' : isTelegramSubscribed ? <><Check size={14} /> បានបើក</> : 'Enable Telegram'}
          </button>
        </div>
      )}

      {/* Cancelled Alert Modal */}
      {showCancelledAlert && isCancelled && !isDismissed && (
        <div role="alertdialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
            <XCircle className="mx-auto mb-3 h-12 w-12 text-rose-600" />
            <h2 className="text-lg font-bold text-slate-900">ការបញ្ជាទិញរបស់អ្នកត្រូវបានបោះបង់</h2>
            <p className="mt-2 text-sm text-slate-600">សូមអភ័យទោស ការបញ្ជាទិញនេះត្រូវបានអ្នកលក់បោះបង់។</p>
          </div>
        </div>
      )}

      {/* Delivered & Review Popup Modal */}
      {showDeliveredAlert && isDelivered && !isDismissed && (
        <div role="alertdialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-gray-100 p-6 relative">
            {!isSubmitted ? (
              <div className="text-center">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 flex items-center justify-center mx-auto mb-3 shadow-sm">
                  <PackageCheck size={28} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Your product has been delivered!</h3>
                <p className="text-xs text-gray-400 mt-1">Please rate your experience with us.</p>

                <form onSubmit={handleSubmitReview} className="space-y-4 mt-4">
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => { setRating(star); playSound('click'); }}
                        className="cursor-pointer transition-transform hover:scale-110"
                      >
                        <Star size={26} className={`${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                      </button>
                    ))}
                  </div>

                  <textarea 
                    rows={2}
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    placeholder="Write a quick review..."
                    className="w-full p-3 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-blue-600 bg-gray-50 resize-none text-slate-900"
                  ></textarea>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={dismissOrderProgress}
                      className="w-1/3 py-2 rounded-xl text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition cursor-pointer"
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      className="w-2/3 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-md transition cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Check size={16} /> Submit
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="text-center py-4 space-y-2">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                  <Check size={24} />
                </div>
                <h4 className="text-base font-bold text-gray-900">Thank you for your feedback!</h4>
                <button 
                  onClick={dismissOrderProgress}
                  className="mt-3 px-5 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition cursor-pointer"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}