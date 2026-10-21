import React, { useState } from 'react';
import { ShieldCheck, Heart, MessageCircle, Share2, MapPin, Clock, Phone, Info, Truck } from 'lucide-react';

function AboutShop({ shopData }) {
  const [activeTab, setActiveTab] = useState('posts');

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

  const sellerPosts = [
    {
      id: 1,
      content: "🔥 មកដល់ថ្មីទៀតហើយ! កាស Wireless Earbuds ស៊េរីថ្មី ធានាថា bass ខ្លាំង ត្រជាក់ភ្នែក លក់ដាច់ខ្លាំងបញ្ចុះតម្លៃពិសេសសប្តាហ៍នេះ! 🎧✨",
      image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=1200",
      date: "2 ម៉ោងមុន",
      likes: 142,
      comments: 24
    },
    {
      id: 2,
      content: "📦 អរគុណអតិថិជនទាំងអស់គ្នាសម្រាប់ការគាំទ្រហាងយើងខ្ញុំជាបន្តបន្ទាប់! រាល់ការបញ្ជាទិញថ្ងៃនេះ មានថែមជូនកាដូពិសេសភ្លាមៗ 🎁",
      image: "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&q=80&w=1200",
      date: "ម្សិលមិញ",
      likes: 89,
      comments: 12
    }
  ];

  return (
    <div className="w-full space-y-6">
      
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
          {sellerPosts.map((post) => (
            <div key={post.id} className="w-full bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
              
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={shopInfo.avatar} alt="Shop" className="w-11 h-11 rounded-full object-cover border-2 border-blue-500/20 shadow-sm" />
                  <div>
                    <h4 className="text-base font-bold text-gray-900 flex items-center gap-1.5">
                      {shopInfo.name} <ShieldCheck size={18} className="text-blue-600" />
                    </h4>
                    <p className="text-xs text-gray-400 mt-0.5">{post.date}</p>
                  </div>
                </div>
              </div>

              {/* Text Content */}
              <p className="p-4 sm:p-5 text-sm sm:text-base text-gray-800 leading-relaxed">
                {post.content}
              </p>

              {/* Image Section - Set Full Width & Responsive Height */}
              <div className="w-full h-[400px] sm:h-[520px] bg-gray-100 overflow-hidden">
                <img src={post.image} alt="Post content" className="w-full h-full object-cover" />
              </div>

              {/* Actions Bar */}
              <div className="p-4 sm:p-5 border-t border-gray-100 flex items-center justify-around text-gray-600 text-xs sm:text-sm font-medium">
                <button className="flex items-center gap-2 hover:text-blue-600 transition cursor-pointer py-1.5 px-4 rounded-lg hover:bg-blue-50">
                  <Heart size={20} /> <span>{post.likes} ចូលចិត្ត</span>
                </button>
                <button className="flex items-center gap-2 hover:text-blue-600 transition cursor-pointer py-1.5 px-4 rounded-lg hover:bg-blue-50">
                  <MessageCircle size={20} /> <span>{post.comments} មតិយោបល់</span>
                </button>
                <button className="flex items-center gap-2 hover:text-blue-600 transition cursor-pointer py-1.5 px-4 rounded-lg hover:bg-blue-50">
                  <Share2 size={20} /> <span>ចែករំលែក</span>
                </button>
              </div>

            </div>
          ))}
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

    </div>
  );
}

export default AboutShop;