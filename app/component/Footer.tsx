'use client';
import React from 'react';
import Link from 'next/link';
import { Send, Heart } from 'lucide-react';

export default function FooterStyle1() {
  return (
    <footer className="bg-white border-t border-slate-200/60 pt-12 pb-6 px-4 sm:px-6 lg:px-8 font-['Kantumruy_Pro'] text-slate-500 text-xs">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-8 pb-10 border-b border-slate-100">
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold text-[11px]">V</div>
            <span className="text-sm font-bold text-slate-900 tracking-tight">E-Commerce Store</span>
          </div>
          <p className="text-slate-500 leading-relaxed max-w-sm">
            វេទិកាទិញទំនិញអនឡាញដ៏ទុកចិត្តរបស់អ្នក ផ្តល់ជូននូវផលិតផលមានគុណភាពខ្ពស់ និងតម្លៃសមរម្យ។
          </p>
        </div>
        <div className="space-y-2.5">
          <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider">ទំព័រដើម</h4>
          <p><Link href="/" className="hover:text-blue-600 transition-colors">ផលិតផល</Link></p>
          <p><Link href="/cart" className="hover:text-blue-600 transition-colors">កន្ត្រកទំនិញ</Link></p>
        </div>
        <div className="space-y-2.5">
          <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider">ជំនួយ</h4>
          <p><span className="hover:text-blue-600 transition-colors cursor-pointer">របៀបបញ្ជាទិញ</span></p>
          <p><span className="hover:text-blue-600 transition-colors cursor-pointer">ទំនាក់ទំនង</span></p>
        </div>
        <div className="space-y-2.5">
          <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider">តាមដានយើង</h4>
          <div className="flex gap-2">
            <input type="email" placeholder="អ៊ីម៉ែល..." className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 w-full focus:outline-none focus:border-blue-600 text-slate-800" />
            <button className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"><Send className="w-3.5 h-3.5" /></button>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto pt-6 flex flex-col sm:flex-row justify-between items-center text-slate-400 gap-2">
        <p>© 2026 E-Commerce Store. រក្សាសិទ្ធិគ្រប់យ៉ាង។</p>
        <p className="flex items-center gap-1">រចនាដោយ <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /></p>
      </div>
    </footer>
  );
}