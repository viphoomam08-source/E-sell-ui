'use client';

import React, { useState, useEffect, useRef } from 'react';

const CategoryItem = ({ category, onSelect, isSelected, isScrolled }) => {
    return (
        <div 
            onClick={() => onSelect(category)}
            className={`flex flex-col items-center flex-shrink-0 cursor-pointer group select-none transition-all duration-300 ${isSelected ? 'scale-105' : 'hover:-translate-y-0.5'} ${isScrolled ? 'w-14' : 'w-18'}`}
        >
            <div className={`rounded-full p-0.5 transition-all duration-300 ${
                isScrolled ? 'w-9 h-9' : 'w-14 h-14 sm:w-16 sm:h-16'
            } ${
                isSelected 
                    ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-sm shadow-blue-500/25 ring-2 ring-blue-500/30' 
                    : 'bg-slate-100 group-hover:bg-blue-100'
            }`}>
                <div className="w-full h-full rounded-full overflow-hidden bg-white border border-slate-200/60 shadow-inner">
                    {category.image_category ? (
                        <img 
                            src={`${import.meta.env?.VITE_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL}/storage/${category.image_category}`} 
                            alt={category.category_name} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 pointer-events-none" 
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-[9px] font-medium">
                            គ្មានរូប
                        </div>
                    )}
                </div>
            </div>
            <span className={`mt-1 text-[11px] font-medium text-center truncate w-full transition-colors duration-200 ${
                isSelected ? 'text-blue-600 font-bold' : 'text-slate-600 group-hover:text-blue-600'
            }`} style={{ fontFamily: "'Kantumruy Pro', sans-serif" }}>
                {category.category_name}
            </span>
        </div>
    );
};

export default function Category({ onSelectSubcategory, selectedSubId }) {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isScrolled, setIsScrolled] = useState(false);
    
    const scrollRef = useRef(null);

    const fetchCategories = async () => {
        try {
            const response = await fetch(`${import.meta.env?.VITE_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL}/api/category-list`, {
                headers: { 'Accept': 'application/json' }
            });
            const data = await response.json();
            const mainCategories = (data.list || []).filter(cat => !cat.parent_id);
            setCategories(mainCategories);
            
            const firstWithChildren = mainCategories.find(cat => cat.children && cat.children.length > 0);
            if (firstWithChildren) {
                setSelectedCategory(firstWithChildren);
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Kantumruy+Pro:ital,wght@0,100..700;1,100..700&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);

        fetchCategories();

        const handleScroll = () => {
            if (window.scrollY > 30) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scroll = (direction) => {
        if (scrollRef.current) {
            const scrollAmount = 250;
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    const handleSelectCategory = (cat) => {
        setSelectedCategory(cat);
        if (onSelectSubcategory) {
            onSelectSubcategory(null); 
        }
    };

    if (loading) {
        return (
            <div className="w-full max-w-7xl mx-auto px-4 py-2 flex justify-center items-center">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium" style={{ fontFamily: "'Kantumruy Pro', sans-serif" }}>
                    <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span>កំពុងទាញទិន្នន័យ...</span>
                </div>
            </div>
        );
    }

    const hasChildren = selectedCategory && selectedCategory.children && selectedCategory.children.length > 0;

    return (
        <div className="sticky top-[100px] z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-100 transition-all shadow-2xs" style={{ fontFamily: "'Kantumruy Pro', sans-serif" }}>
            <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-1.5 space-y-1.5">
                
                {/* Main Container Card */}
                <div className={`bg-white/95 rounded-xl transition-all duration-300 border border-slate-100 shadow-2xs ${isScrolled ? 'p-1.5' : 'p-2.5 sm:p-4'}`}>
                    
                    {/* Header: Title and Navigation Arrows (Hidden completely when scrolled to save maximum mobile space) */}
                    <div className={`flex justify-between items-center transition-all duration-300 overflow-hidden ${isScrolled ? 'max-h-0 mb-0 opacity-0' : 'max-h-12 mb-2 opacity-100'}`}>
                        <div>
                            <h3 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                                ប្រភេទមុខទំនិញ
                            </h3>
                        </div>
                        <div className="flex space-x-1">
                            <button onClick={() => scroll('left')} className="p-1.5 rounded-lg bg-slate-50 hover:bg-blue-600 hover:text-white text-slate-600 transition-all duration-200 border border-slate-200/60 cursor-pointer">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
                            </button>
                            <button onClick={() => scroll('right')} className="p-1.5 rounded-lg bg-slate-50 hover:bg-blue-600 hover:text-white text-slate-600 transition-all duration-200 border border-slate-200/60 cursor-pointer">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
                            </button>
                        </div>
                    </div>

                    {/* Scrollable Categories List */}
                    <div ref={scrollRef} className="flex space-x-2.5 overflow-x-auto scroll-smooth py-0.5 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden">
                        {categories.map((cat) => (
                            <div key={cat.id} className="snap-start flex-shrink-0">
                                <CategoryItem 
                                    category={cat} 
                                    isSelected={selectedCategory?.id === cat.id}
                                    onSelect={handleSelectCategory} 
                                    isScrolled={isScrolled}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Subcategories Section */}
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${hasChildren ? 'max-h-36 opacity-100 pb-1' : 'max-h-0 opacity-0 py-0'}`}>
                    {selectedCategory && (
                        <div className="bg-slate-50/90 backdrop-blur-sm rounded-xl p-2 border border-slate-200/60 shadow-2xs">
                            <div className="flex flex-wrap gap-1.5">
                                {selectedCategory.children.map((sub) => {
                                    const isSubSelected = selectedSubId == sub.id;
                                    return (
                                        <div 
                                            key={sub.id}
                                            onClick={() => onSelectSubcategory && onSelectSubcategory(sub.id)}
                                            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border shadow-2xs cursor-pointer transition-all duration-200 text-xs ${
                                                isSubSelected 
                                                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/25 font-medium' 
                                                    : 'bg-white border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 text-slate-700'
                                            }`}
                                        >
                                            {sub.image_category ? (
                                                <img src={`${import.meta.env?.VITE_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL}/storage/${sub.image_category}`} alt="" className="w-3.5 h-3.5 object-cover rounded-full shadow-2xs" />
                                            ) : (
                                                <div className="w-3.5 h-3.5 bg-slate-100 rounded-full flex items-center justify-center text-[9px] text-slate-400">-</div>
                                            )}
                                            <span>{sub.category_name}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}