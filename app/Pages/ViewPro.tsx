'use client';
import React, { useState, useEffect } from 'react';
import { ShoppingCart, X, ShoppingBag } from 'lucide-react';

export default function ViewPro({ product, isOpen, onClose, onAddToCart, showAlert }) {
  const [show, setShow] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Trigger smooth animation and set initial selected image when opened
  useEffect(() => {
    if (isOpen && product) {
      setShow(true);
      // កំណត់យករូបភាពដំបូងរបស់ product ឬ fallback
      setSelectedImage(product.image || "https://images.unsplash.com/photo-1542291026-7eec264c27ff");
      setQuantity(1);
    } else {
      setShow(false);
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const subtotal = Number(product.price) * quantity;
  const taxFee = subtotal * 0.05;
  const totalAmount = subtotal + taxFee;

  const sellerName = product.seller?.name || "Loda Store";
  const sellerAvatar = product.seller?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e";

  // បញ្ជីរូបភាពជាច្រើន (Multiple Pictures) សម្រាប់ឱ្យអតិថិជនជ្រើសរើស
  const productImages = [
    product.image, 
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff", 
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b"
  ].filter(Boolean);

  return (
    <div className={`fixed inset-0 z-[9999] w-screen h-screen flex items-center justify-center bg-black/60 backdrop-blur-md p-4 transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0'}`}>
      
      {/* Modal Box with smooth scale & fade animation */}
      <div className={`w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col transform transition-all duration-300 ease-out ${show ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-4 opacity-0'}`}>
        
        {/* Top Bar */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2 bg-slate-200/60 px-3.5 py-1.5 rounded-full">
            <ShoppingCart className="w-4 h-4 text-slate-700" />
            <span className="text-xs font-bold text-slate-700">View Pro Detail</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-200/85 hover:bg-slate-300 text-slate-700 transition-all cursor-pointer hover:rotate-90 duration-300"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 md:p-8 overflow-y-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Left Side: Images & Complete Purchase Box */}
          <div className="space-y-4">
            <div className="w-full h-72 sm:h-80 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 relative flex items-center justify-center">
              <img 
                src={selectedImage} 
                alt={product.product_name} 
                className="w-full h-full object-cover transition-all duration-500 hover:scale-105"
              />
            </div>

            {/* Thumbnails សម្រាប់ឱ្យអតិថិជនចុចជ្រើសរើសរូបដែលចង់បាន */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {productImages.map((img, idx) => (
                <div 
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-14 h-14 rounded-xl overflow-hidden border-2 cursor-pointer flex-shrink-0 transition-all duration-300 ${selectedImage === img ? 'border-blue-600 scale-105 shadow-md' : 'border-slate-200 opacity-60 hover:opacity-100'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>

            {/* Complete Purchase Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Complete Purchase</h4>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Enter Quantity
                </label>
                <input 
                  type="number" 
                  min="1" 
                  max={product.stock || 10}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                />
              </div>
              <div className="text-xs text-slate-600 space-y-1 pt-2 border-t border-slate-200">
                <div className="flex justify-between"><span>Subtotal:</span><span className="font-semibold">${subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Tax / Fee:</span><span className="font-semibold">${taxFee.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-200">
                  <span>Total Amount:</span><span className="text-blue-600">${totalAmount.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button 
                  onClick={onClose}
                  className="flex-1 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    // 🛒 ពេលចុច Purchase គឺភ្ជាប់រូបភាពដែលបានជ្រើសរើស (selectedImage) ទៅជាមួយ
                    const purchasedItem = { ...product, image: selectedImage, quantity };
                    const existingCart = JSON.parse(localStorage.getItem('cart_items')) || [];
                    localStorage.setItem('cart_items', JSON.stringify([...existingCart, purchasedItem]));

                    showAlert(`Purchase confirmed for total: $${totalAmount.toFixed(2)} (Image selected saved)[cite: 1]`, 'success');
                    onClose();
                  }}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition-all cursor-pointer active:scale-95"
                >
                  Confirm Purchase
                </button>
              </div>
            </div>
          </div>

          {/* Right Side: Product & Store Info */}
          <div className="bg-slate-100 border border-slate-200 rounded-3xl p-6 space-y-6">
            <div className="flex justify-between items-start gap-3">
              <div>
                <h2 className="text-xl font-black text-slate-900">{product.product_name}</h2>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{product.decribtion || "High quality collection item."}</p>
              </div>
              <div className="bg-white p-2.5 rounded-2xl border border-slate-200 flex flex-col items-center flex-shrink-0 shadow-xs">
                <img src={sellerAvatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                <span className="text-[10px] font-bold text-slate-700 mt-1 truncate max-w-[70px]">{sellerName}</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2 shadow-xs">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-500">Stock Available:</span>
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">Stock: {product.stock ?? 10}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-500">Cost:</span>
                <span className="text-xl font-extrabold text-blue-600">${product.price}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-16 bg-white border border-slate-200 rounded-xl py-2.5 text-center text-xs font-bold text-slate-800 shadow-xs">
                {quantity}
              </div>
              <button 
                // 🛒 ពេលចុច Add to Cart គឺបញ្ជូនរូបភាពដែលបានជ្រើសរើស (selectedImage) ទៅជាមួយ[cite: 1]
                onClick={(e) => onAddToCart({ ...product, image: selectedImage }, quantity, e)}
                className="flex-1 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-500/20 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-95"
              >
                <ShoppingCart className="w-4 h-4" />
                Add to cart
              </button>
            </div>

            <div className="pt-4 border-t border-slate-200 space-y-3">
              <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                <span>Payment:</span>
                <span className="text-base text-slate-900 font-extrabold">${totalAmount.toFixed(2)}</span>
              </div>
              <button 
                onClick={() => {
                  // 🛒 ពេលចុច Purchase គឺភ្ជាប់រូបភាពដែលបានជ្រើសរើស (selectedImage) ទៅជាមួយ[cite: 1]
                  const purchasedItem = { ...product, image: selectedImage, quantity };
                  const existingCart = JSON.parse(localStorage.getItem('cart_items')) || [];
                  localStorage.setItem('cart_items', JSON.stringify([...existingCart, purchasedItem]));

                  showAlert(`Successfully purchased for $${totalAmount.toFixed(2)}!`, 'success');
                  onClose();
                }}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/25 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-95"
              >
                <ShoppingBag className="w-4 h-4" />
                Purchase
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}