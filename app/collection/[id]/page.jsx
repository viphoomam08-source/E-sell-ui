'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

function CollectionDetailPage() {
  const params = useParams();
  const id = params?.id;

  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    // ហៅ API តាម ID របស់ Category កូន
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/collection/${id}`, {
      headers: { 'Accept': 'application/json' }
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch collection details');
        return res.json();
      })
      .then((data) => {
        console.log("Collection Detail Response:", data);
        setCategory(data.category || null);
        setProducts(data.product || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching collection detail:', err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 flex justify-center items-center">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 my-6 font-['Kantumruy_Pro']">
      
      {/* 💙 Soft Blue Background Wrapper */}
      <div className="bg-gradient-to-br from-blue-50/90 via-sky-50/50 to-indigo-50/60 rounded-3xl border border-blue-100/90 p-5 sm:p-8 shadow-xs">
        
        {/* Navigation Back & Title Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link 
              href="/"
              className="px-3.5 py-1.5 bg-white border border-blue-200 text-blue-600 text-xs font-bold rounded-xl hover:bg-blue-50 transition-all shadow-2xs"
            >
              ← ត្រឡប់ក្រោយ
            </Link>
            <h3 className="text-base sm:text-xl font-extrabold text-blue-950 tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-5 bg-blue-600 rounded-full inline-block"></span>
              {category ? category.category_name : `បណ្តុំទំនិញ #${id}`}
            </h3>
          </div>
        </div>

        {/* Collection Banner / Detail Info Box */}
        {category && (
          <div className="bg-white/80 backdrop-blur-xs rounded-2xl border border-blue-100 p-6 shadow-xs flex flex-col md:flex-row items-center gap-6 mb-6">
            {category.image_category && (
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden border border-blue-100 shadow-sm flex-shrink-0 bg-white p-2 flex items-center justify-center">
                <img 
                  src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${category.image_category}`} 
                  alt={category.category_name} 
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            <div className="text-center md:text-left">
              <h4 className="text-lg font-bold text-slate-800 mb-2">
                {category.category_name}
              </h4>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                ស្វែងរកផលិតផលទាំងអស់ដែលស្ថិតក្រោមបណ្តុំប្រមូលផ្តុំនេះ ជាមួយតម្លៃសមរម្យ និងគុណភាពខ្ពស់។
              </p>
            </div>
          </div>
        )}

        {/* Products Section */}
        <div className="mt-6">
          <h5 className="text-sm font-bold text-slate-700 mb-4">ផលិតផលក្នុងបណ្តុំនេះ ({products.length})</h5>
          
          {products.length === 0 ? (
            <div className="p-8 text-center bg-white/60 rounded-2xl border border-blue-100 text-slate-500 text-xs">
              ⚠️ មិនទាន់មានផលិតផលនៅក្នុងបណ្តុំនេះនៅឡើយទេ។
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {products.map((prod) => {
                const prodImg = prod.image || prod.product_image || prod.image_url;
                const fullProdImg = prodImg 
                  ? `${process.env.NEXT_PUBLIC_API_URL}/storage/${prodImg}` 
                  : null;

                return (
                  <div key={prod.id} className="bg-white rounded-2xl p-4 border border-blue-100/80 shadow-2xs hover:shadow-md transition-all flex flex-col gap-2 group cursor-pointer">
                    {/* Image Container with object-contain to show full picture */}
                    <div className="h-36 bg-blue-50/20 rounded-xl overflow-hidden flex items-center justify-center border border-blue-50 p-2">
                      {fullProdImg ? (
                        <img 
                          src={fullProdImg} 
                          alt={prod.product_name} 
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" 
                        />
                      ) : (
                        <span className="text-blue-400 font-bold text-xs">🛍️ គ្មានរូបភាព</span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-slate-800 truncate mt-1">{prod.product_name || prod.name}</span>
                    <span className="text-xs font-extrabold text-blue-600">${prod.price || '0.00'}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

export default CollectionDetailPage;