'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Registerform from './registerform'; 
import eLogo from '../image/e.png'
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Search() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // 🔍 State សម្រាប់គ្រប់គ្រងការស្វែងរក
  const [keyword, setKeyword] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm px-3 sm:px-6 py-3 font-['Kantumruy_Pro']">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
        
        <div className="w-full md:w-auto flex items-center justify-between">
          <Link href="/" className="font-bold text-lg sm:text-xl flex items-center gap-2">
    <span></span>
<img src={eLogo.src} alt="Logo" className="w-20 h-20 object-contain" />
<h1>
  <span className="text-blue-600 font-bold">E</span>
  -
  <span className="text-yellow-500 font-bold">Sell</span>
</h1></Link>
          <div className="flex items-center space-x-2 md:hidden">
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 text-slate-600 font-medium border border-slate-200 text-sm">
              🛒
            </div>
            
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <div 
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs uppercase overflow-hidden border-2 border-blue-500 shadow-sm cursor-pointer"
                >
                  {user.profile_pic ? (
                    <img src={user.profile_pic} alt={user.username} className="w-full h-full object-cover" />
                  ) : (
                    <span>{user.username.charAt(0)}</span>
                  )}
                </div>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-60 bg-white border border-slate-200 rounded-xl shadow-xl p-3.5 z-50 text-xs space-y-3">
                    <div className="border-b border-slate-100 pb-2.5 flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs uppercase overflow-hidden flex-shrink-0">
                        {user.profile_pic ? (
                          <img src={user.profile_pic} alt={user.username} className="w-full h-full object-cover" />
                        ) : (
                          <span>{user.username.charAt(0)}</span>
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-bold text-slate-800 truncate">{user.username}</p>
                        <p className="text-slate-500 truncate">{user.email}</p>
                        <span className="inline-block mt-1 text-[9px] uppercase bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-bold">
                          {user.role}
                        </span>
                      </div>
                    </div>

                    {user.role === 'seller' && (
                      <Link
                        href="/dashboard"
                        className="block w-full py-2.5 text-center bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold rounded-lg transition-colors"
                      >
                        Seller Dashboard
                      </Link> 
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full py-2.5 text-center bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-lg cursor-pointer transition-colors shadow-sm"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-1 text-xs font-medium">
                <button 
                  onClick={() => setOpen(true)}
                  className="px-2.5 py-1.5 text-slate-700 hover:text-blue-600 cursor-pointer"
                >
                  Login
                </button>
                <button 
                  onClick={() => setOpen(true)}
                  className="px-2.5 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer shadow-sm"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Search Bar & Results Dropdown */}
        <div className="w-full md:flex-1 md:max-w-xl md:mx-4 relative">
          <div className="relative">
            <input 
              type="search" 
              name="search" 
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search for products..."
              className="w-full px-4 py-2 text-xs sm:text-sm bg-slate-100 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" 
            />
          </div>

          {/* 🔍 Box បង្ហាញលទ្ធផល Search */}
          {keyword.trim() && (
            <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-80 overflow-y-auto z-50 p-2 space-y-1.5">
              {isSearching ? (
                <div className="text-center py-4 text-xs text-slate-400">កំពុងស្វែងរក...</div>
              ) : searchResults.length === 0 ? (
                <div className="text-center py-4 text-xs text-slate-400">រកមិនឃើញផលិតផលដែលអ្នកចង់រកទេ</div>
              ) : (
                searchResults.map((item) => (
                  <Link 
                    key={item.id} 
                    href={`/product/${item.id}`}
                    onClick={() => setKeyword('')}
                    className="flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-xl transition border border-transparent hover:border-slate-100"
                  >
                    <div className="flex items-center space-x-3 overflow-hidden">
                      {/* 🖼️ រូបភាពផលិតផលធំ */}
                      <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
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
                        {/* 🏷️ ឈ្មោះផលិតផល */}
                        <h4 className="font-bold text-xs text-slate-800 truncate">{item.product_name || 'គ្មានឈ្មោះ'}</h4>
                        
                        {/* 📂 បង្ហាញរូបភាព Category និង ឈ្មោះ Category នៅខាងក្រោម */}
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
                            <span className="text-[10px] text-blue-600 font-semibold truncate">
                              Category: {item.category.category_name}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <span className="text-xs font-bold text-blue-600 flex-shrink-0 ml-2">${item.product_price || '0.00'}</span>
                  </Link>
                ))
              )}
            </div>
          )}
        </div>

        <div className="hidden md:flex items-center space-x-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 text-slate-600 font-medium border border-slate-200">
            🛒
          </div>

          {user ? (
            <div className="relative" ref={dropdownRef}>
              <div 
                onMouseEnter={() => setShowDropdown(true)}
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-2 cursor-pointer p-1 rounded-full hover:bg-slate-100 transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm uppercase overflow-hidden border-2 border-blue-500 shadow-sm">
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
                  className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg p-3 z-50 text-xs space-y-3"
                >
                  <div className="border-b border-slate-100 pb-2 flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs uppercase overflow-hidden flex-shrink-0">
                      {user.profile_pic ? (
                        <img src={user.profile_pic} alt={user.username} className="w-full h-full object-cover" />
                      ) : (
                        <span>{user.username.charAt(0)}</span>
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-bold text-slate-800 truncate">{user.username}</p>
                      <p className="text-slate-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[10px] uppercase bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-bold">
                        {user.role}
                      </span>
                    </div>
                  </div>

                  {user.role === 'seller' && (
                    <Link
                      href="/dashboard"
                      className="block w-full py-1.5 text-center bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium rounded-lg transition-colors"
                    >
                      Seller Dashboard
                    </Link> 
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full py-1.5 text-center bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-lg cursor-pointer transition-colors"
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
                className="px-4 py-2 text-slate-700 hover:text-blue-600 cursor-pointer transition-colors"
              >
                Login
              </button>
              <button 
                onClick={() => setOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer shadow-sm transition-colors"
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