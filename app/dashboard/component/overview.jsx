import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Activity from './activity';
const emptyProfitData = {
  total_orders: 0,
  total_revenue: 0,
  total_cost: 0,
  total_profit: 0,
  total_items_sold: 0,
  daily_breakdown: [],
};

function Overview() {
  const [loading, setLoading] = useState(true);
  const [profitData, setProfitData] = useState(emptyProfitData);
  const [error, setError] = useState(null);


  const fetchProfitOverview = async () => {
  try {
    const token = localStorage.getItem('access_token')
      || localStorage.getItem('token')
      || localStorage.getItem('jwt_token');

    if (!token) {
      setError('សូមធ្វើការ Login ជាមុនសិន (រកមិនឃើញ Token)');
      setLoading(false);
      return;
    }

    const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '');

    const response = await axios.get(`${API_URL}/api/seller-profit`, {
      headers: {
        Authorization: `Bearer ${token}` // ចំណុចនេះសំខាន់បំផុត ដើម្បីកុំឱ្យចេញ 401
      }
    });

    if (response.data.status) {
      setProfitData(response.data.data);
    }
  } catch (err) {
    console.error(err);
    if (err.response && err.response.status === 401) {
      setError('Token របស់អ្នកបានផុតកំណត់ ឬគ្មានសិទ្ធិ访问 (Unauthorized)។ សូម Login ម្តងទៀត។');
    } else {
      setError('មិនអាចទាញយកទិន្នន័យប្រាក់ចំណេញបានទេ។ សូមព្យាយាមម្តងទៀត។');
    }
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchProfitOverview();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">ផ្ទាំងគ្រប់គ្រងប្រាក់ចំណេញ (Profit Overview)</h1>
        <p className="text-sm text-slate-500">ពិនិត្យមើលចំណូល ដើមទុន និងប្រាក់ចំណេញសរុបរបស់អ្នកនៅទីនេះ។</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* ចំណូលសរុប */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">ចំណូលសរុប (Revenue)</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">${Number(profitData.total_revenue).toLocaleString()}</h3>
          </div>
         
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
 <Activity/>
        {/* ដើមទុនសរុប */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">ដើមទុនសរុប (Total Cost)</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">${Number(profitData.total_cost).toLocaleString()}</h3>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        </div>

        {/* ប្រាក់ចំណេញសុទ្ធ */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">ប្រាក់ចំណេញសុទ្ធ (Net Profit)</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">${Number(profitData.total_profit).toLocaleString()}</h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">ទំនិញបានលក់ (Items Sold)</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{Number(profitData.total_items_sold).toLocaleString()} ផលិតផល</h3>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Daily Breakdown Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800">របាយការណ៍លម្អិតតាមថ្ងៃ (Daily Breakdown)</h3>
          <p className="mt-1 text-sm text-slate-500">
            សរុបមាន {Number(profitData.total_orders).toLocaleString()} ការបញ្ជាទិញ
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="py-3 px-6">កាលបរិច្ឆេទ (Date)</th>
                <th className="py-3 px-6">ការបញ្ជាទិញ (Orders)</th>
                <th className="py-3 px-6">ចំនួនលក់ (Qty)</th>
                <th className="py-3 px-6">ចំណូល (Revenue)</th>
                <th className="py-3 px-6">ដើមទុន (Cost)</th>
                <th className="py-3 px-6">ប្រាក់ចំណេញ (Profit)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
              {profitData.daily_breakdown && profitData.daily_breakdown.length > 0 ? (
                profitData.daily_breakdown.map((row, index) => (
                  <tr key={index} className="hover:bg-slate-50/50 transition">
                    <td className="py-4 px-6 font-medium text-slate-800">{row.date}</td>
                    <td className="py-4 px-6">{row.order_count}</td>
                    <td className="py-4 px-6">{row.items_sold}</td>
                    <td className="py-4 px-6">${Number(row.revenue).toLocaleString()}</td>
                    <td className="py-4 px-6">${Number(row.cost).toLocaleString()}</td>
                    <td className="py-4 px-6 font-semibold text-emerald-600">${Number(row.profit).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-6 text-center text-slate-400">
                    {loading ? 'កំពុងទាញយកទិន្នន័យ...' : 'គ្មានទិន្នន័យបង្ហាញ'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Overview;