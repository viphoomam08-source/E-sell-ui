import React, { useState } from 'react';
import { X, Upload, Loader2 } from 'lucide-react';

function BannerModal({ isOpen, onClose, onAdd }) {
    const [name, setName] = useState('');
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    // Retrieve the authorization token from storage
    const token = typeof window !== 'undefined' 
        ? (localStorage.getItem('access_token') || localStorage.getItem('token') || localStorage.getItem('jwt_token')) 
        : '';

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !image) return;

        setIsSubmitting(true);
        setError('');

        const baseUrl = import.meta.env?.VITE_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || '';
        const formData = new FormData();
        formData.append('Name', name);
        formData.append('Image_Banner', image);

        try {
            const response = await fetch(`${baseUrl}/api/banner-input`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: formData
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'មិនអាចបញ្ចូលបដាបានទេ។');
            }

            // Pass the newly created banner data back to parent
            if (onAdd) {
                onAdd(result.data);
            }

            // Reset and close
            onClose();
            setName('');
            setImage(null);
            setPreview(null);
        } catch (err) {
            setError(err.message || 'មានបញ្ហាក្នុងការបញ្ចូលបដា។');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 font-['Kantumruy_Pro']">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-150">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <h3 className="text-sm font-bold text-slate-800">បន្ថែមបដាថ្មី (Add New Banner)</h3>
                    <button 
                        type="button"
                        onClick={onClose}
                        className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer transition-all"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-medium rounded-xl">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">ឈ្មោះបដា (Banner Name)</label>
                        <input 
                            type="text" 
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="បញ្ចូលឈ្មោះបដា..."
                            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-blue-600 bg-slate-50/50"
                        />
                    </div>

                    <div>
                        <span className="block text-xs font-bold text-slate-700 mb-1">រូបភាពបដា (Banner Image)</span>
                        <label className="mt-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl h-36 cursor-pointer bg-slate-50 hover:bg-slate-100 transition-all overflow-hidden relative">
                            {preview ? (
                                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex flex-col items-center text-slate-400">
                                    <Upload className="w-5 h-5 mb-1 text-blue-600" />
                                    <span className="text-[11px] font-medium">ចុចទីនេះដើម្បីបញ្ចូលរូបភាព</span>
                                </div>
                            )}
                            <input type="file" accept="image/jpeg,image/png,image/jpg" onChange={handleImageChange} className="hidden" required />
                        </label>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer transition"
                        >
                            បោះបង់
                        </button>
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50 transition"
                        >
                            {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                            រក្សាទុក
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default BannerModal;