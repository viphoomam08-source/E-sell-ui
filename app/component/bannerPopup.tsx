'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Copy, Check } from 'lucide-react';

export default function BannerPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const promoCode = "PROMO50";

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(promoCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-['Kantumruy_Pro']">
          
          {/* Backdrop Blur Animation (ចុចខាងក្រៅដើម្បីបិទ) */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
          />

          {/* Modal Box (បានពង្រីកទទឹងឱ្យវែងទូលាយ max-w-xl និងលុបបំបាត់ប៊ូតុងទិញចោល) */}
          <motion.div 
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 z-10"
          >

            {/* Top Image Banner Section (Blue Theme) */}
            <div className="relative w-full h-56 sm:h-64 bg-gradient-to-br from-blue-600 to-indigo-700 overflow-hidden flex items-center justify-center">
              <img 
                src="https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?q=80&w=800&auto=format&fit=crop" 
                alt="Banner Promotion" 
                className="w-full h-full object-cover opacity-85 hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent flex items-end p-6">
                <span className="inline-flex items-center gap-1 bg-white/90 text-blue-600 text-xs font-bold px-3 py-1 rounded-full shadow-sm animate-pulse">
                  <Sparkles className="w-3.5 h-3.5" /> Special Banner
                </span>
              </div>
            </div>

            {/* Content Section (គ្មានប៊ូតុងបញ្ជាទិញទេ) */}
            <div className="p-6 sm:p-8 text-center space-y-4">
              
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mb-1">
                  ការបញ្ចុះតម្លៃពិសេសប្រចាំរដូវកាល
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  ស្វែងរកផលិតផលថ្មីៗជាច្រើនជម្រើសជាមួយកូដពិសេសនៅទីនេះ!
                </p>
              </div>

              {/* Promo Code Box */}
              <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-2xl p-3.5 shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">កូដ៖</span>
                  <span className="text-sm font-bold font-mono text-blue-600 tracking-wider">{promoCode}</span>
                </div>
                <button 
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-xs font-bold transition cursor-pointer active:scale-95"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'បានចម្លង' : 'ចម្លង'}
                </button>
              </div>

              <p className="text-[11px] text-slate-400">
                លក្ខខណ្ឌផ្សេងៗត្រូវបានអនុវត្ត (T&Cs apply). ចុចទីកន្លែងទំនេរខាងក្រៅដើម្បីបិទ។
              </p>

            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}