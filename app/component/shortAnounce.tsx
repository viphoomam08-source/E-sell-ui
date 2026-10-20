"use client";

import React, { useState, useEffect } from 'react';
import { Megaphone } from 'lucide-react';

interface AnnouncementItem {
  id?: number;
  message?: string;
  big_tile?: string;
  [key: string]: unknown;
}

export default function ShortAnounce() {
  const [announcements, setAnnouncements] = useState<string[]>([
    "🎉 កំពុងទាញយកសេចក្តីជូនដំណឹង..."
  ]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '');
        
        const response = await fetch(`${API_URL}/api/quick-show`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
        });

        const result = await response.json();

        const dataList: AnnouncementItem[] = Array.isArray(result) 
          ? result 
          : Array.isArray(result?.data) 
            ? result.data 
            : [];

        if (dataList.length > 0) {
          const texts = dataList.map((item) => {
            if (typeof item === 'string') return item;
            return item.message || item.big_tile || String(item);
          });
          setAnnouncements(texts);
        }
      } catch (error) {
        console.error('Failed to fetch announcements:', error);
      }
    };

    fetchAnnouncements();
  }, []);

  return (
    <div className="mb-6 overflow-hidden rounded-2xl bg-blue-600 border border-blue-500 text-white px-4 py-3 flex items-center shadow-lg font-['Kantumruy_Pro']">
      
      {/* 🏷️ Static Label on the left */}
      <div className="flex items-center gap-2 bg-blue-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider shrink-0 mr-4 z-10 shadow-sm border border-blue-400/30">
        <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
        <Megaphone className="w-4 h-4" />
        <span>សេចក្តីជូនដំណឹង</span>
      </div>

      {/* 🔄 Running Text Container with Pure CSS Marquee */}
      <div className="relative overflow-hidden w-full whitespace-nowrap">
        <style>
          {`
            @keyframes customMarquee {
              0% { transform: translateX(100%); }
              100% { transform: translateX(-100%); }
            }
            .animate-news-ticker {
              display: inline-block;
              animation: customMarquee 25s linear infinite;
            }
            .animate-news-ticker:hover {
              animation-play-state: paused;
            }
          `}
        </style>
        
        <div className="animate-news-ticker text-xs font-medium text-blue-50">
          {announcements.map((text, idx) => (
            <span key={idx} className="inline-flex items-center mr-16 cursor-pointer hover:text-white transition-colors">
              <span className="text-blue-200 mr-2 font-bold">✦</span>
              {text}
            </span>
          ))}
        </div>
      </div>

    </div>
  );
}