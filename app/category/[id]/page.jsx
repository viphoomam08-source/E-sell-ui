'use client';
import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Heart, ChevronLeft, ChevronRight, ArrowRight, Tag } from 'lucide-react';
import CustomAlert from '../../component/CustomAlert';
import ViewPro from '../../Pages/ViewPro';
import Link from 'next/link';

export default function ProductCard({ selectedSubId }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [favorites, setFavorites] = useState({});

  const [showAll, setShowAll] = useState(false);
  const scrollContainerRef = useRef(null);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/product_no_discount`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch products');
        return data;
      })
      .then((data) => {
        const productArray = data.product || data.data || data.products || data;
        setProducts(Array.isArray(productArray) ? productArray : []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

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
      scrollContainerRef.current.scrollBy({ left: -240, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 240, behavior: 'smooth' });
    }
  };

  const handleAddToCart = (product, qty = 1, e) => {
    if (e) e.stopPropagation();
    const token = localStorage.getItem('jwt_token') || localStorage.getItem('token');
    const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
    const userRole = localStorage.getItem('user_role');
    const isSeller = userRole === 'seller' || storedUser?.role === 'seller';

    if (!token || !storedUser || isSeller) {
      showAlert('You must have a buyer account to add items to cart.', 'warning', () => { window.location.href = '/register'; });
      return;
    }

    const existingCart = JSON.parse(localStorage.getItem('cart_items')) || [];
    const updatedCart = [...existingCart, { ...product, quantity: qty }];
    localStorage.setItem('cart_items', JSON.stringify(updatedCart));
    showAlert(`Successfully added "${product.product_name}" to cart! 🛒`, 'success');
  };

  if (loading) return <div className="flex items-center justify-center min-h-[200px]"><div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div></div>;
  if (error) return <div className="max-w-md mx-auto my-6 p-3 bg-red-50 text-red-600 rounded-xl text-center text-xs">⚠️ Error: {error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 relative font-['Kantumruy_Pro']">
      <CustomAlert isOpen={alertState.isOpen} type={alertState.type} message={alertState.message} onClose={closeAlert} onConfirm={alertState.onConfirm} />
      <ViewPro product={selectedProduct} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAddToCart={handleAddToCart} showAlert={showAlert} />

      {/* Header Section */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg sm:text-2xl font-bold text-blue-600 tracking-tight">ទំនិញទូទៅ</h2>
          <p className="text-xs text-blue-600 mt-0.5">ស្វែងរកទិញថ្មី</p>
        </div>  

        <div className="flex items-center gap-2">
          <span className="hidden xs:inline-block text-[11px] font-semibold bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full border border-blue-100">
            {filteredProducts.length} Items
          </span>
          {!showAll && (
            <div className="flex items-center gap-1">
              <button onClick={scrollLeft} className="w-7 h-7 rounded-full bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center cursor-pointer shadow-xs"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={scrollRight} className="w-7 h-7 rounded-full bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center cursor-pointer shadow-xs"><ChevronRight className="w-4 h-4" /></button>
            </div>
          )}
          <button onClick={() => setShowAll(!showAll)} className="flex items-center gap-1 text-[11px] font-bold text-blue-600 bg-white border border-slate-200 hover:bg-blue-50 px-3 py-1.5 rounded-full cursor-pointer shadow-xs">
            <span>{showAll ? 'Slider' : 'All'}</span>
            <ArrowRight className={`w-3 h-3 transition-transform duration-300 ${showAll ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>
      
      {filteredProducts.length === 0 ? (
        <div className="text-center py-8 text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          📦 No products found for this subcategory.
        </div>
      ) : showAll ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 items-start">
          {filteredProducts.map((product) => renderProductCard(product))}
        </div>
      ) : (
        <div ref={scrollContainerRef} className="flex gap-3 overflow-x-auto pb-3 pt-1 px-0.5 scroll-smooth [&::-webkit-scrollbar]:hidden">
          {filteredProducts.map((product) => renderProductCard(product, true))}
        </div>
      )}
    </div>
  );

  function renderProductCard(product, isSliderItem = false) {
    const isFav = favorites[product.id];
    const sellerName = product.seller?.seller_name || "គ្មានឈ្មោះ";
    const sellerPic = product.seller?.profile_pic || product.seller?.Image;
    const categoryName = product.category?.category_name || 'គ្មានប្រភេទ';

    return (
      <Link 
        key={product.id} 
        href={`/product/${product.id}`}
        className={`group bg-white rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden relative cursor-pointer ${isSliderItem ? 'flex-shrink-0 w-42 sm:w-52' : 'w-full'}`}
      >
        {/* New Badge */}
        <div className="absolute top-2 left-2 z-10 bg-blue-600/90 text-white text-[9px] font-bold uppercase px-1.5 py-0.5 rounded">New</div>
        
        {/* Favorite Button */}
        <button onClick={(e) => toggleFavorite(product.id, e)} className={`absolute top-2 right-2 z-10 w-6 h-6 rounded-full flex items-center justify-center transition-all ${isFav ? 'bg-rose-500 text-white' : 'bg-white/90 text-slate-700 hover:text-rose-500 shadow-xs'}`}>
          <Heart className={`w-3 h-3 ${isFav ? 'fill-current' : ''}`} />
        </button>

        {/* Product Image */}
        <div className="w-full h-32 sm:h-36 bg-slate-100 relative overflow-hidden flex items-center justify-center">
          <img src={product.image ? `${process.env.NEXT_PUBLIC_API_URL}/storage/${product.image}` : "https://images.unsplash.com/photo-1542291026-7eec264c27ff"} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>

        {/* Product Details Section */}
        <div className="p-2.5 flex flex-col" onClick={(e) => e.stopPropagation()}>
          {/* Category Tag */}
          <div className="flex items-center gap-1 text-[10px] font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded w-fit mb-1">
            <Tag className="w-2.5 h-2.5" />
            <span className="truncate max-w-[100px]">{categoryName}</span>
          </div>

          {/* Store Info */}
          <div className="flex items-center gap-1.5 mb-1.5 pb-1.5 border-b border-slate-100">
            <div className="w-5 h-5 rounded-full overflow-hidden bg-slate-100 shrink-0">
              <img src={sellerPic ? `${process.env.NEXT_PUBLIC_API_URL}/storage/${sellerPic}` : ""} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col truncate">
              <span className="text-[8px] text-slate-400 leading-none">Store</span>
              <span className="text-[10px] font-bold text-slate-800 truncate">{sellerName}</span>
            </div>
          </div>

          {/* Title & Price */}
          <div className="mb-1.5">
            <h3 className="text-xs font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600">{product.product_name}</h3>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs sm:text-sm font-extrabold text-blue-600">${product.product_price}</span>
              {product.product_stock !== undefined && (
                <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${product.product_stock > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                  {product.product_stock > 0 ? `Stock: ${product.product_stock}` : 'Out'}
                </span>
              )}
            </div>
          </div>

          {/* Action Links */}
          <div className="flex items-center justify-between pt-1.5 border-t border-slate-100">
            <span className="text-[11px] font-semibold text-blue-600 hover:underline">
              View Details
            </span>
            <button onClick={(e) => handleAddToCart(product, 1, e)} className="w-7 h-7 rounded-lg flex items-center justify-center bg-blue-600 text-white shadow-xs hover:scale-105 cursor-pointer">
              <ShoppingCart className="w-3 h-3" />
            </button>
          </div>
        </div>
      </Link>
    );
  }
}