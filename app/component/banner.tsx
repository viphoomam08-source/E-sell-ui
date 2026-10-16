'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export default function MultiBannerLayout() {
  const [heroBanners, setHeroBanners] = useState([]);
  const [subBanners, setSubBanners] = useState([]);
  const [currentHero, setCurrentHero] = useState(0);

  // ១. ទាញយកទិន្នន័យសម្រាប់ Hero Banner ធំ (ពី /api/banner-all)
  useEffect(() => {
    fetch(`${API_URL}/api/banner-all`)
      .then((res) => res.json())
      .then((data) => {
        const bannerList = data.Banner || data.data || [];
        const formatted = bannerList.map((item) => ({
          id: item.id,
          image: item.Image_Banner 
            ? `${API_URL}/storage/${item.Image_Banner}` 
            : (item.image ? `${API_URL}/storage/${item.image}` : 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9'),
          title: item.Name || item.title || 'New Fashion Season: Your Style!',
          subtitle: item.subtitle || 'ទិញទំនិញទំនើបៗទទួលបានមកដល់',
        }));
        setHeroBanners(formatted);
      })
      .catch((err) => console.error('Error fetching hero banners:', err));
  }, []);

  // ២. ទាញយកទិន្នន័យសម្រាប់ Sub Banners ខាងក្រោម
  useEffect(() => {
    fetch(`${API_URL}/api/banner-all`) // ប្តូរទៅជា API ផ្សេងរបស់អ្នកនៅទីនេះប្រសិនបើមាន (ឧទាហរណ៍ /api/sub-banners)
      .then((res) => res.json())
      .then((data) => {
        const bannerList = data.Banner || data.data || [];
        const formatted = bannerList.map((item) => ({
          id: item.id,
          image: item.Image_Banner 
            ? `${API_URL}/storage/${item.Image_Banner}` 
            : (item.image ? `${API_URL}/storage/${item.image}` : 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f'),
          title: item.Name || item.title || 'ការផ្តល់ជូនពិសេសប្រចាំថ្ងៃ',
        }));
        setSubBanners(formatted);
      })
      .catch((err) => console.error('Error fetching sub banners:', err));
  }, []);

  // Auto Slide សម្រាប់ Hero Banner ធំខាងលើ
  useEffect(() => {
    if (heroBanners.length === 0) return;
    const timer = setInterval(() => {
      setCurrentHero((prev) => (prev + 1) % heroBanners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [heroBanners.length]);

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 my-3 font-['Kantumruy_Pro'] space-y-4">
      
      {/* ================= 1. HERO BANNER ធំនៅខាងលើ ================= */}
      {heroBanners.length > 0 && (
        <div className="relative w-full h-[220px] sm:h-[320px] md:h-[400px] bg-slate-900 overflow-hidden border border-slate-200">
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
                <div className="absolute inset-0 bg-gradient-to-r from-amber-50/70 via-transparent to-transparent flex flex-col justify-center px-8 sm:px-16">
                  <span className="text-amber-700 bg-white/90 px-3 py-1 text-xs font-bold w-fit mb-2 shadow-2xs">
                    Promotion
                  </span>
                  <h1 className="text-slate-900 text-lg sm:text-2xl md:text-3xl font-extrabold max-w-lg mb-1">{banner.title}</h1>
                  <p className="text-slate-700 text-xs sm:text-sm font-medium">{banner.subtitle}</p>
                </div>
              </div>
            ))}
          </motion.div>

          <div className="absolute bottom-3 right-5 flex space-x-1.5 z-10">
            {heroBanners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentHero(index)}
                className={`h-1.5 transition-all cursor-pointer ${
                  currentHero === index ? 'bg-amber-600 w-6' : 'bg-white/70 w-2 hover:bg-white'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* ================= 2. SUB BANNERS (លឿន និងរលូនជាងមុន) ================= */}
      {subBanners.length > 0 && (
        <div className="relative w-full overflow-hidden py-3">
          <motion.div 
            className="flex gap-3 px-2"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ 
              duration: subBanners.length * 2, // កាត់បន្ថយមកត្រឹម ២ វិនាទីក្នុងមួយ item ដើម្បីឱ្យវាដើរលឿននិងរលូនល្អ
              repeat: Infinity, 
              ease: "linear" 
            }}
          >
            {[...subBanners, ...subBanners, ...subBanners].map((item, index) => (
              <div 
                key={`${item.id}-${index}`}
                className="relative h-[130px] sm:h-[160px] min-w-[260px] sm:min-w-[340px] bg-slate-900 overflow-hidden border border-slate-200 group cursor-pointer flex-shrink-0 transition-transform duration-300 hover:scale-105 hover:z-10 shadow-sm"
              >
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent flex flex-col justify-end p-3 sm:p-4 group-hover:bg-black/40 transition-colors">
                  <span className="bg-blue-600 text-white text-[9px] font-bold px-2 py-0.5 w-fit mb-1">
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