'use client';

import { useState } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';

export default function RelatedProduct({ products }) {
  if (!products || products.length === 0) return null;

  // កំណត់ចំនួនទំនិញដែលត្រូវបង្ហាញដំបូង (៦ មុខ)
  const [visibleCount, setVisibleCount] = useState(6);

  // ទាញយកទំនិញតាមចំនួនដែលត្រូវបង្ហាញបច្ចុប្បន្ន
  const displayedProducts = products.slice(0, visibleCount);
  const hasMore = visibleCount < products.length;

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 6); // បន្ថែម ៦ មុខទៀតរាល់ពេលចុច
  };

  return (
    <div className="mt-8 pt-6 border-t border-slate-200">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            ផលិតផលផ្សេងទៀតពីអ្នកលក់នេះ <span className="text-xs font-normal text-slate-500">(More from this Seller)</span>
          </h3>
          <p className="text-xs text-slate-500">ស្វែងរកផលិតផលបន្ថែមពីហាងដូចគ្នា</p>
        </div>
        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
          បង្ហាញ {displayedProducts.length} នាក់ / សរុប {products.length}
        </span>
      </div>

      {/* Grid សម្រាប់បង្ហាញទំនិញ (២ ຖັນលើទូរស័ព្ទ, ៣-៤ ຖັນលើ ल्याបថុប) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {displayedProducts.map((item) => {
          const imgRaw = item.image || item.image_url;
          const imgUrl = imgRaw 
            ? (imgRaw.startsWith('http') ? imgRaw : `${process.env.NEXT_PUBLIC_API_URL}/storage/${imgRaw}`)
            : "https://images.unsplash.com/photo-1542291026-7eec264c27ff";

          const name = item.product_name || item.name || 'ផលិតផលគ្មានឈ្មោះ';
          const price = Number(item.product_price || item.price || 0);

          return (
            <div 
              key={item.id} 
              className="bg-white border border-slate-200/85 rounded-2xl p-3 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-full h-32 sm:h-36 bg-slate-50 rounded-xl overflow-hidden mb-2.5 flex items-center justify-center border border-slate-100">
                  <img src={imgUrl} alt={name} className="w-full h-full object-cover" />
                </div>
                
                <h4 className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-2 mb-2">
                  {name}
                </h4>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-auto">
                <span className="text-xs sm:text-sm font-extrabold text-blue-600">
                  ${price.toFixed(2)}
                </span>
                
                <a 
                  href={`/product/${item.id}`}
                  className="px-2.5 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg text-[11px] font-bold transition-all"
                >
                  មើលលម្អិត
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* ប៊ូតុង Load More (បង្ហាញលុះត្រាតែនៅសល់ទំនិញមិនទាន់បង្ហាញ) */}
      {hasMore && (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={handleLoadMore}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-300 hover:border-blue-600 text-slate-700 hover:text-blue-600 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <span>បង្ហាញទំនិញបន្ថែម (Load More)</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}