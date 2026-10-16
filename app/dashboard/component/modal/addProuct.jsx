import React, { useState, useEffect } from 'react';
import { Upload, X, Calendar } from 'lucide-react';

export default function AddProductSeller({ onClose, onSuccess }) {
    // State សម្រាប់រូបភាពទំនិញ (Product Image)
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);

    // State សម្រាប់រូបភាពម៉ាកយីហោ (Brand Image)
    const [brandImagePreview, setBrandImagePreview] = useState(null);
    const [brandImageFile, setBrandImageFile] = useState(null);

    // State សម្រាប់វីដេអូទំនិញ (Product Video)
    const [videoPreview, setVideoPreview] = useState(null);
    const [videoFile, setVideoFile] = useState(null);

    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    
    // State សម្រាប់ទាញយក Categories
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);

    // State សម្រាប់ FormData (រួមបញ្ចូលទាំង Field កំណត់ពេលផុស)
    const [formData, setFormData] = useState({
        product_name: '',
        product_sku: '',
        brand: '',
        category_id: '',
        product_cost: '',
        product_price: '',
        discount_price: '',
        product_stock: '',
        status: 'មានស្តុក',
        product_description: '',
        // 📌 Field កំណត់ពេលផុស (ដាក់ទទេរបាន បើចង់ផុសភ្លាមៗ)
        year: '',
        month: '',
        day: '',
        time: ''
    });

    // ទាញយកទិន្នន័យ Categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/category-list`, {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const result = await response.json();
                
                if (response.ok) {
                    setCategories(result.list || []);
                } else {
                    console.error('Failed to fetch categories');
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            } finally {
                setLoadingCategories(false);
            }
        };

        fetchCategories();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // មុខងារគ្រប់គ្រងរូបភាពទំនិញ
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview(null);
    };

    // មុខងារគ្រប់គ្រងរូបភាពម៉ាកយីហោ
    const handleBrandImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setBrandImageFile(file);
            setBrandImagePreview(URL.createObjectURL(file));
        }
    };

    const handleRemoveBrandImage = () => {
        setBrandImageFile(null);
        setBrandImagePreview(null);
    };

    // មុខងារគ្រប់គ្រងវីដេអូទំនិញ
    const handleVideoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setVideoFile(file);
            setVideoPreview(URL.createObjectURL(file));
        }
    };

    const handleRemoveVideo = () => {
        setVideoFile(null);
        setVideoPreview(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage('');

        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                // បញ្ជូនទិន្នន័យទៅ (ប្រសិនបើមានតម្លៃ)
                if (formData[key] !== '') {
                    data.append(key, formData[key]);
                }
            });

            if (imageFile) data.append('Image', imageFile);
            if (brandImageFile) data.append('brand_image', brandImageFile);
            if (videoFile) data.append('product_video', videoFile);

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/productSell`, {
                method: 'POST',
                body: data,
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const result = await response.json();

            if (!response.ok) {
                const validationErrors = result.errors ? Object.values(result.errors).flat().join(', ') : null;
                throw new Error(validationErrors || result.message || 'មានបញ្ហាក្នុងការរក្សាទុកទំនិញ។');
            }

            if (onSuccess) onSuccess(result);
            onClose();

        } catch (error) {
            console.error('Error saving product:', error);
            setErrorMessage(error.message || 'មានបញ្ហាអ្វីមួយកើតឡើង សូមព្យាយាមម្តងទៀត។');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
            <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-2xl shadow-xl border border-slate-200 transform transition-all my-auto">
                
                <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3 sticky top-0 bg-white z-10">
                    <h3 className="text-base sm:text-lg font-bold text-slate-800">បន្ថែមទំនិញថ្មី & កំណត់ពេលផុស</h3>
                    <button 
                        type="button"
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition cursor-pointer"
                    >
                        ✕
                    </button>
                </div>

                {errorMessage && (
                    <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-600 text-sm rounded-lg">
                        {errorMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                
                    {/* Row 1: Product Name & SKU */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wider">
                                ឈ្មោះទំនិញ (Product Name) *
                            </label>
                            <input 
                                type="text" 
                                name="product_name"
                                value={formData.product_name}
                                onChange={handleChange}
                                placeholder="ឧ. កាសស្តាប់ត្រចៀកឥតខ្សែ"
                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wider">
                                លេខកូដទំនិញ (SKU)
                            </label>
                            <input 
                                type="text" 
                                name="product_sku"
                                value={formData.product_sku}
                                onChange={handleChange}
                                placeholder="ឧ. SKU-12345"
                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    {/* Row 2: Brand & Category Select */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wider">
                                ម៉ាកយីហោ (Brand)
                            </label>
                            <input 
                                type="text" 
                                name="brand"
                                value={formData.brand}
                                onChange={handleChange}
                                placeholder="ឧ. សូនី (Sony)"
                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wider">
                                ប្រភេទមុខទំនិញ (Category) *
                            </label>
                            <select 
                                name="category_id"
                                value={formData.category_id}
                                onChange={handleChange}
                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                required
                            >
                                <option value="">-- ជ្រើសរើសប្រភេទ --</option>
                                {loadingCategories ? (
                                    <option disabled>កំពុងទាញយក...</option>
                                ) : (
                                    categories.map((parent) => (
                                        <optgroup key={parent.id} label={parent.category_name}>
                                            <option value={parent.id}>
                                                {parent.category_name} (ប្រភេទមេ)
                                            </option>
                                            {parent.children && parent.children.map((child) => (
                                                <option key={child.id} value={child.id}>
                                                    &nbsp;&nbsp;&nbsp;&nbsp;↳ {child.category_name}
                                                </option>
                                            ))}
                                        </optgroup>
                                    ))
                                )}
                            </select>
                        </div>
                    </div>

                    {/* Row 3: Cost, Price & Discount Price */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wider">
                                តម្លៃដើម ($) *
                            </label>
                            <input 
                                type="number" 
                                name="product_cost"
                                value={formData.product_cost}
                                onChange={handleChange}
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wider">
                                តម្លៃលក់ ($) *
                            </label>
                            <input 
                                type="number" 
                                name="product_price"
                                value={formData.product_price}
                                onChange={handleChange}
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wider">
                                តម្លៃបញ្ចុះតម្លៃ ($)
                            </label>
                            <input 
                                type="number" 
                                name="discount_price"
                                value={formData.discount_price}
                                onChange={handleChange}
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    {/* Row 4: Stock & Status */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wider">
                                ស្តុកទំនិញ (Stock) *
                            </label>
                            <input 
                                type="number" 
                                name="product_stock"
                                value={formData.product_stock}
                                onChange={handleChange}
                                placeholder="0"
                                min="0"
                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wider">
                                ស្ថានភាព (Status)
                            </label>
                            <select 
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            >
                                <option value="មានស្តុក">មានស្តុក</option>
                                <option value="អស់ស្តុក">អស់ស្តុក</option>
                            </select>
                        </div>
                    </div>

                    {/* ========================================== */}
                    {/* 🕒 SECTION ថ្មី៖ កំណត់ពេលផុស (Schedule Time) */}
                    {/* ========================================== */}
                    <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl space-y-3">
                        <div className="flex items-center gap-2 text-blue-800 font-semibold text-xs uppercase tracking-wider">
                            <Calendar className="w-4 h-4" />
                            <span>កំណត់ពេលបង្ហាញទំនិញ (ទុកទទេបើចង់ផុសភ្លាមៗ)</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div>
                                <label className="block text-[11px] font-medium text-slate-600 mb-1">ឆ្នាំ (Year)</label>
                                <input 
                                    type="number" 
                                    name="year"
                                    value={formData.year}
                                    onChange={handleChange}
                                    placeholder="ឧ. 2026"
                                    className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-medium text-slate-600 mb-1">ខែ (Month)</label>
                                <input 
                                    type="number" 
                                    name="month"
                                    value={formData.month}
                                    onChange={handleChange}
                                    placeholder="1 - 12"
                                    min="1" max="12"
                                    className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-medium text-slate-600 mb-1">ថ្ងៃ (Day)</label>
                                <input 
                                    type="number" 
                                    name="day"
                                    value={formData.day}
                                    onChange={handleChange}
                                    placeholder="1 - 31"
                                    min="1" max="31"
                                    className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-medium text-slate-600 mb-1">ម៉ោង (Time)</label>
                                <input 
                                    type="time" 
                                    name="time"
                                    value={formData.time}
                                    onChange={handleChange}
                                    className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Row 5: Images Upload */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wider">
                                រូបភាពទំនិញ (Product Image)
                            </label>
                            {imagePreview ? (
                                <div className="relative w-full h-32 bg-slate-50 border border-slate-300 rounded-lg overflow-hidden flex items-center justify-center">
                                    <img src={imagePreview} alt="Preview" className="h-full object-contain" />
                                    <button
                                        type="button"
                                        onClick={handleRemoveImage}
                                        className="absolute top-2 right-2 w-7 h-7 bg-rose-600 text-white rounded-full flex items-center justify-center hover:bg-rose-700 transition cursor-pointer shadow-md"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition">
                                    <div className="flex flex-col items-center justify-center pt-4 pb-5 text-slate-500">
                                        <Upload className="w-5 h-5 mb-1 text-slate-400" />
                                        <p className="text-xs font-medium">ចុចបញ្ចូលរូបភាពទំនិញ</p>
                                        <p className="text-[10px] text-slate-400">PNG, JPG (max 2MB)</p>
                                    </div>
                                    <input 
                                        type="file" 
                                        accept="image/jpeg,image/png,image/jpg" 
                                        onChange={handleImageChange} 
                                        className="hidden" 
                                    />
                                </label>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wider">
                                រូបភាពម៉ាក (Brand Logo/Image)
                            </label>
                            {brandImagePreview ? (
                                <div className="relative w-full h-32 bg-slate-50 border border-slate-300 rounded-lg overflow-hidden flex items-center justify-center">
                                    <img src={brandImagePreview} alt="Brand Preview" className="h-full object-contain" />
                                    <button
                                        type="button"
                                        onClick={handleRemoveBrandImage}
                                        className="absolute top-2 right-2 w-7 h-7 bg-rose-600 text-white rounded-full flex items-center justify-center hover:bg-rose-700 transition cursor-pointer shadow-md"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition">
                                    <div className="flex flex-col items-center justify-center pt-4 pb-5 text-slate-500">
                                        <Upload className="w-5 h-5 mb-1 text-slate-400" />
                                        <p className="text-xs font-medium">ចុចបញ្ចូលរូបភាពម៉ាក</p>
                                        <p className="text-[10px] text-slate-400">PNG, JPG (max 2MB)</p>
                                    </div>
                                    <input 
                                        type="file" 
                                        accept="image/jpeg,image/png,image/jpg" 
                                        onChange={handleBrandImageChange} 
                                        className="hidden" 
                                    />
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Row 6: Video Upload Field */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wider">
                            វីដេអូទំនិញ (Product Video)
                        </label>
                        {videoPreview ? (
                            <div className="relative w-full h-36 bg-slate-900 border border-slate-300 rounded-lg overflow-hidden flex items-center justify-center">
                                <video src={videoPreview} controls className="h-full w-full object-contain" />
                                <button
                                    type="button"
                                    onClick={handleRemoveVideo}
                                    className="absolute top-2 right-2 w-7 h-7 bg-rose-600 text-white rounded-full flex items-center justify-center hover:bg-rose-700 transition cursor-pointer shadow-md z-10"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition">
                                <div className="flex flex-col items-center justify-center pt-4 pb-5 text-slate-500">
                                    <Upload className="w-5 h-5 mb-1 text-slate-400" />
                                    <p className="text-xs font-medium">ចុចបញ្ចូលវីដេអូទំនិញ</p>
                                    <p className="text-[10px] text-slate-400">MP4, MOV (max 50MB)</p>
                                </div>
                                <input 
                                    type="file" 
                                    accept="video/mp4,video/quicktime,video/avi" 
                                    onChange={handleVideoChange} 
                                    className="hidden" 
                                />
                            </label>
                        )}
                    </div>

                    {/* Row 7: Description */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wider">
                            បរិយាយពីទំនិញ (Description)
                        </label>
                        <textarea 
                            name="product_description"
                            value={formData.product_description}
                            onChange={handleChange}
                            rows="3"
                            placeholder="បញ្ចូលព័ត៌មានលម្អិតពីទំនិញ..."
                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                        ></textarea>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col-reverse sm:flex-row items-center gap-3 pt-2">
                        <button 
                            type="button"
                            onClick={onClose}
                            className="w-full sm:flex-1 bg-slate-100 text-slate-700 font-medium py-3 sm:py-2.5 px-4 rounded-lg text-sm hover:bg-slate-200 transition cursor-pointer"
                        >
                            បោះបង់
                        </button>
                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full sm:flex-1 bg-blue-600 text-white font-medium py-3 sm:py-2.5 px-4 rounded-lg text-sm hover:bg-blue-700 transition cursor-pointer shadow-md shadow-blue-500/20 disabled:opacity-50"
                        >
                            {loading ? 'កំពុងរក្សាទុក...' : 'រក្សាទុកទំនិញ'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}