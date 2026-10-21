'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../component/CartContext'; // ផ្ទៀងផ្ទាត់ផ្លូវ Path ទៅកាន់ CartContext របស់អ្នក

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, totalItems, totalPrice, clearCart } = useCart(); // បន្ថែម clearCart ដើម្បីជម្រះកន្ត្រកពេលបញ្ជាទិញរួច
  const [loading, setLoading] = useState(false);
  
  // State សម្រាប់ទម្រង់ទូទាត់
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    paymentMethod: 'cod', 
    note: '', 
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert('កន្ត្រកទំនិញរបស់អ្នកទទេ!');
      return;
    }

    // 🔍 ឆែកមើល Token មុនពេលបញ្ជូនសំណើទៅ Backend
    const token = typeof window !== 'undefined' 
      ? (localStorage.getItem('access_token') || localStorage.getItem('token') || localStorage.getItem('jwt_token')) 
      : '';
    
    if (!token) {
      alert('សូម Login ជាមុនសិន (មិនមាន Token រក្សាទុកទេ)!');
      // window.location.href = '/login'; 
      return;
    }

    setLoading(true);
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '');

    try {
      if (!baseUrl) {
        throw new Error('មិនទាន់កំណត់ URL របស់ API ទេ។ សូមទាក់ទងអ្នកគ្រប់គ្រង។');
      }

      const fullShippingAddress = `${formData.address}, ${formData.city}, ឈ្មោះអ្នកទទួល: ${formData.fullName}`;

      const orderItems = cart.map(item => ({
        product_id: item.id,
        quantity: item.quantity || 1,
        price: item.price || 0
      }));

      const response = await fetch(`${baseUrl}/api/track-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          shipping_address: fullShippingAddress,
            phone: formData.phone,
            total_amount: totalPrice, // បន្ថែមទឹកប្រាក់សរុប
            note: `វិធីសាស្ត្របង់ប្រាក់: ${formData.paymentMethod} | ${formData.note || 'គ្មានចំណាំ'}`,
            items: orderItems // បញ្ជូនបញ្ជីទំនិញក្នុងកន្ត្រកទៅកាន់ Controller
        })
      });

      const data = await response.json();

      if (response.ok && (data.status || data.order_code || data.data)) {
        const orderCode = data.data?.order_code || data.data?.order?.order_code || data.order_code || data.order?.order_code;
        
        if (typeof clearCart === 'function') {
          clearCart(); // សម្អាតទំនិញក្នុងកន្ត្រកក្រោយពេលបញ្ជាទិញបានสำเร็จ
        }

        if (orderCode) {
          window.localStorage.setItem('latest_order_code', orderCode);
          window.dispatchEvent(new Event('latest-order-code-changed'));
          router.push('/');
        } else {
          alert('ការបញ្ជាទិញបានជោគជ័យ ប៉ុន្តែ Server មិនបានផ្ញើលេខកូដតាមដានមកទេ។ សូមទាក់ទងផ្នែកជំនួយ។');
        }
      } else {
        alert(data.message || 'មានបញ្ហាអ្វីមួយកើតឡើង សូមព្យាយាមម្តងទៀត!');
      }
    } catch (error) {
      console.error('Checkout Error:', error);
      alert(error instanceof Error ? error.message : 'មិនអាចតភ្ជាប់ទៅកាន់ Server បានទេ!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 font-['Kantumruy_Pro']">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-8">Checkout / បញ្ចប់ការបញ្ជាទិញ</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ផ្នែកទី ១៖ ទម្រង់ព័ត៌មានដឹកជញ្ជូន និងបង់ប្រាក់ */}
          <div className="lg:col-span-7 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">📍 ព័ត៌មានអ្នកទទួល និងទីតាំង</h2>
            
            <form onSubmit={handleCheckout} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ឈ្មោះពេញ (Full Name)</label>
                <input 
                  type="text" 
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="បញ្ចូលឈ្មោះរបស់អ្នក"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">លេខទូរស័ព្ទ (Phone Number)</label>
                <input 
                  type="tel" 
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="ឧ. 012 345 678"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">អាសយដ្ឋានដឹកជញ្ជូន (Address)</label>
                <textarea 
                  name="address"
                  rows={3}
                  required
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="ផ្ទះលេខ ផ្លូវ សង្កាត់ ខណ្ឌ..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm text-black"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">រាជធានី / ខេត្ត (City / Province)</label>
                <input 
                  type="text" 
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="ភ្នំពេញ"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">កំណត់ចំណាំបន្ថែម (Note)</label>
                <input 
                  type="text" 
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  placeholder="ចំណាំបន្ថែម (បើមាន)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm text-black"
                />
              </div>

              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">💳 វិធីសាស្ត្រទូទាត់ប្រាក់ (Payment Method)</h3>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="cod" 
                      checked={formData.paymentMethod === 'cod'}
                      onChange={handleChange}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-800">ទូទាត់ពេលទទួលបានទំនិញ (Cash on Delivery)</span>
                  </label>

                  <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="stripe" 
                      checked={formData.paymentMethod === 'stripe'}
                      onChange={handleChange}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-800">ទូទាត់តាមកាតប័ណ្ណ / Online (Stripe / ABA PayWay)</span>
                  </label>
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md disabled:bg-gray-400 cursor-pointer"
              >
                {loading ? 'កំពុងដំណើរការ...' : `បញ្ជាក់ការបញ្ជាទិញ ($${totalPrice.toFixed(2)})`}
              </button>
            </form>
          </div>

          {/* ផ្នែកទី ២៖ បង្ហាញកន្ត្រកទំនិញ */}
          <div className="lg:col-span-5">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">🛒 កន្ត្រករបស់អ្នក ({totalItems} មុខទំនិញ)</h2>

              {cart.length === 0 ? (
                <p className="text-gray-500 text-sm py-6 text-center">គ្មានទំនិញនៅក្នុងកន្ត្រកទេ</p>
              ) : (
                <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                  {cart.map((item, index) => (
                    <div key={index} className="flex justify-between items-center border-b pb-3">
                      <div>
                        <h4 className="text-sm font-medium text-gray-800">{item.name}</h4>
                        <p className="text-xs text-gray-500">ចំនួន: {item.quantity} {item.variant ? `| Variant: ${item.variant}` : ''}</p>
                      </div>
                      <span className="text-sm font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-gray-100 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>តម្លៃសរុប (Subtotal)</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>សេវាដឹកជញ្ជូន (Shipping)</span>
                  <span className="text-green-600 font-medium">ឥតគិតថ្លៃ (Free)</span>
                </div>
                <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t">
                  <span>ទឹកប្រាក់សរុបទាំងអស់ (Total)</span>
                  <span className="text-blue-600">${totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}