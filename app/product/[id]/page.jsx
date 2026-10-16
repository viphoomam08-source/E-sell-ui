'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ShoppingCart, ArrowLeft, PackageCheck, ShieldCheck, Truck, Plus, Minus, CreditCard, Store, Layers, ChevronUp, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import RelatedProduct from '@/app/component/relatedProduct';
import Comment from './comment';

export default function ProductDetail() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // State សម្រាប់ទុកទិន្នន័យទំនិញដែលទាក់ទងពីហាងជាមួយគ្នា
  const [sellerProducts, setSellerProducts] = useState([]);

  useEffect(() => {
    if (!id) return;
    
    // ១. ទាញយកព័ត៌មានលម្អិតផលិតផល
    fetch(`${import.meta.env?.VITE_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL}/api/product/${id}`, {
      headers: { 'Accept': 'application/json' }
    })
      .then(res => res.json())
      .then(data => {
        const item = data.product || data.data || data;
        setProduct(item);
        
        const productVariants = item.variants || item.product_variants || item.child_products || data.variants || [];
        setVariants(productVariants);

        setLoading(false);

        // ២. ប្រើប្រាស់ seller_id ផ្ទាល់ពីតារាង product_sellers ដើម្បីហៅ API relatedBySeller
        const sellerId = item.seller_id;
        if (sellerId) {
          fetch(`${import.meta.env?.VITE_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL}/api/product-seller/${sellerId}/${id}`, {
            headers: { 'Accept': 'application/json' }
          })
            .then(res => res.json())
            .then(sellerData => {
              const list = sellerData.products || sellerData.data || sellerData;
              if (Array.isArray(list)) {
                setSellerProducts(list);
              }
            })
            .catch(err => console.error("Error fetching seller products:", err));
        }
      })
      .catch(err => {
        console.error("Error fetching product detail:", err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-slate-50 font-['Kantumruy_Pro']">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-slate-500">កំពុងទាញយកទិន្នន័យ...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-slate-50 font-['Kantumruy_Pro'] space-y-4">
        <p className="text-base font-bold text-slate-700">រកមិនឃើញទំនិញនេះទេ</p>
        <Link href="/" className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-blue-700 transition-all">
          ត្រឡប់ទៅទំព័រដើមវិញ
        </Link>
      </div>
    );
  }

  // Build image gallery list (Main product image + all variant images)
  const mainImageRaw = product.image || product.image_url || product.photo;
  const mainImageUrl = mainImageRaw 
    ? (mainImageRaw.startsWith('http') ? mainImageRaw : `${process.env.NEXT_PUBLIC_API_URL}/storage/${mainImageRaw}`)
    : "https://images.unsplash.com/photo-1542291026-7eec264c27ff";

  const allImages = [mainImageUrl];
  variants.forEach(v => {
    const vImg = v.image || v.image_url;
    if (vImg) {
      const fullVImg = vImg.startsWith('http') ? vImg : `${process.env.NEXT_PUBLIC_API_URL}/storage/${vImg}`;
      if (!allImages.includes(fullVImg)) {
        allImages.push(fullVImg);
      }
    }
  });

  const rawImage = selectedVariant 
    ? (selectedVariant.image || selectedVariant.image_url || mainImageRaw)
    : allImages[activeImageIndex] || mainImageRaw;

  const imageUrl = rawImage 
    ? (rawImage.startsWith('http') ? rawImage : `${process.env.NEXT_PUBLIC_API_URL}/storage/${rawImage}`)
    : mainImageUrl;

  const productName = product.product_name || product.name || product.title;
  
  const productPrice = Number(
    selectedVariant 
      ? (selectedVariant.product_price || selectedVariant.price || product.product_price || product.price || 0)
      : (product.product_price || product.price || 0)
  );

  const productStock = Number(
    selectedVariant !== null 
      ? (selectedVariant.product_stock ?? selectedVariant.stock ?? 0)
      : (product.product_stock !== undefined ? product.product_stock : 0)
  );

  const productDesc = product.product_description || product.description;
  const categoryName = product.category?.category_name || product.category_name || 'បណ្តុំទំនិញទូទៅ';
  
  const storeName = 
    product.seller?.name || 
    product.seller?.store_name || 
    product.seller?.shop_name || 
    product.seller?.username || 
    'មិនមានបញ្ជាក់ឈ្មោះហាង';

  const subtotal = productPrice * quantity;

  const handleAddToCart = async () => {
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    if (!token) {
      alert('សូមធ្វើការ Login ជា Buyer ជាមុនសិន!');
      router.push('/login');
      return;
    }

    if (quantity > productStock) {
      alert('ចំនួនដែលអ្នកបានជ្រើសរើសលើសពីស្តុកក្នុងឃ្លាំងហើយ!');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env?.VITE_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL}/api/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          product_id: product.id,
          variant_id: selectedVariant ? selectedVariant.id : null,
          quantity: quantity
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert(`បានបញ្ចូល "${productName}" (ចំនួន: ${quantity}) ទៅក្នុងកន្ត្រកដោយជោគជ័យ! 🛒`);
      } else {
        if (response.status === 401) {
          localStorage.removeItem('access_token');
          alert('Session បានផុតកំណត់ ឬអ្នកមិនទាន់ Login ទេ។ សូម Login ម្តងទៀត!');
          router.push('/login');
          return;
        }
        alert(data.message || 'មានបញ្ហាក្នុងការបន្ថែមទំនិញចូលកន្ត្រក!');
      }
    } catch (error) {
      console.error('API Error:', error);
      alert('មិនអាចតភ្ជាប់ទៅកាន់ Server បានទេ!');
    }
  };

  const handleBuyNow = async () => {
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    if (!token) {
      alert('សូមធ្វើការ Login ជា Buyer ជាមុនសិន!');
      router.push('/login');
      return;
    }

    if (quantity > productStock) {
      alert('ចំនួនដែលអ្នកបានជ្រើសរើសលើសពីស្តុកក្នុងឃ្លាំងហើយ!');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env?.VITE_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL}/api/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          product_id: product.id,
          variant_id: selectedVariant ? selectedVariant.id : null,
          quantity: quantity
        })
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/checkout');
      } else {
        alert(data.message || 'មានបញ្ហាក្នុងការបញ្ជាទិញ!');
      }
    } catch (error) {
      console.error('API Error:', error);
      alert('មិនអាចតភ្ជាប់ទៅកាន់ Server បានទេ!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8 font-['Kantumruy_Pro']">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <div>
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-600 bg-white border border-slate-200 px-4 py-2.5 rounded-xl shadow-xs transition-all">
            <ArrowLeft className="w-4 h-4" />
            <span>ត្រឡប់ក្រោយ</span>
          </Link>
        </div>

        <div className="bg-white border border-slate-200/85 rounded-3xl shadow-xs overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-10">
          
          <div className="lg:col-span-5 flex gap-4">
            {allImages.length > 1 && (
              <div className="flex flex-col items-center justify-between w-20 flex-shrink-0">
                <button 
                  type="button"
                  onClick={() => setActiveImageIndex((prev) => Math.max(0, prev - 1))}
                  className="p-1.5 text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
                >
                  <ChevronUp className="w-5 h-5" />
                </button>

                <div className="space-y-2.5 my-2 w-full overflow-hidden">
                  {allImages.map((img, idx) => (
                    <div 
                      key={idx}
                      onClick={() => {
                        setActiveImageIndex(idx);
                        setSelectedVariant(null);
                        setQuantity(1);
                      }}
                      className={`w-16 h-16 rounded-xl border-2 overflow-hidden cursor-pointer transition-all ${
                        activeImageIndex === idx && selectedVariant === null
                          ? 'border-orange-500 shadow-sm scale-105' 
                          : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>

                <button 
                  type="button"
                  onClick={() => setActiveImageIndex((prev) => Math.min(allImages.length - 1, prev + 1))}
                  className="p-1.5 text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
                >
                  <ChevronDown className="w-5 h-5" />
                </button>
              </div>
            )}

            <div className="w-full h-80 sm:h-[420px] bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 relative flex items-center justify-center flex-grow">
              <img 
                key={imageUrl}
                src={imageUrl} 
                alt={productName} 
                className="w-full h-full object-contain p-4 transition-transform duration-500 hover:scale-105"
              />
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                ប្រភេទមុខទំនិញ៖ <span className="text-blue-600 font-bold">{categoryName}</span>
              </div>
              
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-snug">{productName}</h1>

              <div className="flex items-center gap-2 pt-1">
                <div className="w-7 h-7 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <Store className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-semibold text-slate-600">លក់ដោយហាង៖</span>
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">
                  {storeName}
                </span>
              </div>
           
              <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 pt-2">
                ${productPrice.toFixed(2)}
              </div>
            </div>

            {variants.length > 0 && (
              <div className="space-y-2.5 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <span>ជម្រើសពណ៌ / ម៉ូឌែល (Color / Variant)៖</span>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedVariant(null);
                      setQuantity(1);
                    }}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold border-2 transition-all cursor-pointer ${
                      selectedVariant === null 
                        ? 'border-orange-500 text-orange-600 bg-orange-50/20 shadow-xs' 
                        : 'border-slate-300 text-slate-700 bg-white hover:border-slate-400'
                    }`}
                  >
                    Standard
                  </button>

                  {variants.map((v) => {
                    const isSelected = selectedVariant?.id === v.id;
                    const variantNameLabel = v.variant_name || v.name || 'Default';
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => {
                          setSelectedVariant(v);
                          setQuantity(1);
                        }}
                        className={`px-5 py-2.5 rounded-xl text-xs font-bold border-2 transition-all cursor-pointer flex items-center gap-2 ${
                          isSelected 
                            ? 'border-orange-500 text-orange-600 bg-orange-50/20 shadow-xs' 
                            : 'border-slate-300 text-slate-700 bg-white hover:border-slate-400'
                        }`}
                      >
                        <span>{variantNameLabel}</span>
                        {v.product_price && (
                          <span className="text-slate-400 font-normal">
                            (${Number(v.product_price).toFixed(2)})
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <PackageCheck className="w-4 h-4 text-emerald-600" />
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${productStock > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-600'}`}>
                {productStock > 0 ? `មានស្តុកក្នុងឃ្លាំង (${productStock} ឯកតា)` : 'អស់ពីស្តុក'}
              </span>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-800">ការពិពណ៌នាអំពីទំនិញ៖</span>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                {productDesc || "គ្មានការពិពណ៌នាសម្រាប់ផលិតផលនេះទេ។"}
              </p>
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-700">ចំនួនបញ្ជាទិញ</span>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 overflow-hidden">
                  <button 
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="p-2.5 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer disabled:opacity-30"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center text-xs font-bold text-slate-800">{quantity}</span>
                  <button 
                    type="button"
                    onClick={() => setQuantity(Math.min(productStock, quantity + 1))}
                    disabled={quantity >= productStock || productStock <= 0}
                    className="p-2.5 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer disabled:opacity-30"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-xs text-slate-500 font-normal">
                  តម្លៃសរុប៖ <span className="font-bold text-slate-900">${subtotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-100">
              <button 
                type="button"
                onClick={handleAddToCart}
                disabled={productStock <= 0 || quantity > productStock}
                className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold py-3.5 px-6 rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>បន្ថែមចូលកន្ត្រក</span>
              </button>
              
              <button 
                type="button"
                onClick={handleBuyNow}
                disabled={productStock <= 0 || quantity > productStock}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3.5 px-6 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                <span>បញ្ជាទិញឥឡូវនេះ</span>
              </button>
            </div>
            
          </div>

        </div>

        {/* ដាក់ Comment Section នៅទីនេះ ក្រោយព័ត៌មានលម្អិតទំនិញ */}
        <div className="mt-8">
          <Comment productSellerId={id} sellerId={product?.seller_id} />
        </div>

      </div>

      <div className="mt-8">
        <RelatedProduct products={sellerProducts} />
      </div>
    </div>
  );
}