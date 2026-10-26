'use client';
import React, { useState, useEffect } from 'react';

function brand() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/show-brand`, {
      headers: { 'Accept': 'application/json' }
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch brands');
        return res.json();
      })
      .then((data) => {
        console.log("Brands Image Response:", data);
        const brandList = data.data || data["data "] || data.brands || (Array.isArray(data) ? data : []);
        setBrands(brandList);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching brands:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-center items-center">
        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 my-6 font-['Kantumruy_Pro']">
      
      {/* ផ្នែកចំណងជើង */}
      <div className="mb-3">
        <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <span className="w-2.5 h-5 bg-blue-600 rounded-full inline-block"></span>
          ម៉ាកយីហោល្បីៗ (Featured Brands)
        </h3>
      </div>

      {brands.length === 0 ? (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-700 text-center">
          ⚠️ មិនទាន់មានទិន្នន័យ Brand ត្រូវបានបញ្ចូលក្នុង Database ឡើយ។
        </div>
      ) : (
        /* Marquee Container with Hover Pause */
        <div 
          className="relative w-full bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden py-2"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div 
            className="flex gap-4 w-max"
            style={{
              animation: `marquee 25s linear infinite`,
              animationPlayState: isHovered ? 'paused' : 'running',
            }}
          >
            {/* Duplicate list 3 times for a seamless infinite loop effect */}
            {[...brands, ...brands, ...brands].map((item, index) => {
              const imgUrl = item ? `${process.env.NEXT_PUBLIC_API_URL}/storage/${item}` : null;

              return (
                <div 
                  key={index} 
                  className="h-32 sm:h-36 w-44 sm:w-52 flex-shrink-0 flex items-center justify-center p-4 bg-white border border-slate-100 rounded-xl hover:border-blue-300 hover:bg-blue-50/30 transition-all cursor-pointer group shadow-2xs"
                >
                  {imgUrl ? (
                    <img 
                      src={imgUrl} 
                      alt={`Brand ${index + 1}`} 
                      className="max-h-16 max-w-[85%] object-contain group-hover:scale-110 transition-transform duration-300 pointer-events-none" 
                    />
                  ) : (
                    <span className="text-xs text-slate-400 font-medium">គ្មានរូប</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* CSS Animation Keyframes for Smooth Auto-Scroll */}
          <style jsx>{`
            @keyframes marquee {
              0% {
                transform: translateX(0%);
              }
              100% {
                transform: translateX(-33.333%);
              }
            }
          `}</style>
        </div>
      )}

    </div>
  );
}

export default brand;