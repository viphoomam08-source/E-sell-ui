'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Send, Search, CheckCheck, PanelLeftClose, PanelLeftOpen, X, Image as ImageIcon, ShoppingBag, Plus, ArrowLeft } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.1.4:8000';

export default function SellerChatModule() {
  const [buyers, setBuyers] = useState([]);
  const [loadingBuyers, setLoadingBuyers] = useState(true);

  const [selectedBuyer, setSelectedBuyer] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [input, setInput] = useState('');

  const [previewItem, setPreviewItem] = useState(null); 
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [storeProducts, setStoreProducts] = useState([]);

  // យក Auth Headers សម្រាប់ Seller
  const getAuthHeaders = () => {
    const token = localStorage.getItem('seller_token') || localStorage.getItem('access_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
  };

  // ១. ទាញយកបញ្ជី Buyer និងបញ្ជីទំនិញពេល Load ដំបូង
  useEffect(() => {
    const headers = getAuthHeaders();

    // ទាញយកបញ្ជី Buyer
    fetch(`${API_URL}/api/seller/chat-buyers`, { method: 'GET', headers })
      .then(res => res.json())
      .then(data => {
        setBuyers(data.data || data.buyers || (Array.isArray(data) ? data : []));
        setLoadingBuyers(false);
      })
      .catch(error => {
        console.error('Error fetching buyers:', error);
        setLoadingBuyers(false);
      });

    // ទាញយកបញ្ជីទំនិញ
    fetch(`${API_URL}/api/chat-list-product`, { method: 'GET', headers })
      .then(res => res.json())
      .then(data => {
        setStoreProducts(data.data || (Array.isArray(data) ? data : []));
      })
      .catch(error => {
        console.error('Error fetching products:', error);
      });
  }, []);

  // ២. ទាញយកសារ (Messages) ជាមួយ Auto Refresh រៀងរាល់ 3 វិនាទី
  const fetchMessages = useCallback(async (isInitial = false) => {
    if (!selectedBuyer?.id) return;
    if (isInitial) setLoadingMessages(true);

    try {
      const res = await fetch(`${API_URL}/api/seller/chat-messages/${selectedBuyer.id}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      const data = await res.json();

      if (data.status) {
        const formattedMessages = (data.data || []).map(msg => ({
          id: msg.id,
          sender: msg.sender_type,
          text: msg.message,
          type: msg.type,
          time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));
        setMessages(formattedMessages);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      if (isInitial) setLoadingMessages(false);
    }
  }, [selectedBuyer]);

  useEffect(() => {
    if (!selectedBuyer) return;
    
    fetchMessages(true);

    // បង្កើត Interval ដើម្បី Refresh សាររៀងរាល់ 3 វិនាទី (3000ms)
    const interval = setInterval(() => {
      fetchMessages(false);
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedBuyer, fetchMessages]);

  // ៣. មុខងារផ្ញើសារអត្ថបទធម្មតា
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || !selectedBuyer) return;

    const formData = new FormData();
    formData.append('buyer_id', selectedBuyer.id);
    formData.append('message', input);

    try {
      const res = await fetch(`${API_URL}/api/send-message`, {
        method: 'POST',
        headers: {
          'Authorization': getAuthHeaders()['Authorization'],
          'Accept': 'application/json',
        },
        body: formData
      });
      const data = await res.json();

      if (data.status) {
        setMessages(prev => [
          ...prev, 
          {
            id: data.data?.id || Date.now(),
            sender: 'seller',
            text: input,
            type: 'text',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        setInput('');
      } else {
        alert(data.message || 'មិនអាចបញ្ជូនសារបានទេ');
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  // ៤. មុខងារបញ្ជូន Preview (រូបភាព ឬ ទំនិញ)
  const confirmSendPreview = async () => {
    if (!previewItem || !selectedBuyer) return;

    const formData = new FormData();
    formData.append('buyer_id', selectedBuyer.id);

    if (previewItem.type === 'image' && previewItem.file) {
      formData.append('image', previewItem.file);
      formData.append('message', previewItem.url);
    } else if (previewItem.type === 'product' && previewItem.productData) {
      const pName = previewItem.productData.product_name || previewItem.productData.name;
      const pPrice = previewItem.productData.product_price || previewItem.productData.price;
      formData.append('message', `Product: ${pName} - $${Number(pPrice).toFixed(2)}`);
      formData.append('image', previewItem.url);
    }

    try {
      const res = await fetch(`${API_URL}/api/send-message`, {
        method: 'POST',
        headers: {
          'Authorization': getAuthHeaders()['Authorization'],
          'Accept': 'application/json',
        },
        body: formData
      });
      const data = await res.json();

      if (data.status) {
        setMessages(prev => [
          ...prev, 
          {
            id: data.data?.id || Date.now(),
            sender: 'seller',
            text: previewItem.url,
            type: previewItem.type,
            product: previewItem.productData || null,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        setPreviewItem(null);
      } else {
        alert(data.message || 'មិនអាចបញ្ជូនបានទេ');
      }
    } catch (err) {
      console.error('Error sending preview:', err);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreviewItem({ url: URL.createObjectURL(file), type: 'image', file: file });
  };

  const handleSelectProduct = (product) => {
    setIsProductModalOpen(false);
    const rawImg = product.image || product.image_url;
    const finalImg = rawImg 
      ? (rawImg.startsWith('http') ? rawImg : `${API_URL}/storage/${rawImg}`) 
      : 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60';

    setPreviewItem({ url: finalImg, type: 'product', productData: product });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 h-[calc(100vh-120px)] flex overflow-hidden font-['Kantumruy_Pro'] transition-all relative">
      
      {/* Sidebar: Buyer List */}
      <div className={`
        absolute inset-y-0 left-0 z-20 bg-slate-50/95 lg:relative lg:bg-slate-50/50 border-r border-slate-200 flex flex-col overflow-hidden transition-all duration-300 ease-in-out
        ${selectedBuyer ? 'max-lg:-translate-x-full lg:translate-x-0' : 'max-lg:translate-x-0 w-full'}
        ${isSidebarOpen ? 'lg:w-80 lg:opacity-100' : 'lg:w-0 lg:opacity-0 lg:border-r-0'}
      `}>
        <div className="p-4 border-b border-slate-200 w-full lg:w-80 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-slate-800 text-base">សារអតិថិជន (Chats)</h2>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="hidden lg:flex p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="ស្វែងរកអតិថិជន..." 
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 transition-all text-slate-800"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 w-full lg:w-80">
          {loadingBuyers ? (
            <div className="p-4 text-center text-xs text-slate-400">កំពុងទាញយកបញ្ជីអតិថិជន...</div>
          ) : buyers.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400">មិនទាន់មានអតិថិជនបញ្ជាទិញនៅឡើយទេ</div>
          ) : (
            buyers.map((buyer) => (
              <div 
                key={buyer.id}
                onClick={() => setSelectedBuyer(buyer)}
                className={`p-4 flex items-center gap-3 cursor-pointer transition-colors ${
                  selectedBuyer?.id === buyer.id ? 'bg-blue-50/80 border-l-4 border-blue-600' : 'hover:bg-slate-100/60'
                }`}
              >
                <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-xs">
                  {(buyer.username || buyer.email || 'B').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-slate-800 truncate mb-1">{buyer.username || buyer.email}</h3>
                  <p className="text-xs text-slate-500 truncate">បានបញ្ជាទិញទំនិញរួចរាល់</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Conversation Area */}
      <div className="flex-1 flex flex-col bg-white min-w-0 w-full">
        {selectedBuyer ? (
          <>
            {/* Chat Header */}
            <div className="px-4 lg:px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white shadow-2xs">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setSelectedBuyer(null)}
                  className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                {!isSidebarOpen && (
                  <button 
                    onClick={() => setIsSidebarOpen(true)}
                    className="hidden lg:flex p-2 mr-1 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    <PanelLeftOpen className="w-5 h-5" />
                  </button>
                )}
                
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                  {(selectedBuyer.username || selectedBuyer.email || 'B').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">{selectedBuyer.username || selectedBuyer.email}</h3>
                  <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> កំពុងអនឡាញ
                  </span>
                </div>
              </div>

              <button 
                onClick={() => setSelectedBuyer(null)}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>បិទការសន្ទនា</span>
              </button>
            </div>

            {/* Messages Content */}
            <div className="flex-1 p-4 lg:p-6 overflow-y-auto space-y-4 bg-slate-50/30">
              {loadingMessages ? (
                <div className="text-center text-xs text-slate-400 py-10">កំពុងទាញយកប្រវត្តើសារ...</div>
              ) : messages.length === 0 ? (
                <div className="text-center text-xs text-slate-400 py-10">មិនទាន់មានការសន្ទនាជាមួយអតិថិជននេះនៅឡើយទេ</div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'seller' ? 'justify-end' : 'justify-start'}`}>
                    {msg.type === 'image' || (msg.text && (msg.text.includes('/storage/') || msg.text.startsWith('http'))) ? (
                      <div className="flex flex-col items-end">
                        <img src={msg.text} alt="Chat media" className="w-48 h-48 sm:w-52 sm:h-52 object-cover rounded-2xl shadow-md border border-slate-200" />
                        <span className="text-[9px] mt-1 text-slate-400 flex items-center gap-1">{msg.time} <CheckCheck className="w-3 h-3 text-blue-600" /></span>
                      </div>
                    ) : msg.type === 'product' ? (
                      <div className="flex flex-col items-end">
                        <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden w-52 sm:w-56 p-3">
                          <p className="text-xs font-bold text-slate-800">{msg.text}</p>
                        </div>
                        <span className="text-[9px] mt-1 text-slate-400 flex items-center gap-1">{msg.time} <CheckCheck className="w-3 h-3 text-blue-600" /></span>
                      </div>
                    ) : (
                      <div className={`max-w-[75%] lg:max-w-[65%] px-4 py-3 rounded-2xl text-xs leading-relaxed shadow-sm ${
                        msg.sender === 'seller' 
                          ? 'bg-blue-600 text-white rounded-br-none' 
                          : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                      }`}>
                        <p>{msg.text}</p>
                        <div className={`text-[9px] mt-1 text-right flex items-center justify-end gap-1 ${msg.sender === 'seller' ? 'text-blue-100' : 'text-slate-400'}`}>
                          {msg.time}
                          {msg.sender === 'seller' && <CheckCheck className="w-3 h-3" />}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Message Input Box */}
            <form onSubmit={handleSendMessage} className="p-3 lg:p-4 bg-white border-t border-slate-200 flex items-center gap-2">
              <label className="p-2.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer flex-shrink-0" title="ផ្ញើរូបភាព">
                <ImageIcon className="w-5 h-5" />
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>

              <button 
                type="button"
                onClick={() => setIsProductModalOpen(true)}
                className="p-2.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer flex-shrink-0"
                title="ជ្រើសរើសទំនិញពីហាងផ្ញើជូនអតិថិជន"
              >
                <ShoppingBag className="w-5 h-5" />
              </button>

              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="សរសេរសារតប..." 
                className="flex-1 px-3 lg:px-4 py-2.5 lg:py-3 bg-slate-100 border border-transparent rounded-xl text-xs focus:bg-white focus:border-blue-500 focus:outline-none transition-all text-slate-800"
              />
              <button 
                type="submit"
                className="px-4 lg:px-6 py-2.5 lg:py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all active:scale-95 cursor-pointer flex-shrink-0"
              >
                <span className="hidden sm:inline">បញ្ជូន</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-sm p-4 text-center">
            សូមជ្រើសរើសអតិថិជនពីបញ្ជីខាងឆ្វេងដើម្បីចាប់ផ្តើមសន្ទនា
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 flex flex-col p-6 items-center">
            <h3 className="font-bold text-slate-800 text-sm mb-4">មើលមុនពេលផ្ញើ (Preview)</h3>
            <div className="w-64 h-64 rounded-2xl overflow-hidden border border-slate-200 shadow-inner mb-6 bg-slate-50 flex items-center justify-center">
              <img src={previewItem.url} alt="Preview" className="w-full h-full object-cover" />
            </div>
            {previewItem.productData && (
              <p className="font-bold text-slate-800 text-sm mb-4">
                {previewItem.productData.product_name || previewItem.productData.name} - ${Number(previewItem.productData.product_price || previewItem.productData.price || 0).toFixed(2)}
              </p>
            )}
            <div className="flex items-center gap-3 w-full">
              <button onClick={() => setPreviewItem(null)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold cursor-pointer">
                បោះបង់
              </button>
              <button onClick={confirmSendPreview} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md cursor-pointer flex items-center justify-center gap-2">
                <span>បញ្ជូនឥឡូវនេះ</span>
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Picker Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 flex flex-col max-h-[80vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-blue-600" /> ជ្រើសរើសទំនិញពីហាងរបស់អ្នក
              </h3>
              <button onClick={() => setIsProductModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto divide-y divide-slate-100 flex-1">
              {storeProducts.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">មិនទាន់មានទំនិញក្នុងហាងរបស់អ្នកនៅឡើយទេ</div>
              ) : (
                storeProducts.map((prod) => {
                  const rawImg = prod.image || prod.image_url;
                  const imgUrl = rawImg ? (rawImg.startsWith('http') ? rawImg : `${API_URL}/storage/${rawImg}`) : null;
                  const productName = prod.product_name || prod.name || 'Product';
                  const productPrice = prod.product_price || prod.price || 0;

                  return (
                    <div key={prod.id} className="py-3 flex items-center justify-between hover:bg-slate-50 px-3 rounded-xl transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-bold text-sm overflow-hidden flex-shrink-0">
                          {imgUrl ? <img src={imgUrl} alt={productName} className="w-full h-full object-cover" /> : productName.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-xs">{productName}</h4>
                          <span className="text-xs text-blue-600 font-extrabold">${Number(productPrice).toFixed(2)}</span>
                        </div>
                      </div>
                      <button onClick={() => handleSelectProduct(prod)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1 flex-shrink-0">
                        <Plus className="w-3.5 h-3.5" /> ជ្រើសរើស
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}