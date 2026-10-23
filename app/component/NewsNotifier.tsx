'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Bell, X } from 'lucide-react';
import Link from 'next/link';

interface NewsNotifierProps {
  onCountUpdate: (count: number) => void;
}

export default function NewsNotifier({ onCountUpdate }: NewsNotifierProps) {
  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });
  const [prevCount, setPrevCount] = useState<number | null>(null);

  const fetchNewsCount = useCallback(async () => {
    try {
      const token = typeof window !== 'undefined' 
        ? (localStorage.getItem('buyer_token') || localStorage.getItem('token'))
        : null;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/show-news`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token ?? ''}`
        }
      });

      if (!res.ok) return;
      const data = await res.json();

      if (data?.status && typeof data.count === 'number') {
        const currentCount = data.count;
        onCountUpdate(currentCount);

        setPrevCount((prev) => {
          if (prev !== null && currentCount > prev) {
            setToast({
              show: true,
              message: 'មានបច្ចុប្បន្នភាពថ្មីត្រូវបានបោះពុម្ពផ្សាយ'
            });
          }
          return currentCount;
        });
      }
    } catch (error) {
      console.error('Failed to fetch news updates:', error);
    }
  }, [onCountUpdate]);

  useEffect(() => {
    fetchNewsCount();
    const interval = setInterval(fetchNewsCount, 3000);
    return () => clearInterval(interval);
  }, [fetchNewsCount]);

  useEffect(() => {
    if (!toast.show) return;
    const timer = setTimeout(() => {
      setToast({ show: false, message: '' });
    }, 5000);
    return () => clearTimeout(timer);
  }, [toast.show]);

  if (!toast.show) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[99999] animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="flex items-center gap-3 bg-gray-900/95 text-white px-4 py-3 rounded-xl shadow-xl border border-gray-800 backdrop-blur-md max-w-sm">
        <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg">
          <Bell className="w-4 h-4" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-200">ដំណឹងថ្មីៗ</p>
          <p className="text-xs text-gray-400 mt-0.5 truncate">{toast.message}</p>
        </div>

        <div className="flex items-center gap-1.5 pl-2 border-l border-gray-800">
          <Link
            href="/update"
            onClick={() => setToast({ show: false, message: '' })}
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 px-2.5 py-1 rounded-md hover:bg-white/5 transition-colors"
          >
            មើល  
          </Link>

          <button
            onClick={() => setToast({ show: false, message: '' })}
            className="text-gray-400 hover:text-gray-200 p-1 rounded-md hover:bg-white/5 transition-colors"
            aria-label="Close notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}