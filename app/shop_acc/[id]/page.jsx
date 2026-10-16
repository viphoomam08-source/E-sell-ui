'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Star, MapPin, Clock, Bike, Plus, ShieldCheck, MessageCircle } from 'lucide-react';
import Banner from './banner';
import Chat from './chat';

export default function ShopView() {
  const params = useParams();
  const id = params?.id;

  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  
  // State សម្រាប់គ្រប់គ្រងការបើក/បិទប្រអប់ Chat
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchShopDetails = async () => {
      try {
        setLoading(true);

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shop-details/${id}`, {
          headers: { 
            'Accept': 'application/json',
          }
        });
        const data = await response.json();

        const fetchedShop = data.seller || data.shop || data;
        const fetchedProducts = data.products || data.product_sellers || data.menu || [];

        setShop(fetchedShop);
        setProducts(fetchedProducts);

        const uniqueCategories = Array.from(
          new Set(
            fetchedProducts
              .map(item => item.category_name || item.category)
              .filter(Boolean)
          )
        );

        setCategories(['All', ...uniqueCategories]);

      } catch (error) {
        console.error("Error fetching shop details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchShopDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center font-['Kantumruy_Pro']">
        <div className="text-blue-600 text-sm font-medium animate-pulse">កំពុងទាញយកទិន្នន័យហាង...</div>
      </div>
    );
  }

  const shopName = shop?.seller_name || 'ហាងទំនិញ';
  const profileImage = shop?.profile_pic;
  const backgroundImage = shop?.Image;

  const filteredProducts = activeTab === 'All' 
    ? products 
    : products.filter(item => 
        item.category_name === activeTab || 
        item.category === activeTab
      );
  
  return (
    <div className="min-h-screen bg-gray-50 pb-16 font-['Kantumruy_Pro'] relative">
      
      {/* 1. Cover Banner Section */}
      <div className="w-full bg-white shadow-sm">
        <div className="h-48 sm:h-64 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
          {backgroundImage ? (
            <img 
               src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${backgroundImage}`}
               alt="Store Cover" 
               className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-blue-600 to-indigo-700 opacity-90" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>

        {/* Profile & Store Details Section */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative pb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start -mt-16 sm:-mt-20 mb-4 gap-5 text-center sm:text-left">
            
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-white bg-blue-600 shadow-xl overflow-hidden flex-shrink-0 flex items-center justify-center text-white font-bold text-3xl z-10">
              {profileImage ? (
                <img 
                  src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${profileImage}`}
                  alt={shopName} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{shopName.charAt(0).toUpperCase()}</span>
              )}
            </div>

            <div className="flex-1 pt-2 sm:pt-4">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">{shopName}</h1>
                <ShieldCheck className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-sm text-gray-600 mt-1 font-medium">{shop?.decribe || 'Fast Food & Subs • Open Now'}</p>
              
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3 text-xs sm:text-sm text-gray-600">
                <span className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg font-semibold shadow-sm border border-amber-100">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" /> 4.8
                </span>
                <span className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
                  <MapPin className="w-4 h-4 text-blue-500" /> គីឡូម៉ែត្រ
                </span>
                <span className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
                  <Clock className="w-4 h-4 text-blue-500" /> ~31 នាទី
                </span>
                <span className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
                  <Bike className="w-4 h-4 text-blue-500" /> $3.28
                </span>

                {/* Chat Trigger Button */}
                <button 
                  onClick={() => setIsChatOpen(true)}
                  className="flex items-center gap-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 font-semibold transition-all cursor-pointer shadow-sm"
                >
                  <MessageCircle className="w-4 h-4 text-blue-500" /> ឆាតជាមួយហាង
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Full-Width Stretch Promotional Banner Slider */}
      <div className="w-full my-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="rounded-2xl overflow-hidden shadow-md">
            <Banner sellerId={id} />
          </div>
        </div>
      </div>

      {/* 3. Sticky Category Tabs */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-md shadow-sm z-30 py-3">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {categories.map((cat, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(cat)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all shadow-sm ${
                activeTab === cat 
                  ? 'bg-blue-600 text-white shadow-blue-200 shadow-md scale-105' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Product Listing Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
          <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
          ម៉ឺនុយហាង (Menu)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((item) => {
              const productName = item.product_name || item.name;
              const productPrice = Number(item.product_price || item.price || 0);
              const productImage = item.image;

              return (
                <div 
                  key={item.id}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between gap-4 hover:shadow-lg transition-all duration-200 group"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center relative">
                      {productImage ? (
                        <img 
                          src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${productImage}`}
                          alt={productName} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                        />
                      ) : (
                        <span className="text-xs text-gray-400 font-medium">គ្មានរូបភាព</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                        {productName}
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{item.product_description || 'គ្មានការពិពណ៌នា'}</p>
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-1"> Brand: {item.brand || 'គ្មានម៉ាក'}</p>
                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-blue-600 font-extrabold text-lg">
                          ${productPrice.toFixed(2)}
                        </span>
                        <span className="text-xs text-gray-400">
                          ≈ {(productPrice * 4100).toLocaleString()}៛
                        </span>
                      </div>
                    </div>
                  </div>

                  <button 
                    className="w-11 h-11 rounded-xl bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center shadow-md transition-all active:scale-95 flex-shrink-0 cursor-pointer hover:shadow-blue-200 hover:shadow-lg"
                    title="Add Item"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              );
            })
          ) : (
            <div className="col-span-full bg-white rounded-2xl p-12 text-center text-gray-400 text-sm shadow-sm border border-gray-100">
              មិនមានទំនិញនៅក្នុងប្រភេទនេះទេ
            </div>
          )}
        </div>
      </div>

      {/* Embedded Chat Component */}
      <Chat 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        shopId={id}
      />

    </div>
  );
}