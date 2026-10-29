'use client';
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Package, Users, BarChart3, LogOut, Store, ChevronRight, Menu, X, MessageSquare, Bell, AlertTriangle, Lock } from 'lucide-react';

import ProductsModule from '../dashboard/component/ProductsModule';
import OrderTable from '../dashboard/component/OrderTable';
import SellerOrderNotifications from '../dashboard/component/SellerOrderNotifications';
import Banner from '../component/banner';
import BannerModul from './component/BannerModul';
import Activity from './component/activity';
import Overview from './component/overview';
import Messager from '../component/messager'; // 👈 ត្រូវទីតាំង និងឈ្មោះ File ត្រឹមត្រូវ
import DailyPost from './component/DailyPost';
import AuditLog from './component/audit';
import Report from './component/Report';
import SellerChatModule from './component/SellerChatModule';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function App() {
  const [activeModule, setActiveModule] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 📦 State សម្រាប់ផ្ទុកសិទ្ធិ (Permissions) របស់ Seller គ្រប់ Column ទាំងអស់
  const [permissions, setPermissions] = useState({
    is_featured: false,
    banner_management: false,
    order_management: false,
    chat_with_buyers: false,
    reports_analytics: false,
    audit_log: false,
  });

  // 📦 State សម្រាប់ផ្ទុកទិន្នន័យ Stock Alert
  const [stockAlerts, setStockAlerts] = useState([]);
  const [showAlertDropdown, setShowAlertDropdown] = useState(false);

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Kantumruy+Pro:ital,wght@0,100..700;1,100..700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  // 🔍 ហៅ API ទាញយក Profile / Permissions របស់ Seller ដែលកំពុង Login
  useEffect(() => {
    const fetchSellerPermissions = async () => {
      const token = localStorage.getItem('jwt_token') || localStorage.getItem('token');
      if (!token) return;

      try {
        const res = await fetch(`${API_BASE_URL}/api/seller/profile`, { 
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });
        const data = await res.json();
        
        if (data && data.seller) {
          setPermissions({
            is_featured: Boolean(data.seller.is_featured),
            banner_management: Boolean(data.seller.banner_management),
            order_management: Boolean(data.seller.order_management),
            chat_with_buyers: Boolean(data.seller.chat_with_buyers),
            reports_analytics: Boolean(data.seller.reports_analytics),
            audit_log: Boolean(data.seller.audit_log),
          });
        }
      } catch (err) {
        console.error('Error fetching seller permissions:', err);
      }
    };

    fetchSellerPermissions();
  }, []);

  // 🔍 ហៅ API /alert-stock
  useEffect(() => {
    const fetchStockAlerts = async () => {
      const token = localStorage.getItem('jwt_token') || localStorage.getItem('access_token');
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
        if (data.data) {
          setStockAlerts(data.data || []);
        }
      } catch (err) {
        console.error('Error fetching stock alerts:', err);
      }
    };

    fetchStockAlerts();
  }, []);

  // 🛡️ មុខងារសម្រាប់ពេលចុចលើ Menu
  const handleModuleClick = (moduleName, isAllowed) => {
    if (!isAllowed) {
      alert("🔒 មុខងារនេះត្រូវបានចាក់សោ (Locked)។ សូមទំនាក់ទំនងទៅកាន់ Admin!");
      return;
    }
    setActiveModule(moduleName);
    setSidebarOpen(false); 
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden" style={{ fontFamily: "'Kantumruy Pro', sans-serif" }}>
      
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
                <span className="text-xs text-slate-400 font-medium">Seller Panel</span>
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
            {/* Overview (Always Open) */}
            <button
              onClick={() => handleModuleClick('dashboard', true)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${
                activeModule === 'dashboard' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3"><LayoutDashboard className="w-4 h-4" /><span>Overview</span></div>
              {activeModule === 'dashboard' && <ChevronRight className="w-4 h-4 opacity-70" />}
            </button>

            {/* Products (Always Open) */}
            <button
              onClick={() => handleModuleClick('products', true)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${
                activeModule === 'products' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3"><Package className="w-4 h-4" /><span>Products</span></div>
              {activeModule === 'products' && <ChevronRight className="w-4 h-4 opacity-70" />}
            </button>
             <button
              onClick={() => handleModuleClick('message', true)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${
                activeModule === 'products' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3"><Package className="w-4 h-4" /><span>Message</span></div>
              {activeModule === 'message' && <ChevronRight className="w-4 h-4 opacity-70" />}
            </button>

            {/* 🛡️ Banner Management */}
            <button
              onClick={() => handleModuleClick('banner', permissions.banner_management)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${
                !permissions.banner_management ? 'bg-slate-100 text-slate-400 cursor-not-allowed' :
                activeModule === 'banner' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Store className="w-4 h-4" />
                <span>Banner Management</span>
              </div>
              {!permissions.banner_management ? <Lock className="w-4 h-4 text-slate-400" /> : activeModule === 'banner' && <ChevronRight className="w-4 h-4 opacity-70" />}
            </button>

            {/* 🛡️ Order Management */}
            <button
              onClick={() => handleModuleClick('order', permissions.order_management)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${
                !permissions.order_management ? 'bg-slate-100 text-slate-400 cursor-not-allowed' :
                activeModule === 'order' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4" />
                <span>Order Management</span>
              </div>
              {!permissions.order_management ? <Lock className="w-4 h-4 text-slate-400" /> : activeModule === 'order' && <ChevronRight className="w-4 h-4 opacity-70" />}
            </button>

            {/* 🛡️ Chat with Buyers */}
            <button
              onClick={() => handleModuleClick('chat', permissions.chat_with_buyers)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${
                !permissions.chat_with_buyers ? 'bg-slate-100 text-slate-400 cursor-not-allowed' :
                activeModule === 'chat' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4" />
                <span>Chat with Buyers</span>
              </div>
              {!permissions.chat_with_buyers ? <Lock className="w-4 h-4 text-slate-400" /> : activeModule === 'chat' && <ChevronRight className="w-4 h-4 opacity-70" />}
            </button>

            {/* 🛡️ Reports & Analytics */}
            <button
              onClick={() => handleModuleClick('reports', permissions.reports_analytics)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${
                !permissions.reports_analytics ? 'bg-slate-100 text-slate-400 cursor-not-allowed' :
                activeModule === 'reports' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <BarChart3 className="w-4 h-4" />
                <span>Reports & Analytics</span>
              </div>
              {!permissions.reports_analytics ? <Lock className="w-4 h-4 text-slate-400" /> : activeModule === 'reports' && <ChevronRight className="w-4 h-4 opacity-70" />}
            </button>

            {/* 🛡️ Audit Logs */}
            <button
              onClick={() => handleModuleClick('audit', permissions.audit_log)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${
                !permissions.audit_log ? 'bg-slate-100 text-slate-400 cursor-not-allowed' :
                activeModule === 'audit' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-4 h-4" />
                <span>Audit Logs</span>
              </div>
              {!permissions.audit_log ? <Lock className="w-4 h-4 text-slate-400" /> : activeModule === 'audit' && <ChevronRight className="w-4 h-4 opacity-70" />}
            </button>

            {/* Daily Post */}
            <button
              onClick={() => handleModuleClick('daily', true)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${
                activeModule === 'daily' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3"><AlertTriangle className="w-4 h-4" /><span>Daily Post</span></div>
              {activeModule === 'daily' && <ChevronRight className="w-4 h-4 opacity-70" />}
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

      {/* Main Container */}
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
            {activeModule === 'daily' && <DailyPost />}
            {activeModule === 'message' && <Messager />}
          </div>
        </main>
      </div>
    </div>
  );


}