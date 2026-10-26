'use client';

import React, { useState, useEffect, useRef } from 'react';

const CategoryItem = ({ category, onSelect, isSelected, isScrolled }) => {
    return (
        <button 
            onClick={() => onSelect(category)}
            className={`flex flex-col items-center flex-shrink-0 cursor-pointer group outline-none transition-all duration-300 ${
                isScrolled ? 'w-16' : 'w-20'
            }`}
        >
            {/* Circle Avatar Frame */}
            <div className={`relative rounded-full transition-all duration-300 flex items-center justify-center ${
                isScrolled ? 'w-11 h-11' : 'w-16 h-16 sm:w-18 sm:h-18'
            } ${
                isSelected 
                    ? 'p-[2px] bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-md shadow-blue-500/20' 
                    : 'p-[1px] bg-slate-200/80 group-hover:bg-blue-300'
            }`}>
                <div className="w-full h-full rounded-full overflow-hidden bg-white p-0.5">
                    {category.image_category ? (
                        <img 
                            src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${category.image_category}`}
                            alt={category.category_name} 
                            className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform duration-300 pointer-events-none" 
                        />
                    ) : (
                        <div className="w-full h-full rounded-full bg-slate-50 flex items-center justify-center text-slate-400 text-[10px]">
                            គ្មានរូប
                        </div>
                    )}
                </div>
            </div>

            {/* Label */}
            <span className={`mt-2 text-[11px] sm:text-xs text-center truncate w-full transition-colors duration-200 ${
                isSelected ? 'text-blue-600 font-extrabold' : 'text-slate-700 group-hover:text-blue-600 font-medium'
            }`} style={{ fontFamily: "'Kantumruy Pro', sans-serif" }}>
                {category.category_name}
            </span>
        </button>
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
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/category-list`, {
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
            if (window.scrollY > 20) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSelectCategory = (cat) => {
        setSelectedCategory(cat);
        if (onSelectSubcategory) {
            onSelectSubcategory(null); 
        }
    };

    if (loading) {
        return (
            <div className="w-full max-w-7xl mx-auto px-4 py-3 flex justify-center items-center">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium" style={{ fontFamily: "'Kantumruy Pro', sans-serif" }}>
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span>កំពុងទាញទិន្នន័យ...</span>
                </div>
            </div>
        );
    }

    const hasChildren = selectedCategory && selectedCategory.children && selectedCategory.children.length > 0;

    return (
        <div className="sticky top-[70px] sm:top-[80px] z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-100 transition-all shadow-xs" style={{ fontFamily: "'Kantumruy Pro', sans-serif" }}>
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-2.5 space-y-2.5">
                
                <div className="relative">
                    <div ref={scrollRef} className="flex items-start space-x-4 overflow-x-auto scroll-smooth py-1 [&::-webkit-scrollbar]:hidden">
                        {categories.map((cat) => (
                            <CategoryItem 
                                key={cat.id}
                                category={cat} 
                                isSelected={selectedCategory?.id === cat.id}
                                onSelect={handleSelectCategory} 
                                isScrolled={isScrolled}
                            />
                        ))}
                    </div>
                </div>

                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${hasChildren ? 'max-h-24 opacity-100 pt-1' : 'max-h-0 opacity-0 py-0'}`}>
                    {selectedCategory && (
                        <div className="flex items-center gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden py-1">
                            {selectedCategory.children.map((sub) => {
                                const isSubSelected = selectedSubId == sub.id;
                                return (
                                    <button 
                                        key={sub.id}
                                        onClick={() => onSelectSubcategory && onSelectSubcategory(sub.id)}
                                        className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-full border flex-shrink-0 cursor-pointer transition-all duration-200 text-xs outline-none ${
                                            isSubSelected 
                                                ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-xs' 
                                                : 'bg-slate-50 border-slate-200/80 hover:border-blue-300 text-slate-700 font-medium'
                                        }`}
                                    >
                                        {sub.image_category && (
                                            <img src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${sub.image_category}`} alt="" className="w-3.5 h-3.5 object-cover rounded-full" />
                                        )}
                                        <span className="whitespace-nowrap">{sub.category_name}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}