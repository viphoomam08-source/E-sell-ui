'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

// ==========================================
// 1. HELPER FUNCTIONS
// ==========================================
const calculateDiscountPercent = (product) => {
    if (product.bigDicount) return Math.round(product.bigDicount);
    if (!product.product_price || !product.discount_price) return 0;
    return Math.round(((product.product_price - product.discount_price) / product.product_price) * 100);
};

const getImageUrl = (path, defaultUrl) => {
    return path ? `${process.env.NEXT_PUBLIC_API_URL}/storage/${path}` : defaultUrl;
};

// ==========================================
// 2. SUB-COMPONENTS
// ==========================================
const SellerBadge = ({ seller }) => {
    const sellerName = seller?.seller_name || 'ហាងមិនស្គាល់ឈ្មោះ';
    const profilePic = getImageUrl(seller?.profile_pic || seller?.Image, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb');

    return (
        <div className="flex items-center space-x-3 bg-white/80 backdrop-blur-xs p-2 rounded-xl border border-slate-200/80 shadow-2xs w-fit">
            <img src={profilePic} alt={sellerName} className="w-9 h-9 rounded-lg object-cover border border-slate-200" />
            <div>
                <span className="block text-[10px] text-slate-400 uppercase font-semibold">អ្នកលក់ (Store)</span>
                <span className="text-xs font-bold text-slate-800">{sellerName}</span>
            </div>
        </div>
    );
};

const DiscountBadge = ({ percentage }) => (
    <div className="inline-flex items-center space-x-1.5 bg-rose-50 text-rose-600 border border-rose-200 text-xs font-bold px-3 py-1 rounded-lg">
        <span>🔥 បញ្ចុះតម្លៃធំ: -{percentage}%</span>
    </div>
);

const CountdownTimer = ({ durationInSeconds, onExpire }) => {
    const [timeLeft, setTimeLeft] = useState(durationInSeconds);

    useEffect(() => {
        if (timeLeft <= 0) {
            onExpire();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, onExpire]);

    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;

    const formatTime = (time) => String(time).padStart(2, '0');

    return (
        <div className="flex items-center space-x-2 bg-amber-50/80 border border-amber-200 px-3 py-1.5 rounded-xl w-fit">
            <span className="text-[11px] font-bold text-amber-700">⏳ សល់ពេល៖</span>
            <div className="text-xs font-mono font-black text-amber-800">
                {formatTime(hours)}:{formatTime(minutes)}:{formatTime(seconds)}
            </div>
        </div>
    );
};

// ==========================================
// 3. MAIN COMPONENT
// ==========================================
export default function SpotlightDiscountLayout() {
    const [discountProducts, setDiscountProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isExpired, setIsExpired] = useState(false);

    // Mouse tracking for running border effect
    const cardRef = useRef(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        setMousePosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    };

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/top-three-discounts`, {
            headers: { 'Accept': 'application/json' }
        })
            .then((res) => res.json())
            .then((response) => {
                console.log("API Response Data:", response);
                
                // Flexible parsing to handle various Laravel response structures
                const productList = response.data || response.products || (Array.isArray(response) ? response : []);
                
                if (Array.isArray(productList)) {
                    setDiscountProducts(productList);
                }
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching biggest discounts:', error);
                setLoading(false);
            });
    }, []);

    // Force Auto-slide without pause lock
    useEffect(() => {
        if (discountProducts.length <= 1) return;

        const interval = setInterval(() => {
            setIsExpired(false);
            setCurrentIndex((prevIndex) => {
                const nextIndex = prevIndex === discountProducts.length - 1 ? 0 : prevIndex + 1;
                return nextIndex;
            });
        }, 4000);

        return () => clearInterval(interval);
    }, [discountProducts]);

    if (loading) {
        return (
            <div className="w-full max-w-7xl mx-auto px-4 py-12 text-center text-slate-500 font-['Kantumruy_Pro']">
                <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
                <p className="text-xs">កំពុងទាញយកទិន្នន័យ...</p>
            </div>
        );
    }

    if (discountProducts.length === 0) {
        return (
            <div className="w-full max-w-7xl mx-auto px-4 py-6 font-['Kantumruy_Pro']">
                <div className="w-full p-6 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center text-xs text-slate-400">
                    📦 មិនមានផលិតផលបញ្ចុះតម្លៃធំសម្រាប់បង្ហាញនៅលើប្រព័ន្ធឡើយ។
                </div>
            </div>
        );
    }

    const handleNext = () => {
        setIsExpired(false);
        setCurrentIndex((prev) => (prev === discountProducts.length - 1 ? 0 : prev + 1));
    };

    const handlePrev = () => {
        setIsExpired(false);
        setCurrentIndex((prev) => (prev === 0 ? discountProducts.length - 1 : prev - 1));
    };

    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-6 font-['Kantumruy_Pro']">
            {/* Header & Controls */}
            <div className="mb-4 flex justify-between items-end">
                <div>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">
                        ⭐ កាំរស្មីពិសេស (Top Three Discounts)
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">ផលិតផលបញ្ចុះតម្លៃធំជាងគេប្រចាំថ្ងៃ</h2>
                </div>
                <div className="flex space-x-2">
                    <button onClick={handlePrev} className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition cursor-pointer text-slate-700 bg-white shadow-2xs active:scale-95">&larr;</button>
                    <button onClick={handleNext} className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition cursor-pointer text-slate-700 bg-white shadow-2xs active:scale-95">&rarr;</button>
                </div>
            </div>

            {/* Main Card Container */}
            <div 
                ref={cardRef}
                onMouseMove={handleMouseMove}
                className="relative bg-white border border-slate-200/90 rounded-2xl overflow-hidden text-slate-800 p-6 md:p-10 group shadow-sm"
            >
                {/* Spotlight mouse tracking effect */}
                <div 
                    className="absolute inset-0 pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100 z-20"
                    style={{
                        background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(37,99,235,0.1), transparent 40%)`
                    }}
                ></div>

                {/* Sliding Track using Framer Motion */}
                <div className="overflow-hidden w-full relative">
                    <motion.div 
                        className="flex"
                        animate={{ x: `-${currentIndex * 100}%` }}
                        transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
                    >
                        {discountProducts.map((activeProduct, idx) => {
                            const discountPercentage = calculateDiscountPercent(activeProduct);
                            const productImage = getImageUrl(activeProduct.image, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e');

                            return (
                                <div key={activeProduct.id || idx} className="w-full shrink-0 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                                    {/* Left Content */}
                                    <div className="lg:col-span-6 space-y-4">
                                        <div className="flex flex-wrap gap-2.5 items-center">
                                            <SellerBadge seller={activeProduct.seller} />
                                            {!isExpired && (
                                                <CountdownTimer 
                                                    durationInSeconds={3600} 
                                                    onExpire={() => setIsExpired(true)} 
                                                />
                                            )}
                                        </div>

                                        <DiscountBadge percentage={discountPercentage} />

                                        <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                            ប្រភេទ: {activeProduct.category?.name || 'General'}
                                        </span>

                                        <h3 className="text-xl md:text-3xl font-extrabold leading-snug text-slate-900">
                                            {activeProduct.product_name}
                                        </h3>
                                        
                                        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-lg line-clamp-3">
                                            {activeProduct.product_description || 'គ្មានការពន្យល់បន្ថែមសម្រាប់ផលិតផលនេះទេ។'}
                                        </p>

                                        <div className="flex items-baseline space-x-3 pt-2">
                                            {isExpired ? (
                                                <span className="text-2xl font-extrabold text-slate-900">
                                                    ${Number(activeProduct.product_price).toFixed(2)} <span className="text-xs text-rose-500 font-normal">(ផុតកំណត់បញ្ចុះតម្លៃ)</span>
                                                </span>
                                            ) : (
                                                <>
                                                    <span className="text-2xl sm:text-3xl font-extrabold text-blue-600">${Number(activeProduct.discount_price).toFixed(2)}</span>
                                                    <span className="text-sm sm:text-base text-slate-400 line-through">${Number(activeProduct.product_price).toFixed(2)}</span>
                                                </>
                                            )}
                                        </div>

                                        <div className="pt-2">
                                            <button 
                                                onClick={() => alert(isExpired ? 'ការបញ្ចុះតម្លៃបានបញ្ចប់ហើយ!' : `បានទិញ: ${activeProduct.product_name}`)}
                                                disabled={isExpired}
                                                className={`text-xs font-bold px-7 py-3 rounded-xl transition cursor-pointer shadow-xs ${
                                                    isExpired 
                                                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                                                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20'
                                                }`}
                                            >
                                                {isExpired ? 'បានផុតកំណត់' : 'ទិញឥឡូវនេះ'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Right Image */}
                                    <div className="lg:col-span-6 flex justify-center">
                                        <div className="relative w-full max-w-md h-64 sm:h-80 rounded-2xl overflow-hidden border border-slate-100 bg-slate-50/50 flex items-center justify-center p-4">
                                            <img src={productImage} alt={activeProduct.product_name} className="w-full h-full object-contain transform hover:scale-105 transition duration-500" />
                                            {isExpired && (
                                                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center">
                                                    <span className="bg-rose-600 text-white font-bold px-4 py-2 rounded-xl text-sm rotate-[-10deg] shadow-lg">
                                                        ❌ បញ្ចប់ការបញ្ចុះតម្លៃ
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </motion.div>
                </div>

                {/* Footer Navigation Bullets */}
                <div className="flex justify-center space-x-2 mt-6 pt-5 border-t border-slate-100 relative z-10">
                    {discountProducts.map((item, index) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setIsExpired(false);
                                setCurrentIndex(index);
                            }}
                            className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl transition cursor-pointer text-xs ${
                                currentIndex === index ? 'bg-blue-600 text-white font-bold shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            <span>0{index + 1}</span>
                            <span className="line-clamp-1 hidden sm:inline">{item.product_name}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}