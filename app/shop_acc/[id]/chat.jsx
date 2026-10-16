import React, { useState, useEffect } from 'react';
import { Send, X, MessageSquare } from 'lucide-react';
function Chat({ isOpen = false, onClose, shopId }) {
  const [loading, setLoading] = useState(false);
  const [shopProfile, setShopProfile] = useState(null);
  const [messages, setMessages] = useState([
    { id: 1, sender: 'shop', text: 'សួស្ដី! តើអាចឱ្យខ្ញុំជួយអ្វីខ្លះដែរ?' }
  ]);
  const [input, setInput] = useState('');
  useEffect(() => {
    if (!isOpen || !shopId) return;

    const fetchShopChatDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shop-details/${shopId}`, {
          headers: { 
            'Accept': 'application/json',
          }
        });
        const data = await response.json();
        const fetchedShop = data.seller || data.shop || data;
        setShopProfile(fetchedShop);
      } catch (error) {
        console.error("Error fetching shop profile for chat:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchShopChatDetails();
  }, [isOpen, shopId]);

  if (!isOpen) return null;

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages([...messages, { id: Date.now(), sender: 'user', text: input }]);
    setInput('');
  };

  const shopName = shopProfile?.seller_name || shopProfile?.name || 'ហាងទំនិញ';
  const profileImage = shopProfile?.profile_pic || shopProfile?.image || shopProfile?.avatar;

  return (
    <div className="fixed bottom-5 right-5 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden z-50 font-['Kantumruy_Pro'] animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3.5 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/20 overflow-hidden flex items-center justify-center font-bold text-sm border-2 border-white/40 flex-shrink-0">
            {profileImage ? (
              <img 
                src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${profileImage}`}
                alt={shopName} 
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{shopName.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div>
            <h3 className="font-bold text-sm truncate max-w-[170px] font-['Kantumruy_Pro']">{shopName}</h3>
            <p className="text-[10px] text-blue-100 font-['Kantumruy_Pro']">ឆ្លើយតបយ៉ាងលឿន</p>
          </div>
        </div>

        {onClose && (
          <button 
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="p-4 flex-1 h-72 overflow-y-auto bg-gray-50 flex flex-col gap-3 font-['Kantumruy_Pro']">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed font-['Kantumruy_Pro'] ${
              msg.sender === 'user' 
                ? 'bg-blue-600 text-white rounded-br-none shadow-sm' 
                : 'bg-white text-gray-800 rounded-bl-none border border-gray-100 shadow-sm'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input Footer */}
      <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="សរសេរសារ..." 
          className="flex-1 px-4 py-2 text-xs bg-gray-100 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none transition-all text-gray-800 font-['Kantumruy_Pro']"
        />
        <button 
          type="submit"
          className="w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-md transition-all active:scale-95 cursor-pointer flex-shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
      
    </div>
  );
}

export default Chat;