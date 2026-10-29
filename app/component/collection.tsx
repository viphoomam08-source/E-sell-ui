'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

function collection() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/category-child`, {
      headers: { 'Accept': 'application/json' }
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch categories');
        return res.json();
      })
      .then((data) => {
        console.log("Category Child Response:", data);
        const catList = data.list || data.data || (Array.isArray(data) ? data : []);
        setCategories(catList);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching categories:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6 flex justify-center items-center">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  // Calculate Pagination Data
  const totalPages = Math.ceil(categories.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCategories = categories.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 my-6 font-['Kantumruy_Pro']">
      
      {/* 💙 Soft Blue Background Wrapper */}
      <div className="bg-gradient-to-br from-blue-50/90 via-sky-50/50 to-indigo-50/60 rounded-3xl border border-blue-100/90 p-5 sm:p-7 shadow-xs">
        
        {/* Section Header */}
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-extrabold text-blue-950 tracking-tight flex items-center gap-2">
            <span className="w-2.5 h-5 bg-blue-600 rounded-full inline-block"></span>
            បណ្តុំការប្រមូលផ្តុំ (Collections)
          </h3>
          <span className="text-xs font-semibold text-blue-700 bg-blue-100/80 px-3 py-1 rounded-full">
            ទំព័រ {currentPage} / {totalPages || 1}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          {currentCategories.map((item, index) => {
            const imgUrl = item.image_category 
              ? `${process.env.NEXT_PUBLIC_API_URL}/storage/${item.image_category}` 
              : null;

            return (
              <Link 
                key={item.id || index}
                href={`/collection/${item.id}`}
                className="w-28 sm:w-32 flex flex-col items-center justify-center gap-3 group cursor-pointer"
              >
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white shadow-sm border border-blue-100/60 flex items-center justify-center overflow-hidden group-hover:scale-105 group-hover:border-blue-400 group-hover:shadow-md transition-all duration-300">
                  {imgUrl ? (
                    <img 
                      src={imgUrl} 
                      alt={item.category_name} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <span className="text-blue-600 font-bold text-xl">🛍️</span>
                  )}
                </div>

                <span className="text-xs sm:text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors text-center truncate w-full">
                  {item.category_name}
                </span>
              </Link>
            );
          })}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-blue-100/80">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                currentPage === 1 
                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' 
                  : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50'
              }`}
            >
              មុន (Prev)
            </button>

            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 text-xs font-bold rounded-xl border transition-all flex items-center justify-center ${
                    currentPage === page
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white text-slate-600 border-blue-200 hover:bg-blue-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                currentPage === totalPages 
                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' 
                  : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50'
              }`}
            >
              បន្ទាប់ (Next)
            </button>
          </div>
        )}

      </div>

    </div>
  );
}

export default collection;