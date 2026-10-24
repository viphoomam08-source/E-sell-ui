'use client';

import Link from 'next/link';
import React, { useState, useEffect, useRef } from 'react';

const ShopCard = ({ shop }) => {
    const imagePath = shop.profile_pic || shop.Image;
    const shopName = shop.seller_name || 'ហាងទំនិញ';

    return (
        <div className="flex flex-col items-center flex-shrink-0 cursor-pointer group w-20 select-none transition-all duration-300">
            {/* Outer Ring with Glow Effect */}
            <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl p-0.5 bg-gradient-to-tr from-blue-600 via-indigo-500 to-blue-400 shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-300">
                <div className="w-full h-full rounded-[14px] overflow-hidden bg-white p-0.5">
                    <div className="w-full h-full rounded-xl overflow-hidden bg-slate-100 relative">
                        {imagePath ? (
                            <img 
                                src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${imagePath}`}
                                alt={shopName} 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 pointer-events-none" 
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-600 text-xs font-bold">
                                {shopName.charAt(0).toUpperCase()}
                            </div>
                        )}
                        {/* Overlay subtle gradient on hover */}
                        <div className="absolute inset-0 bg-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                </div>
            </div>

            {/* Shop Name */}
            <span className="mt-1.5 text-[11px] font-semibold text-center truncate w-full text-slate-700 group-hover:text-blue-600 transition-colors" style={{ fontFamily: "'Kantumruy Pro', sans-serif" }}>
                {shopName}
            </span>
        </div>
    );
};

export default function Shop() {
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef(null);

    const fetchShops = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/seller-list`, {
                headers: { 'Accept': 'application/json' }
            });
            const data = await response.json();
            
            const shopList = data.seller || data.list || data.shops || data.data || data;
            setShops(Array.isArray(shopList) ? shopList : []);
        } catch (error) {
            console.error("Error fetching shops:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Kantumruy+Pro:ital,wght@0,100..700;1,100..700&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);

        fetchShops();
    }, []);

    const scroll = (direction) => {
        if (scrollRef.current) {
            const scrollAmount = 300;
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    if (loading) {
        return (
            <div className="w-full max-w-7xl mx-auto px-4 py-4">
                <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-4 bg-blue-600 rounded-full animate-pulse"></div>
                        <div className="w-28 h-4 bg-slate-200 rounded animate-pulse"></div>
                    </div>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((n) => (
                            <div key={n} className="flex flex-col items-center gap-2">
                                <div className="w-16 h-16 rounded-2xl bg-slate-100 animate-pulse"></div>
                                <div className="w-12 h-2.5 bg-slate-100 rounded animate-pulse"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3" style={{ fontFamily: "'Kantumruy Pro', sans-serif" }}>
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100 relative overflow-hidden">
                
                {/* Background ambient decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

                {/* Header Section */}
                <div className="flex justify-between items-center mb-3.5 relative z-10">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-5 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full shadow-xs"></div>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                            ហាងទំនិញល្បីៗ
                        </h3>
                    </div>

                    <div className="flex items-center space-x-2">
                        {/* See All Button */}
                        <button 
                            onClick={() => alert('ទៅកាន់ទំព័រមើលហាងទាំងអស់')} 
                            className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50/80 hover:bg-blue-100/80 px-3 py-1.5 rounded-xl transition-all active:scale-95"
                        >
                            មើលទាំងអស់
                        </button>

                        {/* Scroll Controls */}
                        <div className="flex space-x-1.5">
                            <button 
                                onClick={() => scroll('left')}
                                className="p-1.5 rounded-xl bg-slate-50 hover:bg-blue-600 hover:text-white text-slate-600 transition-all shadow-2xs border border-slate-200/60 active:scale-90 cursor-pointer"
                                aria-label="Scroll Left"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path>
                                </svg>
                            </button>
                            <button 
                                onClick={() => scroll('right')}
                                className="p-1.5 rounded-xl bg-slate-50 hover:bg-blue-600 hover:text-white text-slate-600 transition-all shadow-2xs border border-slate-200/60 active:scale-90 cursor-pointer"
                                aria-label="Scroll Right"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Horizontal Scrolling Container */}
                <div 
                    ref={scrollRef}
                    className="flex space-x-4 overflow-x-auto scroll-smooth pb-2 pt-1 snap-x snap-mandatory [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] relative z-10"
                >
                    {shops.length > 0 ? (
                        shops.map((shop) => {
                            const shopId = shop.id || shop.shop_id || shop.seller_id;
                            return (
                                <Link 
                                    key={shopId} 
                                    href={`/shop_acc/${shopId}`}
                                    className="snap-start flex-shrink-0"
                                >
                                    <ShopCard shop={shop} />
                                </Link>
                            );
                        })
                    ) : (
                        <div className="w-full text-center text-slate-400 py-6 text-xs">
                            មិនមានទិន្នន័យហាងទំនិញនៅឡើយទេ
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}