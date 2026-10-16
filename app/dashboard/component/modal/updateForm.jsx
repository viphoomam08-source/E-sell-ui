import React, { useState, useEffect } from 'react';
import { X, Edit3, Loader2, Save } from 'lucide-react';

export default function UpdateForm({ product, isOpen, onClose, onUpdateSuccess }) {
    const [formData, setFormData] = useState({
        product_name: '',
        product_sku: '',
        brand: '',
        product_cost: '',
        product_price: '',
        category_id: '', 
        discount_price: '',
        product_stock: '',
        product_description: '',
        status: 'មានស្តុក',
        image: null // Added image state
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Load initial product data when modal opens or product changes
    useEffect(() => {
        if (product) {
            setFormData({
                product_name: product.product_name || '',
                product_sku: product.product_sku || '',
                brand: product.brand || '',
                product_cost: product.product_cost || '',
                product_price: product.product_price || '',
                discount_price: product.discount_price || '',
                product_stock: product.product_stock || '',
                category_id: product.category_id || '', 
                status: product.status || 'មានស្តុក',
                product_description: product.product_description || '',
                image: null, // Reset file selection on open
            });
        }
    }, [product]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handle file input changes
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, image: file }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const token = typeof window !== 'undefined' 
            ? (localStorage.getItem('access_token') || localStorage.getItem('token') || localStorage.getItem('jwt_token')) 
            : '';
        const baseUrl = import.meta.env?.VITE_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;

        // Use FormData to send both text fields and the image file
        const dataToSend = new FormData();
        dataToSend.append('_method', 'PUT'); // Required by Laravel for file uploads via POST method spoofing

        for (const key in formData) {
            if (formData[key] !== null && formData[key] !== '') {
                dataToSend.append(key, formData[key]);
            }
        }

        try {
            const response = await fetch(`${baseUrl}/api/product-update/${product.id}`, {
                method: 'POST', // Use POST with _method=PUT for multipart/form-data support
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                    // Note: Do NOT set 'Content-Type': 'application/json' when using FormData
                },
                body: dataToSend
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || 'មិនអាចកែប្រែទិន្នន័យផលិតផលបានទេ សូមព្យាយាមម្តងទៀត។');
            }

            const data = await response.json();
            if (onUpdateSuccess) {
                onUpdateSuccess(data.product || data.data || formData);
            }
            onClose();
        } catch (err) {
            setError(err.message || 'មានបញ្ហាបច្ចេកទេសកើតឡើង។');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 font-['Kantumruy_Pro'] animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Modal Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold border border-slate-100 shadow-xs">
                            <Edit3 className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-800">កែប្រែព័ត៌មានផលិតផល</h3>
                            <p className="text-xs text-slate-500">ធ្វើបច្ចុប្បន្នភាពព័ត៌មានស្តុក តម្លៃ និងรายละเอียดទំនិញ។</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-medium rounded-xl">
                        {error}
                    </div>
                )}

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        
                        {/* Product Name */}
                        <div className="space-y-1.5 sm:col-span-2">
                            <label className="text-xs font-bold text-slate-700">ឈ្មោះផលិតផល <span className="text-rose-500">*</span></label>
                            <input 
                                type="text" 
                                name="product_name"
                                value={formData.product_name}
                                onChange={handleChange}
                                required
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                            />
                        </div>

                        {/* SKU */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">SKU</label>
                            <input 
                                type="text" 
                                name="product_sku"
                                value={formData.product_sku}
                                onChange={handleChange}
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition font-mono"
                            />
                        </div>

                        {/* Brand */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">ម៉ាក (Brand)</label>
                            <input 
                                type="text" 
                                name="brand"
                                value={formData.brand}
                                onChange={handleChange}
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                            />
                        </div>

                        {/* Cost Price */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">តម្លៃដើម ($)</label>
                            <input 
                                type="number" 
                                step="0.01"
                                name="product_cost"
                                value={formData.product_cost}
                                onChange={handleChange}
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                            />
                        </div>

                        {/* Selling Price */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">តម្លៃលក់ ($) <span className="text-rose-500">*</span></label>
                            <input 
                                type="number" 
                                step="0.01"
                                name="product_price"
                                value={formData.product_price}
                                onChange={handleChange}
                                required
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                            />
                        </div>

                        {/* Discount Price */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">តម្លៃបញ្ចុះតម្លៃ ($)</label>
                            <input 
                                type="number" 
                                step="0.01"
                                name="discount_price"
                                value={formData.discount_price}
                                onChange={handleChange}
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                            />
                        </div>

                        {/* Stock Quantity */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">ស្តុក (Stock)</label>
                            <input 
                                type="number" 
                                name="product_stock"
                                value={formData.product_stock}
                                onChange={handleChange}
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                            />
                        </div>

                        {/* Product Image Input */}
                        <div className="space-y-1.5 sm:col-span-2">
                            <label className="text-xs font-bold text-slate-700">រូបភាពផលិតផល (Product Image)</label>
                            <div className="flex items-center gap-4">
                                {product?.image && !formData.image && (
                                    <img 
                                        src={product.image} 
                                        alt="Current" 
                                        className="w-12 h-12 object-cover rounded-xl border border-slate-200 shrink-0" 
                                    />
                                )}
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition cursor-pointer"
                                />
                            </div>
                        </div>

                        {/* Status */}
                        <div className="space-y-1.5 sm:col-span-2">
                            <label className="text-xs font-bold text-slate-700">ស្ថានភាព</label>
                            <select 
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                            >
                                <option value="សកម្ម">សកម្ម (Active)</option>
                                <option value="អសកម្ម">អសកម្ម (Inactive)</option>
                            </select>
                        </div>

                        {/* Description */}
                        <div className="space-y-1.5 sm:col-span-2">
                            <label className="text-xs font-bold text-slate-700">បរិយាយ (Description)</label>
                            <textarea 
                                name="product_description"
                                rows="3"
                                value={formData.product_description}
                                onChange={handleChange}
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition resize-none"
                            ></textarea>
                        </div>

                    </div>

                    {/* Modal Footer Actions */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                        <button 
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold transition cursor-pointer"
                        >
                            បោះបង់
                        </button>
                        <button 
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer inline-flex items-center gap-1.5 shadow-sm shadow-blue-500/20 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                            រក្សាទុកការកែប្រែ
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}