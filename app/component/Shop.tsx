'use client';

import Link from 'next/link';
import React, { useState, useEffect, useRef } from 'react';

const ShopCard = ({ shop }) => {
    // កំណត់យករូបភាពពី profile_pic ឬ Image
    const imagePath = shop.profile_pic || shop.Image;
    // យកឈ្មោះហាងពី seller_name
    const shopName = shop.seller_name || 'ហាងទំនិញ';

    return (
        <div className="flex flex-col items-center flex-shrink-0 cursor-pointer group w-18 select-none transition-all duration-300">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden p-0.5 bg-white shadow-2xs border border-slate-100 group-hover:border-blue-500 group-hover:shadow-xs transition-all duration-300">
                <div className="w-full h-full rounded-lg overflow-hidden bg-slate-100 relative">
                    {imagePath ? (
                        <img 
                            src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${imagePath}`}
                            alt={shopName} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 pointer-events-none" 
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-[10px] font-bold">
                            {shopName.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>
            </div>
            <span className="mt-1 text-[11px] font-medium text-center truncate w-full text-slate-700 group-hover:text-blue-600 transition" style={{ fontFamily: "'Kantumruy Pro', sans-serif" }}>
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
            
            // ទាញយកទិន្នន័យពី Key "seller" ដែលទទួលបានពី API Response របស់អ្នក
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
            const scrollAmount = 250;
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    if (loading) {
        return (
            <div className="w-full max-w-7xl mx-auto px-3 py-3 flex justify-center items-center">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium" style={{ fontFamily: "'Kantumruy Pro', sans-serif" }}>
                    <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span>កំពុងទាញទិន្នន័យហាងទំនិញ...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 space-y-2" style={{ fontFamily: "'Kantumruy Pro', sans-serif" }}>
            <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-2xs border border-slate-100">
                {/* Header ផ្នែកចំណងជើង និងប៊ូតុងបញ្ជា */}
                <div className="flex justify-between items-center mb-2.5">
                    <div>
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                            ហាងទំនិញល្បីៗ
                        </h3>
                    </div>

                    <div className="flex items-center space-x-2">
                        {/* ប៊ូតុង មើលទាំងអស់ (See All) */}
                        <button 
                            onClick={() => alert('ទៅកាន់ទំព័រមើលហាងទាំងអស់')} 
                            className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition"
                        >
                            មើលទាំងអស់
                        </button>

                        {/* ប៊ូតុង Scroll ឆ្វេង ស្ដាំ */}
                        <div className="flex space-x-1">
                            <button 
                                onClick={() => scroll('left')}
                                className="p-1.5 rounded-lg bg-slate-50 hover:bg-blue-600 hover:text-white text-slate-600 transition shadow-2xs border border-slate-200/60 active:scale-95"
                                aria-label="Scroll Left"
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path>
                                </svg>
                            </button>
                            <button 
                                onClick={() => scroll('right')}
                                className="p-1.5 rounded-lg bg-slate-50 hover:bg-blue-600 hover:text-white text-slate-600 transition shadow-2xs border border-slate-200/60 active:scale-95"
                                aria-label="Scroll Right"
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Container សម្រាប់អូសហាងឆ្វេងស្តាំ */}
                <div 
                    ref={scrollRef}
                    className="flex space-x-3 overflow-x-auto scroll-smooth pb-1 pt-0.5 snap-x snap-mandatory [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
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
                        <div className="w-full text-center text-slate-400 py-4 text-xs">
                            មិនមានទិន្នន័យហាងទំនិញនៅឡើយទេ
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}