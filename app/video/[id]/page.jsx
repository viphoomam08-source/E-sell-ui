'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, MessageCircle, Share2, Volume2, VolumeX, ShoppingBag, Loader2, Sparkles } from 'lucide-react';

export default function VideoView() {
  const router = useRouter();
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [muted, setMuted] = useState(true);
  const [likes, setLikes] = useState({});

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
            price: item.product_price || '0.00',
            videoUrl: `${baseUrl}/storage/${item.video || item.product_video}`
          }));

        setReels(formattedReels);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'មានបញ្ហាក្នុងการទាញយកទិន្នន័យ។');
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [token]);

  const toggleLike = (id, e) => {
    e.stopPropagation();
    setLikes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleProductClick = (productId) => {
    router.push(`/product/${productId}`);
  };

  if (loading) {
    return (
      <div className="h-[85vh] w-full max-w-md mx-auto flex flex-col justify-center items-center text-slate-400 gap-2 text-xs font-['Kantumruy_Pro']">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <span>កំពុងទាញយកវីដេអូ Reels...</span>
      </div>
    );
  }

  if (error || reels.length === 0) {
    return (
      <div className="h-[85vh] w-full max-w-md mx-auto flex items-center justify-center text-center p-6 text-slate-400 text-xs bg-slate-50 rounded-3xl border border-dashed border-slate-200 font-['Kantumruy_Pro']">
        {error || 'មិនមានវីដេអូបង្ហាញក្នុងប្រព័ន្ធឡើយ។'}
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center py-4 font-['Kantumruy_Pro'] bg-slate-950/5">
      {/* Container សម្រាប់ Scroll ទម្លាក់ចុះឡើងបែប Reel */}
      <div className="w-full max-w-[420px] h-[82vh] bg-slate-950 rounded-3xl overflow-y-scroll snap-y snap-mandatory scrollbar-none shadow-2xl relative border border-slate-800">
        
        {reels.map((reel) => (
          <div 
            key={reel.id}
            className="w-full h-full snap-start relative flex items-center justify-center bg-black overflow-group"
          >
            {/* Video Element */}
            <video 
              src={reel.videoUrl}
              autoPlay
              muted={muted}
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Gradient Overlay ឱ្យស្អាត */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80 pointer-events-none" />

            {/* Top Bar (Audio Toggle) */}
            <div className="absolute top-4 right-4 z-10">
              <button 
                onClick={() => setMuted(!muted)}
                className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center border border-white/10 active:scale-95 transition-all cursor-pointer"
              >
                {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 text-blue-400" />}
              </button>
            </div>

            {/* Right Action Sidebar (Like, Share, etc.) */}
            <div className="absolute bottom-20 right-4 z-10 flex flex-col items-center space-y-4">
              <button 
                onClick={(e) => toggleLike(reel.id, e)}
                className="flex flex-col items-center group cursor-pointer"
              >
                <div className={`w-11 h-11 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 transition-transform active:scale-90 ${likes[reel.id] ? 'text-rose-500 bg-rose-500/20' : 'text-white'}`}>
                  <Heart className={`w-6 h-6 ${likes[reel.id] ? 'fill-rose-500' : ''}`} />
                </div>
                <span className="text-[11px] text-white font-medium mt-1">យល់ព្រម</span>
              </button>

              <button className="flex flex-col items-center group cursor-pointer">
                <div className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center border border-white/10">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <span className="text-[11px] text-white font-medium mt-1">មតិ</span>
              </button>

              <button className="flex flex-col items-center group cursor-pointer">
                <div className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center border border-white/10">
                  <Share2 className="w-6 h-6" />
                </div>
                <span className="text-[11px] text-white font-medium mt-1">ចែករំលែក</span>
              </button>
            </div>

            {/* Bottom Info & Product Button */}
            <div className="absolute bottom-6 left-4 right-20 z-10 space-y-2 pointer-events-auto">
              <div className="flex items-center gap-1.5 text-blue-400 text-xs font-bold bg-blue-500/20 px-2.5 py-1 rounded-full w-max backdrop-blur-sm border border-blue-400/30">
                <Sparkles className="w-3.5 h-3.5" /> វីដេអូផលិតផល
              </div>

              <h3 className="text-white text-sm font-bold line-clamp-2 drop-shadow-md">
                {reel.title}
              </h3>

              <div className="flex items-center justify-between pt-1">
                <span className="text-white text-base font-extrabold tracking-tight drop-shadow-md">
                  ${reel.price}
                </span>

                <button 
                  onClick={() => handleProductClick(reel.id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-lg active:scale-95 transition-all cursor-pointer border border-blue-500/50"
                >
                  <ShoppingBag className="w-4 h-4" /> មើលទំនិញ
                </button>
              </div>
            </div>

          </div>
        ))}

      </div>
    </div>
  );
}