'use client';

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  BarChart3, 
  RefreshCw, 
  ChevronRight, 
  Minus, 
  Plus,
  Send
} from 'lucide-react';

export default function SuperAdminReports() {
  const [activeTab, setActiveTab] = useState('Revenue by Period');
  const [periodType, setPeriodType] = useState('Daily');
  const [limitCount, setLimitCount] = useState(30);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);

  // States សម្រាប់ទិន្នន័យដាច់ដោយឡែកពីគ្នា
  const [todayData, setTodayData] = useState([]);
  const [yesterdayData, setYesterdayData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(false);

  const getHeaders = () => {
    const token = localStorage.getItem('token') || localStorage.getItem('access_token') || localStorage.getItem('jwt_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const API_url = process.env.NEXT_PUBLIC_API_URL;

  // 🔄 ទាញយកទិន្នន័យតាមប្រភេទ Period
  const fetchReportData = async (type = periodType) => {
    setIsRefreshing(true);
    setLoading(true);
    try {
      const headers = getHeaders();
      let endpoint = `${API_url}/api/reports/today`;

      if (type === 'Weekly') endpoint = `${API_url}/api/reports/yesterday`;
      if (type === 'Monthly') endpoint = `${API_url}/api/reports/monthly`;

      const res = await fetch(endpoint, { headers });
      const json = await res.json();
      const resultData = json.data || [];

      if (type === 'Daily') setTodayData(resultData);
      if (type === 'Weekly') setYesterdayData(resultData);
      if (type === 'Monthly') setMonthlyData(resultData);

    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  };

  // 🚀 មុខងារសម្រាប់ហៅ Dispatch Report API (ចូល Queue)
  const handleDispatchReport = async () => {
    setIsDispatching(true);
    try {
      const headers = getHeaders();
      const response = await fetch(`${API_url}/api/reports/dispatch`, {
        method: 'POST',
        headers: headers,
      });
      
      const result = await response.json();
      if (response.ok) {
        alert('Success: Report successfully dispatched to queue!');
      } else {
        alert('Error: ' + (result.message || 'Something went wrong'));
      }
    } catch (error) {
      console.error('Error dispatching report:', error);
      alert('Network error while dispatching report.');
    } finally {
      setIsDispatching(false);
    }
  };

  useEffect(() => {
    fetchReportData(periodType);
  }, [periodType]);

  const handleRefresh = () => {
    fetchReportData(periodType);
  };

  // គណនាសរុបទឹកប្រាក់ និងចំនួន Order
  const totalTodayRevenue = todayData.reduce((acc, item) => acc + parseFloat(item.total_amount || item.amount || 0), 0);
  const totalMonthlyRevenue = monthlyData.reduce((acc, item) => acc + parseFloat(item.total_amount || item.amount || 0), 0);

  const totalTodayOrders = todayData.length;
  const totalMonthlyOrders = monthlyData.length;

  return (
    <div className="min-h-screen bg-slate-50 font-['Kantumruy_Pro'] text-slate-800 p-4 sm:p-6 space-y-6">
      
      {/* 1. TOP TABS BAR */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-100 transition cursor-pointer">
          <LayoutDashboard className="w-4 h-4 text-blue-600" /> Dashboard
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-lg text-xs font-semibold text-indigo-700 shadow-2xs">
          <BarChart3 className="w-4 h-4 text-indigo-600" /> Report Dashboard 
          <span className="ml-1 text-indigo-400 hover:text-indigo-700 font-bold">×</span>
        </button>
      </div>

      {/* 2. HEADER & ACTION BUTTONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Sell Reports
        </h1>
        <div className="flex items-center gap-2">
          {/* Dispatch Button */}
          <button 
            onClick={handleDispatchReport}
            disabled={isDispatching}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-2xs transition active:scale-95 cursor-pointer w-fit disabled:opacity-50"
          >
            <Send className={`w-3.5 h-3.5 ${isDispatching ? 'animate-pulse' : ''}`} /> 
            {isDispatching ? 'Dispatching...' : 'Dispatch Report'}
          </button>

          {/* Refresh Button */}
          <button 
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold shadow-2xs transition active:scale-95 cursor-pointer w-fit"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} /> 
            Refresh
          </button>
        </div>
      </div>

      {/* 3. METRIC CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Revenue</span>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">${totalTodayRevenue.toFixed(2)}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">This Month Revenue</span>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">${totalMonthlyRevenue.toFixed(2)}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Orders</span>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{totalTodayOrders}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Monthly Volume</span>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-blue-600">{totalMonthlyOrders}</span>
          </div>
        </div>
      </div>

      {/* 4. TABS SUB SECTION */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 sm:p-6 space-y-6">
        <div className="flex items-center gap-6 border-b border-slate-200 overflow-x-auto pb-3 text-sm font-semibold">
          {['Revenue by Period', 'Top Products', 'Status Breakdown', 'Customers', 'Product Performance'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 relative transition whitespace-nowrap cursor-pointer ${
                activeTab === tab ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-[-13px] left-0 w-full h-[3px] bg-blue-600 rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        {/* 5. FILTER CONTROLS */}
        <div className="flex flex-wrap items-center gap-3">
          <select 
            value={periodType}
            onChange={(e) => setPeriodType(e.target.value)}
            className="px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-700 focus:outline-blue-600 cursor-pointer"
          >
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
          </select>

          <div className="flex items-center bg-white border border-slate-300 rounded-xl overflow-hidden shadow-2xs">
            <button 
              onClick={() => setLimitCount(Math.max(1, limitCount - 1))}
              className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 transition cursor-pointer border-r border-slate-300"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="px-4 text-xs font-bold text-slate-800 min-w-[45px] text-center">
              {limitCount}
            </span>
            <button 
              onClick={() => setLimitCount(limitCount + 1)}
              className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 transition cursor-pointer border-l border-slate-300"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <button 
            onClick={() => fetchReportData(periodType)}
            className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold shadow-2xs transition cursor-pointer active:scale-95"
          >
            <ChevronRight className="w-4 h-4 text-blue-600" /> {loading ? 'Loading...' : 'Load'}
          </button>
        </div>

        {/* 6. DATA TABLE */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider">
                <th className="p-4">Period / Created At</th>
                <th className="p-4">Order ID</th>
                <th className="p-4">Total Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {(() => {
                let currentList = monthlyData;
                if (periodType === 'Daily') currentList = todayData;
                if (periodType === 'Weekly') currentList = yesterdayData;

                return currentList.length > 0 ? (
                  currentList.slice(0, limitCount).map((item, index) => (
                    <tr key={index} className="hover:bg-slate-50/80 transition">
                      <td className="p-4 text-slate-700 font-mono text-xs">{item.created_at}</td>
                      <td className="p-4 text-slate-800 font-semibold">{item.id || item.order_id || 'N/A'}</td>
                      <td className="p-4 text-slate-800 font-semibold">${item.total_amount || item.amount || '0.00'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="p-6 text-center text-slate-400">
                      {loading ? 'Fetching report data...' : `No orders found for ${periodType} period.`}
                    </td>
                  </tr>
                );
              })()}
            </tbody>
          </table>
        </div>

        {/* 7. TABLE SUMMARY FOOTER */}
        <div className="text-sm font-extrabold text-slate-900 pt-2">
          Total Orders Count: {
            periodType === 'Daily' ? todayData.length : periodType === 'Weekly' ? yesterdayData.length : monthlyData.length
          }
        </div>
      </div>

      {/* 8. FOOTER COPYRIGHT */}
      <div className="text-center text-xs text-slate-400 py-4">
        Copyright ©2026-present ElementAdmin
      </div>

    </div>
  );
} 