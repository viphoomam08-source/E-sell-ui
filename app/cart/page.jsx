"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, ShoppingBag, ArrowRight, Plus, Minus, Loader2 } from 'lucide-react';

export default function CartPage() {
    const router = useRouter();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const API = process.env.NEXT_PUBLIC_API_URL;

    // ទាញយកទិន្នន័យ Cart ពី Backend API ពេល Load ទំព័រ
    useEffect(() => {
        fetchCartItems();
    }, []);

    const fetchCartItems = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('access_token') || localStorage.getItem('buyer_token');
            
            const response = await fetch(`${API}/api/cart/items`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (data.status && Array.isArray(data.data)) {
                setCartItems(data.data);
            } else if (Array.isArray(data)) {
                setCartItems(data);
            } else {
                setCartItems([]);
            }

        } catch (err) {
            console.error("Fetch Error:", err);
            setError('No product ');
        } finally {
            setLoading(false);
        }
    };

    const increaseQty = (id) => {
        setCartItems(cartItems.map(item => 
            item.id === id ? { ...item, quantity: item.quantity + 1 } : item
        ));
    };

    const decreaseQty = (id) => {
        setCartItems(cartItems.map(item => 
            item.id === id && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item
        ));
    };

    // មុខងារលុបទំនិញតាម API Route (/api/cart-delete/{id})
    const removeItem = async (id) => {
        try {
            const token = localStorage.getItem('access_token') || localStorage.getItem('buyer_token');

            const response = await fetch(`${API}/api/cart-delete/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok && data.status) {
                // ធ្វើការ Filter លុប Item ចេញពី State ភ្លាមៗ
                setCartItems(prevItems => prevItems.filter(item => item.id !== id));
            } else {
                alert(data.message || 'មិនអាចលុបទំនិញបានទេ');
            }
        } catch (err) {
            console.error("Delete Error:", err);
            alert('មានបញ្ហាក្នុងការតភ្ជាប់ទៅកាន់ Server ពេលលុបទំនិញ');
        }
    };

    const subtotal = cartItems.reduce((acc, item) => {
        const product = item.product || {};
        const price = product.discount_price ? product.discount_price : (product.product_price || 0);
        return acc + (price * item.quantity);
    }, 0);

    const total = subtotal > 0 ? subtotal : 0;

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <span className="ml-2 text-slate-600 font-medium">កំពុងទាញយកទិន្នន័យកន្ត្រក...</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-7xl mx-auto">
                
                <div className="flex items-center space-x-3 mb-8">
                    <ShoppingBag className="w-8 h-8 text-blue-600" />
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">កន្រ្តកទំនិញរបស់អ្នក (Shopping Cart)</h1>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl mb-6">
                        {error}
                    </div>
                )}

                {cartItems.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
                        <ShoppingBag className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-slate-700 mb-2">កន្រ្តករបស់អ្នកទទេរ</h2>
                        <p className="text-slate-500 mb-6">អ្នកមិនទាន់បានបន្ថែមទំនិញណាមួយទៅក្នុងកន្រ្តកនៅឡើយទេ។</p>
                        <a href="/" className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-600/20">
                            ទិញទំនិញឥឡូវនេះ <ArrowRight className="w-4 h-4 ml-2" />
                        </a>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        <div className="lg:col-span-2 space-y-4">
                            {cartItems.map((item) => {
                                const prod = item.product || {};
                                const currentPrice = prod.discount_price ? prod.discount_price : (prod.product_price || 0);
                                
                                return (
                                    <div key={item.id} className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 transition hover:shadow-md">
                                        
                                        <div className="flex items-center space-x-4 w-full sm:w-auto">
                                            <div className="w-20 h-20 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0 border border-slate-200">
                                                <img 
                                                    src={prod.image ? `${API}/storage/${prod.image}` : 'https://via.placeholder.com/150'} 
                                                    alt={prod.product_name || 'Product'} 
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }} 
                                                />
                                            </div>
                                            <div>
                                                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">{prod.brand || 'Store'}</span>
                                                <h3 className="text-lg font-bold text-slate-800">{prod.product_name || 'ផលិតផលគ្មានឈ្មោះ'}</h3>
                                                <div className="flex items-center space-x-2 mt-1">
                                                    <span className="text-blue-600 font-bold">${Number(currentPrice).toFixed(2)}</span>
                                                    {prod.discount_price && (
                                                        <span className="text-sm text-slate-400 line-through">${Number(prod.product_price).toFixed(2)}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between w-full sm:w-auto sm:space-x-6">
                                            <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                                                <button 
                                                    onClick={() => decreaseQty(item.id)}
                                                    className="p-1 hover:bg-white rounded-lg text-slate-600 transition shadow-xs"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <span className="px-4 font-semibold text-slate-700">{item.quantity}</span>
                                                <button 
                                                    onClick={() => increaseQty(item.id)}
                                                    className="p-1 hover:bg-white rounded-lg text-slate-600 transition shadow-xs"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <div className="text-right min-w-[80px]">
                                                <span className="font-bold text-slate-800">${(currentPrice * item.quantity).toFixed(2)}</span>
                                            </div>

                                            <button 
                                                onClick={() => removeItem(item.id)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition cursor-pointer"
                                                title="លុបចេញ"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>

                                    </div>
                                );
                            })}
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-fit space-y-4">
                            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4">សង្ខេបការបញ្ជាទិញ</h2>
                            
                            <div className="space-y-3 text-slate-600">
                                <div className="flex justify-between">
                                    <span>តម្លៃទំនិញសរុប (Subtotal)</span>
                                    <span className="font-semibold text-slate-800">${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>សេវាដឹកជញ្ជូន (Shipping)</span>
                                    <span className="font-semibold text-slate-800">free delivery</span>
                                </div>
                                <div className="border-t border-slate-100 pt-3 flex justify-between text-lg font-bold text-slate-900">
                                    <span>ទឹកប្រាក់សរុប (Total)</span>
                                    <span className="text-blue-600">${total.toFixed(2)}</span>
                                </div>
                            </div>

                            <button 
                                onClick={() => router.push('/checkout')}
                                className="w-full mt-4 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition flex items-center justify-center space-x-2 cursor-pointer"
                            >
                                <span>បន្តទៅទូទាត់ប្រាក់ (Checkout)</span>
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>

                    </div>
                )}

            </div>
        </div>
    );
}