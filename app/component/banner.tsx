'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://e-sale-4.onrender.com';

export default function MultiBannerLayout() {
  const [heroBanners, setHeroBanners] = useState([]);
  const [subBanners, setSubBanners] = useState([]);
  const [currentHero, setCurrentHero] = useState(0);

  // 1. Fetch Banners from /api/banner-all
  useEffect(() => {
    fetch(`${API_URL}/api/banner-all`, {
      headers: { 'Accept': 'application/json' }
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Live Banners Response:", data);
        const bannerList = data.Banner || data.data || (Array.isArray(data) ? data : []);
        
        const formatted = bannerList.map((item) => ({
          id: item.id,
          image: item.Image_Banner 
            ? `${API_URL}/storage/${item.Image_Banner}` 
            : (item.image ? `${API_URL}/storage/${item.image}` : 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9'),
          title: item.Name || item.title || 'New Fashion Season: Your Style!',
          subtitle: item.subtitle || 'ទិញទំនិញទំនើបៗទទួលបានមកដល់',
        }));
        
        setHeroBanners(formatted);
        setSubBanners(formatted);
      })
      .catch((err) => console.error('Error fetching banners:', err));
  }, []);

  // Auto Slide for Hero Banner
  useEffect(() => {
    if (heroBanners.length === 0) return;
    const timer = setInterval(() => {
      setCurrentHero((prev) => (prev + 1) % heroBanners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [heroBanners.length]);

  if (heroBanners.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 my-3 font-['Kantumruy_Pro']">
        <div className="w-full h-[150px] bg-slate-50 border border-dashed border-slate-200 rounded-2xl flex items-center justify-center text-xs text-slate-400">
          📦 មិនមានវីដេអូ ឬបដាបង្ហាញក្នុងប្រព័ន្ធឡើយ (សូមបង្កើតបដានៅក្នុងផ្ទាំងគ្រប់គ្រង)
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 my-3 font-['Kantumruy_Pro'] space-y-4">
      
      {/* ================= 1. HERO BANNER WITH ROUNDED BORDER ================= */}
      <div className="relative w-full h-[220px] sm:h-[320px] md:h-[400px] bg-slate-900 rounded-3xl overflow-hidden border border-blue-100 shadow-md">
        <motion.div 
          className="flex w-full h-full"
          animate={{ x: `-${currentHero * 100}%` }}
          transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
        >
          {heroBanners.map((banner) => (
            <div key={banner.id} className="w-full h-full shrink-0 relative group cursor-pointer">
              <img 
                src={banner.image} 
                alt={banner.title} 
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700 pointer-events-none" 
              />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-950/70 via-blue-900/30 to-transparent flex flex-col justify-center px-8 sm:px-16">
                <span className="text-blue-600 bg-white/95 px-3 py-1 text-xs font-bold w-fit mb-2 shadow-xs rounded-xl border border-blue-100">
                  Promotion
                </span>
                <h1 className="text-white text-lg sm:text-2xl md:text-3xl font-extrabold max-w-lg mb-1 drop-shadow-sm">{banner.title}</h1>
                <p className="text-slate-100 text-xs sm:text-sm font-medium drop-shadow-xs">{banner.subtitle}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Pagination Indicators */}
        <div className="absolute bottom-4 right-6 flex space-x-2 z-10 bg-black/20 backdrop-blur-xs px-3 py-1.5 rounded-full">
          {heroBanners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentHero(index)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                currentHero === index ? 'bg-blue-500 w-6' : 'bg-white/70 w-2 hover:bg-white'
              }`}
            />
          ))}
        </div>
      </div>

      {/* ================= 2. SUB BANNERS WITH ROUNDED CORNERS ================= */}
      {subBanners.length > 0 && (
        <div className="relative w-full overflow-hidden py-3">
          <motion.div 
            className="flex gap-4 px-2"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ 
              duration: subBanners.length * 3, 
              repeat: Infinity, 
              ease: "linear" 
            }}
          >
            {[...subBanners, ...subBanners, ...subBanners].map((item, index) => (
              <div 
                key={`${item.id}-${index}`}
                className="relative h-[130px] sm:h-[160px] min-w-[260px] sm:min-w-[340px] bg-slate-900 rounded-2xl overflow-hidden border border-blue-100/80 group cursor-pointer flex-shrink-0 transition-all duration-300 hover:scale-105 hover:z-10 shadow-sm hover:shadow-md"
              >
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-3.5 sm:p-4 group-hover:bg-black/50 transition-colors">
                  <span className="bg-blue-600 text-white text-[9px] font-bold px-2.5 py-0.5 rounded-lg w-fit mb-1 shadow-xs">
                    Special Offer
                  </span>
                  <h3 className="text-white text-xs sm:text-sm font-bold line-clamp-1 group-hover:translate-x-1 transition-transform">{item.title}</h3>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      )}

    </div>
  );
}