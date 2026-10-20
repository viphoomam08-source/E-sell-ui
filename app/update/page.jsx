"use client";

import React, { useState, useEffect } from 'react';
import { CalendarDays, Heart, Megaphone, ShieldCheck, Sparkles, Zap, MessageCircle, X, Send, Lock, LogIn } from 'lucide-react';

export default function WhatsNewPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [unauthMessage, setUnauthMessage] = useState("");
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const [newCommentText, setNewCommentText] = useState("");

  const API = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchNews = async () => {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');

      if (!token) {
        setIsLoggedIn(false);
        setUnauthMessage("please login to see news update!");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API}/api/show-news`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const result = await response.json();

        if (response.status === 401 || result.status === false) {
          setIsLoggedIn(false);
          setUnauthMessage(result.message || "please login to see news update!");
          return;
        }

        if (response.ok && (result.status === true || result.messsage === "true")) {
          setIsLoggedIn(true);
          const rawData = Array.isArray(result.data) ? result.data : [];

          const formattedPosts = rawData.map((item) => ({
            id: item.id,
            title: item.big_tile,
            tag: item.sub_title || 'System Update',
            date: item.created_at ? new Date(item.created_at).toLocaleDateString('km-KH') : '',
            content: item.decribe,
            image: item.image || '',
            video: item.video || null,
            likes: item.likes || 0,
            isLiked: false,
            comments: item.comments || []
          }));

          setPosts(formattedPosts);
        }
      } catch (error) {
        console.error('Failed to fetch news updates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [API]);

  const handleLike = (id) => {
    setPosts((currentPosts) => currentPosts.map((post) => {
      if (post.id !== id) return post;
      return {
        ...post,
        likes: post.isLiked ? post.likes - 1 : post.likes + 1,
        isLiked: !post.isLiked
      };
    }));
  };

  const handleAddComment = (postId, e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    setPosts((currentPosts) => currentPosts.map((post) => {
      if (post.id !== postId) return post;
      return {
        ...post,
        comments: [
          ...(post.comments || []),
          { id: Date.now(), user: "អ្នកប្រើប្រាស់", text: newCommentText }
        ]
      };
    }));
    setNewCommentText("");
  };

  const activePost = posts.find(p => p.id === activeCommentPostId);

  // 🔒 ករណីមិនទាន់ Login (Not Authenticated)
  if (!isLoggedIn && !loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">តម្រូវឱ្យចូលគណនី</h2>
          <p className="text-xs text-slate-500 leading-relaxed mb-6">
            {unauthMessage || "សូមចូលគណនីជាមុនសិន ដើម្បីមើល និងទាក់ទងជាមួយព័ត៌មានអាប់ដេត!"}
          </p>
          <a
            href="/login"
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-blue-600 text-white font-semibold text-xs shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-colors"
          >
            <LogIn className="w-4 h-4" />
            <span>ចូលទៅកាន់ទំព័រ Login</span>
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8 relative">
      <div className="mx-auto max-w-7xl">
        <section className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 px-6 py-8 text-white shadow-xl shadow-blue-900/10 sm:px-10 sm:py-10">
          <div className="absolute -right-12 -top-20 -z-10 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-24 right-1/4 -z-10 h-48 w-48 rounded-full bg-indigo-300/20 blur-2xl" />

          <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-blue-50 backdrop-blur-sm">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                E-SELL NEWSROOM
              </div>
              <h1 className="flex items-center gap-3 text-2xl font-extrabold leading-tight sm:text-4xl">
                <Megaphone className="h-7 w-7 shrink-0 text-blue-100 sm:h-9 sm:w-9" aria-hidden="true" />
                ដំណឹង និងមុខងារថ្មីៗ
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100 sm:text-base">
                តាមដានមុខងារថ្មីៗ ការកែលម្អ និងព័ត៌មានពីហាង E-Sell របស់យើង។
              </p>
            </div>

            <div className="flex items-center gap-3 self-start rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-sm sm:self-auto">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                <Megaphone className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-2xl font-extrabold leading-none">{posts.length}</p>
                <p className="mt-1 text-xs font-medium text-blue-100">ការអាប់ដេត</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto mt-8 max-w-5xl">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Stay in the loop</p>
              <h2 className="mt-1 text-xl font-extrabold text-slate-800 sm:text-2xl">ព័ត៌មានថ្មីៗ</h2>
            </div>
            <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
              {posts.length} updates
            </span>
          </div>

          {loading ? (
            <div className="text-center py-20 text-slate-400 text-sm">កំពុងផ្ទុកទិន្នន័យ... (Loading updates...)</div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 text-slate-400 text-sm">មិនទាន់មានការអាប់ដេតនៅឡើយទេ</div>
          ) : (
            <div className="space-y-4">
              {posts.map((post, index) => {
                const isFeature = post.tag === 'New Feature';
                const UpdateIcon = isFeature ? Zap : ShieldCheck;

                return (
                  <article
                    key={post.id}
                    className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg hover:shadow-slate-900/5 sm:p-6"
                  >
                    <div className="flex gap-4 sm:gap-5">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl sm:h-14 sm:w-14 ${
                        isFeature ? 'bg-blue-50 text-blue-600' : 'bg-indigo-50 text-indigo-600'
                      }`}>
                        <UpdateIcon className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden="true" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                            isFeature ? 'bg-blue-50 text-blue-700' : 'bg-indigo-50 text-indigo-700'
                          }`}>
                            {post.tag}
                          </span>
                          {index === 0 && (
                            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                              Latest
                            </span>
                          )}
                          {post.date && (
                            <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                              <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                              {post.date}
                            </span>
                          )}
                        </div>

                        <h3 className="mt-3 text-base font-bold leading-7 text-slate-800 transition-colors group-hover:text-blue-700 sm:text-lg">
                          {post.title}
                        </h3>
                        
                        <p className="mt-2 text-sm leading-7 text-slate-600">
                          {post.content}
                        </p>

                        {/* 🖼️ រូបភាពប្រកាស */}
                        {post.image && (
                          <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                            <img 
                              src={post.image} 
                              alt={post.title} 
                              className="h-auto w-full max-h-80 object-cover transition-transform duration-300 group-hover:scale-[1.01]"
                            />
                          </div>
                        )}

                        {/* 🎬 វីដេអូប្រកាស */}
                        {post.video && (
                          <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-black">
                            <video src={post.video} controls className="h-auto w-full max-h-80 object-contain" />
                          </div>
                        )}

                        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => handleLike(post.id)}
                              className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
                                post.isLiked
                                  ? 'border-rose-100 bg-rose-50 text-rose-600 hover:bg-rose-100'
                                  : 'border-slate-200 bg-white text-slate-600 hover:border-rose-100 hover:bg-rose-50 hover:text-rose-600'
                              }`}
                            >
                              <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} aria-hidden="true" />
                              {post.likes} ចូលចិត្ត
                            </button>

                            <button
                              type="button"
                              onClick={() => setActiveCommentPostId(post.id)}
                              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-blue-600"
                            >
                              <MessageCircle className="h-4 w-4" />
                              មតិយោបល់ ({post.comments?.length || 0})
                            </button>
                          </div>

                          <span className="text-xs font-medium text-slate-400">E-Sell • Official update</span>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* 📱 SLIDE-OVER COMMENT PANEL */}
      <div className={`fixed inset-0 z-50 overflow-hidden transition-all duration-300 ${activeCommentPostId ? 'visible opacity-100' : 'invisible opacity-0'}`}>
        <div 
          className={`absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300 ${activeCommentPostId ? 'opacity-100' : 'opacity-0'}`} 
          onClick={() => setActiveCommentPostId(null)} 
        />

        <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
          <div className={`w-screen max-w-md bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${activeCommentPostId ? 'translate-x-0' : 'translate-x-full'}`}>
            
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-blue-600" />
                <h3 className="font-bold text-slate-800 text-base">មតិយោបល់ ({activePost?.comments?.length || 0})</h3>
              </div>
              <button 
                onClick={() => setActiveCommentPostId(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {(!activePost?.comments || activePost.comments.length === 0) ? (
                <p className="text-center text-slate-400 text-sm py-10">មិនទាន់មានមតិយោបល់នៅឡើយទេ...</p>
              ) : (
                activePost.comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {comment.user ? comment.user.charAt(0) : 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-slate-800">{comment.user}</span>
                        <span className="text-[10px] text-slate-400">ទើបតែឥឡូវ</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{comment.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={(e) => handleAddComment(activePost?.id, e)} className="p-4 border-t border-slate-100 bg-white">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="សរសេរមតិយោបល់របស់អ្នក..."
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-xs focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-white transition-colors hover:bg-blue-700"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>

          </div>
        </div>
      </div>
    </main>
  );
}