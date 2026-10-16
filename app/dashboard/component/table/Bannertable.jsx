import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Eye, Trash2, Loader2, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Bannertable({ searchTerm }) {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isOpen, setIsOpen] = useState(true);
    const [expandedRowId, setExpandedRowId] = useState(null);

    // Pagination States
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const token = typeof window !== 'undefined' 
        ? (localStorage.getItem('access_token') || localStorage.getItem('token') || localStorage.getItem('jwt_token')) 
        : '';

    // URL API configuration
    const getApiBaseUrl = () => {
        return process.env.NEXT_PUBLIC_API_URL ||
               'http://127.0.0.1:8000';
    };

    const fetchBanners = async (page = 1) => {
        setLoading(true);
        setError('');
        const baseUrl = getApiBaseUrl();

        try {
            // បញ្ជូន query ?page=X ទៅកាន់ Laravel API
            const endpoint = `${baseUrl}/api/banner-list?page=${page}`;

            const response = await fetch(endpoint, {    
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('ការផ្ទៀងផ្ទាត់បរាជ័យ (Unauthorized)៖ សូម Login ម្ដងទៀត។');
                }
                throw new Error('មិនអាចទាញយកទិន្នន័យបានទេ។');
            }

            const result = await response.json();
            console.log("API Response:", result);

            // កំណត់ទិន្នន័យសម្រាប់ Laravel Pagination (`result.data.data` ឬ `result.banner.data`)
            let bannerList = [];
            let paginationData = result.data || result.banner || result;

            if (paginationData && Array.isArray(paginationData.data)) {
                bannerList = paginationData.data;
                setCurrentPage(paginationData.current_page || 1);
                setLastPage(paginationData.last_page || 1);
                setTotalItems(paginationData.total || 0);
            } else if (Array.isArray(result)) {
                bannerList = result;
            }

            setBanners(bannerList);
        } catch (err) {
            setError(err.message || 'មិនអាចទាញយកទិន្នន័យបដា (Banner) បានទេ។');
            setBanners([]); 
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchBanners(currentPage);
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [token, currentPage]);

    const toggleRow = (id) => {
        setExpandedRowId(prevId => (prevId === id ? null : id));
    };

    const handleDelete = async (id) => {
        if (!window.confirm("តើអ្នកពិតជាចង់លុบบដានេះមែនទេ?")) return;
        const baseUrl = getApiBaseUrl();
        
        try {
            const response = await fetch(`${baseUrl}/api/banner-delete/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Delete failed');

            // ធ្វើការទាញយកទិន្នន័យឡើងវិញបន្ទាប់ពីលុប
            fetchBanners(currentPage);
            if (expandedRowId === id) setExpandedRowId(null);
        } catch (error) {
            alert('ការលុបបរាជ័យ សូមព្យាយាមម្តងទៀត។');
        }
    };

    if (loading && banners.length === 0) {
        return (
            <div className="p-12 text-center text-slate-500 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center gap-2 font-['Kantumruy_Pro']">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                <p className="text-sm font-medium">កំពុងទាញយកទិន្នន័យ...</p>
            </div>
        );
    }

    const baseUrl = getApiBaseUrl();
    const safeBanners = Array.isArray(banners) ? banners : [];
    const filteredBanners = safeBanners.filter((banner) =>
        (banner.Name || banner.title || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden transition-all duration-300 font-['Kantumruy_Pro']">
            {/* Header Section */}
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold border border-slate-100 shadow-xs">
                        <ImageIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-slate-800">ការគ្រប់គ្រងបដា (Banner)</h3>
                        <p className="text-xs text-slate-500">សរុបចំនួន {totalItems} បដា</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold transition cursor-pointer shadow-xs"
                    >
                        {isOpen ? "លាក់តារាង" : "បង្ហាញតារាង"}
                        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-rose-50 border-b border-rose-100 text-rose-600 text-xs font-medium text-center">
                    {error}
                </div>
            )}

            {/* Collapsible Content Wrapper */}
            <div className={`grid transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider">
                                    <th className="py-3.5 px-6 font-semibold">ចំណងជើង / បដា</th>
                                    <th className="py-3.5 px-6 font-semibold">តំណភ្ជាប់ (Link)</th>
                                    <th className="py-3.5 px-6 font-semibold">ទីតាំង (Position)</th>
                                    <th className="py-3.5 px-6 font-semibold">ស្ថានភាព</th>
                                    <th className="py-3.5 px-6 font-semibold text-right">សកម្មភាព</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                                {filteredBanners.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="py-12 text-center text-slate-400 font-medium">
                                            រកមិនឃើញទិន្នន័យបដាទេ។
                                        </td>
                                    </tr>
                                ) : (
                                    filteredBanners.map((banner) => {
                                        const isExpanded = expandedRowId === banner.id;
                                        const bannerTitle = banner.Name || banner.title || 'គ្មានចំណងជើង';
                                        const bannerImgPath = banner.Image_Banner;

                                        return (
                                            <React.Fragment key={banner.id}>
                                                <tr className="hover:bg-slate-50/80 transition-colors">
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center gap-3.5">
                                                            {bannerImgPath ? (
                                                                <img 
                                                                    src={`${baseUrl}/storage/${bannerImgPath}`} 
                                                                    alt={bannerTitle} 
                                                                    className="w-16 h-10 object-cover rounded-xl border border-slate-200 shadow-xs shrink-0"
                                                                />
                                                            ) : (
                                                                <div className="w-16 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 text-[10px] border border-slate-200 shrink-0 font-medium">
                                                                    គ្មានរូប
                                                                </div>
                                                            )}
                                                            <div>
                                                                <span className="font-bold text-slate-800 block text-sm">{bannerTitle}</span>
                                                                <span className="text-xs text-slate-400">ID: #{banner.id}</span>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="py-4 px-6">
                                                        <span className="text-xs font-mono text-blue-600 block truncate max-w-xs">{banner.link || 'គ្មាន'}</span>
                                                    </td>

                                                    <td className="py-4 px-6">
                                                        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">
                                                            {banner.position || 'ទំព័រដើម'}
                                                        </span>
                                                    </td>

                                                    <td className="py-4 px-6">
                                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                            banner.status === 'inactive' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                                                        }`}>
                                                            {banner.status || 'សកម្ម'}
                                                        </span>
                                                    </td>

                                                    <td className="py-4 px-6 text-right space-x-2">
                                                        <button 
                                                            onClick={() => toggleRow(banner.id)}
                                                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer inline-flex items-center gap-1 ${
                                                                isExpanded ? 'bg-emerald-600 text-white shadow-sm' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                                            }`}
                                                        >
                                                            <Eye className="w-3.5 h-3.5" /> {isExpanded ? 'លាក់' : 'មើល'}
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDelete(banner.id)}
                                                            className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-semibold transition cursor-pointer inline-flex items-center gap-1"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" /> លុប
                                                        </button>
                                                    </td>
                                                </tr>

                                                {/* Expanded Detail View */}
                                                <tr>
                                                    <td colSpan="5" className="p-0 border-none">
                                                        <div className={`grid transition-all duration-300 ease-in-out bg-slate-50/90 ${
                                                            isExpanded ? 'grid-rows-[1fr] opacity-100 p-6 border-b border-slate-200' : 'grid-rows-[0fr] opacity-0 p-0 border-none'
                                                        }`}>
                                                            <div className="overflow-hidden space-y-6 max-w-4xl mx-auto w-full">
                                                                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                                                                    <div className="md:col-span-5 flex flex-col items-center justify-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                                        {bannerImgPath ? (
                                                                            <img 
                                                                                src={`${baseUrl}/storage/${bannerImgPath}`} 
                                                                                alt={bannerTitle} 
                                                                                className="w-full h-36 object-cover rounded-xl border border-slate-200 shadow-sm"
                                                                            />
                                                                        ) : (
                                                                            <div className="text-xs text-slate-400 text-center py-4">គ្មានរូបភាព</div>
                                                                        )}
                                                                        <span className="text-[11px] font-medium text-slate-400 mt-2">រូបភាពបដាពេញលេញ</span>
                                                                    </div>

                                                                    <div className="md:col-span-7 space-y-3 bg-slate-50/60 p-4 rounded-xl border border-slate-100">
                                                                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">ព័ត៌មានលម្អិតបដា</span>
                                                                        <div>
                                                                            <span className="text-xs text-slate-500 block">ឈ្មោះ / ចំណងជើង (Name):</span>
                                                                            <h4 className="text-sm font-bold text-slate-800">{bannerTitle}</h4>
                                                                        </div>
                                                                        <div>
                                                                            <span className="text-xs text-slate-500 block">Seller ID:</span>
                                                                            <span className="text-xs font-mono text-slate-700">{banner.seller_id || 'គ្មាន'}</span>
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

                    {/* Pagination Bar */}
                    {lastPage > 1 && (
                        <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between">
                            <span className="text-xs text-slate-500 font-medium">
                                ទំព័រទី <span className="font-bold text-slate-800">{currentPage}</span> នៃ <span className="font-bold text-slate-800">{lastPage}</span>
                            </span>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition shadow-xs"
                                >
                                    <ChevronLeft className="w-3.5 h-3.5" /> មុន
                                </button>
                                
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, lastPage))}
                                    disabled={currentPage === lastPage}
                                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition shadow-xs"
                                >
                                    បន្ទាប់ <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}