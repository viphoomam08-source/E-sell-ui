"use client";
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import ProTable from './table/proTable'
import AddProuct from './modal/addProuct'
export default function ProductsModule() {
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState(''); 
    

    return (
        <>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                <h2 className="text-lg font-bold text-slate-800 mb-1">Product Management Module</h2>
                <p className="text-sm text-slate-500">see your product</p>
                
                <div className="w-full bg-slate-50 p-4 rounded-xl mt-6 flex flex-wrap items-center gap-4 border border-slate-200">
                    
                 <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="search" 
                            name="keywords" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search products..." 
                            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" 
                        />
                    </div>

                    <div className="relative">
                        <input 
                            type="date" 
                            className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                        />
                    </div>
                    <button onClick={() => setOpen(true)} className='w-[150px] cursor-pointer p-2 rounded-xl font-bold bg-sky-400 text-white hover:bg-sky-500 transition'>
                        Add new Product
                    </button>
                </div>

                {open && (
                    <AddProuct onClose={() => setOpen(false)} onSuccess={() => setOpen(false)} />
                )}
            </div>

                
         
           <div className='m-3'>
                <ProTable searchTerm={searchTerm} />
            </div>
        </>
    );
}