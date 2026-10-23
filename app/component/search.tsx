'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Registerform from './registerform'; 
import eLogo from '../image/e.png';
import { Search as SearchIcon, X, Loader2, ShoppingCart, Calendar, Clock } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Search() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  // 🔍 State សម្រាប់គ្រប់គ្រងការស្វែងរក
  const [keyword, setKeyword] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // 📅 State សម្រាប់ Date និង Time API
  const [currentDate, setCurrentDate] = useState('...');
  const [currentTime, setCurrentTime] = useState('...');

  // 1️⃣ Fetch Date ពី API (/api/date)
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/date`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status) {
          setCurrentDate(data.current_date);
        }
      })
      .catch((err) => console.error('Error fetching date:', err));
  }, []);

  // 2️⃣ Fetch Time ពី API (/api/time) រៀងរាល់ ១វិនាទីម្តង
  useEffect(() => {
    const fetchTime = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/time`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
        });
        const data = await res.json();
        if (data.status) {
          setCurrentTime(data.current_time || `${data.hours}:${data.minutes}:${data.seconds}`);
        }
      } catch (err) {
        console.error('Error fetching time:', err);
      }
    };

    fetchTime();
    const timeInterval = setInterval(fetchTime, 1000);
    return () => clearInterval(timeInterval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsSearchFocused(false);
        setShowDropdown(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (!keyword.trim()) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/search-product`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ keyword }),
        });
        const data = await res.json();
        if (data.status) {
          setSearchResults(data.data || []);
        }
      } catch (err) {
        console.error('Error searching products:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [keyword]);

  // 3️⃣ Fetch User Account (មានស្រាប់សម្រាប់ទាញយកឈ្មោះនិង Profile)
  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    const role = localStorage.getItem('user_role') || 'buyer';

    if (!token) return;

    const apiEndpoint = role === 'seller' 
      ? `${API_BASE_URL}/api/seller-acc` 
      : `${API_BASE_URL}/api/buyer-acc`;

    fetch(apiEndpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Unauthorized');
        }
        return data;
      })
      .then((resData) => {
        const userData = resData.data; 
        if (userData) {
         setUser({
           username: userData.seller_name || userData.username || userData.name || 'Account',
           email: userData.seller_email || userData.email || 'user@example.com',
           profile_pic: userData.profile_pic 
             ? `${API_BASE_URL}/storage/${userData.profile_pic}` 
             : (userData.Image ? `${API_BASE_URL}/storage/${userData.Image}` : null),
           role: role
         });
        }
      })
      .catch((err) => {
        console.error("Auth check failed:", err.message);
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user_role');
        setUser(null);
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_role');
    setUser(null);
    window.location.reload();
  };

  return (
    <header className="w-full bg-white/95 backdrop-blur-md px-3 sm:px-6 py-3 font-['Kantumruy_Pro'] transition-all relative z-[100]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
        
        {/* Logo, Buyer Greeting & Live Date/Time Widget */}
        <div className="w-full md:w-auto flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-bold text-lg sm:text-xl flex items-center gap-2 group">
              <img src={eLogo.src} alt="Logo" className="w-12 h-12 sm:w-16 sm:h-16 object-contain transform group-hover:scale-105 transition-transform" />
              <h1 className="text-xl sm:text-2xl tracking-tight">
                <span className="text-blue-600 font-extrabold">E</span>
                <span className="text-slate-400 font-light">-</span>
                <span className="text-yellow-500 font-extrabold">Sell</span>
              </h1>
            </Link>

            {/* 👋 បង្ហាញពាក្យសួស្តី និងឈ្មោះ User ដោយស្វ័យប្រវត្តិពេល Login រួច */}
            {user && (
              <span className="inline-block text-xs sm:text-sm font-bold text-slate-700 bg-blue-50/80 border border-blue-100 px-3 py-1 rounded-xl shadow-2xs">
                សួស្តី {user.username}
              </span>
            )}
          </div>

          {/* 🌟 បង្ហាញកាលបរិច្ឆេទ និងម៉ោង */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-xl text-[10px] sm:text-[11px] text-slate-600 shadow-2xs">
            <div className="flex items-center gap-1 font-medium">
              <Calendar className="w-3 h-3 text-blue-600" />
              <span>{currentDate}</span>
            </div>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1 font-bold text-blue-600">
              <Clock className="w-3 h-3 animate-spin" style={{ animationDuration: '6s' }} />
              <span>{currentTime}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 md:hidden">
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 text-slate-600 font-medium border border-slate-200 text-sm hover:bg-slate-200 transition-colors shadow-2xs">
              <ShoppingCart className="w-4 h-4 text-slate-700" />
            </div>
            
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <div 
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs uppercase overflow-hidden border-2 border-blue-500 shadow-sm cursor-pointer active:scale-95 transition-transform"
                >
                  {user.profile_pic ? (
                    <img src={user.profile_pic} alt={user.username} className="w-full h-full object-cover" />
                  ) : (
                    <span>{user.username.charAt(0)}</span>
                  )}
                </div>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-60 bg-white border border-slate-200 rounded-2xl shadow-xl p-3.5 z-50 text-xs space-y-3 animate-in fade-in zoom-in-95 duration-150">
                    <div className="border-b border-slate-100 pb-2.5 flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs uppercase overflow-hidden flex-shrink-0 shadow-inner">
                        {user.profile_pic ? (
                          <img src={user.profile_pic} alt={user.username} className="w-full h-full object-cover" />
                        ) : (
                          <span>{user.username.charAt(0)}</span>
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-bold text-slate-800 truncate">{user.username}</p>
                        <p className="text-slate-500 truncate">{user.email}</p>
                        <span className="inline-block mt-1 text-[9px] uppercase bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold border border-blue-100">
                          {user.role}
                        </span>
                      </div>
                    </div>

                    {user.role === 'seller' && (
                      <Link
                        href="/dashboard"
                        onClick={() => setShowDropdown(false)}
                        className="block w-full py-2.5 text-center bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold rounded-xl transition-colors shadow-2xs"
                      >
                        Seller Dashboard
                      </Link> 
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full py-2.5 text-center bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-xl cursor-pointer transition-colors shadow-2xs"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-1.5 text-xs font-medium">
                <button 
                  onClick={() => setOpen(true)}
                  className="px-3 py-1.5 text-slate-700 hover:text-blue-600 cursor-pointer transition-colors"
                >
                  Login
                </button>
                <button 
                  onClick={() => setOpen(true)}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 cursor-pointer shadow-sm active:scale-95 transition-all"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Search Bar & Results Dropdown */}
        <div className="w-full md:flex-1 md:max-w-xl md:mx-4 relative" ref={searchRef}>
          <div className="relative flex items-center">
            <SearchIcon className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
            <input 
              type="text" 
              name="search" 
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              placeholder="Search for products..."
              className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm bg-slate-100/90 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all shadow-inner" 
            />
            {keyword && (
              <button 
                onClick={() => setKeyword('')}
                className="absolute right-3 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* 🔍 Box បង្ហាញលទ្ធផល Search */}
          {keyword.trim() && isSearchFocused && (
            <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl max-h-96 overflow-y-auto z-[9999] p-2 space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
              {isSearching ? (
                <div className="flex flex-col items-center justify-center py-8 text-slate-400 gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  <span className="text-xs font-medium">កំពុងស្វែងរក...</span>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 space-y-1">
                  <p>📦</p>
                  <p>រកមិនឃើញផលិតផលដែលត្រូវនឹងពាក្យ "{keyword}" ទេ</p>
                </div>
              ) : (
                <>
                  <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-50">
                    លទ្ធផលស្វែងរក ({searchResults.length})
                  </div>
                  {searchResults.map((item) => (
                    <Link 
                      key={item.id} 
                      href={`/product/${item.id}`}
                      onClick={() => {
                        setKeyword('');
                        setIsSearchFocused(false);
                      }}
                      className="flex items-center justify-between p-2.5 hover:bg-blue-50/50 rounded-xl transition-all border border-transparent hover:border-blue-100 group"
                    >
                      <div className="flex items-center space-x-3 overflow-hidden">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200/60 shadow-2xs group-hover:scale-105 transition-transform">
                          {item.product_image || item.image ? (
                            <img 
                              src={`${API_BASE_URL}/storage/${item.product_image || item.image}`} 
                              alt={item.product_name} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-xs">📦</div>
                          )}
                        </div>

                        <div className="overflow-hidden space-y-0.5">
                          <h4 className="font-bold text-xs text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                            {item.product_name || ''}
                          </h4>
                          
                          {item.category && (
                            <div className="flex items-center space-x-1.5">
                              <div className="w-4 h-4 rounded-full bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                                {item.category.image_category ? (
                                  <img 
                                    src={`${API_BASE_URL}/storage/${item.category.image_category}`} 
                                    alt={item.category.category_name} 
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="text-[8px] flex items-center justify-center">🏷️</span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-500 truncate">
                                {item.category.category_name}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <span className="text-xs font-extrabold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg flex-shrink-0 ml-2">
                        ${item.product_price || '0.00'}
                      </span>
                    </Link>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <div 
                onMouseEnter={() => setShowDropdown(true)}
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-2 cursor-pointer p-1 rounded-full hover:bg-slate-100 transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm uppercase overflow-hidden border-2 border-blue-500 shadow-sm hover:ring-2 hover:ring-blue-400 transition-all">
                  {user.profile_pic ? (
                    <img src={user.profile_pic} alt={user.username} className="w-full h-full object-cover" />
                  ) : (
                    <span>{user.username.charAt(0)}</span>
                  )}
                </div>
              </div>

              {showDropdown && (
                <div 
                  onMouseLeave={() => setShowDropdown(false)}
                  className="absolute right-0 mt-2 w-60 bg-white border border-slate-200/80 rounded-2xl shadow-xl p-3.5 z-50 text-xs space-y-3 animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="border-b border-slate-100 pb-2.5 flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs uppercase overflow-hidden flex-shrink-0 shadow-inner">
                      {user.profile_pic ? (
                        <img src={user.profile_pic} alt={user.username} className="w-full h-full object-cover" />
                      ) : (
                        <span>{user.username.charAt(0)}</span>
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-bold text-slate-800 truncate">{user.username}</p>
                      <p className="text-slate-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[9px] uppercase bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold border border-blue-100">
                        {user.role}
                      </span>
                    </div>
                  </div>

                  {user.role === 'seller' && (
                    <Link
                      href="/dashboard"
                      onClick={() => setShowDropdown(false)}
                      className="block w-full py-2 text-center bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold rounded-xl transition-colors"
                    >
                      Seller Dashboard
                    </Link> 
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full py-2 text-center bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-xl cursor-pointer transition-colors shadow-2xs"
                  >
                    Logout
                  </button> 
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-3 text-sm font-medium">
              <button 
                onClick={() => setOpen(true)}
                className="px-4 py-2 text-slate-700 hover:text-blue-600 cursor-pointer transition-colors font-semibold"
              >
                Login
              </button>
              <button 
                onClick={() => setOpen(true)}
                className="px-4.5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 cursor-pointer shadow-sm hover:shadow transition-all active:scale-95 font-semibold"
              >
                Register
              </button> 
            </div>
          )}
        </div>

      </div>

      <Registerform isOpen={open} onClose={() => setOpen(false)} />
    </header>
  );
}