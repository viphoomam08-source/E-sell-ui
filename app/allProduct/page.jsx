'use client';
import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Heart, Tag, Filter, X } from 'lucide-react';
import CustomAlert from '../component/CustomAlert';
import ViewPro from '../Pages/ViewPro'; 
import Link from 'next/link';

export default function Page({ selectedSubId }) {
  // ==================== 1. STATES ====================
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  
  // Filter & Sort States
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState('All');
  const [sortBy, setSortBy] = useState('Default');

  // Mobile Filter Drawer Toggle State
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Pagination & Loading States
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  
  // Interactive States
  const [favorites, setFavorites] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const loaderRef = useRef(null);

  // Alert Modal State
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

  // ==================== 2. API CALLS ====================
  useEffect(() => {
    // បើមាន selectedSubId អាចប្តូរ Endpoint ទៅតាម API របស់អ្នក (ឧទាហរណ៍: /api/products-by-sub/${selectedSubId})
    const productApiUrl = selectedSubId 
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/products-by-sub/${selectedSubId}?page=1`
      : `${process.env.NEXT_PUBLIC_API_URL}/api/product-all?page=1`;

    Promise.all([
      fetch(productApiUrl, { headers: { 'Accept': 'application/json' } }).then(res => res.json()),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/category-list`, { headers: { 'Accept': 'application/json' } }).then(res => res.json())
    ])
      .then(([prodData, catData]) => {
        const productArray = prodData.product || prodData.data || prodData.products || prodData;
        const validProducts = Array.isArray(productArray) ? productArray : [];
        setProducts(validProducts);

        const extractedBrands = [...new Set(validProducts.map(p => p.brand?.brand_name || p.brand_name || p.brand).filter(Boolean))];
        setBrands(extractedBrands);

        if (prodData.current_page && prodData.last_page) {
          if (prodData.current_page >= prodData.last_page) setHasMore(false);
        }

        const categoryArray = catData.category || catData.data || catData.categories || catData;
        setCategories(Array.isArray(categoryArray) ? categoryArray : []);

        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [selectedSubId]);

  const loadMoreProducts = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/product-all?page=${nextPage}`, {
        headers: { 'Accept': 'application/json' },
      });
      const prodData = await res.json();
      const newProducts = prodData.product || prodData.data || prodData.products || prodData;

      if (Array.isArray(newProducts) && newProducts.length > 0) {
        setProducts(prev => {
          const updated = [...prev, ...newProducts];
          const extractedBrands = [...new Set(updated.map(p => p.brand?.brand_name || p.brand_name || p.brand).filter(Boolean))];
          setBrands(extractedBrands);
          return updated;
        });
        setPage(nextPage);
        
        if (prodData.last_page && nextPage >= prodData.last_page) setHasMore(false);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error loading more products:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        loadMoreProducts();
      }
    }, { threshold: 1.0 });

    const currentLoader = loaderRef.current;
    if (currentLoader) observer.observe(currentLoader);
    return () => { if (currentLoader) observer.unobserve(currentLoader); };
  }, [hasMore, loading, page, loadingMore]);

  // ==================== 3. FILTER & SORT LOGIC ====================
  const toggleBrand = (brandName) => {
    setSelectedBrands(prev => 
      prev.includes(brandName) ? prev.filter(b => b !== brandName) : [...prev, brandName]
    );
  };

  const filteredProducts = products.filter(p => {
    const catName = p.category?.category_name || p.category_name || p.category || '';
    const matchesCategory = selectedCategory === 'All' || catName.toLowerCase() === selectedCategory.toLowerCase();

    const brandName = p.brand?.brand_name || p.brand_name || p.brand || '';
    const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(brandName);

    const price = Number(p.product_price) || 0;
    let matchesPrice = true;
    if (selectedPriceRange === '0-50') matchesPrice = price <= 50;
    else if (selectedPriceRange === '50-100') matchesPrice = price > 50 && price <= 100;
    else if (selectedPriceRange === '100-500') matchesPrice = price > 100 && price <= 500;
    else if (selectedPriceRange === '500+') matchesPrice = price > 500;

    return matchesCategory && matchesBrand && matchesPrice;
  }).sort((a, b) => {
    const priceA = Number(a.product_price) || 0;
    const priceB = Number(b.product_price) || 0;
    if (sortBy === 'Price: Low to High') return priceA - priceB;
    if (sortBy === 'Price: High to Low') return priceB - priceA;
    return 0;
  });

  // ==================== 4. ACTIONS ====================
  const toggleFavorite = (id, e) => {
    e.stopPropagation();
    setFavorites(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddToCart = (product, qty = 1, e) => {
    if (e) e.stopPropagation();
    const token = localStorage.getItem('jwt_token') || localStorage.getItem('token');
    const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
    const isSeller = localStorage.getItem('user_role') === 'seller' || storedUser?.role === 'seller';

    if (!token || !storedUser || isSeller) {
      showAlert('You must have a buyer account to add items to cart.', 'warning', () => { window.location.href = '/register'; });
      return;
    }

    const existingCart = JSON.parse(localStorage.getItem('cart_items')) || [];
    const updatedCart = [...existingCart, { ...product, quantity: qty }];
    localStorage.setItem('cart_items', JSON.stringify(updatedCart));
    showAlert(`Successfully added "${product.product_name}" to cart! 🛒`, 'success');
  };

  if (loading) return <div className="flex items-center justify-center min-h-[300px]"><div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent"></div></div>;
  if (error) return <div className="max-w-md mx-auto my-10 p-4 bg-red-50 text-red-600 rounded-2xl text-center text-sm">⚠️ Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <CustomAlert isOpen={alertState.isOpen} type={alertState.type} message={alertState.message} onClose={closeAlert} onConfirm={alertState.onConfirm} />
      <ViewPro product={selectedProduct} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAddToCart={handleAddToCart} showAlert={showAlert} />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center mb-4 sm:mb-6 gap-3">
          <div className="flex items-center justify-between">
            <p className="text-gray-600 text-xs sm:text-sm font-medium">{filteredProducts.length} Results found</p>
            
            <button 
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>
          </div>

          <div className="flex items-center justify-between sm:justify-end space-x-2">
            <span className="text-xs sm:text-sm text-gray-500">Sort By</span>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="Default">Default</option>
              <option value="Price: Low to High">Price: Low to High</option>
              <option value="Price: High to Low">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* DESKTOP SIDEBAR */}
          <div className="hidden lg:block lg:col-span-1 space-y-4 sticky top-20">
            <FilterSidebar 
              categories={categories}
              brands={brands}
              products={products}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedBrands={selectedBrands}
              toggleBrand={toggleBrand}
              selectedPriceRange={selectedPriceRange}
              setSelectedPriceRange={setSelectedPriceRange}
            />
          </div>

          {/* MOBILE DRAWER */}
          {isMobileFilterOpen && (
            <div className="fixed inset-0 z-50 flex lg:hidden bg-black/50 backdrop-blur-xs">
              <div className="w-4/5 max-w-xs bg-white h-full overflow-y-auto p-4 flex flex-col justify-between shadow-xl">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                    <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                      <Filter className="w-4 h-4 text-blue-600" />
                      Filters
                    </h3>
                    <button onClick={() => setIsMobileFilterOpen(false)} className="p-1 rounded-full text-gray-500 hover:bg-gray-100">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <FilterSidebar 
                      categories={categories}
                      brands={brands}
                      products={products}
                      selectedCategory={selectedCategory}
                      setSelectedCategory={setSelectedCategory}
                      selectedBrands={selectedBrands}
                      toggleBrand={toggleBrand}
                      selectedPriceRange={selectedPriceRange}
                      setSelectedPriceRange={setSelectedPriceRange}
                    />
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-100 mt-4">
                  <button 
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="w-full bg-blue-600 text-white py-2 rounded-xl text-xs font-bold shadow-sm"
                  >
                    Apply Filters ({filteredProducts.length} Results)
                  </button>
                </div>
              </div>
              <div className="flex-1" onClick={() => setIsMobileFilterOpen(false)}></div>
            </div>
          )}

          {/* RIGHT CONTENT: PRODUCT LIST */}
          <div className="lg:col-span-3">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16 text-xs sm:text-sm text-gray-500 bg-white rounded-2xl border border-dashed border-gray-300">
                📦 No products found matching your filters.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard 
                      key={product.id}
                      product={product}
                      isFav={favorites[product.id]}
                      toggleFavorite={toggleFavorite}
                      handleAddToCart={handleAddToCart}
                    />
                  ))}
                </div>

                <div ref={loaderRef} className="py-8 text-center">
                  {loadingMore && (
                    <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-blue-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                      <span>កំពុងទាញទិន្នន័យបន្ថែម...</span>
                    </div>
                  )}
                  {!hasMore && <p className="text-[11px] text-gray-400">គ្មានទំនិញសម្រាប់បង្ហាញបន្ថែមទៀតទេ</p>}
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

// ==================== SUB-COMPONENTS ====================

function FilterSidebar({ 
  categories, brands, products, 
  selectedCategory, setSelectedCategory, 
  selectedBrands, toggleBrand, 
  selectedPriceRange, setSelectedPriceRange 
}) {
  return (
    <>
      <div className="bg-white p-3.5 sm:p-4 rounded-xl shadow-xs border border-gray-100">
        <h3 className="font-semibold text-gray-800 text-xs sm:text-sm mb-3">Categories</h3>
        <ul className="space-y-2 text-xs sm:text-sm text-gray-600 max-h-60 overflow-y-auto pr-1">
          <li className="flex items-center justify-between">
            <label className={`flex items-center space-x-2 cursor-pointer w-full ${selectedCategory === 'All' ? 'text-blue-600 font-medium' : ''}`}>
              <input type="checkbox" checked={selectedCategory === 'All'} onChange={() => setSelectedCategory('All')} className="rounded text-blue-600" />
              <span>All Categories ({products.length})</span>
            </label>
          </li>
          {categories.map((cat, index) => {
            const catName = cat.category_name || cat.name || cat;
            const count = products.filter(p => (p.category?.category_name || p.category_name || p.category || '').toLowerCase() === String(catName).toLowerCase()).length;
            const isChecked = selectedCategory === catName;
            return (
              <li key={cat.id || index}>
                <label className={`flex items-center space-x-2 cursor-pointer w-full ${isChecked ? 'text-blue-600 font-medium' : ''}`}>
                  <input type="checkbox" checked={isChecked} onChange={() => setSelectedCategory(isChecked ? 'All' : catName)} className="rounded text-blue-600" />
                  <span className="truncate">{catName} ({count})</span>
                </label>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="bg-white p-3.5 sm:p-4 rounded-xl shadow-xs border border-gray-100">
        <h3 className="font-semibold text-gray-800 text-xs sm:text-sm mb-3">Brands</h3>
        {brands.length === 0 ? <p className="text-[11px] text-gray-400">No brands available</p> : (
          <ul className="space-y-2 text-xs sm:text-sm text-gray-600 max-h-40 overflow-y-auto pr-1">
            {brands.map((brand, index) => {
              const isChecked = selectedBrands.includes(brand);
              return (
                <li key={index}>
                  <label className={`flex items-center space-x-2 cursor-pointer w-full ${isChecked ? 'text-blue-600 font-medium' : ''}`}>
                    <input type="checkbox" checked={isChecked} onChange={() => toggleBrand(brand)} className="rounded text-blue-600" />
                    <span className="truncate">{brand}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="bg-white p-3.5 sm:p-4 rounded-xl shadow-xs border border-gray-100">
        <h3 className="font-semibold text-gray-800 text-xs sm:text-sm mb-3">Price Ranges</h3>
        <ul className="space-y-2 text-xs sm:text-sm text-gray-600">
          {[
            { label: 'All Prices', value: 'All' },
            { label: '$0 - $50', value: '0-50' },
            { label: '$50 - $100', value: '50-100' },
            { label: '$100 - $500', value: '100-500' },
            { label: '$500+', value: '500+' }
          ].map((range) => (
            <li key={range.value}>
              <label className={`flex items-center space-x-2 cursor-pointer w-full ${selectedPriceRange === range.value ? 'text-blue-600 font-medium' : ''}`}>
                <input type="radio" name="priceRange" checked={selectedPriceRange === range.value} onChange={() => setSelectedPriceRange(range.value)} className="text-blue-600" />
                <span>{range.label}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

function ProductCard({ product, isFav, toggleFavorite, handleAddToCart }) {
  const sellerName = product.seller?.seller_name || product.seller?.name || "Store";
  const sellerPic = product.seller?.profile_pic || product.seller?.Image;
  const categoryName = product.category?.category_name || product.category_name || product.category || 'General';
  const isOut = product.stock <= 0 || product.status === 'out';

  return (
    <div className="group bg-white p-2.5 sm:p-4 rounded-xl sm:rounded-2xl shadow-xs border border-gray-100 hover:shadow-md transition-all duration-300 flex flex-col justify-between relative">
      <div>
        <div className="w-full h-32 sm:h-48 bg-gray-100 rounded-lg sm:rounded-xl relative overflow-hidden flex items-center justify-center mb-2.5 sm:mb-3">
          <img 
            src={product.image ? `${process.env.NEXT_PUBLIC_API_URL}/storage/${product.image}` : "https://images.unsplash.com/photo-1542291026-7eec264c27ff"} 
            alt={product.product_name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
          <button 
            onClick={(e) => toggleFavorite(product.id, e)} 
            className={`absolute top-2 right-2 sm:top-3 sm:right-3 w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all shadow-xs ${isFav ? 'bg-rose-500 text-white' : 'text-gray-600 hover:text-rose-500 bg-white/80 backdrop-blur-md'}`}
          >
            <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isFav ? 'fill-current' : ''}`} />
          </button>
        </div>

        <div className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-[10px] sm:text-xs font-medium mb-2">
          <Tag className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          <span className="capitalize truncate max-w-[100px] sm:max-w-none">{categoryName}</span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full overflow-hidden bg-gray-900 flex-shrink-0">
            <img src={sellerPic ? `${process.env.NEXT_PUBLIC_API_URL}/storage/${sellerPic}` : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde"} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="truncate">
            <span className="text-[8px] sm:text-[10px] text-gray-400 block leading-tight">Store</span>
            <span className="text-[10px] sm:text-xs text-gray-900 font-semibold truncate block">{sellerName}</span>
          </div>
        </div>

        <h4 className="text-xs sm:text-sm text-gray-900 font-bold line-clamp-1 mb-2 sm:mb-3">{product.product_name}</h4>
      </div>

      <div className="flex items-center justify-between mb-2 sm:mb-4">
        <span className="text-blue-600 font-extrabold text-sm sm:text-xl">${Number(product.product_price).toFixed(2)}</span>
        {isOut && <span className="text-[10px] sm:text-xs bg-rose-50 text-rose-500 font-medium px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full">Out</span>}
      </div>

      <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-gray-100">
        <Link href={`/product/${product.id}`} className="text-blue-600 font-semibold text-xs sm:text-sm hover:underline">View Details</Link>
        <button 
          onClick={(e) => handleAddToCart(product, 1, e)} 
          className="w-7 h-7 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs sm:shadow-md cursor-pointer"
          title="Add to Cart"
        >
          <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>
    </div>
  );
}