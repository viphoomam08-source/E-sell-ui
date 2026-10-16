'use client';
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Package, Users, BarChart3, LogOut, Store, ChevronRight, Menu, X, MessageSquare, Bell, AlertTriangle } from 'lucide-react';

import ProductsModule from '../dashboard/component/ProductsModule';
import OrderTable from '../dashboard/component/OrderTable';
import SellerOrderNotifications from '../dashboard/component/SellerOrderNotifications';
import Banner from '../component/banner';
import BannerModul from './component/BannerModul';
import Activity from './component/activity'
import Overview from './component/overview';
import AuditLog from './component/audit';
import Report from './component/Report';
import SellerChatModule from './component/SellerChatModule';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function App() {
  const [activeModule, setActiveModule] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile drawer state

  // 📦 State សម្រាប់ផ្ទុកទិន្នន័យ Stock Alert ដែលទាញយកពី API
  const [stockAlerts, setStockAlerts] = useState([]);
  const [showAlertDropdown, setShowAlertDropdown] = useState(false);

  useEffect(() => {
    // 🔗 បញ្ចូល Google Font (Kantumruy Pro) ដោយស្វ័យប្រវត្តិ
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Kantumruy+Pro:ital,wght@0,100..700;1,100..700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  // 🔍 ហៅ API /alert-stock នៅទីនេះផ្ទាល់ដើម្បី Test មើលសិន
  useEffect(() => {
    const fetchStockAlerts = async () => {
      const token = localStorage.getItem('jwt_token');
      if (!token) return;

      try {
        const res = await fetch(`${API_BASE_URL}/api/alert-stock`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });
        const data = await res.json();
        
        console.log("Stock Alert Response:", data); // 👈 ពិនិត្យមើលទិន្នន័យក្នុង Console 
        
        if (data.data) {
          setStockAlerts(data.data || []);
        }
      } catch (err) {
        console.error('Error fetching stock alerts:', err);
      }
    };

    fetchStockAlerts();
  }, []);

  const handleModuleClick = (module) => {
    setActiveModule(module);
    setSidebarOpen(false); 
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden" style={{ fontFamily: "'Kantumruy Pro', sans-serif" }}>
      
      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 p-6 flex flex-col justify-between shadow-lg lg:shadow-xs
        transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div>
          <div className="flex items-center justify-between px-2 mb-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <span className="text-base font-bold tracking-tight text-slate-800 block">E-Commerce</span>
                <span className="text-xs text-slate-400 font-medium">Admin Panel</span>
              </div>
            </div>
            
            <button 
              onClick={() => setSidebarOpen(false)} 
              className="p-2 text-slate-400 hover:text-slate-600 lg:hidden rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-1.5">
            <button
              onClick={() => handleModuleClick('dashboard')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${
                activeModule === 'dashboard' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3"><LayoutDashboard className="w-4 h-4" /><span>Overview</span></div>
              {activeModule === 'dashboard' && <ChevronRight className="w-4 h-4 opacity-70" />}
            </button>

            <button
              onClick={() => handleModuleClick('products')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${
                activeModule === 'products' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3"><Package className="w-4 h-4" /><span>Products</span></div>
              {activeModule === 'products' && <ChevronRight className="w-4 h-4 opacity-70" />}
            </button>

            <button
              onClick={() => handleModuleClick('banner')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${
                activeModule === 'banner' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3"><Store className="w-4 h-4" /><span>Banner Management</span></div>
              {activeModule === 'banner' && <ChevronRight className="w-4 h-4 opacity-70" />}
            </button>

            <button
              onClick={() => handleModuleClick('order')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${
                activeModule === 'order' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3"><Users className="w-4 h-4" /><span>Order Management</span></div>
              {activeModule === 'order' && <ChevronRight className="w-4 h-4 opacity-70" />}
            </button>

            <button
              onClick={() => handleModuleClick('chat')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${
                activeModule === 'chat' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3"><MessageSquare className="w-4 h-4" /><span>Chat with Buyers</span></div>
              {activeModule === 'chat' && <ChevronRight className="w-4 h-4 opacity-70" />}
            </button>

            <button
              onClick={() => handleModuleClick('reports')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${
                activeModule === 'reports' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3"><BarChart3 className="w-4 h-4" /><span>Reports & Analytics</span></div>
              {activeModule === 'reports' && <ChevronRight className="w-4 h-4 opacity-70" />}
            </button>

            {/* 👇 ប៊ូតុង Audit Logs ដែលបានបន្ថែមនៅទីនេះ */}
            <button
              onClick={() => handleModuleClick('audit')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${
                activeModule === 'audit' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3"><AlertTriangle className="w-4 h-4" /><span>Audit Logs</span></div>
              {activeModule === 'audit' && <ChevronRight className="w-4 h-4 opacity-70" />}
            </button>
          </nav>
        </div>

        <button 
          onClick={() => alert('Logged out!')} 
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-rose-50 text-rose-600 rounded-xl font-medium text-sm hover:bg-rose-100 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" /><span>Log out</span>
        </button>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 z-10">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition lg:hidden cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-800 capitalize truncate max-w-[180px] sm:max-w-none">
                {activeModule === 'dashboard' ? 'Overview Dashboard' : activeModule === 'chat' ? 'Buyer Messages' : `${activeModule} Management`}
              </h1>
              <p className="text-xs text-slate-400 hidden sm:block">Manage your store parameters smoothly.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* 🔔 Stock Alert Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => setShowAlertDropdown(!showAlertDropdown)}
                className="relative w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition cursor-pointer"
              >
                <Bell className="w-5 h-5" />
                {stockAlerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow-sm">
                    {stockAlerts.length}
                  </span>
                )}
              </button>

              {showAlertDropdown && (
                <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-50 text-xs space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 font-bold text-slate-800">
                    <span>Stock Alerts (អស់ស្តុក)</span>
                    <span className="bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full text-[10px]">
                      {stockAlerts.length} items
                    </span>
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-1.5">
                    {stockAlerts.length === 0 ? (
                      <div className="text-center py-6 text-slate-400">គ្មានទំនិញអស់ស្តុកទេ 👍</div>
                    ) : (
                      stockAlerts.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 p-2 bg-rose-50/50 rounded-xl border border-rose-100">
                          <div className="w-9 h-9 rounded-lg bg-white overflow-hidden flex-shrink-0 border border-rose-200">
                            <img 
                              src={`${API_BASE_URL}/storage/${item.product_image || item.image}`} 
                              alt={item.product_name} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="overflow-hidden flex-1">
                            <p className="font-bold text-slate-800 truncate">{item.product_name}</p>
                            <p className="text-[10px] text-rose-600 font-semibold flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> អស់ស្តុក ($ {item.product_price})
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <SellerOrderNotifications onOpenOrders={() => setActiveModule('order')} />

            <div className="flex items-center gap-3 pl-2 sm:pl-4 border-l border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                AD
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-slate-800">Seller</p>
                <p className="text-xs text-slate-400">Seller</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Component Rendering */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto h-full">
            {activeModule === 'dashboard' && <Overview />}
            {activeModule === 'products' && <ProductsModule />} 
            {activeModule === 'banner' && <BannerModul />}
            {activeModule === 'order' && <OrderTable />}
            {activeModule === 'chat' && <SellerChatModule />}
            {activeModule === 'reports' && <Report />}
            {activeModule === 'audit' && <AuditLog />}
          </div>
        </main>

      </div>
    </div>
  );
}