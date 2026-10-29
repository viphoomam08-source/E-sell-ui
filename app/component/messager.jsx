import React, { useState, useEffect, useRef } from 'react';

export default function Messager() {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

  const getToken = () => {
    return (
      localStorage.getItem('seller_token') ||
      localStorage.getItem('access_token') ||
      localStorage.getItem('jwt_token') ||
      localStorage.getItem('token')
    );
  };
  console.log("🔍 Token ທີ່ກำลังໃຊ້:", getToken); 
  useEffect(() => {
    fetchMessages();
  }, []);
  
  const fetchMessages = async () => {
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/seller/chat/send`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      const data = await res.json();
      
      const msgList = data.messages || data.data;
      if (Array.isArray(msgList)) {
        setMessages(msgList); 
      }
    } catch (err) {
      console.error('Error fetching chat:', err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    const token = getToken();
    if (!token) {
      alert('សូម Login');
      return;
    }

    const textToSend = messageText;
    setMessageText('');

    const tempId = Date.now();
    const tempMessage = {
      id: tempId,
      sender_type: 'seller',
      message: textToSend,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMessage]);

    try {
      const res = await fetch(`${API_BASE_URL}/api/seller/chat/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ message: textToSend }),
      });

      const data = await res.json();
      
      // 2. ពិនិត្យមើលថាតើ Server ផ្ញើសារពិតប្រាកដមកវិញ ឬត់អត់
      const savedMessage = data.message || data.data;

      if (res.ok && (data.status === 'success' || savedMessage)) {
        // ជំនួស Temporary Message ជាមួយសារពិតដែលមាន ID មកពី Database
        if (savedMessage) {
          setMessages((prev) => 
            prev.map((msg) => (msg.id === tempId ? savedMessage : msg))
          );
        }
      } else {
        console.error('Server error saving message:', data);
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] w-full bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex font-['Kantumruy_Pro']">
      
      {/* Sidebar Info */}
      <div className="w-80 border-r border-slate-200 hidden sm:flex flex-col bg-slate-50/50 p-4">
        <h2 className="text-lg font-bold text-slate-800 mb-1 flex items-center gap-2">
          <span>🛡️</span> ឆាតផ្ទាល់ជាមួយ Admin
        </h2>
        <p className="text-[11px] text-slate-400">ប្រព័ន្ធជំនួយ និងទំនាក់ទំនងរដ្ឋបាល</p>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col bg-slate-50/30">
        
        {/* Header */}
        <div className="h-16 px-6 bg-white border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
              AD
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Admin Support</h3>
              <p className="text-[10px] text-emerald-600 font-medium">● Online</p>
            </div>
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 p-6 overflow-y-auto space-y-3">
          {messages.length === 0 ? (
            <div className="text-center text-slate-400 text-xs mt-10">មិនទាន់មានការសន្ទនាទេ សូមផ្ញើសារសួរសំណួរដំបូង!</div>
          ) : (
            messages.map((msg, index) => {
              const isSeller = msg.sender_type === 'seller';
              return (
                <div key={msg.id || index} className={`flex flex-col ${isSeller ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                      isSeller
                        ? 'bg-blue-600 text-white rounded-br-xs shadow-xs'
                        : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs shadow-2xs'
                    }`}
                  >
                    {msg.message}
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1 px-1">
                    {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="ផ្ញើសារទៅកាន់ Admin..."
            className="flex-1 bg-slate-100 text-xs text-slate-800 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
          <button
            type="submit"
            className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/25 transition-all cursor-pointer"
          >
            ផ្ញើ
          </button>
        </form>

      </div>
    </div>
  );
}