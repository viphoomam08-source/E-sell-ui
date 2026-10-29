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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 items-start">
              {products.map((prod) => {
                const prodImg = prod.image || prod.product_image || prod.image_url;
                const fullProdImg = prodImg 
                  ? `${process.env.NEXT_PUBLIC_API_URL}/storage/${prodImg}` 
                  : "https://images.unsplash.com/photo-1542291026-7eec264c27ff";

                const sellerName = prod.seller?.seller_name || "គ្មានឈ្មោះ";
                const sellerPic = prod.seller?.profile_pic || prod.seller?.Image;
                const categoryName = prod.category?.category_name || category?.category_name || 'គ្មានប្រភេទ';
                const productPrice = Number(prod.product_price || prod.price || 0);

                return (
                  <Link 
                    key={prod.id}
                    href={`/product/${prod.id}`}
                    className="group bg-white rounded-xl border border-slate-200/90 shadow-sm hover:shadow-lg hover:border-blue-400/60 transition-all duration-300 flex flex-col overflow-hidden relative cursor-pointer transform hover:-translate-y-1 w-full"
                  >
                    {/* Badge */}
                    <div className="absolute top-2 left-2 z-10 bg-blue-600/90 backdrop-blur-md text-white text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded shadow-xs">
                      New
                    </div>

                    {/* Image Container */}
                    <div className="w-full h-28 sm:h-36 bg-slate-100 relative overflow-hidden flex items-center justify-center">
                      <img 
                        src={fullProdImg} 
                        alt={prod.product_name || prod.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
                      />
                    </div>

                    {/* Details Content */}
                    <div className="p-2.5 flex flex-col">
                      {/* Category Tag */}
                      <div className="flex items-center gap-1 text-[9px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded w-fit mb-1 border border-blue-100/50">
                        <span className="truncate max-w-[90px]">🏷️ {categoryName}</span>
                      </div>

                      {/* Store Details */}
                      <div className="flex items-center gap-1.5 mb-1.5 pb-1.5 border-b border-slate-100">
                        <div className="w-5 h-5 rounded-full overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                          {sellerPic ? (
                            <img src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${sellerPic}`} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-blue-100 text-blue-600 font-bold text-[8px] flex items-center justify-center">S</div>
                          )}
                        </div>
                        <div className="flex flex-col truncate">
                          <span className="text-[7px] text-slate-400 uppercase font-medium leading-none">Store</span>
                          <span className="text-[9px] font-bold text-slate-700 truncate">{sellerName}</span>
                        </div>
                      </div>

                      {/* Title & Price */}
                      <div className="mb-1.5">
                        <h3 className="text-[11px] font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                          {prod.product_name || prod.name}
                        </h3>
                        <div className="flex flex-col mt-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-blue-600">
                              ${productPrice.toFixed(2)}
                            </span>
                            {prod.product_stock !== undefined && (
                              <span className={`text-[8px] font-semibold px-1 py-0.2 rounded ${prod.product_stock > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                                {prod.product_stock > 0 ? `Stock: ${prod.product_stock}` : 'Out'}
                              </span>
                            )}
                          </div>
                          <span className="text-[9px] text-slate-400">
                            ≈ {(productPrice * 4100).toLocaleString()}៛
                          </span>
                        </div>
                      </div>

                      {/* Footer Action */}
                      <div className="flex items-center justify-between pt-1.5 border-t border-slate-100/80">
                        <span className="text-[10px] font-bold text-blue-600 group-hover:underline">
                          View Details
                        </span>
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-blue-600 text-white shadow-sm group-hover:bg-blue-700 transition-all text-xs font-bold">
                          🛒
                        </div>
                      </div>
                    </div>
                  </Link>
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