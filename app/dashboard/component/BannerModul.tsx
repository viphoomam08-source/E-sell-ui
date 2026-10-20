'use client';

import React, { useState } from 'react';
import { Search, Plus, X, Upload, Image as ImageIcon } from 'lucide-react';
import Bannertable from '../component/table/Bannertable';
// --- Modal Component for Adding Banner ---
import BannerModal from '../component/modal/BannerModal';
import { s } from 'framer-motion/m';


// --- Main Banner Module UI ---
export default function BannerModul() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mock data so the UI displays immediately
  const [banners, setBanners] = useState([
    { id: 1, Name: 'ការបញ្ចុះតម្លៃពិសេសប្រចាំរដូវកាល', Image_Banner: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a' },
    { id: 2, Name: 'ទំនិញគុណភាពខ្ពស់ តម្លៃសមរម្យ', Image_Banner: 'https://images.unsplash.com/photo-1555529771-835f59fc5efe' }
  ]);

  const handleAddBanner = (newBanner) => {
    setBanners([newBanner, ...banners]);
  };

  return (
    <div className="p-6 font-['Kantumruy_Pro'] space-y-6">
      
      {/* Action Bar (Search & Add Button) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ស្វែងរកតាមឈ្មោះបដា..."
            className="w-full pl-10 pr-4 py-2 bg-white text-xs rounded-xl border border-slate-200 focus:outline-blue-600 shadow-xs"
          />
        </div>

        {/* Add Banner Button */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> បន្ថែម bannerថ្មី
        </button>
      </div>

      {/* Table Component */}
      <div>
         <Bannertable searchTerm={searchQuery} />
      </div>
    
      {/* Popup Modal Component */}
      <BannerModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={handleAddBanner} 
      />
    </div>
  );
}