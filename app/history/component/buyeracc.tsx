'use client';
import React, { useState, useEffect } from 'react';

export default function BuyerAcc() {
  const [buyerInfo, setBuyerInfo] = useState<{ id?: number; username: string; email: string }>({ username: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // State សម្រាប់គ្រប់គ្រងទិន្នន័យប្ដូរ Password
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_pass: '',
    new_pass: '',
    new_password_confirmation: ''
  });

  useEffect(() => {
    fetchBuyerInfo();
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('buyer_token') || localStorage.getItem('access_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  };

  const fetchBuyerInfo = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${apiUrl}/api/show-info`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.data) setBuyerInfo(data.data);
    } catch (err) {
      console.error(err);
      showNotification('មិនអាចទាញយកទិន្នន័យបានទេ', 'error');
    } finally {
      setLoading(false);
    }
  };

  // មុខងារ Update ព័ត៌មាន Profile (Username & Email)
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${apiUrl}/api/update-info`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(buyerInfo),
      });
      const data = await res.json();
      
      if (res.ok) {
        showNotification('កែប្រែព័ត៌មានបានជោគជ័យ!', 'success');
        setIsEditing(false);
      } else {
        showNotification(data.message || 'មានបញ្ហាក្នុងการកែប្រែ', 'error');
      }
    } catch (err) {
      console.error(err);
      showNotification('មិនអាចភ្ជាប់ទៅកាន់ Server បានទេ', 'error');
    }
  };

  // មុខងារ Change Password ផ្ញើទៅ Laravel API
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${apiUrl}/api/change-password`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(passwordData),
      });
      const data = await res.json();

      if (res.ok && data.status) {
        showNotification(data.message || 'ផ្លាស់ប្ដូរពាក្យសម្ងាត់បានជោគជ័យ!', 'success');
        setShowPasswordForm(false);
        setPasswordData({ current_pass: '', new_pass: '', new_password_confirmation: '' });
      } else {
        showNotification(data.message || 'ពាក្យសម្ងាត់បច្ចុប្បន្នមិនត្រូវគ្នាទេ', 'error');
      }
    } catch (err) {
      console.error(err);
      showNotification('មិនអាចភ្ជាប់ទៅកាន់ Server បានទេ', 'error');
    }
  };

  const showNotification = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  if (loading) {
    return <div className="text-xs text-slate-400 p-4">កំពុងទាញយកព័ត៌មានគណនី...</div>;
  }

  return (
    <div className="max-w-xl space-y-6">
      {/* Header Section */}
      <div>
        <h2 className="text-base font-bold text-slate-800">👤 ព័ត៌មានគណនី</h2>
        <p className="text-xs text-slate-500">គ្រប់គ្រងព័ត៌មានផ្ទាល់ខ្លួន និងការកំណត់សុវត្ថិភាពរបស់អ្នកនៅទីនេះ។</p>
      </div>

      {/* Global Notification Banner */}
      {message.text && (
        <div className={`p-3 rounded-lg text-xs font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      {/* 1. Profile Information Card */}
      <div className="bg-white shadow-sm border border-slate-200 rounded-xl p-5 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-500 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-sm">
              {buyerInfo.username ? buyerInfo.username.charAt(0).toUpperCase() : 'B'}
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm">{buyerInfo.username || 'Buyer Name'}</p>
              <p className="text-xs text-slate-400">{buyerInfo.email}</p>
            </div>
          </div>

          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
            >
              ✏️ កែប្រែព័ត៌មាន
            </button>
          )}
        </div>

        {!isEditing ? (
          <div className="grid grid-cols-1 gap-3 text-xs text-slate-600">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="font-medium text-slate-500">លេខសម្គាល់ (ID):</span>
              <span className="text-slate-800 font-semibold">{buyerInfo.id}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="font-medium text-slate-500">ឈ្មោះអ្នកប្រើប្រាស់ (Username):</span>
              <span className="text-slate-800 font-semibold">{buyerInfo.username || 'មិនទាន់មាន'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="font-medium text-slate-500">អ៊ីមែល (Email):</span>
              <span className="text-slate-800 font-semibold">{buyerInfo.email}</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-slate-600 mb-1">ឈ្មោះអ្នកប្រើប្រាស់ (Username)</label>
              <input
                type="text"
                value={buyerInfo.username || ''}
                onChange={(e) => setBuyerInfo({ ...buyerInfo, username: e.target.value })}
                className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                required
              />
            </div>

            <div>
              <label className="block font-medium text-slate-600 mb-1">អ៊ីមែល (Email)</label>
              <input
                type="email"
                value={buyerInfo.email || ''}
                onChange={(e) => setBuyerInfo({ ...buyerInfo, email: e.target.value })}
                className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                required
              />
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition shadow-sm"
              >
                💾 រក្សាទុក
              </button>
              <button
                type="button"
                onClick={() => { setIsEditing(false); fetchBuyerInfo(); }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium rounded-lg transition"
              >
                បោះបង់
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 2. Security / Change Password Card */}
      <div className="bg-white shadow-sm border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-xs font-bold text-slate-800">🔒 សុវត្ថិភាព និងពាក្យសម្ងាត់</h3>
            <p className="text-[11px] text-slate-400">ប្ដូរពាក្យសម្ងាត់គណនីរបស់អ្នកជាប្រចាំដើម្បីធានាសុវត្ថិភាព។</p>
          </div>

          {!showPasswordForm && (
            <button
              onClick={() => setShowPasswordForm(true)}
              className="px-3 py-1.5 text-xs font-medium text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg transition"
            >
              🔑 ផ្លាស់ប្ដូរពាក្យសម្ងាត់
            </button>
          )}
        </div>

        {showPasswordForm && (
          <form onSubmit={handlePasswordChange} className="space-y-3 text-xs pt-1">
            <div>
              <label className="block font-medium text-slate-600 mb-1">ពាក្យសម្ងាត់បច្ចុប្បន្ន (Current Password)</label>
              <input
                type="password"
                value={passwordData.current_pass}
                onChange={(e) => setPasswordData({ ...passwordData, current_pass: e.target.value })}
                className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"
                required
              />
            </div>

            <div>
              <label className="block font-medium text-slate-600 mb-1">ពាក្យសម្ងាត់ថ្មី (New Password)</label>
              <input
                type="password"
                value={passwordData.new_pass}
                onChange={(e) => setPasswordData({ ...passwordData, new_pass: e.target.value })}
                className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"
                placeholder="យ៉ាងហោចណាស់ ៦ តួអក្សរ"
                required
              />
            </div>

            <div>
              <label className="block font-medium text-slate-600 mb-1">បញ្ជាក់ពាក្យសម្ងាត់ថ្មី (Confirm Password)</label>
              <input
                type="password"
                value={passwordData.new_password_confirmation}
                onChange={(e) => setPasswordData({ ...passwordData, new_password_confirmation: e.target.value })}
                className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"
                required
              />
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition shadow-sm"
              >
                🔒 ធ្វើបច្ចុប្បន្នភាពពាក្យសម្ងាត់
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPasswordForm(false);
                  setPasswordData({ current_pass: '', new_pass: '', new_password_confirmation: '' });
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium rounded-lg transition"
              >
                បោះបង់
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}