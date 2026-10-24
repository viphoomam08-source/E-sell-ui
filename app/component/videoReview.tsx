'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Play, ChevronLeft, ChevronRight, Sparkles, LayoutGrid, Rows, Loader2 } from 'lucide-react';

export default function VideoReview() {
  const router = useRouter();
  const scrollRef = useRef(null);
  const [showAll, setShowAll] = useState(false);
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = typeof window !== 'undefined' 
      ? (localStorage.getItem('access_token') || localStorage.getItem('token') || localStorage.getItem('jwt_token')) 
      : '';

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      setError('');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

      try {
        const response = await fetch(`${baseUrl}/api/productSell-list_videos`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('មិនអាចទាញយកទិន្នន័យវីដេអូបានទេ។');
        }

        const data = await response.json();
        const productsList = data.product || data.data || data.products || (Array.isArray(data) ? data : []);

        const formattedReels = productsList
          .filter(item => item.video || item.product_video)
          .map((item, index) => ({
            id: item.id || index,
            title: item.product_name || 'វីដេអូផលិតផល',
            videoUrl: `${baseUrl}/storage/${item.video || item.product_video}`
          }));

        setReels(formattedReels);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'មានបញ្ហាក្នុងការទាញយកទិន្នន័យ។');
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [token]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // 🚀 Function to handle video card click
  const handleCardClick = (id) => {
    router.push(`/video/${id}`);
  };  

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 font-['Kantumruy_Pro']">
      
      <div className="flex justify-between items-end mb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-gray-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            វីដេអូសម្រាប់ផលិតផល
          </h2>
          <p className="text-xs text-gray-500">ទស្សនាវីដេអូផលិតផលជាក់ស្តែងពីប្រព័ន្ធ</p>
        </div>

        <div className="flex items-center space-x-3">
          {reels.length > 0 && (
            <button 
              onClick={() => setShowAll(!showAll)}
              className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 transition-colors cursor-pointer bg-blue-50 px-3 py-1.5 rounded-xl"
            >
              {showAll ? (
                <>
                  <Rows className="w-4 h-4" /> Show Less
                </>
              ) : (
                <>
                  <LayoutGrid className="w-4 h-4" /> See All ({reels.length})
                </>
              )}
            </button>
          )}

          {!showAll && reels.length > 0 && (
            <div className="hidden sm:flex items-center space-x-1.5 pl-2 border-l border-gray-200">
              <button 
                onClick={() => scroll('left')}
                className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all shadow-xs cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={() => scroll('right')}
                className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all shadow-xs cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12 text-gray-400 gap-2 text-xs">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" /> កំពុងទាញយកវីដេអូ...
        </div>
      ) : error ? (
        <div className="text-center py-8 text-rose-500 text-xs">{error}</div>
      ) : reels.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-xs bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          មិនមានវីដេអូបង្ហាញក្នុងប្រព័ន្ធឡើយ។
        </div>
      ) : (
        showAll ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 animate-in fade-in duration-300">
            {reels.map((reel) => (
              <div 
                key={reel.id}
                onClick={() => handleCardClick(reel.id)}
                className="w-full h-48 sm:h-72 rounded-2xl relative overflow-hidden group shadow-md bg-gray-900 cursor-pointer border border-gray-100 active:scale-95 transition-all"
              >
                <video 
                  src={reel.videoUrl}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2.5 sm:p-4 pointer-events-none">
                  <h3 className="text-white text-[10px] sm:text-xs font-bold line-clamp-2 group-hover:text-blue-300 transition-colors">
                    {reel.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div 
            ref={scrollRef}
            className="flex space-x-3 overflow-x-auto pb-3 pt-1 scrollbar-none snap-x snap-mandatory scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {reels.map((reel) => (
              <div 
                key={reel.id}
                onClick={() => handleCardClick(reel.id)}
                className="flex-shrink-0 w-32 h-48 sm:w-48 sm:h-72 rounded-2xl relative overflow-hidden group snap-start shadow-md bg-gray-900 cursor-pointer border border-gray-100 active:scale-95 transition-all"
              >
                <video 
                  src={reel.videoUrl}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2.5 sm:p-4 pointer-events-none">
                  <h3 className="text-white text-[10px] sm:text-xs font-bold line-clamp-2 group-hover:text-blue-300 transition-colors">
                    {reel.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        )
      )}

    </div>
  );
}