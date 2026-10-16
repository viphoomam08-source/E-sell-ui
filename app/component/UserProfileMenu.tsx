'use client';
import React, { useState, useEffect, useRef } from 'react';
import { FiLogOut, FiUser, FiShoppingBag } from 'react-icons/fi';

export default function UserProfileMenu() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    const userRole = localStorage.getItem('user_role');
    const userInfo = localStorage.getItem('user_info');

    if (token) {
      setRole(userRole);
      if (userInfo) {
        try {
          setUser(JSON.parse(userInfo));
        } catch (e) {
          setUser(null);
        }
      }
    }

    // បិទ Dropdown ពេលចុចក្រៅ
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_info');
    window.location.reload();
  };

  if (!user && !localStorage.getItem('jwt_token')) {
    return null; // បើមិនទាន់ Login ទេ មិនបាច់បង្ហាញទេ (ទុកសម្រាប់បង្ហាញប៊ូតុង Login/Register ធម្មតា)
  }

  // ទាញយករូបភាព ឬ អក្សរផ្ដើម (Initials)
  const displayName = user?.name || user?.username || user?.seller_name || 'User';
  const initial = displayName.charAt(0).toUpperCase();
  const profilePicUrl = user?.profile_pic
    ? `${process.env.NEXT_PUBLIC_API_URL}/storage/${user.profile_pic}`
    : null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Circle Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-600 bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm focus:outline-none shadow-sm hover:ring-2 hover:ring-blue-400 transition-all cursor-pointer"
      >
        {profilePicUrl ? (
          <img src={profilePicUrl} alt={displayName} className="w-full h-full object-cover" />
        ) : (
          <span>{initial}</span>
        )}
      </button>

      {/* Dropdown Menu (Hover ឬ Click លើ Circle) */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-xs font-bold text-gray-800 truncate">{displayName}</p>
            <span className="text-[10px] uppercase bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-semibold">
              {role || 'Member'}
            </span>
          </div>

          <div className="py-1">
            <a
              href="/profile"
              className="flex items-center space-x-2 px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <FiUser size={14} className="text-gray-400" />
              <span>My Profile</span>
            </a>
            {role === 'seller' && (
              <a
                href="/dashboard"
                className="flex items-center space-x-2 px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <FiShoppingBag size={14} className="text-gray-400" />
                <span>Store Dashboard</span>
              </a>
            )}
          </div>

          <div className="border-t border-gray-100 pt-1">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
            >
              <FiLogOut size={14} />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}