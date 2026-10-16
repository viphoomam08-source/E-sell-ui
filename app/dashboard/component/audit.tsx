'use client';
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Clock, User, AlertCircle, RefreshCw } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAuditLogs = async () => {
    setLoading(true);
    const token = localStorage.getItem('jwt_token');
    
    if (!token) {
      setError('Please login first.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/getLog`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      const data = await res.json();

      if (data.status) {
        setLogs(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch audit logs.');
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      setError('An error occurred while fetching logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
      {/* Header section */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Audit Logs</h2>
            <p className="text-xs text-slate-400">Track all your store activities and modifications.</p>
          </div>
        </div>

        <button 
          onClick={fetchAuditLogs}
          className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-medium transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Content section */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Loading audit logs...</div>
      ) : error ? (
        <div className="flex items-center gap-2 p-4 bg-rose-50 text-rose-600 rounded-xl text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm">No activity logs found today.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition">
                  <td className="py-3 px-4 font-semibold text-slate-700">
                    <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-bold border border-amber-200">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{log.description}</td>
                  <td className="py-3 px-4 text-xs text-slate-400 flex items-center gap-1.5 pt-4">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table> 
        </div>
      )}
    </div>  
  );
}