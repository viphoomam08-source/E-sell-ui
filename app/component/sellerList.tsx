'use client';
import React, { useState, useEffect, useCallback } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.4.52:8000';

export default function SellerList() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeller, setSelectedSeller] = useState(null);
  
  // State សម្រាប់សារក្នុងពេលជជែក
  const [messageText, setMessageText] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // យក Auth Headers សម្រាប់ Buyer
  const getAuthHeaders = () => {
    const token = localStorage.getItem('buyer_token') || localStorage.getItem('access_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  };

  // ១. ទាញយកបញ្ជីហាងដែល Buyer បានទិញទំនិញ
  const fetchSellers = async () => {
    try {
      const res = await fetch(`${API_URL}/api/takeSeller`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      
      if (res.ok && data.data) {
        const formattedSellers = data.data.map((item) => {
          const firstItem = Array.isArray(item.items) ? item.items[0] : null;
          const sellerId = item.seller_id || item.seller?.id || firstItem?.seller_id;
          const sellerName = item.seller?.seller_name || firstItem?.seller_name || 'ហាងលក់ទំនិញ';
          const sellerPic = item.seller?.profile_pic || item.seller?.Image || firstItem?.image || null;

          return {
            id: sellerId,
            name: sellerName,
            image: sellerPic,
            lastMessage: item.note || 'បានបញ្ជាទិញទំនិញពីហាងនេះ',
            time: item.created_at ? new Date(item.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'ឥឡូវនេះ',
            avatar: sellerName.charAt(0).toUpperCase(),
            bgGradient: 'from-blue-600 to-indigo-600',
            online: true,
          };
        });
        setSellers(formattedSellers);
      }
    } catch (err) {
      console.error('Error fetching sellers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  // ២. ទាញយកប្រវត្តើសារ (ជាមួយ Auto Refresh រៀងរាល់ 3 វិនាទី)
  const fetchMessages = useCallback(async (isInitial = false) => {
    if (!selectedSeller?.id) return;
    if (isInitial) setLoadingMessages(true);

    try {
      const res = await fetch(`${API_URL}/api/buyer/chat-messages/${selectedSeller.id}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      const data = await res.json();

      if (data.status && data.data) {
        const formatted = data.data.map(msg => ({
          id: msg.id,
          sender: msg.sender_type, // 'buyer' ឬ 'seller'
          type: msg.type,
          text: msg.message,
          time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));
        setChatMessages(formatted);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      if (isInitial) setLoadingMessages(false);
    }
  }, [selectedSeller]);

  useEffect(() => {
    if (!selectedSeller) return;
    
    fetchMessages(true);

    const interval = setInterval(() => {
      fetchMessages(false);
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedSeller, fetchMessages]);

  // ៣. មុខងារ Buyer ផ្ញើសារទៅ Seller
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedSeller) return;

    const formData = new FormData();
    formData.append('seller_id', selectedSeller.id);
    formData.append('message', messageText);

    try {
      const res = await fetch(`${API_URL}/api/buyer/send-message`, {
        method: 'POST',
        headers: {
          'Authorization': getAuthHeaders()['Authorization'],
          'Accept': 'application/json',
        },
        body: formData
      });
      const data = await res.json();

      if (data.status) {
        setChatMessages(prev => [
          ...prev, 
          {
            id: data.data?.id || Date.now(),
            sender: 'buyer',
            type: 'text',
            text: messageText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        setMessageText('');
      } else {
        alert(data.message || 'មិនអាចផ្ញើសារបានទេ');
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const filteredSellers = sellers.filter((seller) =>
    seller.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="text-center p-6 text-xs text-slate-400">កំពុងទាញយកបញ្ជីហាង...</div>;
  }

  return (
    <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      {selectedSeller ? (
        /* ផ្ទាំង Chat ជាមួយហាង */
        <div className="flex flex-col h-[550px]">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-blue-600 text-white">
            <div className="flex items-center gap-3">
              {selectedSeller.image ? (
                <img 
                  src={`${API_URL}/storage/${selectedSeller.image}`} 
                  alt={selectedSeller.name} 
                  className="w-10 h-10 rounded-full object-cover shadow-sm border border-white/30"
                />
              ) : (
                <div className={`w-10 h-10 bg-gradient-to-tr ${selectedSeller.bgGradient} rounded-full flex items-center justify-center font-bold text-xs shadow-sm`}>
                  {selectedSeller.avatar}
                </div>
              )}
              <div>
                <h3 className="text-xs font-bold">{selectedSeller.name}</h3>
                <p className="text-[10px] opacity-80">online</p>
              </div>
            </div>
            
            <button
              onClick={() => setSelectedSeller(null)}
              className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-medium transition cursor-pointer"
            >
              ← ថយក្រោយ
            </button>
          </div>

          {/* Messages Display */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50">
            {loadingMessages ? (
              <div className="text-center text-xs text-slate-400 py-10">កំពុងទាញយកសារ...</div>
            ) : chatMessages.length === 0 ? (
              <div className="text-center text-xs text-slate-400 py-10">មិនទាន់មានការសន្ទនាទេ!</div>
            ) : (
              chatMessages.map((msg) => {
                const isBuyer = msg.sender === 'buyer';
                // ឆែកមើលថាតើសារជាប្រភេទរូបភាព ឬមាន Link រូបភាព
                const isImage = msg.type === 'image' || (msg.text && (msg.text.includes('/storage/chat-images/') || msg.text.endsWith('.png') || msg.text.endsWith('.jpg')));

                return (
                  <div key={msg.id} className={`flex ${isBuyer ? 'justify-end' : 'justify-start'}`}>
                    {isImage ? (
                      <div className="flex flex-col items-end">
                        <img 
                          src={msg.text} 
                          alt="Chat media" 
                          className="w-40 h-40 object-cover rounded-2xl shadow-sm border border-slate-200" 
                        />
                        <span className="text-[9px] mt-1 text-slate-400">{msg.time}</span>
                      </div>
                    ) : (
                      <div className={`p-3 rounded-2xl text-xs max-w-[80%] shadow-xs ${
                        isBuyer 
                          ? 'bg-blue-600 text-white rounded-br-none' 
                          : 'bg-white text-slate-800 rounded-bl-none border border-slate-100'
                      }`}>
                        {msg.text}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Input Box */}
          <div className="p-3 bg-white border-t border-slate-100">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="វាយបញ្ចូលសាររបស់អ្នកទីនេះ..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                required
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-xl transition text-xs shrink-0 cursor-pointer"
              >
                បញ្ជូន
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* បញ្ជីរាយនាមហាង (Buyer Chat Inbox) */
        <>
          <div className="p-4 border-b border-slate-100 space-y-3">
            <h2 className="text-base font-bold text-slate-800">💬 ប្រអប់សារហាង (Chats)</h2>
            <input
              type="text"
              placeholder="ស្វែងរកក្នុងសារ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-100 border-none rounded-xl px-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
            />
          </div>

          <div className="divide-y divide-slate-100 max-h-[480px] overflow-y-auto">
            {filteredSellers.map((seller) => (
              <div
                key={seller.id}
                onClick={() => setSelectedSeller(seller)}
                className="flex items-center gap-3 p-3.5 hover:bg-slate-50 transition cursor-pointer relative"
              >
                <div className="relative shrink-0">
                  {seller.image ? (
                    <img 
                      src={`${API_URL}/storage/${seller.image}`} 
                      alt={seller.name} 
                      className="w-12 h-12 rounded-full object-cover shadow-sm"
                    />
                  ) : (
                    <div className={`w-12 h-12 bg-gradient-to-tr ${seller.bgGradient} text-white rounded-full flex items-center justify-center font-bold text-sm shadow-sm`}>
                      {seller.avatar}
                    </div>
                  )}
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h3 className="text-xs font-semibold truncate text-slate-800">{seller.name}</h3>
                    <span className="text-[10px] text-slate-400">{seller.time}</span>
                  </div>
                  <p className="text-[11px] truncate text-slate-500">{seller.lastMessage}</p>
                </div>
              </div>
            ))}
          </div>

          {filteredSellers.length === 0 && (
            <div className="text-center py-10 text-slate-400 text-xs">
              មិនមានការសន្ទនាដែលបានរកឃើញទេ!
            </div>
          )}
        </>
      )}
    </div>
  );
}