'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Sparkles, Store, ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Page() {
  const router = useRouter();
  const [currentBanner, setCurrentBanner] = useState(0);
  const [banners, setBanners] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRefs = useRef({});

  // Fetch Banners from API (`/api/banner-all`)
  useEffect(() => {
    fetch(`${API_URL}/api/banner-all`)
      .then((res) => res.json())
      .then((data) => {
        const bannerList = data.Banner || data.data || [];
        const formattedBanners = bannerList.map((item) => ({
          id: item.id,
          image: item.Image_Banner 
            ? `${API_URL}/storage/${item.Image_Banner}` 
            : (item.image ? `${API_URL}/storage/${item.image}` : 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a'),
          title: item.Name || item.title || 'ការបញ្ចុះតម្លៃពិសេសប្រចាំរដូវកាល',
          subtitle: item.subtitle || 'ស្វែងរកផលិតផលថ្មីៗជាច្រើនជម្រើសនៅទីនេះ',
        }));
        setBanners(formattedBanners);
      })
      .catch((err) => console.error('Error fetching banners:', err));
  }, []);

  // Banner auto-slide timer
  useEffect(() => {
    if (banners.length === 0) return;
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [banners.length]);

  // Fetch stores and products data
  useEffect(() => {
    fetch(`${API_URL}/api/sellerDiplay`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const formattedStores = data.data.map((seller) => ({
            id: seller.id,
            storeName: seller.seller_name,
            avatar: seller.profile_pic 
              ? `${API_URL}/storage/${seller.profile_pic}` 
              : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
            products: seller.products.map((p) => ({
              id: p.id,
              image: p.image 
                ? `${API_URL}/storage/${p.image}` 
                : 'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
              text: p.product_name,
              price: `$${p.product_price}`,
            })),
          }));
          setStores(formattedStores);
        }
      })
      .catch((err) => console.error('Error fetching stores:', err))
      .finally(() => setLoading(false));
  }, []);

  const scrollRow = (storeId, direction) => {
    const container = scrollRefs.current[storeId];
    if (container) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-['Kantumruy_Pro'] text-slate-500 bg-slate-100 text-sm">
        កំពុងទាញយកទិន្នន័យ...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 font-['Kantumruy_Pro'] pb-16">
      
      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8">
        
        {/* Responsive Banner Section (Desktop & Mobile optimized) */}
        <div className="relative w-full h-[220px] sm:h-[350px] lg:h-[400px] rounded-3xl bg-slate-900 overflow-hidden shadow-md">
          {banners.length > 0 ? (
            banners.map((item, index) => (
              <div
                key={item.id}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  index === currentBanner ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <img 
                  src={item.image} 
                  alt={`Banner ${item.id}`} 
                  className="w-full h-full object-cover opacity-85" 
                  onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a"; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-6 sm:p-10">
                  <span className="inline-flex items-center gap-1 bg-blue-600 text-white text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full mb-2 w-fit">
                    <Sparkles className="w-3.5 h-3.5" /> Promotion Special
                  </span>
                  <h1 className="text-white text-base sm:text-2xl lg:text-3xl font-bold tracking-tight mb-1">{item.title}</h1>
                  <p className="text-slate-200 text-xs sm:text-sm">{item.subtitle}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white text-xs">
              គ្មានទិន្នន័យបដា
            </div>
          )}

          {/* Dots Indicator */}
          <div className="absolute bottom-4 right-6 flex items-center gap-1.5">
            {banners.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-2 rounded-full transition-all ${idx === currentBanner ? 'w-8 bg-blue-600' : 'w-2 bg-white/60'}`}
              />
            ))}
          </div>
        </div>

        {/* Section Title */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-800">ហាងទំនិញ និងផលិតផលពេញនិយម</h2>
          </div>
        </div>

        {/* Stores & Products Web & Mobile Grid Feed */}
        <div className="space-y-6">
          {stores.map((store) => (
            <div key={store.id} className="bg-white rounded-3xl shadow-sm p-5 sm:p-6 border border-slate-200/80 transition hover:shadow-md">
              
              {/* Store Profile Row */}
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 shadow-xs">
                    <img 
                      src={store.avatar} 
                      alt={store.storeName} 
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e"; }}
                    />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-1.5">
                      <Store className="w-4 h-4 text-blue-600" /> {store.storeName}
                    </h3>
                    <span className="text-xs text-slate-400">ហាងទំនិញស្របច្បាប់ • ផលិតផលគុណភាពខ្ពស់</span>
                  </div>
                </div>

                {/* Scroll Navigation Arrows */}
                <div className="flex items-center gap-2">
                  <button onClick={() => scrollRow(store.id, 'left')} className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 cursor-pointer transition">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={() => scrollRow(store.id, 'right')} className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 cursor-pointer transition">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Product Horizontal Scroll Cards (Responsive Grid View) */}
              <div ref={(el) => (scrollRefs.current[store.id] = el)} className="flex items-center gap-4 overflow-x-auto pb-3 scroll-smooth [&::-webkit-scrollbar]:hidden">
                {store.products.map((item) => (
                  <div key={item.id} className="group bg-slate-50/60 rounded-2xl border border-slate-200/70 p-3.5 flex-shrink-0 w-[180px] sm:w-[220px] flex flex-col justify-between hover:border-blue-300 hover:bg-white transition-all shadow-2xs">
                    <div className="w-full h-36 sm:h-40 bg-white rounded-xl border border-slate-100 overflow-hidden mb-3 relative flex items-center justify-center shadow-2xs">
                      <img src={item.image} alt={item.text} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-1 mb-1">{item.text}</h4>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs sm:text-sm font-extrabold text-blue-600">{item.price}</span>
                        <button 
                          onClick={() => router.push(`/product/${item.id}`)}
                          className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl text-xs font-semibold transition flex items-center gap-1 cursor-pointer shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5" /> មើល
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}