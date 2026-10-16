'use client';

import React, { useState, useEffect } from 'react';
import Banner from '../component/banner';

export default function BrandGridUI() {
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBrands = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/productSell-list`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                    }
                });
                const data = await response.json();
                setBrands(data.data || data);
            } catch (error) {
                console.error('Error fetching brands:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBrands();
    }, []);

    return (
        <div className="w-full max-w-13xl mx-auto px-4 py-8 font-['Kantumruy_Pro'] space-y-8 bg-slate-50 min-h-screen">
            <Banner />

            {/* ================= 1. FEATURED BRANDS ================= */}
            <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-2xs">
                <div className="mb-4">
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 border-l-4 border-blue-600 pl-3">
                        Featured Brands
                    </h2>
                </div>

                {loading ? (
                    <div className="text-center py-8 text-slate-500 text-sm">កំពុងទាញយកទិន្នន័យ...</div>
                ) : brands.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-sm">មិនមានទិន្នន័យ Brand ទេ</div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {brands.map((brand) => (
                            <div
                                key={brand.id}
                                className="bg-white border border-slate-200/90 rounded-lg p-3 flex flex-col items-center justify-center h-28 shadow-2xs hover:shadow-md hover:border-blue-500 transition-all cursor-pointer group"
                            >
                                <img 
                                    src={brand.brand_image ? `${process.env.NEXT_PUBLIC_API_URL}/storage/${brand.brand_image}` : brand.logo} 
                                    alt={brand.name} 
                                    // កែសម្រួលទីនេះ៖ ដក filter grayscale ចេញ និងបង្កើនកម្ពស់/ទទឹងរូបភាព (max-h-14, max-w-[85%])
                                    className="max-h-14 max-w-[85%] object-contain transition duration-300 group-hover:scale-105" 
                                    onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }}
                                />
                                <span className="text-[11px] font-semibold text-slate-500 mt-2 group-hover:text-blue-600 transition line-clamp-1">
                                    {brand.name}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ================= 2. ALL BRANDS ================= */}
            <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-2xs">
                <div className="mb-4">
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 border-l-4 border-blue-600 pl-3">
                        All Brands
                    </h2>
                </div>

                {loading ? (
                    <div className="text-center py-8 text-slate-500 text-sm">កំពុងទាញយកទិន្នន័យ...</div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {brands.map((brand) => (
                            <div
                                key={brand.id}
                                className="bg-white border border-slate-200/90 rounded-lg p-3 flex flex-col items-center justify-center h-28 shadow-2xs hover:shadow-md hover:border-blue-500 transition-all cursor-pointer group"
                            >
                                <img 
                                    src={brand.brand_image ? `${process.env.NEXT_PUBLIC_API_URL}/storage/${brand.brand_image}` : brand.logo} 
                                    alt={brand.name} 
                                    // កែសម្រួលទីនេះដូចគ្នា៖ ដក grayscale និងເພີ່ມទំហំ
                                    className="max-h-14 max-w-[85%] object-contain transition duration-300 group-hover:scale-105" 
                                    onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }}
                                />
                                <span className="text-[11px] font-semibold text-slate-500 mt-2 group-hover:text-blue-600 transition line-clamp-1">
                                    {brand.name}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}