'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Star, MapPin, Clock, Bike, Plus, ShieldCheck, MessageCircle, ArrowLeft } from 'lucide-react';
import Banner from './banner';
import Chat from './chat';
import AboutShop from '../aboutShop';

export default function ShopView() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState('All');
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Follow States
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [loadingFollow, setLoadingFollow] = useState(false);

  // 🌟 Swipe Animation States
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartX = useRef(0);

  // 🆔 ID របស់ Seller ផ្ទាល់ខ្លួនដែលកំពុង Login
  const currentSellerId = typeof window !== 'undefined' ? localStorage.getItem('seller_id') || 1 : 1;

  useEffect(() => {
    if (!id) return;

    const fetchShopDetails = async () => {
      try {
        setLoading(true);

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shop-details/${id}?follower_id=${currentSellerId}`, {
          headers: { 
            'Accept': 'application/json',
          }
        });
        const data = await response.json();

        const fetchedShop = data.shop || data.seller || data.data || data;
        const fetchedProducts = data.products || data.product_sellers || data.menu || [];

        setShop(fetchedShop);
        setProducts(fetchedProducts);
        
        setFollowerCount(data.followers_count || 0);
        setIsFollowing(Boolean(data.is_following));

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
  }, [id, currentSellerId]);

  const handleFollow = async () => {
    try {
      setLoadingFollow(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/follow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          follower_id: Number(currentSellerId),
          seller_id: Number(id),
        })
      });

      const data = await response.json();
      if (response.ok) {
        setIsFollowing(data.is_following);
        setFollowerCount(prev => data.is_following ? prev + 1 : Math.max(0, prev - 1));
      } else {
        console.error("Follow error:", data);
        alert("កំហុស៖ " + (data.message || JSON.stringify(data.errors)));
      }
    } catch (error) {
      console.error("Error submitting follow:", error);
    } finally {
      setLoadingFollow(false);
    }
  };

  // 🌟 Edge Swipe Animation Handlers
  const handleTouchStart = (e) => {
    // ចាប់ផ្ដើមអូសលុះត្រាតែលូកពីគែមឆ្វេងបំផុត (តិចជាង 50px)
    if (e.touches[0].clientX < 50) {
      touchStartX.current = e.touches[0].clientX;
      setIsDragging(true);
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - touchStartX.current;
    
    // ឱ្យទំព័ររអិលតាមដៃទៅស្ដាំ (បើអូសទៅឆ្វេងវិញមិនឱ្យទៅទេ)
    if (diff > 0) {
      setTranslateX(diff);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    // បើអូសហួសចម្ងាយ 120px ឱ្យវាថយក្រោយស្វ័យប្រវត្តិតាម Animation
    if (translateX > 120) {
      setTranslateX(window.innerWidth); // រអិលចេញផុតអេក្រង់
      setTimeout(() => {
        router.back();
      }, 200);
    } else {
      // បើអូសមិនដល់ ឱ្យវតបមកទីតាំងដើមវិញដោយរលូន
      setTranslateX(0);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-['Kantumruy_Pro']">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-blue-600 text-sm font-semibold animate-pulse">កំពុងទាញយកទិន្នន័យហាង...</div>
        </div>
      </div>
    );
  }

  const shopData = shop?.shop || shop?.seller || shop || {};
  const shopName = shopData.seller_name || shopData.name || shopData.username || 'ហាងទំនិញ';
  
  const profileImage = shopData.profile_pic_url || (shopData.profile_pic ? `${process.env.NEXT_PUBLIC_API_URL}/storage/${shopData.profile_pic}` : null);
  const backgroundImage = shopData.background_image_url || (shopData.Image ? `${process.env.NEXT_PUBLIC_API_URL}/storage/${shopData.Image}` : null);

  const filteredProducts = activeTab === 'All' 
    ? products 
    : products.filter(item => 
        item.category_name === activeTab || 
        item.category === activeTab
      );
  
  return (
    <div 
      className="min-h-screen bg-slate-50 pb-16 font-['Kantumruy_Pro'] relative select-none overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: `translateX(${translateX}px)`,
        transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      
      {/* 🔙 Floating Back Button */}
      <div className="absolute top-4 left-4 z-40">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-md shadow-md border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-blue-600 hover:text-white transition-all cursor-pointer active:scale-95"
          title="ថយក្រោយ"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      {/* 1. Cover Banner Section */}
      <div className="w-full bg-white shadow-sm">
        <div className="h-48 sm:h-64 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
          {backgroundImage ? (
            <img 
               src={backgroundImage}
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
                  src={profileImage}
                  alt={shopName} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{shopName.charAt(0).toUpperCase()}</span>
              )}
            </div>

            <div className="flex-1 pt-2 sm:pt-4">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{shopName}</h1>
                <ShieldCheck className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-sm text-slate-600 mt-1 font-medium">{shopData?.decribe || shopData?.description || 'Fast Food & Subs • Open Now'}</p>
              
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3 text-xs sm:text-sm text-slate-600">
                <span className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-xl font-semibold shadow-2xs border border-amber-100">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" /> 4.8
                </span>

                <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                  <MapPin className="w-4 h-4 text-blue-500" /> គីឡូម៉ែត្រ
                </span>

                <button 
                  onClick={() => setActiveTab('ABOUT_SHOP')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer font-medium ${
                    activeTab === 'ABOUT_SHOP' 
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                      : 'bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-600 border-slate-200'
                  }`}
                >
                  <MapPin className={`w-4 h-4 ${activeTab === 'ABOUT_SHOP' ? 'text-white' : 'text-blue-500'}`} /> 
                  <span>About shop</span>
                </button>

                <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                  <Clock className="w-4 h-4 text-blue-500" /> ~31 នាទី
                </span>

                {/* 🛒 ប៊ូតុង Follow */}
                {Number(currentSellerId) !== Number(id) ? (
                  <button 
                    onClick={handleFollow}
                    disabled={loadingFollow}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl border font-semibold transition-all cursor-pointer shadow-sm ${
                      isFollowing 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                        : 'bg-blue-600 text-white hover:bg-blue-700 border-blue-600 shadow-blue-200'
                    }`}
                  >
                    {isFollowing ? '✓ កំពុងតាមដាន (Following)' : '+ តាមដាន (Follow)'}
                  </button>
                ) : (
                  <span className="text-xs font-semibold bg-amber-50 text-amber-700 px-3 py-1.5 rounded-xl border border-amber-200">
                    ⭐ ហាងរបស់អ្នកផ្ទាល់
                  </span>
                )}

                <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 font-semibold text-slate-700">
                  👥 Followers: <span className="text-blue-600">{followerCount}</span>
                </span>

                {/* Chat Button */}
                <button 
                  onClick={() => setIsChatOpen(true)}
                  className="flex items-center gap-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 px-3.5 py-1.5 rounded-xl border border-blue-200 font-semibold transition-all cursor-pointer shadow-2xs"
                >
                  <MessageCircle className="w-4 h-4 text-blue-500" /> ឆាតជាមួយហាង
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Promotional Banner */}
      <div className="w-full my-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="rounded-2xl overflow-hidden shadow-md">
            <Banner sellerId={id} />
          </div>
        </div>
      </div>

      {/* 3. Sticky Category Tabs */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md shadow-2xs z-30 py-3 border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center gap-2 overflow-x-auto no-scrollbar">
          
          {categories.map((cat, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(cat)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all shadow-2xs cursor-pointer ${
                activeTab === cat 
                  ? 'bg-blue-600 text-white shadow-blue-200 shadow-md scale-105' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}

          <button
            onClick={() => setActiveTab('ABOUT_SHOP')}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all shadow-2xs cursor-pointer ${
              activeTab === 'ABOUT_SHOP' 
                ? 'bg-blue-600 text-white shadow-blue-200 shadow-md scale-105' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            About Shop
          </button>

        </div>
      </div>

      {/* 4. Dynamic Content Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-8">
        
        {activeTab === 'ABOUT_SHOP' ? (
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-5 flex items-center gap-2">
              <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
              សកម្មភាព និងព័ត៌មានហាង (About Shop)
            </h2>
            <AboutShop shopData={shopData} />
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-5 flex items-center gap-2">
              <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
              ម៉ឺនុយហាង ({activeTab})
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((item) => {
                  const productName = item.product_name || item.name;
                  const productPrice = Number(item.product_price || item.price || 0);
                  const productImage = item.image || item.product_image;

                  return (
                    <div 
                      key={item.id}
                      className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100 flex items-center justify-between gap-4 hover:shadow-md transition-all duration-300 group"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-24 h-24 sm:w-28 sm:h-28 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center relative">
                          {productImage ? (
                            <img 
                              src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${productImage}`}
                              alt={productName} 
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                            />
                          ) : (
                            <span className="text-xs text-slate-400 font-medium">គ្មានរូបភាព</span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                            {productName}
                          </h3>
                          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{item.product_description || item.description || 'គ្មានការពិពណ៌នា'}</p>
                          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1"> Brand: {item.brand || 'គ្មានម៉ាក'}</p>
                          <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-blue-600 font-extrabold text-lg">
                              ${productPrice.toFixed(2)}
                            </span>
                            <span className="text-xs text-slate-400">
                              ≈ {(productPrice * 4100).toLocaleString()}៛
                            </span>
                          </div>
                        </div>
                      </div>

                      <button 
                        className="w-11 h-11 rounded-xl bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center shadow-sm transition-all active:scale-95 flex-shrink-0 cursor-pointer hover:shadow-blue-200 hover:shadow-md"
                        title="Add Item"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full bg-white rounded-2xl p-12 text-center text-slate-400 text-sm shadow-xs border border-slate-100">
                  មិនមានទំនិញនៅក្នុងប្រភេទនេះទេ
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      <Chat 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        shopId={id}
      />

    </div>
  );
}