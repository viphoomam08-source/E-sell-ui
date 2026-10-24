"use client";

import React, { useState, useEffect } from 'react';
import { Package, Eye, Edit3, Trash2, Loader2, ChevronDown, Plus, Layers, ChevronLeft, ChevronRight } from 'lucide-react';
import AddProductModal from '../modal/AddProductModal';
import UpdateForm from '../modal/updateForm';

export default function ProTable({ searchTerm }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isOpen, setIsOpen] = useState(true);
    
    const [expandedRowId, setExpandedRowId] = useState(null);
    const [collapsedVariants, setCollapsedVariants] = useState({}); 
    const [selectUpdate, setSelectUpdate] = useState(null);
    const [selectedProductId, setSelectedProductId] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);

    const token =
         (localStorage.getItem('access_token') || localStorage.getItem('token') || localStorage.getItem('jwt_token')) 
        ;

    const fetchProducts = async (isBackground = false) => {
        if (!isBackground) setLoading(true);
        setError('');
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;

        try {
            let endpoint;
            let options = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            };

            if (searchTerm && searchTerm.trim() !== '') {
                endpoint = `${baseUrl}/api/search-product?page=${currentPage}`;
                options.method = 'POST';
                options.body = JSON.stringify({ keyword: searchTerm });
            } else {
                endpoint = `${baseUrl}/api/productSell-list?page=${currentPage}`;
                options.method = 'GET';
            }

            const response = await fetch(endpoint, options);
            
            if (!response.ok) {
                if (response.status === 401) throw new Error(' សូម Login ម្ដងទៀត។');
                throw new Error('មិនអាចទាញយកទិន្នន័យបានទេ។');
            }

            const json = await response.json();
            parseAndSetProductsData(json);

        } catch (err) {
            if (!isBackground) {
                setError(err.message || 'មិនអាចទាញយកទិន្នន័យផលិតផលបានទេ។');
            }
        } finally {
            if (!isBackground) setLoading(false);
        }
    };

    const parseAndSetProductsData = (data) => {
        let extracted = [];

        if (data?.data?.data && Array.isArray(data.data.data)) {
            extracted = data.data.data;
            setCurrentPage(data.data.current_page || 1);
            setLastPage(data.data.last_page || 1);
            setTotalProducts(data.data.total || 0);
        } else if (data?.data && Array.isArray(data.data)) {
            extracted = data.data;
            setTotalProducts(data.total || data.data.length);
        } else if (data?.product && Array.isArray(data.product)) {
            extracted = data.product;
            setTotalProducts(data.total || data.product.length);
        } else if (Array.isArray(data)) {
            extracted = data;
            setTotalProducts(data.length);
        }

        setProducts(extracted);
    };

    useEffect(() => {
        const delayDebounce = setTimeout(() => fetchProducts(false), 300);
        const pollInterval = setInterval(() => fetchProducts(true), 1000); 

        return () => {
            clearTimeout(delayDebounce);
            clearInterval(pollInterval);
        };
    }, [searchTerm, token, currentPage]);

    const handleNextPage = () => { if (currentPage < lastPage) setCurrentPage(p => p + 1); };
    const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(p => p - 1); };

    const toggleRow = (id) => setExpandedRowId(prev => (prev === id ? null : id));
    
    const toggleVariantsSection = (id) => {
        setCollapsedVariants(prev => ({ ...prev, [id]: prev[id] === undefined ? false : !prev[id] }));
    };

    const handleDelete = async (id) => {
        if (!window.confirm("តើអ្នកពិតជាចង់លុបផលិតផលនេះមែនទេ?")) return;
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        
        try {
            const res = await fetch(`${baseUrl}/api/product-delete/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
            });

            if (!res.ok) throw new Error('Delete failed');

            setProducts(prev => prev.filter(p => p.id !== id));
            if (expandedRowId === id) setExpandedRowId(null);
        } catch (error) {
            alert('ការលុបបរាជ័យ សូមព្យាយាមម្តងទៀត។');
        }
    };

    const productsList = Array.isArray(products) ? products : [];

    if (loading && productsList.length === 0) {
        return (
            <div className="p-12 text-center text-slate-500 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center gap-2 font-['Kantumruy_Pro']">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                <p className="text-sm font-medium">កំពុងទាញយកទិន្នន័យ...</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden font-['Kantumruy_Pro']">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold border border-slate-100 shadow-xs">
                        <Package className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-slate-800">ការគ្រប់គ្រងផលិតផល</h3>
                        <p className="text-xs text-slate-500">គ្រប់គ្រងស្តុក តម្លៃ និងទំនិញ (សរុប: {totalProducts})</p>
                    </div>
                </div>

                <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold transition cursor-pointer shadow-xs"
                >
                    {isOpen ? "លាក់តារាង" : "បង្ហាញតារាង"}
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
            </div>

            {error && (
                <div className="p-4 bg-rose-50 border-b border-rose-100 text-rose-600 text-xs font-medium text-center">
                    {error}
                </div>
            )}

            <div className={`grid transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider">
                                    <th className="py-3.5 px-6 font-semibold">ឈ្មោះផលិតផល</th>
                                    <th className="py-3.5 px-6 font-semibold">SKU / ម៉ាក</th>
                                    <th className="py-3.5 px-6 font-semibold">តម្លៃដើម / តម្លៃលក់</th>
                                    <th className="py-3.5 px-6 font-semibold">ស្តុក</th>
                                    <th className="py-3.5 px-6 font-semibold">ស្ថានភាព</th>
                                    <th className="py-3.5 px-6 font-semibold text-right">សកម្មភាព</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                                {productsList.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-12 text-center text-slate-400 font-medium">
                                            រកមិនឃើញទិន្នន័យផលិតផលទេ។
                                        </td>
                                    </tr>
                                ) : (
                                    productsList.map((product) => {
                                        const isExpanded = expandedRowId === product.id;
                                        const isVariantsCollapsed = collapsedVariants[product.id] ?? true;
                                        const childVariants = product.variants || product.product_variants || product.child_products || product.productVariants || product.variations || [];

                                        return (
                                            <React.Fragment key={product.id}>
                                                {/* Main Row */}
                                                <tr className="hover:bg-slate-50/80 transition-colors">
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center gap-3.5">
                                                            {product.image ? (
                                                                <img 
                                                                    src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${product.image}`}
                                                                    alt={product.product_name} 
                                                                    className="w-12 h-12 object-cover rounded-xl border border-slate-200 shadow-xs shrink-0"
                                                                />
                                                            ) : (
                                                                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 text-[10px] border border-slate-200 shrink-0 font-medium">
                                                                    គ្មានរូប
                                                                </div>
                                                            )}
                                                            <div>
                                                                <span className="font-bold text-slate-800 block text-sm">{product.product_name}</span>
                                                                <span className="text-xs text-slate-400">
                                                                    {product.category?.category_name || product.category_name || 'គ្មានប្រភេទ'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="py-4 px-6">
                                                        <span className="text-xs font-mono text-slate-600 block">{product.product_sku}</span>
                                                        <span className="text-xs text-slate-400">{product.brand || 'គ្មាន'}</span>
                                                    </td>

                                                    <td className="py-4 px-6">
                                                        <div className="text-xs text-slate-400 line-through">តម្លៃដើម: ${product.product_cost}</div>
                                                        <div className="font-bold text-emerald-600">តម្លៃលក់: ${product.product_price}</div>
                                                        {product.discount_price > 0 && (
                                                            <div className="text-xs text-rose-500">បញ្ចុះតម្លៃ: ${product.discount_price}</div>
                                                        )}
                                                    </td>

                                                    <td className="py-4 px-6">
                                                        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">
                                                            {product.product_stock} ឯកតា
                                                        </span>
                                                    </td>

                                                    <td className="py-4 px-6">
                                                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600">
                                                            {product.status || 'សកម្ម'}
                                                        </span>
                                                    </td>

                                                    <td className="py-4 px-6 text-right space-x-2">
                                                        <button 
                                                            onClick={() => setSelectedProductId(product.id)}
                                                            className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-xs font-semibold transition cursor-pointer inline-flex items-center gap-1"
                                                            title="បន្ថែម Variant"
                                                        >
                                                            <Plus className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button 
                                                            onClick={() => toggleRow(product.id)}
                                                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer inline-flex items-center gap-1 ${
                                                                isExpanded ? 'bg-emerald-600 text-white shadow-sm' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                                            }`}
                                                        >
                                                            <Eye className="w-3.5 h-3.5" /> {isExpanded ? 'លាក់' : 'មើល'}
                                                        </button>
                                                        <button 
                                                            onClick={() => setSelectUpdate(product)}
                                                            className="px-3 py-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800 rounded-xl text-xs font-semibold transition cursor-pointer inline-flex items-center gap-1"
                                                        >
                                                            <Edit3 className="w-3.5 h-3.5" /> កែប្រែ
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDelete(product.id)}
                                                            className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-semibold transition cursor-pointer inline-flex items-center gap-1"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" /> លុប
                                                        </button>
                                                    </td>
                                                </tr>

                                                {/* Expanded Details & Variants Row */}
                                                <tr>
                                                    <td colSpan="6" className="p-0 border-none">
                                                        <div className={`grid transition-all duration-300 ease-in-out bg-slate-50/90 ${
                                                            isExpanded ? 'grid-rows-[1fr] opacity-100 p-6 border-b border-slate-200' : 'grid-rows-[0fr] opacity-0 p-0 border-none'
                                                        }`}>
                                                            <div className="overflow-hidden space-y-6 max-w-5xl mx-auto w-full">
                                                                
                                                                {/* Details Info Card */}
                                                                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                                                                    <div className="md:col-span-3 flex flex-col gap-3 items-center justify-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                                        {product.image && (
                                                                            <img src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${product.image}`} alt={product.product_name} className="w-28 h-28 object-cover rounded-xl border border-slate-200 shadow-sm" />
                                                                        )}
                                                                        {!product.image && <div className="text-xs text-slate-400 py-4">គ្មានរូបភាព</div>}
                                                                    </div>
                                                                    <div className="md:col-span-9 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                                        <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-100">
                                                                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">ព័ត៌មានទូទៅ</span>
                                                                            <h4 className="text-sm font-bold text-slate-800">{product.product_name}</h4>
                                                                            <p className="text-xs text-slate-500 mt-0.5">ម៉ាក: <span className="font-medium text-slate-700">{product.brand || 'គ្មាន'}</span></p>
                                                                            <p className="text-xs text-slate-500 mt-0.5">SKU: <span className="font-mono text-slate-700">{product.product_sku || 'គ្មាន'}</span></p>
                                                                        </div>
                                                                        <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-100">
                                                                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">តម្លៃ និងស្តុក</span>
                                                                            <div className="text-xs space-y-1 mt-1">
                                                                                <div className="flex justify-between"><span className="text-slate-500">តម្លៃដើម:</span> <span className="text-slate-600">${product.product_cost}</span></div>
                                                                                <div className="flex justify-between"><span className="text-slate-500">តម្លៃលក់:</span> <span className="font-bold text-emerald-600">${product.product_price}</span></div>
                                                                                <div className="flex justify-between"><span className="text-slate-500">ស្តុកសរុប:</span> <span className="font-medium text-slate-700">{product.product_stock} ឯកតា</span></div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Variants Section */}
                                                                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
                                                                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                                                        <div className="flex items-center gap-2">
                                                                            <Layers className="w-4 h-4 text-blue-600" />
                                                                            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">ជម្រើសរង (Child Variants)</h4>
                                                                        </div>
                                                                        <button onClick={() => toggleVariantsSection(product.id)} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-semibold transition cursor-pointer inline-flex items-center gap-1">
                                                                            {isVariantsCollapsed ? "បង្ហាញ" : "បិទ"}
                                                                            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isVariantsCollapsed ? '' : 'rotate-180'}`} />
                                                                        </button>
                                                                    </div>
                                                                    
                                                                    <div className={`grid transition-all duration-300 ease-in-out ${isVariantsCollapsed ? 'grid-rows-[0fr] opacity-0' : 'grid-rows-[1fr] opacity-100'}`}>
                                                                        <div className="overflow-hidden">
                                                                            {childVariants.length === 0 ? (
                                                                                <div className="py-4 text-center text-slate-400 text-xs">មិនមាន Variant ទេ។</div>
                                                                            ) : (
                                                                                <table className="w-full text-left border-collapse pt-2">
                                                                                    <tbody>
                                                                                        {childVariants.map((variant, idx) => (
                                                                                            <tr key={idx} className="border-b border-slate-100">
                                                                                                <td className="py-2 px-3 text-xs font-medium text-slate-800">{variant.variant_name || variant.name || 'គ្មានឈ្មោះ'}</td>
                                                                                                <td className="py-2 px-3 text-xs font-bold text-emerald-600">${variant.price || '0.00'}</td>
                                                                                                <td className="py-2 px-3 text-xs text-slate-600">{variant.stock || 0} ឯកតា</td>
                                                                                            </tr>
                                                                                        ))}
                                                                                    </tbody>
                                                                                </table>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            </React.Fragment>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between">
                        <span className="text-xs text-slate-500 font-medium">
                            ទំព័រ <span className="font-bold text-slate-700">{currentPage}</span> / <span className="font-bold text-slate-700">{lastPage}</span> (សរុប: {totalProducts})
                        </span>
                        
                        <div className="flex items-center gap-2">
                            <button onClick={handlePrevPage} disabled={currentPage === 1} className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition ${currentPage === 1 ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer shadow-xs'}`}>
                                <ChevronLeft className="w-3.5 h-3.5" /> មុន
                            </button>
                            <button onClick={handleNextPage} disabled={currentPage >= lastPage} className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition ${currentPage >= lastPage ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer shadow-xs'}`}>
                                បន្ទាប់ <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    {/* Modals */}
                    {selectedProductId && (
                        <AddProductModal productId={selectedProductId} token={token} onClose={() => setSelectedProductId(null)} onSuccess={() => fetchProducts(false)} />
                    )}
                    {selectUpdate && (
                        <UpdateForm product={selectUpdate} isOpen={Boolean(selectUpdate)} token={token} onClose={() => setSelectUpdate(null)} onUpdateSuccess={() => fetchProducts(false)} />
                    )}
                </div>
            </div>
        </div>
    );
}