'use client';
import React, { useState, useEffect } from 'react';

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // មុខងារទាញយកប្រវត្តិ Order
  const fetchOrders = () => {
    const token = localStorage.getItem('buyer_token') || localStorage.getItem('access_token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    fetch(`${apiUrl}/api/history`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    .then(res => res.json())
    .then(data => {
      if (data.status) {
        setOrders(data.data || []);
      }
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // មុខងារលុបប្រវត្តិ Order នីមួយៗពេលចុចសញ្ញា X
  const handleDeleteSingle = (id) => {
    if (!confirm('តើអ្នកពិតជាចង់លុបប្រវត្តិ Order នេះមែនទេ?')) return;

    const token = localStorage.getItem('buyer_token') || localStorage.getItem('access_token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    fetch(`${apiUrl}/api/delete-history/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    .then(res => res.json())
    .then(data => {
      if (data.status) {
        // កាត់ထုတ်កាត Order ដែលទើបលុបចេញពី State ភ្លាមៗដោយមិនបាច់ Refresh getPage
        setOrders(orders.filter(order => order.id !== id));
      } else {
        alert(data.message || 'មិនអាចលុបបានទេ');
      }
    })
    .catch(err => console.error(err));
  };

  return (
    <div className="space-y-4">
      <h2 className="text-base font-bold text-slate-800">📋 ប្រវត្តិការបញ្ជាទិញរបស់អ្នក</h2>
      <p className="text-xs text-slate-500">ទីនេះនឹងបង្ហាញបញ្ជីរាយនាមទំនិញដែលអ្នកធ្លាប់បានកុម្ម៉ង់កន្លងមក...</p>
      
      {loading ? (
        <p className="text-xs text-slate-400">កំពុងទាញយក...</p>
      ) : orders.length === 0 ? (
        <p className="text-xs text-slate-400">មិនទាន់មានប្រវត្តិការបញ្ជាទិញទេ</p>
      ) : (
        orders.map((order) => (
          // បន្ថែម class "relative" ដើម្បីឱ្យសញ្ញា X អាចតម្រៀបទីតាំង (absolute) ក្នុងកាតនេះបាន
          <div key={order.id} className="relative w-full bg-gray-600 h-auto rounded-lg p-3 text-white space-y-2">
            
            {/* ⭐ ប៊ូតុងសញ្ញា X សម្រាប់លុបនៅជ្រុងខាងស្តាំខាងលើនៃ Div នីមួយៗ */}
            <button 
              onClick={() => handleDeleteSingle(order.id)}
              className="absolute top-3 right-3 text-gray-300 hover:text-red-400 bg-gray-700 hover:bg-gray-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold transition shadow"
              title="លុបប្រវត្តិនេះ"
            >
              ✕
            </button>

            <h1 className="text-xs font-bold pr-6">Order Code: {order.order_code}</h1>
            <p className="text-xs">ទឹកប្រាក់សរុប: ${order.total_amount}</p>
            <p className="text-xs">ស្ថានភាព: {order.status}</p>

            <div className="bg-gray-700 p-2 rounded mt-2 space-y-1">
              <p className="text-xs font-semibold text-yellow-300">ទំនិញក្នុងបញ្ជាទិញ៖</p>
              {Array.isArray(order.items) && order.items.map((item, index) => (
                <div key={index} className="text-xs border-b border-gray-600 pb-1">
                  <p>📦 ឈ្មោះផលិតផល: {item.product_name}</p>
                  <p>ចំនួន: {item.quantity} | តម្លៃ: ${item.product_price}</p>
                  <p>ឈ្មោះហាង: {item.seller_name}</p>
                </div>
              ))}
            </div>

          </div>
        ))
      )}
    </div>
  );
}