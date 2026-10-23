'use client';

import React, { useState, useEffect } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

function BuyerName() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      setLoading(false);
      return;
    }

    fetch(`${API_BASE_URL}/api/show_name`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status && data.data) {
          setName(data.data); // ទទួលបានឈ្មោះ Buyer
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching buyer name:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-xs text-slate-400">កំពុងផ្ទុក...</div>;
  }

  // ប្រសិនបើអត់ទាន់ Login ឬរកមិនឃើញឈ្មោះ មិនបាច់បង្ហាញអ្វីទាំងអស់ ឬបង្ហាញ Guest
  if (!name) {
    return null; 
  }

  return (
    <div className="font-['Kantumruy_Pro'] font-bold text-slate-800 text-sm sm:text-base">
      សួស្តី {name}
    </div>
  );
}

export default BuyerName;