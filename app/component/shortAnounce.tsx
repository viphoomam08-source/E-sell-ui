"use client";

import React, { useState, useEffect } from 'react';
import { Megaphone } from 'lucide-react';

export default function ShortAnounce() {
  const [announcements, setAnnouncements] = useState([
    "🎉 កំពុងទាញយកសេចក្តីជូនដំណឹង..."
  ]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const API_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '');
        
        const response = await fetch(`${API_URL}/api/quick-show`, {
          method: 'POST', // ប្រើ POST តាម Route របស់អ្នក
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          // body: JSON.stringify({ }) // បើ API ត្រូវការส่ง parameter អ្វីបន្ថែម អាចដាក់ទីនេះ
        });

        const result = await response.json();

        // ត្រួតពិនិត្យមើលโครงสร้างទិន្នន័យដែល trả មកពី Laravel (ឧទាហរណ៍: result.data ឬ result ជា Array)
        const dataList = Array.isArray(result) ? result : result.data || [];

        if (dataList.length > 0) {
          // สมมติว่าใน database column របស់អ្នកឈ្មោះ message
          const texts = dataList.map((item) => item.message || item.big_tile || item);
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