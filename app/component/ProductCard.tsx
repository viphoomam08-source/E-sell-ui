'use client';
import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Heart, ChevronLeft, ChevronRight, ArrowRight, Tag, Info } from 'lucide-react';
import CustomAlert from './CustomAlert';
import ViewPro from '../Pages/ViewPro'; 
import Link from 'next/link';

export default function ProductCard({ selectedSubId }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [favorites, setFavorites] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);

  const [showAll, setShowAll] = useState(false);
  const scrollContainerRef = useRef(null);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [hoveredProductId, setHoveredProductId] = useState(null);

  const [alertState, setAlertState] = useState({
    isOpen: false,
    type: 'success',
    message: '',
    onConfirm: null
  });

  const showAlert = (message, type = 'success', onConfirm = null) => {
    setAlertState({ isOpen: true, type, message, onConfirm });
  };

  const closeAlert = () => {
    setAlertState(prev => ({ ...prev, isOpen: false }));
  };

  const fetchProducts = async (isBackground = false) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/product_no_discount`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch products');
      
      const productArray = data.product || data.data || data.products || data;
      setProducts(Array.isArray(productArray) ? productArray : []);
      
      if (!isBackground) setLoading(false);
    } catch (err) {
      if (!isBackground) {
        setError('cant show product');
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 50);
    fetchProducts(false);

    const interval = setInterval(() => {
      fetchProducts(true);
    }, 2000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  const handleMouseEnterCard = (product) => {
    setHoveredProductId(product.id);
  };

  const handleMouseLeaveCard = () => {
    setHoveredProductId(null);
  };

  const filteredProducts = selectedSubId 
    ? products.filter(p => {
        const prodCatId = 
          p.category_id ?? 
          p.category?.id ?? 
          p.sub_category_id ?? 
          p.subcategory_id ?? 
          p.sub_category?.id ??
          p.cat_id;
        return prodCatId == selectedSubId;
      }) 
    : products;

  const toggleFavorite = (id, e) => {
    e.stopPropagation();
    setFavorites(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -280, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 280, behavior: 'smooth' });
    }
  };

  const handleAddToCart = async (product, qty = 1, e = null) => {
    if (e) e.stopPropagation();
    
    const token = localStorage.getItem('token') || localStorage.getItem('access_token') || localStorage.getItem('jwt_token');
    const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
    const userRole = localStorage.getItem('user_role');
    const isSeller = userRole === 'seller' || storedUser?.role === 'seller';

    if (!token || !storedUser || isSeller) {
      showAlert('You must have a buyer account to add items to cart.', 'warning', () => { window.location.href = '/register'; });
      return;
    }

    const existingCart = JSON.parse(localStorage.getItem('cart_items')) || [];
    const existingIndex = existingCart.findIndex(item => item.id === product.id);
    
    let updatedCart;
    if (existingIndex > -1) {
      updatedCart = [...existingCart];
      updatedCart[existingIndex].quantity += qty;
    } else {
      updatedCart = [...existingCart, { ...product, quantity: qty }];
    }
    localStorage.setItem('cart_items', JSON.stringify(updatedCart));

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/cart/add`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          product_id: product.id,
          variant_id: product.variant_id || null,
          quantity: qty,
        }),
      });
    } catch (error) {
      console.error('Error syncing cart with backend:', error);
    }

    showAlert(`Successfully added "${product.product_name}" to cart! 🛒`, 'success');
  };

  if (loading) return <div className="flex items-center justify-center min-h-[220px]"><div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div></div>;
  if (error) return <div className="max-w-md mx-auto my-6 p-3 bg-red-50 text-red-600 rounded-xl text-center text-xs">⚠️ Error: {error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 relative">
      <CustomAlert isOpen={alertState.isOpen} type={alertState.type} message={alertState.message} onClose={closeAlert} onConfirm={alertState.onConfirm} />
      <ViewPro product={selectedProduct} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAddToCart={handleAddToCart} showAlert={showAlert} />

      {/* Header Section */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span className="w-2.5 h-6 bg-blue-600 rounded-full inline-block"></span>
            ទំនិញទូទៅ
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 ml-4">ស្វែងរកទិញទំនិញថ្មីៗគុណភាពខ្ពស់</p>
        </div>  

        <div className="flex items-center gap-2">
          <span className="hidden xs:inline-block text-[11px] font-semibold bg-blue-50 text-blue-600 px-3 py-1 rounded-full border border-blue-100 shadow-2xs">
            {filteredProducts.length} Items
          </span>
          {!showAll && (
            <div className="flex items-center gap-1">
              <button onClick={scrollLeft} className="w-8 h-8 rounded-full bg-white border border-slate-200 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 flex items-center justify-center cursor-pointer shadow-xs transition-all"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={scrollRight} className="w-8 h-8 rounded-full bg-white border border-slate-200 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 flex items-center justify-center cursor-pointer shadow-xs transition-all"><ChevronRight className="w-4 h-4" /></button>
            </div>
          )}
          <button onClick={() => setShowAll(!showAll)} className="flex items-center gap-1 text-[11px] font-bold text-blue-600 bg-blue-50/80 border border-blue-200 hover:bg-blue-600 hover:text-white px-3.5 py-1.5 rounded-full cursor-pointer shadow-2xs transition-all">
            <span>{showAll ? 'Slider View' : 'View All'}</span>
            <ArrowRight className={`w-3 h-3 transition-transform duration-300 ${showAll ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>
      
      {filteredProducts.length === 0 ? (
        <div className="text-center py-10 text-xs text-slate-500 bg-slate-50/80 rounded-2xl border border-dashed border-slate-200">
          📦 No products found for this subcategory.
        </div>
      ) : showAll ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 items-start">
          {filteredProducts.map((product, index) => renderProductCard(product, false, index))}
        </div>
      ) : (
        <div className="relative w-full overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-12 bg-gradient-to-r from-white via-white/60 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-12 bg-gradient-to-l from-white via-white/60 to-transparent z-10 pointer-events-none" />

          <div ref={scrollContainerRef} className="flex gap-3.5 overflow-x-auto pb-4 pt-1 px-2 scroll-smooth [&::-webkit-scrollbar]:hidden">
            {filteredProducts.map((product, index) => renderProductCard(product, true, index))}
          </div>
        </div>
      )}
    </div>
  );

  function renderProductCard(product, isSliderItem = false, index = 0) {
    const isFav = favorites[product.id];
    const sellerName = product.seller?.seller_name || "គ្មានឈ្មោះ";
    const sellerPic = product.seller?.profile_pic || product.seller?.Image;
    const categoryName = product.category?.category_name || 'គ្មានប្រភេទ';
    const animationDelay = `${Math.min(index * 40, 600)}ms`;
    const isThisHovered = hoveredProductId === product.id;

    return (
      <div 
        key={product.id}
        style={{ animationDelay }}
        onMouseEnter={() => handleMouseEnterCard(product)}
        onMouseLeave={handleMouseLeaveCard}
        className={`flex transition-all duration-300 ease-out ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        } ${isSliderItem ? 'flex-shrink-0' : 'w-full'}`}
      >
        <Link 
          href={`/product/${product.id}`}
          className="group bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-blue-400/60 transition-all duration-300 flex flex-col overflow-hidden relative cursor-pointer transform hover:-translate-y-1.5 w-44 sm:w-56"
        >
          <div className="absolute top-2.5 left-2.5 z-10 bg-blue-600/90 backdrop-blur-md text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md shadow-xs">
            New
          </div>
          
          <button 
            onClick={(e) => toggleFavorite(product.id, e)} 
            className={`absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full flex items-center justify-center transition-transform active:scale-90 shadow-sm ${
              isFav ? 'bg-rose-500 text-white' : 'bg-white/90 backdrop-blur-md text-slate-700 hover:text-rose-500'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
          </button>

          <div className="w-full h-36 sm:h-42 bg-slate-100 relative overflow-hidden flex items-center justify-center">
            <img 
              src={product.image ? `${process.env.NEXT_PUBLIC_API_URL}/storage/${product.image}` : "https://images.unsplash.com/photo-1542291026-7eec264c27ff"} 
              alt={product.product_name} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out" 
            />
          </div>

          <div className="p-3 flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-1 text-[10px] font-semibold text-blue-600 bg-blue-50/80 px-2 py-0.5 rounded-md w-fit mb-1.5 border border-blue-100/50">
              <Tag className="w-2.5 h-2.5" />
              <span className="truncate max-w-[110px]">{categoryName}</span>
            </div>

            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100">
              <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                <img src={sellerPic ? `${process.env.NEXT_PUBLIC_API_URL}/storage/${sellerPic}` : ""} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col truncate">
                <span className="text-[8px] text-slate-400 uppercase font-medium leading-none">Store</span>
                <span className="text-[10px] font-bold text-slate-700 truncate">{sellerName}</span>
              </div>
            </div>

            <div className="mb-2">
              <h3 className="text-xs font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                {product.product_name}
              </h3>
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-xs sm:text-sm font-extrabold text-blue-600">
                  ${product.product_price}
                </span>
                {product.product_stock !== undefined && (
                  <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-md ${product.product_stock > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                    {product.product_stock > 0 ? `Stock: ${product.product_stock}` : 'Out'}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100/80">
              <span className="text-[11px] font-bold text-blue-600 hover:underline">
                View Details
              </span>
              <button 
                onClick={(e) => handleAddToCart(product, 1, e)} 
                className="w-8 h-8 rounded-xl flex items-center justify-center bg-blue-600 text-white shadow-md hover:bg-blue-700 transition-transform active:scale-95 cursor-pointer"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </Link>

        <div 
          className={`overflow-hidden transition-all duration-300 ease-out flex items-center ${
            isThisHovered ? 'w-56 opacity-100 ml-2.5' : 'w-0 opacity-0 ml-0'
          }`}
        >
          <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-blue-100 shadow-lg p-3.5 w-56 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600 mb-1.5 bg-blue-50 px-2 py-0.5 rounded w-fit">
                <Info className="w-3 h-3" /> Product Details
              </div>
              <h4 className="text-xs font-extrabold text-slate-900 line-clamp-2 mb-1">
                {product.product_name}
              </h4>
              <p className="text-[11px] text-slate-500 line-clamp-3 leading-relaxed mb-3">
                {product.description || "ព័ត៌មានលម្អិតនៃផលិតផលគុណភាពខ្ពស់ ធានាជូនពីហាងផ្ទាល់។"}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-extrabold text-blue-600">${product.product_price}</span>
              <button 
                onClick={(e) => handleAddToCart(product, 1, e)}
                className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded-lg shadow-xs transition-all cursor-pointer"
              >
                + Add
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}