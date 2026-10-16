'use client';
import React, { useState, useEffect } from 'react';
import { Percent, Clock, Tag, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

export default function DiscountDisplay() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDiscountedProducts = async (isBackground = false) => {
    try {
      const res = await fetch(`${import.meta.env?.VITE_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL}/api/dicount`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch discounted products');
      
      const productArray = data.product || data.data || [];
      setProducts(Array.isArray(productArray) ? productArray : []);
      
      if (!isBackground) setLoading(false);
    } catch (err) {
      if (!isBackground) {
        setError(err.message);
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    // 1. ទាញយកទិន្នន័យម្ដងពេលចាប់ផ្ដើមដំបូង
    fetchDiscountedProducts(false);

    // 2. កំណត់ឱ្យទាញយកទិន្នន័យថ្មីស្វ័យប្រវត្តិរៀងរាល់ ២ វិនាទី (2000ms) ដោយមិនបង្ហាញ Loading Spinner ញឹកញាប់
    const interval = setInterval(() => {
      fetchDiscountedProducts(true);
    }, 2000);

    // 3. សម្អាត interval ចោលពេលបិទ Component (Cleanup)
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto my-10 p-4 bg-red-50 text-red-600 rounded-2xl text-center text-sm">
        ⚠️ Error: {error}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12 text-sm text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
        📦 No discounted products found.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-blue-600 tracking-tight">ទំនិញបញ្ចុះតម្លៃពិសេស</h2>
        <p className="text-sm text-slate-500 mt-0.5">ស្វែងរកទំនិញដែលមានតម្លៃពិសេសបញ្ចុះជូន</p>
      </div>

      {/* បង្ហាញជា Grid 3 កាតក្នុងមួយជួរ (1, 2, 3 នៅជួរលើ និង 4, 5, 6 នៅជួរក្រោម) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => {
          const sellerName = product.seller?.seller_name || "គ្មានឈ្មោះ";
          const sellerPic = product.seller?.profile_pic || product.seller?.Image;
          const categoryName = product.category?.category_name || 'គ្មានប្រភេទ';

          return (
            <Link 
              key={product.id}
              href={`/product/${product.id}`}
              className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col group cursor-pointer"
            >
              {/* រូបភាពទំនិញ */}
              <div className="relative h-48 w-full bg-slate-900 overflow-hidden flex items-center justify-center">
                <img 
                  src={product.image ? `${import.meta.env?.VITE_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL}/storage/${product.image}` : "https://images.unsplash.com/photo-1542291026-7eec264c27ff"} 
                  alt={product.product_name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                
                {/* ស្លាកបញ្ចុះតម្លៃ */}
                <div className="absolute top-3 left-3 bg-blue-600 text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1">
                  <Percent className="w-3 h-3" />
                  <span>Discount</span>
                </div>
              </div>

              {/* ព័ត៌មានហាង និងទំនិញ */}
              <div className="p-5 flex flex-col flex-grow justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100">
                    <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-100 flex-shrink-0">
                      <img src={sellerPic ? `${import.meta.env?.VITE_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL}/storage/${sellerPic}` : ""} alt="" className="w-full h-full object-cover" />
                    </div>
                    <h2 className="text-sm font-extrabold text-slate-900 truncate">
                      {sellerName}
                    </h2>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md w-fit mb-2">
                    <Tag className="w-3 h-3" />
                    <span>{categoryName}</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 mb-2">
                    {product.product_name}
                  </h3>

                  {/* តម្លៃបញ្ចុះ និងតម្លៃដើម */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-lg font-extrabold text-blue-600">
                      ${product.discount_price}
                    </span>
                    {product.product_price && (
                      <span className="text-xs font-semibold text-slate-400 line-through">
                        ${product.product_price}
                      </span>
                    )}
                  </div>
                </div>

                {/* ព័ត៌មានផ្នែកខាងក្រោម */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-500" />
                    Fast Delivery
                  </span>
                  <span className="text-blue-600 font-semibold group-hover:underline">
                    View Details
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}