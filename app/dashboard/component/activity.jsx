'use client';
import React, { useState, useEffect } from 'react';
import { Package, AlertCircle } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Activity({ productId }) {
  const [loading, setLoading] = useState(true);
  const [activityData, setActivityData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActivityData = async () => {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        setError('Please login first');
        setLoading(false);
        return;
      }

      try {
        // 🔗 ភ្ជាប់ទៅកាន់ API របស់អ្នក (ជំនួស ID តាមតម្រូវការ ឬផ្ដល់ជា Parameter)
        const id = productId || 1; 
        const res = await fetch(`${API_BASE_URL }/api/activity/${id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });
        
        const result = await res.json();
        if (result.status) {
          setActivityData(result);
        } else {
          setError(result.message || 'Failed to load data');
        }
      } catch (err) {
        console.error('Error fetching activity:', err);
        setError('Network error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchActivityData();
  }, [productId]);

  return (
    <div className="p-4" style={{ fontFamily: "'Kantumruy Pro', sans-serif" }}>
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 flex items-center justify-between max-w-sm hover:shadow-md transition-shadow">
        
        {/* ផ្នែកអត្ថបទ និងតម្លៃនៅខាងឆ្វេង */}
        <div>
          <p className="text-sm text-slate-500 font-medium">
            សកម្មភាពថ្ងៃនេះ <span className="text-xs text-slate-400">(Today's Activity)</span>
          </p>
          
          {loading ? (
            <div className="h-8 w-20 bg-slate-100 animate-pulse rounded mt-1"></div>
          ) : error ? (
            <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> {error}
            </p>
          ) : (
            <div className="mt-1">
              <h3 className="text-2xl font-bold text-slate-900">
                {activityData?.count ?? 0} <span className="text-sm font-normal text-slate-500">Products</span>
              </h3>
              <p className="text-xs text-emerald-600 font-medium mt-0.5">
                លុបថ្ងៃនេះ: {activityData?.delete_count ?? 0}
              </p>
            </div>
          )}
        </div>

        {/* ផ្នែក Icon ប្រអប់ទំនិញនៅខាងស្តាំ */}
        <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shadow-xs">
          <Package className="w-6 h-6" />
        </div>

      </div>
    </div>
  );
}