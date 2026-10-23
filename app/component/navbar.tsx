'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Layers
} from 'lucide-react';
import OrderNotifications from './OrderNotifications';
import NewsNotifier from './NewsNotifier';

export default function SecondaryNav() {
  const pathname = usePathname();
  const { cart, totalItems, totalPrice, removeFromCart } = useCart();
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDockExpanded, setIsDockExpanded] = useState(false);
  const [dockPosition, setDockPosition] = useState(null);
  const [viewportWidth, setViewportWidth] = useState(0);
  const dockDrag = useRef(null);
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);
  const [whatsNewCount, setWhatsNewCount] = useState(0);

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

  useEffect(() => {
    const updateDockBounds = () => {
      setViewportWidth(window.innerWidth);
      setDockPosition((position) => {
        const maxX = Math.max(12, window.innerWidth - 68);
        const maxY = Math.max(12, window.innerHeight - 80);

        return position
          ? {
              x: Math.min(Math.max(position.x, 12), maxX),
              y: Math.min(Math.max(position.y, 12), maxY)
            }
          : {
              x: 12,
              y: Math.max(12, window.innerHeight - 72)
            };
      });
    };

    updateDockBounds();
    window.addEventListener('resize', updateDockBounds);
    return () => window.removeEventListener('resize', updateDockBounds);
  }, []);

  const handleDockPointerDown = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const position = dockPosition || { x: bounds.left, y: bounds.top };

    dockDrag.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: position.x,
      originY: position.y,
      moved: false
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleDockPointerMove = (event) => {
    const drag = dockDrag.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - drag.startX;
    const deltaY = event.clientY - drag.startY;
    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) drag.moved = true;
    if (!drag.moved) return;

    setDockPosition({
      x: Math.min(Math.max(drag.originX + deltaX, 12), window.innerWidth - 68),
      y: Math.min(Math.max(drag.originY + deltaY, 12), window.innerHeight - 80)
    });
  };

  const handleDockPointerUp = (event) => {
    const drag = dockDrag.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    dockDrag.current = null;
    if (drag.moved) return;
    if (isDockExpanded) {
      setIsDockExpanded(false);
      return;
    }

    const expandedWidth = Math.min(320, window.innerWidth - 80);
    const x = dockPosition?.x ?? 12;
    const y = dockPosition?.y ?? Math.max(12, window.innerHeight - 72);
    const left = x > window.innerWidth / 2 ? x + 56 - expandedWidth : x;
    const right = left + expandedWidth;
    const chatLeft = window.innerWidth - 72;
    const chatTop = window.innerHeight - 72;
    const overlapsChat = right > chatLeft && left < window.innerWidth - 24
      && y + 56 > chatTop && y < window.innerHeight - 24;

    if (overlapsChat) {
      setDockPosition((position) => position
        ? { ...position, y: Math.max(12, chatTop - 80) }
        : position);
    }
    setIsDockExpanded(true);
  };

  const handleDockKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsDockExpanded((expanded) => !expanded);
    }
  };

  const isActive = (path) => pathname === path;
  const dockOnRight = Boolean(dockPosition && dockPosition.x > viewportWidth / 2);
  const dockStyle = dockPosition
    ? {
        left: dockOnRight ? 'auto' : `${dockPosition.x}px`,
        right: dockOnRight ? `${Math.max(12, viewportWidth - dockPosition.x - 56)}px` : 'auto',
        top: `${dockPosition.y}px`,
        bottom: 'auto'
      }
    : undefined;

  return (
    <>
      <NewsNotifier onCountUpdate={setWhatsNewCount} />

      {/* ==================== DESKTOP NAVIGATION (MODERN TYPOGRAPHY & SMOOTH HOVER) ==================== */}
      <nav className="sticky top-0 w-full bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 text-white px-4 sm:px-8 py-3 hidden md:flex items-center justify-between shadow-xl z-50 backdrop-blur-md bg-opacity-95 font-['Kantumruy_Pro',sans-serif] tracking-wide">
        
        {/* 📂 Left Side: Categories Mega Menu */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div 
              onClick={() => {
                setIsCategoryOpen(!isCategoryOpen);
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center space-x-2.5 bg-white/10 hover:bg-white/20 active:scale-95 px-4 py-2 rounded-xl cursor-pointer transition-all duration-300 select-none border border-white/15 shadow-sm group"
            >
              <div className="w-2 h-2 rounded-full bg-cyan-300 animate-ping"></div>
              <span className="text-sm font-semibold tracking-wider group-hover:text-cyan-100 transition-colors">Categories</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isCategoryOpen ? 'rotate-180' : ''}`} />
            </div>

            {/* Mega Menu Dropdown */}
            {isCategoryOpen && (
              <>
                <div 
                  className="fixed inset-0 bg-black/50 backdrop-blur-xs z-[9998] transition-opacity animate-in fade-in duration-200" 
                  onClick={() => setIsCategoryOpen(false)}
                />

                <div className="absolute left-0 top-full mt-3 w-[920px] bg-white text-gray-800 rounded-2xl shadow-2xl border border-gray-100/80 flex z-[9999] overflow-hidden max-h-[520px] animate-in fade-in zoom-in-95 duration-200">
                  
                  {/* Left Sidebar */}
                  <div className="w-72 bg-gradient-to-b from-gray-50 to-slate-50 border-r border-gray-100 p-2.5 overflow-y-auto space-y-1">
                    <div className="px-3 py-2 text-[11px] font-black uppercase tracking-widest text-slate-400">Explore Categories</div>
                    {loading ? (
                      <div className="py-12 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                        <span className="font-medium">កំពុងទាញយក...</span>
                      </div>
                    ) : categories.length === 0 ? (
                      <div className="py-8 text-center text-xs text-gray-400 font-medium">គ្មានទិន្នន័យ</div>
                    ) : (
                      categories.map((cat) => (
                        <div
                          key={cat.id}
                          onMouseEnter={() => setActiveCategory(cat)}
                          onClick={() => setActiveCategory(cat)}
                          className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                            activeCategory?.id === cat.id 
                              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-[1.02]' 
                              : 'text-slate-600 hover:bg-white hover:text-blue-600 hover:shadow-xs'
                          }`}
                        >
                          <span className="truncate">{cat.category_name}</span>
                          <ChevronRight className={`w-3.5 h-3.5 transition-transform ${activeCategory?.id === cat.id ? 'translate-x-0.5 text-white' : 'text-slate-400'}`} />
                        </div>
                      ))
                    )}
                  </div>

                  {/* Right Content */}
                  <div className="flex-1 p-7 overflow-y-auto bg-white">
                    {activeCategory ? (
                      <div>
                        <div className="mb-5 pb-3 border-b border-gray-100 flex justify-between items-center">
                          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
                            {activeCategory.category_name}
                          </h3>
                          <Link 
                            href={`/category/${activeCategory.id}`} 
                            className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-all"
                            onClick={() => setIsCategoryOpen(false)}
                          >
                            មើលទាំងអស់ &rarr;
                          </Link>
                        </div>

                        {activeCategory.children && activeCategory.children.length > 0 ? (
                          <div className="grid grid-cols-3 gap-5">
                            {activeCategory.children.map((sub) => (
                              <div key={sub.id} className="space-y-2 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-sm transition-all group/sub">
                                <Link 
                                  href={`/category/${sub.id}`}
                                  className="block font-bold text-xs text-slate-800 group-hover/sub:text-blue-600 transition-colors"
                                  onClick={() => setIsCategoryOpen(false)}
                                >
                                  {sub.category_name}
                                </Link>

                                {sub.children && sub.children.length > 0 && (
                                  <ul className="space-y-1 pl-2 border-l-2 border-blue-200">
                                    {sub.children.map((child) => (
                                      <li key={child.id}>
                                        <Link 
                                          href={`/categories/${child.id}`}
                                          className="text-[11px] font-medium text-slate-500 hover:text-blue-600 transition-all block truncate py-0.5"
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
                          <div className="py-16 text-center text-slate-400 text-xs font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            មិនមាន Sub-categories សម្រាប់ប្រភេទនេះទេ
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="py-20 text-center text-slate-400 text-xs font-medium">
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
        <div className="flex items-center space-x-1 lg:space-x-1.5 text-xs lg:text-sm font-semibold">
          <Link href="/" className={`px-3 py-2 rounded-xl transition-all duration-200 ${isActive('/') ? 'bg-white/25 shadow-xs' : 'hover:bg-white/10'}`}>Home</Link>
          <Link href="/allProduct" className={`px-3 py-2 rounded-xl transition-all duration-200 ${isActive('/allProduct') ? 'bg-white/25 shadow-xs' : 'hover:bg-white/10'}`}>All Product</Link>
          <Link href="/track-order" className={`px-3 py-2 rounded-xl transition-all duration-200 ${isActive('/track-order') ? 'bg-white/25 shadow-xs' : 'hover:bg-white/10'}`}>Track Order</Link>
          <Link href="/brand" className={`px-3 py-2 rounded-xl transition-all duration-200 ${isActive('/brand') ? 'bg-white/25 shadow-xs' : 'hover:bg-white/10'}`}>All Brand</Link>
          <Link href="/brands" className={`px-3 py-2 rounded-xl transition-all duration-200 ${isActive('/brands') ? 'bg-white/25 shadow-xs' : 'hover:bg-white/10'}`}>Brands</Link>
          <Link href="/sellers" className={`px-3 py-2 rounded-xl transition-all duration-200 ${isActive('/sellers') ? 'bg-white/25 shadow-xs' : 'hover:bg-white/10'}`}>Sellers</Link>
          <Link href="/history" className={`px-3 py-2 rounded-xl transition-all duration-200 ${isActive('/history') ? 'bg-white/25 shadow-xs' : 'hover:bg-white/10'}`}>History</Link>
          
          {/* 🔴 WHAT'S NEW LINK WITH BADGE */}
          <Link href="/update" className={`relative px-3 py-2 rounded-xl transition-all duration-200 flex items-center gap-1.5 ${isActive('/update') ? 'bg-white/25 shadow-xs' : 'hover:bg-white/10'}`}>
            <span>What&apos;s new?</span>
            {whatsNewCount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-sm animate-bounce">
                {whatsNewCount}
              </span>
            )}
          </Link>

          <Link href="/todays-deal" className="px-3 py-2 rounded-xl hover:bg-white/10 transition-all duration-200 text-amber-300 font-bold flex items-center gap-1">
            🔥 Todays Deal
          </Link>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2.5">
          <OrderNotifications />

          <div className="relative">
            <div 
              onClick={() => setIsCartOpen(!isCartOpen)}
              className="flex items-center space-x-2 bg-white/15 hover:bg-white/25 active:scale-95 px-3.5 py-2 rounded-xl transition-all duration-200 cursor-pointer select-none border border-white/15 shadow-sm"
            >
              <ShoppingCart className="w-4 h-4 text-cyan-200" />
              <div className="text-xs sm:text-sm flex items-center gap-1.5">
                <span className="font-bold">${totalPrice.toFixed(2)}</span>
                <span className="bg-blue-900 text-cyan-100 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                  {totalItems}
                </span>
              </div>
            </div>

            {isCartOpen && (
              <div className="absolute right-0 mt-3 w-80 bg-white text-gray-800 rounded-2xl shadow-2xl border border-gray-100 p-4 z-[9999] animate-in fade-in zoom-in-95 duration-150 font-sans">
                <div className="flex justify-between items-center mb-3 border-b border-gray-100 pb-2.5">
                  <span className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-blue-600" /> Shopping Cart
                  </span>
                  <span className="text-xs bg-blue-50 text-blue-600 font-bold px-2.5 py-0.5 rounded-full">{totalItems} items</span>
                </div>

                {cart.length === 0 ? (
                  <p className="text-center text-slate-400 py-8 text-xs font-medium">កន្ត្រកទំនិញរបស់អ្នកទទេរ</p>
                ) : (
                  <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1">
                    {cart.map((item, index) => (
                      <div key={index} className="flex items-center justify-between border-b border-slate-50 pb-2.5 hover:bg-slate-50/80 p-2 rounded-xl transition-colors">
                        <div className="flex-1 pr-2">
                          <p className="text-xs font-bold text-slate-800 truncate">{item.name}</p>
                          <p className="text-xs text-slate-500 font-medium">{item.quantity} x <span className="text-blue-600 font-bold">${item.price}</span></p>
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
                    <span className="text-[10px] text-slate-400 font-medium block">សរុបរួម</span>
                    <span className="font-black text-blue-600 text-base">${totalPrice.toFixed(2)}</span>
                  </div>
                  <Link 
                    href="/cart" 
                    onClick={() => setIsCartOpen(false)}
                    className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-blue-500/25 transition-all"
                  >
                    មើលកន្ត្រកពេញលេញ
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ==================== MOBILE FLOATING NAV (MODERN STYLED) ==================== */}
      {!isMobileMenuOpen && (
        <div
          className={`fixed bottom-4 left-4 z-[9999] md:hidden transition-[width] duration-300 ease-out font-sans ${
            isDockExpanded ? 'w-[min(300px,calc(100vw-80px))]' : 'w-14'
          }`}
          style={dockStyle}
        >
          <div className={`flex items-center gap-1.5 rounded-full border border-white/20 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 p-1.5 text-white shadow-2xl shadow-blue-900/30 backdrop-blur-lg ${
            dockOnRight ? 'flex-row-reverse' : ''
          }`}>
            <nav
              aria-label="Quick navigation"
              aria-hidden={!isDockExpanded}
              className={`flex min-w-0 items-center justify-around gap-0 overflow-hidden transition-[width,opacity,transform] duration-300 ease-out ${
                isDockExpanded
                  ? 'w-[min(240px,calc(100vw-130px))] translate-x-0 opacity-100'
                  : `w-0 opacity-0 pointer-events-none ${dockOnRight ? 'translate-x-2' : '-translate-x-2'}`
              }`}
            >
              <Link
                href="/"
                tabIndex={isDockExpanded ? 0 : -1}
                aria-label="Home"
                title="Home"
                onClick={() => setIsDockExpanded(false)}
                className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${
                  isActive('/') ? 'bg-white/25 text-white' : 'text-blue-100 hover:bg-white/15 hover:text-white'
                }`}
              >
                <Home className="h-4 w-4" aria-hidden="true" />
              </Link>

              <Link
                href="/allProduct"
                tabIndex={isDockExpanded ? 0 : -1}
                aria-label="All products"
                title="All products"
                onClick={() => setIsDockExpanded(false)}
                className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${
                  isActive('/allProduct') ? 'bg-white/25 text-white' : 'text-blue-100 hover:bg-white/15 hover:text-white'
                }`}
              >
                <Store className="h-4 w-4" aria-hidden="true" />
              </Link>

              <Link
                href="/todays-deal"
                tabIndex={isDockExpanded ? 0 : -1}
                aria-label="Today's deals"
                title="Today's deals"
                onClick={() => setIsDockExpanded(false)}
                className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${
                  isActive('/todays-deal') ? 'bg-amber-400 text-blue-950 font-bold' : 'text-amber-300 hover:bg-white/15 hover:text-amber-200'
                }`}
              >
                <Flame className="h-4 w-4" aria-hidden="true" />
              </Link>

              {/* 🔴 WHAT'S NEW FLOATING DOCK LINK WITH BADGE */}
              <Link
                href="/update"
                tabIndex={isDockExpanded ? 0 : -1}
                aria-label="What's new?"
                title="What's new?"
                onClick={() => setIsDockExpanded(false)}
                className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${
                  isActive('/update') ? 'bg-white/25 text-white' : 'text-blue-100 hover:bg-white/15 hover:text-white'
                }`}
              >
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                {whatsNewCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-black text-white shadow-sm">
                    {whatsNewCount}
                  </span>
                )}
              </Link>

              <Link
                href="/cart"
                tabIndex={isDockExpanded ? 0 : -1}
                aria-label={`Shopping cart${totalItems > 0 ? `, ${totalItems} items` : ''}`}
                title="Shopping cart"
                onClick={() => setIsDockExpanded(false)}
                className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${
                  isActive('/cart') ? 'bg-white/25 text-white' : 'text-blue-100 hover:bg-white/15 hover:text-white'
                }`}
              >
                <ShoppingCart className="h-4 w-4" aria-hidden="true" />
                {totalItems > 0 && (
                  <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-400 px-1 text-[10px] font-black text-blue-950 shadow-sm">
                    {totalItems}
                  </span>
                )}
              </Link>

              <button
                type="button"
                tabIndex={isDockExpanded ? 0 : -1}
                aria-label="More navigation"
                title="More navigation"
                onClick={() => {
                  setIsDockExpanded(false);
                  setIsMobileMenuOpen(true);
                }}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-blue-100 transition-colors hover:bg-white/15 hover:text-white"
              >
                <Layers className="h-4 w-4" aria-hidden="true" />
              </button>

              <Link
                href="/history"
                tabIndex={isDockExpanded ? 0 : -1}
                aria-label="Profile and order history"
                title="Profile and order history"
                onClick={() => setIsDockExpanded(false)}
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${
                  isActive('/history') ? 'bg-white/25 text-white' : 'text-blue-100 hover:bg-white/15 hover:text-white'
                }`}
              >
                <User className="h-4 w-4" aria-hidden="true" />
              </Link>
            </nav>

            <button
              type="button"
              aria-label={isDockExpanded ? 'Collapse navigation' : 'Expand navigation'}
              aria-expanded={isDockExpanded}
              onPointerDown={handleDockPointerDown}
              onPointerMove={handleDockPointerMove}
              onPointerUp={handleDockPointerUp}
              onPointerCancel={() => {
                dockDrag.current = null;
              }}
              onKeyDown={handleDockKeyDown}
              className="flex h-10 w-10 shrink-0 touch-none items-center justify-center rounded-full bg-white/15 text-white transition-all hover:bg-white/25 active:scale-95 focus-visible:outline-none shadow-sm cursor-grab active:cursor-grabbing"
            >
              {isDockExpanded ? <X className="h-5 w-5" aria-hidden="true" /> : <Layers className="h-5 w-5" aria-hidden="true" />}
            </button>
          </div>
        </div>
      )}

      {/* ==================== MOBILE MENU OVERLAY ==================== */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-blue-950/60 backdrop-blur-sm z-[9998] md:hidden flex flex-col justify-end p-4 font-sans animate-in fade-in duration-200">
          <div className="bg-white text-gray-800 rounded-3xl p-5 shadow-2xl border border-blue-100 max-h-[75vh] overflow-y-auto space-y-3 animate-in slide-in-from-bottom duration-300 mb-16">
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
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="p-3 rounded-2xl bg-slate-50 text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors text-center">Home</Link>
              <Link href="/allProduct" onClick={() => setIsMobileMenuOpen(false)} className="p-3 rounded-2xl bg-slate-50 text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors text-center">All Product</Link>
              <Link href="/track-order" onClick={() => setIsMobileMenuOpen(false)} className="p-3 rounded-2xl bg-slate-50 text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors text-center">Track Order</Link>
              <Link href="/brand" onClick={() => setIsMobileMenuOpen(false)} className="p-3 rounded-2xl bg-slate-50 text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors text-center">All Brand</Link>
              <Link href="/brands" onClick={() => setIsMobileMenuOpen(false)} className="p-3 rounded-2xl bg-slate-50 text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors text-center">Brands</Link>
              <Link href="/sellers" onClick={() => setIsMobileMenuOpen(false)} className="p-3 rounded-2xl bg-slate-50 text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors text-center">Sellers</Link>
              <Link href="/history" onClick={() => setIsMobileMenuOpen(false)} className="p-3 rounded-2xl bg-slate-50 text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors text-center">History</Link>
              
              {/* 🔴 MOBILE OVERLAY WHAT'S NEW WITH BADGE */}
              <Link href="/update" onClick={() => setIsMobileMenuOpen(false)} className="p-3 rounded-2xl bg-slate-50 text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center justify-between px-4">
                <span>What&apos;s new?</span>
                {whatsNewCount > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                    {whatsNewCount}
                  </span>
                )}
              </Link>

              <Link href="/todays-deal" onClick={() => setIsMobileMenuOpen(false)} className="col-span-2 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold text-center shadow-md">🔥 Todays Deal</Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}