'use client';
import React, { useState } from 'react';
import { History, Heart, User } from 'lucide-react';
import Favorite from './component/favorite';
import Orderhistory from './component/orderhistory';
import  ACC  from './component/buyeracc';
function Page() {
  const [activeTab, setActiveTab] = useState('history');

  return (
    <div className="w-full bg-slate-50 min-h-screen font-['Kantumruy_Pro'] p-6">
      
      {/* Navigation Header */}
      <div className="w-full bg-white border border-slate-200 px-6 py-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-sm mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-sm font-bold text-slate-800">ផ្ទាំងគ្រប់គ្រង (Dashboard)</h1>
        </div>

        <div className="flex items-center gap-3">
          {/* ប៊ូតុងប្រវត្តិការបញ្ជាទិញ */}
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 shadow-2xs cursor-pointer active:scale-95 ${
              activeTab === 'history' 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                : 'bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-600 border border-slate-200'
            }`}
          >
            <History className={`w-4 h-4 ${activeTab === 'history' ? 'text-white' : 'text-blue-500'}`} />
            <span>ប្រវត្តិការបញ្ជាទិញ</span>
          </button>

          {/* ប៊ូតុងទំនិញដែលចូលចិត្ត */}
          <button 
            onClick={() => setActiveTab('favorites')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 shadow-2xs cursor-pointer active:scale-95 ${
              activeTab === 'favorites' 
                ? 'bg-rose-600 text-white shadow-md shadow-rose-500/20' 
                : 'bg-slate-50 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200'
            }`}
          >
            <Heart className={`w-4 h-4 ${activeTab === 'favorites' ? 'text-white' : 'text-rose-500'}`} />
            <span>ទំនិញដែលចូលចិត្ត</span>
          </button>

          {/* ប៊ូតុងគណនីរបស់ខ្ញុំ */}
          <button 
            onClick={() => setActiveTab('account')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 shadow-2xs cursor-pointer active:scale-95 ${
              activeTab === 'account' 
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20' 
                : 'bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-600 border border-slate-200'
            }`}
          >
            <User className={`w-4 h-4 ${activeTab === 'account' ? 'text-white' : 'text-emerald-500'}`} />
            <span>គណនីរបស់ខ្ញុំ</span>
          </button>
        </div>
      </div>

      {/* Dynamic UI Content (បង្ហាញផ្ទាំង UI ទៅតាម Tab ដែលបានចុច) */}
      <div className="w-full bg-white border border-slate-200 rounded-2xl p-6 shadow-sm min-h-[300px]">
        {activeTab === 'history' && (
         <Orderhistory/>
        )}

        {activeTab === 'favorites' && (
         <Favorite/>
        )}

        {activeTab === 'account' && (
         <ACC/>
        )}
      </div>

    </div>
  );
}

export default Page;