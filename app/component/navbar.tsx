'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from './CartContext';
import { 
  ShoppingCart, 
  Menu, 
  X, 
  ChevronDown, 
  ChevronRight, 
  Sparkles,
  Home,
  Store,
  Flame,
  User,
  Layers,
  History
} from 'lucide-react';
import OrderNotifications from './OrderNotifications';

export default function SecondaryNav() {
  const pathname = usePathname();
  const { cart, totalItems, totalPrice, removeFromCart } = useCart();
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/category-list`)
      .then((res) => res.json())
      .then((data) => {
        const catList = data.list || data.category || data.data || [];
        if (catList.length > 0) {
          setCategories(catList);
          setActiveCategory(catList[0]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching categories:', err);
        setLoading(false);
      });
  }, []);

  const isActive = (path) => pathname === path;

  return (
    <>
      {/* ==================== DESKTOP NAVIGATION (UNCHANGED) ==================== */}
      <nav className="sticky top-0 w-full bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 text-white px-4 sm:px-8 py-3 hidden md:flex items-center justify-between shadow-lg z-50 backdrop-blur-md bg-opacity-95">
        
        {/* 📂 Left Side: Categories Mega Menu */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div 
              onClick={() => {
                setIsCategoryOpen(!isCategoryOpen);
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-3.5 py-2 rounded-xl cursor-pointer transition-all duration-200 select-none border border-white/10 shadow-sm"
            >
              <div className="w-2 h-2 rounded-full bg-blue-300 animate-pulse"></div>
              <span className="text-sm sm:text-base font-bold tracking-wide">Categories</span>
              <span className="text-xs font-light text-blue-200 hidden sm:inline">(Explore)</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isCategoryOpen ? 'rotate-180' : ''}`} />
            </div>

            {/* Mega Menu Dropdown */}
            {isCategoryOpen && (
              <>
                <div 
                  className="fixed inset-0 bg-black/50 backdrop-blur-xs z-[9998]" 
                  onClick={() => setIsCategoryOpen(false)}
                />

                <div className="fixed md:absolute left-3 right-3 md:left-0 top-16 md:top-full mt-2 md:w-[900px] bg-white text-gray-800 rounded-2xl shadow-2xl border border-gray-100 flex flex-col md:flex-row z-[9999] overflow-hidden max-h-[82vh] md:max-h-[500px] animate-in fade-in zoom-in-95 duration-200">
                  
                  {/* Left Sidebar */}
                  <div className="w-full md:w-72 bg-gray-50/80 border-r border-gray-100 p-2 overflow-y-auto space-y-1">
                    <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-gray-400">Main Categories</div>
                    {loading ? (
                      <div className="py-12 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                        <span>កំពុងទាញយក...</span>
                      </div>
                    ) : categories.length === 0 ? (
                      <div className="py-8 text-center text-xs text-gray-500">គ្មានទិន្នន័យ</div>
                    ) : (
                      categories.map((cat) => (
                        <div
                          key={cat.id}
                          onMouseEnter={() => window.innerWidth >= 768 && setActiveCategory(cat)}
                          onClick={() => setActiveCategory(cat)}
                          className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs md:text-sm cursor-pointer transition-all ${
                            activeCategory?.id === cat.id 
                              ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/20' 
                              : 'text-gray-700 hover:bg-gray-100/80'
                          }`}
                        >
                          <span className="truncate">{cat.category_name}</span>
                          <ChevronRight className={`w-4 h-4 hidden md:block ${activeCategory?.id === cat.id ? 'text-white' : 'text-gray-400'}`} />
                        </div>
                      ))
                    )}
                  </div>

                  {/* Right Content */}
                  <div className="flex-1 p-5 md:p-7 overflow-y-auto bg-white">
                    {activeCategory ? (
                      <div>
                        <div className="mb-4 pb-3 border-b border-gray-100 flex justify-between items-center">
                          <h3 className="text-base md:text-lg font-extrabold text-gray-900 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-blue-600" />
                            {activeCategory.category_name}
                          </h3>
                          <Link 
                            href={`/category/${activeCategory.id}`} 
                            className="text-xs text-blue-600 font-bold hover:underline bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                            onClick={() => setIsCategoryOpen(false)}
                          >
                            View All &rarr;
                          </Link>
                        </div>

                        {activeCategory.children && activeCategory.children.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {activeCategory.children.map((sub) => (
                              <div key={sub.id} className="space-y-2 bg-gray-50/50 p-3 rounded-xl border border-gray-100/80 hover:border-blue-100 transition-all">
                                <Link 
                                  href={`/category/${sub.id}`}
                                  className="block font-bold text-xs md:text-sm text-gray-900 hover:text-blue-600 transition-colors"
                                  onClick={() => setIsCategoryOpen(false)}
                                >
                                  {sub.category_name}
                                </Link>

                                {sub.children && sub.children.length > 0 && (
                                  <ul className="space-y-1.5 pl-2 border-l-2 border-blue-200">
                                    {sub.children.map((child) => (
                                      <li key={child.id}>
                                        <Link 
                                          href={`/categories/${child.id}`}
                                          className="text-xs text-gray-500 hover:text-blue-600 transition-all block truncate py-0.5"
                                          onClick={() => setIsCategoryOpen(false)}
                                        >
                                          • {child.category_name}
                                        </Link>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="py-16 text-center text-gray-400 text-sm bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            មិនមាន Sub-categories សម្រាប់ប្រភេទនេះទេ
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="py-16 text-center text-gray-400 text-sm">
                        សូមជ្រើសរើស Category នៅខាងឆ្វេង
                      </div>
                    )}
                  </div>

                </div>
              </>
            )}
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <div className="flex items-center space-x-1 lg:space-x-2 text-sm font-medium">
          <Link href="/" className="px-3 py-2 rounded-xl hover:bg-white/10 transition-colors">Home</Link>
          <Link href="/allProduct" className="px-3 py-2 rounded-xl hover:bg-white/10 transition-colors">All Product</Link>
          <Link href="/track-order" className="px-3 py-2 rounded-xl hover:bg-white/10 transition-colors">Track Order</Link>
          <Link href="/brand" className="px-3 py-2 rounded-xl hover:bg-white/10 transition-colors">All Brand</Link>
          <Link href="/brands" className="px-3 py-2 rounded-xl hover:bg-white/10 transition-colors">Brands</Link>
          <Link href="/sellers" className="px-3 py-2 rounded-xl hover:bg-white/10 transition-colors">Sellers</Link>
          <Link href="/history" className="px-3 py-2 rounded-xl hover:bg-white/10 transition-colors">History</Link>
          <Link href="/update" className="px-3 py-2 rounded-xl hover:bg-white/10 transition-colors">What's new?</Link>

          <Link href="/todays-deal" className="px-3 py-2 rounded-xl hover:bg-white/10 transition-colors text-amber-300 font-semibold flex items-center gap-1">
            🔥 Todays Deal
          </Link>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          <OrderNotifications />

          <div className="relative">
            <div 
              onClick={() => setIsCartOpen(!isCartOpen)}
              className="flex items-center space-x-2 bg-white/15 hover:bg-white/25 px-4 py-2 rounded-xl transition-all duration-200 cursor-pointer select-none border border-white/15 shadow-sm"
            >
              <ShoppingCart className="w-5 h-5 text-blue-200" />
              <div className="text-xs sm:text-sm flex items-center gap-1.5">
                <span className="font-extrabold">${totalPrice.toFixed(2)}</span>
                <span className="bg-blue-800 text-blue-100 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {totalItems}
                </span>
              </div>
            </div>

            {isCartOpen && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white text-gray-800 rounded-2xl shadow-2xl border border-gray-100 p-4 z-[9999] animate-in fade-in zoom-in-95 duration-150">
                <div className="flex justify-between items-center mb-3 border-b border-gray-100 pb-2.5">
                  <span className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
                    <ShoppingCart className="w-4 h-4 text-blue-600" /> Shopping Cart
                  </span>
                  <span className="text-xs bg-blue-50 text-blue-600 font-semibold px-2 py-0.5 rounded-full">{totalItems} items</span>
                </div>

                {cart.length === 0 ? (
                  <p className="text-center text-gray-400 py-8 text-xs sm:text-sm">កន្ត្រកទំនិញរបស់អ្នកទទេរ</p>
                ) : (
                  <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1">
                    {cart.map((item, index) => (
                      <div key={index} className="flex items-center justify-between border-b border-gray-50 pb-2.5 hover:bg-gray-50/80 p-1.5 rounded-xl transition-colors">
                        <div className="flex-1 pr-2">
                          <p className="text-xs sm:text-sm font-semibold text-gray-800 truncate">{item.name}</p>
                          <p className="text-xs text-gray-500">{item.quantity} x <span className="text-blue-600 font-medium">${item.price}</span></p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            removeFromCart(item.id, item.variant);
                          }}
                          className="text-rose-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-all text-xs font-semibold cursor-pointer"
                          title="លុប"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-gray-400 block">សរុបរួម</span>
                    <span className="font-extrabold text-blue-600 text-base">${totalPrice.toFixed(2)}</span>
                  </div>
                  <Link 
                    href="/cart" 
                    onClick={() => setIsCartOpen(false)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all"
                  >
                    មើលកន្ត្រកពេញលេញ
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ==================== MOBILE MENU OVERLAY ==================== */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-blue-950/60 backdrop-blur-sm z-[9998] md:hidden flex flex-col justify-end p-4">
          <div className="bg-white text-gray-800 rounded-3xl p-5 shadow-2xl border border-blue-100 max-h-[75vh] overflow-y-auto space-y-3 animate-in slide-in-from-bottom duration-200 mb-16">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <span className="font-extrabold text-blue-700 text-base flex items-center gap-2">
                <Menu className="w-5 h-5 text-blue-600" /> Navigation Menu
              </span>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs font-bold pt-1">
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="p-3 rounded-2xl bg-gray-50 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">Home</Link>
              <Link href="/allProduct" onClick={() => setIsMobileMenuOpen(false)} className="p-3 rounded-2xl bg-gray-50 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">All Product</Link>
              <Link href="/track-order" onClick={() => setIsMobileMenuOpen(false)} className="p-3 rounded-2xl bg-gray-50 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">Track Order</Link>
              <Link href="/brand" onClick={() => setIsMobileMenuOpen(false)} className="p-3 rounded-2xl bg-gray-50 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">All Brand</Link>
              <Link href="/brands" onClick={() => setIsMobileMenuOpen(false)} className="p-3 rounded-2xl bg-gray-50 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">Brands</Link>
              <Link href="/sellers" onClick={() => setIsMobileMenuOpen(false)} className="p-3 rounded-2xl bg-gray-50 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">Sellers</Link>
              <Link href="/history" onClick={() => setIsMobileMenuOpen(false)} className="p-3 rounded-2xl bg-gray-50 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">History</Link>
              <Link href="/update" onClick={() => setIsMobileMenuOpen(false)} className="p-3 rounded-2xl bg-gray-50 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">What's new?</Link>
              <Link href="/todays-deal" onClick={() => setIsMobileMenuOpen(false)} className="col-span-2 p-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-center shadow-sm">🔥 Todays Deal</Link>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MOBILE FLOATING PILL BAR (BLUE & WHITE STYLE) ==================== */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] md:hidden w-[92%] max-w-[420px]">
        {/* Main Blue Floating Pill Bar Container */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 text-white shadow-2xl shadow-blue-900/30 rounded-full px-2 py-1.5 flex items-center justify-between border border-white/20 backdrop-blur-lg">
          
          {/* 1. Home Link */}
          <Link 
            href="/"
            className={`flex items-center justify-center py-2 px-3.5 rounded-full transition-all duration-300 ${
              isActive('/') 
                ? 'bg-white/25 text-white scale-105 shadow-sm border border-white/20' 
                : 'text-blue-100 hover:text-white'
            }`}
          >
            <Home className="w-5 h-5 stroke-[2.2]" />
          </Link>

          {/* 2. All Products */}
          <Link 
            href="/allProduct"
            className={`flex items-center justify-center py-2 px-3.5 rounded-full transition-all duration-300 ${
              isActive('/allProduct') 
                ? 'bg-white/25 text-white scale-105 shadow-sm border border-white/20' 
                : 'text-blue-100 hover:text-white'
            }`}
          >
            <Store className="w-5 h-5 stroke-[2.2]" />
          </Link>

          {/* 3. Todays Deal */}
          <Link 
            href="/todays-deal"
            className={`flex items-center justify-center py-2 px-3.5 rounded-full transition-all duration-300 ${
              isActive('/todays-deal') 
                ? 'bg-amber-400 text-blue-950 font-bold scale-105 shadow-sm' 
                : 'text-amber-300 hover:text-amber-200'
            }`}
          >
            <Flame className="w-5 h-5 stroke-[2.2]" />
          </Link>

          {/* 4. Cart Link */}
          <Link 
            href="/cart"
            className={`relative flex items-center justify-center py-2 px-3.5 rounded-full transition-all duration-300 ${
              isActive('/cart') 
                ? 'bg-white/25 text-white scale-105 shadow-sm border border-white/20' 
                : 'text-blue-100 hover:text-white'
            }`}
          >
            <ShoppingCart className="w-5 h-5 stroke-[2.2]" />
            {totalItems > 0 && (
              <span className="absolute top-1 right-1 bg-amber-400 text-blue-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {totalItems}
              </span>
            )}
          </Link>

          {/* 5. Mobile Drawer / Category Toggle */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`flex items-center justify-center py-2 px-3.5 rounded-full transition-all duration-300 ${
              isMobileMenuOpen 
                ? 'bg-white/25 text-white scale-105 shadow-sm border border-white/20' 
                : 'text-blue-100 hover:text-white'
            }`}
          >
            <Layers className="w-5 h-5 stroke-[2.2]" />
          </button>

          {/* 6. Profile / History */}
          <Link 
            href="/history"
            className="flex items-center justify-center p-0.5 rounded-full transition-all"
          >
            <div className="w-7 h-7 rounded-full overflow-hidden bg-white text-blue-700 flex items-center justify-center font-bold shadow-sm border-2 border-white">
              <User className="w-4 h-4 text-blue-700" />
            </div>
          </Link>

        </div>
      </div>
    </>
  );
}