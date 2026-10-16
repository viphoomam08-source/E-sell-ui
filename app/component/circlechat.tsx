import React, { useState } from 'react';
import ChatForm from './chatForm';
import SellerList from './sellerList'

export default function Circlechat({ unreadCount = 0 }) {
  const [openForm, setOpenForm] = useState(false);

  const handleToggle = () => {
    setOpenForm(!openForm);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      {/* 1. ប្រអប់ ChatForm នឹងលោតអណ្តែតនៅពីលើប៊ូតុង */}
      {openForm && (
        <div className="absolute bottom-16 right-0 mb-2 w-80 sm:w-96 shadow-2xl rounded-2xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          <SellerList />
        </div>
      )}

      {/* 2. Main Floating Button */}
      <div className="relative flex items-center justify-center">
        {/* Subtle pulsing background glow */}
        <div className="absolute w-12 h-12 bg-blue-500/20 rounded-full animate-ping pointer-events-none"></div>

        <button
          onClick={handleToggle}
          aria-label="Open Chat"
          className="relative flex items-center justify-center w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg active:scale-95 transition-all duration-200 cursor-pointer"
        >
          {/* Chat Icon */}
          <svg 
            className="w-5 h-5 text-white" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            ></path>
          </svg>

          {/* Unread Badge */}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white shadow-xs">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}