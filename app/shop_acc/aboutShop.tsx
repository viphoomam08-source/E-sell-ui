import React, { useState, useEffect } from 'react';
import { ShieldCheck, Heart, MessageCircle, Share2, MapPin, Clock, Phone, Info, Truck, X } from 'lucide-react';

function AboutShop({ shopData }) {
  const [activeTab, setActiveTab] = useState('posts');
  const [sellerPosts, setSellerPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null); // State សម្រាប់គ្រប់គ្រងរូបភាពពេលចុចពង្រីក

  const shopInfo = {
    name: shopData?.seller_name || "TechStore Cambodia",
    description: shopData?.decribe || "ហាងលក់ឧបករណ៍អេឡិចត្រូនិក និងគ្រឿងបន្លាស់កុំព្យូទ័រគុណភាពខ្ពស់ ធានាត្រឹមត្រូវ។",
    avatar: shopData?.profile_pic 
      ? `${process.env.NEXT_PUBLIC_API_URL}/storage/${shopData.profile_pic}` 
      : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200",
    phone: shopData?.phone || "012 345 678 / 098 765 432",
    location: shopData?.address || "ភ្នំពេញ, កម្ពុជា",
    hours: "08:00 AM - 08:00 PM (រៀងរាល់ថ្ងៃ)",
  };

  // 1. Fetch Posts from Laravel Backend API (/api/show_post)
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/show_post`, {
          headers: {
            'Accept': 'application/json',
          }
        });
        const data = await response.json();
        
        const postsList = Array.isArray(data) ? data : (data.data || data.posts || []);
        setSellerPosts(postsList);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="w-full space-y-6 font-['Kantumruy_Pro'] relative">
      
      {/* Tab Switch */}
      <div className="flex items-center gap-3 border-b border-gray-200 pb-3">
        <button 
          onClick={() => setActiveTab('posts')}
          className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
            activeTab === 'posts' 
              ? 'bg-blue-600 text-white shadow-md' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          សកម្មភាព & ការផុស (Feed)
        </button>

        <button 
          onClick={() => setActiveTab('info')}
          className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
            activeTab === 'info' 
              ? 'bg-blue-600 text-white shadow-md' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          ព័ត៌មានហាងលម្អិត
        </button>
      </div>

      {/* 1. សកម្មភាព & ការផុស (Full Width 100%) */}
      {activeTab === 'posts' && (
        <div className="w-full space-y-6">
          {loading ? (
            <div className="text-center py-10 text-gray-400 text-sm">កំពុងទាញយកទិន្នន័យ...</div>
          ) : sellerPosts.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm bg-white rounded-2xl border border-gray-200/80">មិនទាន់មានការផុសនៅឡើយទេ</div>
          ) : (
            sellerPosts.map((post) => {
              const postImgUrl = post.pic ? `${process.env.NEXT_PUBLIC_API_URL}/storage/${post.pic}` : post.image;
              
              return (
                <div key={post.id} className="w-full bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
                  
                  {/* Header */}
                  <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={shopInfo.avatar} alt="Shop" className="w-11 h-11 rounded-full object-cover border-2 border-blue-500/20 shadow-sm" />
                      <div>
                        <h4 className="text-base font-bold text-gray-900 flex items-center gap-1.5">
                          {shopInfo.name} <ShieldCheck size={18} className="text-blue-600" />
                        </h4>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {post.created_at ? new Date(post.created_at).toLocaleDateString('km-KH') : 'ថ្មីៗនេះ'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Text Content */}
                  <p className="p-4 sm:p-5 text-sm sm:text-base text-gray-800 leading-relaxed whitespace-pre-line">
                    {post.Text || post.content}
                  </p>

                  {/* Image Section - ចុចលើរូបដើម្បីពង្រីក (Click to Zoom) */}
                  {postImgUrl && (
                    <div 
                      onClick={() => setSelectedImage(postImgUrl)}
                      className="w-full h-72 sm:h-96 bg-gray-100 overflow-hidden flex items-center justify-center cursor-pointer group relative"
                    >
                      <img 
                        src={postImgUrl} 
                        alt="Post content" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold">
                        ចុចដើម្បីពង្រីករូបភាព 🔍
                      </div>
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="p-4 sm:p-5 border-t border-gray-100 flex items-center justify-around text-gray-600 text-xs sm:text-sm font-medium">
                    <button className="flex items-center gap-2 hover:text-blue-600 transition cursor-pointer py-1.5 px-4 rounded-lg hover:bg-blue-50">
                      <Heart size={20} /> <span>{post.likes || 0} ចូលចិត្ត</span>
                    </button>
                    <button className="flex items-center gap-2 hover:text-blue-600 transition cursor-pointer py-1.5 px-4 rounded-lg hover:bg-blue-50">
                      <MessageCircle size={20} /> <span>{post.comments || 0} មតិយោបល់</span>
                    </button>
                    <button className="flex items-center gap-2 hover:text-blue-600 transition cursor-pointer py-1.5 px-4 rounded-lg hover:bg-blue-50">
                      <Share2 size={20} /> <span>ចែករំលែក</span>
                    </button>
                  </div>

                </div>
              );
            })
          )}
        </div>
      )}

      {/* 2. ព័ត៌មានហាងលម្អិត (Full Width 100%) */}
      {activeTab === 'info' && (
        <div className="w-full bg-white rounded-2xl p-6 sm:p-8 border border-gray-200/80 shadow-sm space-y-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Info className="w-6 h-6 text-blue-600" /> អំពីហាង {shopInfo.name}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-100 flex items-start gap-3">
              <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400 font-medium">អាសយដ្ឋាន</p>
                <p className="text-sm font-semibold text-gray-800 mt-0.5">{shopInfo.location}</p>
              </div>
            </div>

            <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-100 flex items-start gap-3">
              <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400 font-medium">ម៉ោងធ្វើការ</p>
                <p className="text-sm font-semibold text-gray-800 mt-0.5">{shopInfo.hours}</p>
              </div>
            </div>

            <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-100 flex items-start gap-3">
              <Phone className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400 font-medium">លេខទូរស័ព្ទ</p>
                <p className="text-sm font-semibold text-gray-800 mt-0.5">{shopInfo.phone}</p>
              </div>
            </div>

            <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-100 flex items-start gap-3">
              <Truck className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400 font-medium">ការដឹកជញ្ជូន</p>
                <p className="text-sm font-semibold text-gray-800 mt-0.5">ដឹកជញ្ជូនរហ័សទាន់ចិត្ត ២៤ ខេត្ត/ក្រុង</p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-400 font-medium mb-1.5">ការពិពណ៌នាបន្ថែម</p>
            <p className="text-sm text-gray-700 leading-relaxed bg-gray-50/80 p-4 rounded-xl border border-gray-100">
              {shopInfo.description}
            </p>
          </div>
        </div>
      )}

      {/* 🔍 IMAGE ZOOM MODAL (Lightbox) */}
      {selectedImage && (
        <div 
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="relative max-w-4xl w-full max-h-[90vh] flex items-center justify-center">
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 bg-black/50 p-2 rounded-full transition-colors cursor-pointer"
            >
              <X size={24} />
            </button>
            <img 
              src={selectedImage} 
              alt="Zoomed" 
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl" 
            />
          </div>
        </div>
      )}

    </div>
  );
}

export default AboutShop;