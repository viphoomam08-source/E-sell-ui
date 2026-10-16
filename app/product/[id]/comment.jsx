'use client';
import React, { useState, useEffect } from 'react';
import { Send, MessageSquare, CornerDownRight, User, ChevronDown, ChevronUp } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.4.52:8000';

export default function ProductComments({ productSellerId, sellerId }) {
  const [comments, setComments] = useState([]);
  const [message, setMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // State សម្រាប់គ្រប់គ្រងការបើក/បិទ Comment Section យ៉ាងរលូន
  const [isOpen, setIsOpen] = useState(true);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('buyer_token') || localStorage.getItem('access_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
  };

  const fetchComments = async () => {
    setLoading(true);
    try {
const res = await fetch(`${API_URL}/api/product-comments/${productSellerId}`, {
            method: 'GET',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.status) {
        setComments(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productSellerId) {
      fetchComments();
    }
  }, [productSellerId]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSubmitting(true);
    const formData = {
      product_seller_id: productSellerId,
      seller_id: sellerId || null,
      parent_id: replyingTo ? replyingTo.id : null,
      message: message,
    };

    try {
      const res = await fetch(`${API_URL}/api/comment`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok || data.status) {
        setMessage('');
        setReplyingTo(null);
        fetchComments();
      } else {
        alert(data.message || 'មិនអាចបញ្ជូនមតិយោបល់បានទេ');
      }
    } catch (err) {
      console.error('Error posting comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm max-w-2xl mx-auto font-['Kantumruy_Pro'] overflow-hidden transition-all duration-300">
      
      {/* Header (ចុចដើម្បីបើក/បិទ) */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between p-4 sm:p-5 bg-slate-50/70 hover:bg-slate-100/60 cursor-pointer transition-colors border-b border-slate-100"
      >
        <div className="flex items-center gap-2.5">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-slate-800 text-xs sm:text-sm">
            មតិយោបល់លើផលិតផល ({comments.length})
          </h3>
        </div>
        <button className="p-1 text-slate-500 hover:text-slate-700 transition-transform duration-300">
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* Container សម្រាប់អូសបិទបើកយ៉ាងរលូន (Smooth Collapse) */}
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[1000px] opacity-100 p-4 sm:p-6' : 'max-h-0 opacity-0 py-0 px-4 sm:px-6'}`}>
        
        {/* Form សរសេរ Comment */}
        <form onSubmit={handleSubmitComment} className="mb-6">
          {replyingTo && (
            <div className="flex items-center justify-between bg-blue-50 px-3 py-1.5 rounded-xl text-xs text-blue-700 mb-2">
              <span>កំពុងតបទៅកាន់: <strong>{replyingTo.buyer?.username || 'អតិថិជន'}</strong></span>
              <button 
                type="button" 
                onClick={() => setReplyingTo(null)}
                className="text-red-500 hover:underline font-bold"
              >
                បោះបង់
              </button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={replyingTo ? "សរសេរសារតប..." : "សរសេរមតិយោបល់របស់អ្នកទីនេះ..."}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              required
            />
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-xl transition text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer disabled:opacity-50"
            >
              <span>{submitting ? 'កំពុងផ្ញើ...' : 'បញ្ជូន'}</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        {/* បញ្ជីបង្ហាញ Comments */}
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
          {loading ? (
            <div className="text-center text-xs text-slate-400 py-6">កំពុងទាញយកមតិយោបល់...</div>
          ) : comments.length === 0 ? (
            <div className="text-center text-xs text-slate-400 py-6">មិនទាន់មានមតិយោបល់នៅឡើយទេ ជាអ្នកដំបូងគេឡើយ!</div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="space-y-3">
                {/* Main Comment */}
                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                    {comment.buyer?.username ? comment.buyer.username.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-xs text-slate-800">
                        {comment.buyer?.username || 'អតិថិជន'}
                      </h4>
                      <span className="text-[10px] text-slate-400">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed mb-2">{comment.message}</p>
                    
                    <button
                      onClick={() => setReplyingTo(comment)}
                      className="text-[11px] text-blue-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <CornerDownRight className="w-3 h-3" /> តបសារ (Reply)
                    </button>
                  </div>
                </div>

                {/* Reply Comments (បើមាន) */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="pl-8 space-y-2 border-l-2 border-slate-200 ml-4">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="flex items-start gap-2.5 p-2.5 bg-slate-50/60 rounded-xl border border-slate-100">
                        <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                          {reply.seller ? 'ហាង' : 'B'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <h5 className="font-bold text-[11px] text-slate-800">
                              {reply.seller ? (reply.seller.seller_name || 'ម្ចាស់ហាង') : (reply.buyer?.username || 'អតិថិជន')}
                            </h5>
                            <span className="text-[9px] text-slate-400">
                              {new Date(reply.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-relaxed">{reply.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}