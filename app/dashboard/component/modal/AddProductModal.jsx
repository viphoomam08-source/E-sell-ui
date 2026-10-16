import React, { useState } from 'react';
import { X, Upload, Loader2 } from 'lucide-react';

export default function AddProductModal({ productId, onClose, token }) {
    const activeToken = token || localStorage.getItem('token') || localStorage.getItem('access_token') || localStorage.getItem('seller_token');
    
    // Restored the missing variantName state:
    const [variantName, setVariantName] = useState('');
    const [sku, setSku] = useState('');
    const [cost, setCost] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!productId) {
            setError("រកមិនឃើញ ID របស់ផលិតផលគោល (Product Seller ID) ទេ!");
            return;
        }

        setLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('variant_name', variantName);
        formData.append('product_sku', sku);
        formData.append('product_cost', cost);
        formData.append('product_price', price);
        formData.append('product_stock', stock);
        if (image) {
            formData.append('image', image);
        }

        try {
            const baseUrl = import.meta.env?.VITE_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;
            const response = await fetch(`${baseUrl}/api/product-variants/${productId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${activeToken}`,
                    'Accept': 'application/json'
                },
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'មិនអាចរក្សាទុក Variant បានទេ');
            }

            onClose(); 
        } catch (err) {
            setError(err.message || 'មានបញ្តហាកើតឡើង សូមព្យាយាមម្ដងទៀត។');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
                
                {/* Modal Header */}
                <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-4">
                    <h3 className="text-base font-bold text-slate-800">បន្ថែម Variant ថ្មី</h3>
                    <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-medium rounded-xl text-center">
                        {error}
                    </div>
                )}

                {/* Form Fields */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">ឈ្មោះ Variant *</label>
                            <input 
                                type="text" 
                                required
                                value={variantName}
                                onChange={(e) => setVariantName(e.target.value)}
                                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                placeholder="ឧ. ពណ៌ស / ទំហំ L"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">SKU</label>
                            <input 
                                type="text" 
                                value={sku}
                                onChange={(e) => setSku(e.target.value)}
                                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                placeholder="SKU-CODE"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">តម្លៃដើម ($)</label>
                            <input 
                                type="number" 
                                step="0.01"
                                value={cost}
                                onChange={(e) => setCost(e.target.value)}
                                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                placeholder="0.00"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">តម្លៃលក់ ($)</label>
                            <input 
                                type="number" 
                                step="0.01"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">ចំនួនស្តុក *</label>
                        <input 
                            type="number" 
                            required
                            value={stock}
                            onChange={(e) => setStock(e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            placeholder="0"
                        />
                    </div>

                    {/* Image Upload Area */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">រូបភាព Variant</label>
                        <div className="flex items-center gap-4">
                            <label className="flex-1 flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-xl cursor-pointer bg-slate-50/50 transition">
                                <Upload className="w-5 h-5 text-slate-400 mb-1" />
                                <span className="text-xs text-slate-500 font-medium">ចុចដើម្បីជ្រើសរើសរូបភាព</span>
                                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                            </label>
                            {imagePreview && (
                                <div className="relative w-16 h-16 rounded-xl border border-slate-200 overflow-hidden shrink-0">
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                    <button 
                                        type="button" 
                                        onClick={() => { setImage(null); setImagePreview(null); }}
                                        className="absolute top-1 right-1 bg-rose-600 text-white rounded-full p-0.5 text-xs"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                        <button 
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
                        >
                            ចាកចេញ
                        </button>
                        <button 
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition cursor-pointer inline-flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                        >
                            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                            រក្សាទុក
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}