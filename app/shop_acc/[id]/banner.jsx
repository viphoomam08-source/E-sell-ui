'use client';

import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import Link from "next/link";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function BannerSlider({ sellerId }) {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDiscountProducts = async () => {
      try {
        // Fixed: Properly assign the endpoint with a fallback if sellerId is not passed
        const endpoint = sellerId 
          ? `${import.meta.env?.VITE_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL}/api/seller/${sellerId}/discounts`
          : `${import.meta.env?.VITE_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL}/api/dicount`;

        const response = await fetch(endpoint, {
          headers: {
            'Accept': 'application/json',
          }
        });
        const data = await response.json();
        
        // Handle response format from both controllers (data.data or data.product)
        const discountProducts = data.data || data.product || [];

        const formattedBanners = discountProducts.map((item) => ({
          id: item.id,
          image: item.image ? `${import.meta.env?.VITE_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL}/storage/${item.image}` : '/banners/default.jpg',
          title: item.product_name,
          subtitle: `បញ្ចុះតម្លៃសល់ត្រឹម $${Number(item.discount_price).toFixed(2)} (តម្លៃដើម $${Number(item.product_price).toFixed(2)})`,
          productId: item.id
        }));

        setBanners(formattedBanners);
      } catch (error) {
        console.error("Error fetching discount banners:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscountProducts();
  }, [sellerId]);

  if (loading) {
    return (
      <div className="w-full h-[300px] md:h-[400px] bg-gray-100 flex items-center justify-center text-gray-500 font-['Kantumruy_Pro']">
        កំពុងទាញយកប្រូម៉ូសិន...
      </div>
    );
  }

  if (banners.length === 0) {
    return null;
  }

  return (
    <div className="w-full h-[300px] md:h-[400px] relative overflow-hidden font-['Kantumruy_Pro']">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        loop={true}
        className="w-full h-full"
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner.id} className="relative w-full h-full">
            <img
              src={banner.image}
              alt={banner.title}
              className="w-full h-full object-cover"
            />
            
            {/* Text Overlay */}
            <div className="absolute inset-0 bg-black/10 flex flex-col justify-center items-center text-center text-white px-4 z-10">
              <span className="bg-red-600 text-xs font-bold uppercase px-3 py-1 rounded-full mb-3 tracking-wider font-['Battambang'] shadow-md">
                បញ្ចុះតម្លៃពិសេស 🔥
              </span>
              <h2 className="text-2xl md:text-4xl font-bold mb-2 tracking-wide drop-shadow-md">
                {banner.title}
              </h2>
              <p className="text-base md:text-lg text-amber-300 font-medium mb-5 drop-shadow">
                {banner.subtitle}
              </p>
              
              <Link 
                href={`/product/${banner.productId}`}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-xl transition-all shadow-lg hover:scale-105 active:scale-95"
              >
                ទិញឥឡូវនេះ (Shop Now)
              </Link>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}