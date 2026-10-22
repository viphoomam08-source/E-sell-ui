'use client';

import { useCallback, useEffect, useState } from 'react';
import { Send, X } from 'lucide-react';
import { subscribeToChat } from '../../lib/chatRealtime';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, '');

function getBuyerToken() {
  return localStorage.getItem('buyer_token')
    || localStorage.getItem('access_token')
    || localStorage.getItem('token')
    || localStorage.getItem('jwt_token');
}

function formatMessage(message) {
  return {
    id: message.id,
    sender: message.sender_type === 'buyer' ? 'user' : 'shop',
    text: message.message,
    time: message.created_at
      ? new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '',
  };
}

export default function Chat({ isOpen = false, onClose, shopId }) {
  const [loading, setLoading] = useState(false);
  const [shopProfile, setShopProfile] = useState(null);
  const [buyerId, setBuyerId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen || !shopId) return;

    let cancelled = false;
    const loadChat = async () => {
      setLoading(true);
      setError('');

      try {
        const token = getBuyerToken();
        if (!API_URL || !token) {
          throw new Error('សូមចូលគណនីអ្នកទិញជាមុនសិន ដើម្បីជជែកជាមួយហាង។');
        }

        const headers = {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        };
        const [shopResponse, buyerResponse] = await Promise.all([
          fetch(`${API_URL}/api/shop-details/${shopId}`, { headers: { Accept: 'application/json' } }),
          fetch(`${API_URL}/api/buyer-acc`, { headers }),
        ]);

        const shopData = await shopResponse.json();
        const buyerData = await buyerResponse.json();
        if (!shopResponse.ok) throw new Error(shopData.message || 'មិនអាចទាញយកព័ត៌មានហាងបានទេ។');
        if (!buyerResponse.ok || !buyerData.data?.id) {
          throw new Error(buyerData.message || 'សូមចូលគណនីអ្នកទិញម្ដងទៀត។');
        }

        if (!cancelled) {
          setShopProfile(shopData.seller || shopData.shop || shopData.data || shopData);
          setBuyerId(buyerData.data.id);
        }
      } catch (chatError) {
        console.error('Unable to open buyer chat:', chatError);
        if (!cancelled) {
          setError(chatError instanceof Error ? chatError.message : 'មិនអាចបើកការជជែកបានទេ។');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadChat();
    return () => {
      cancelled = true;
    };
  }, [isOpen, shopId]);

  const fetchMessages = useCallback(async () => {
    if (!buyerId || !shopId) return;

    try {
      const response = await fetch(`${API_URL}/api/buyer/chat-messages/${shopId}`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${getBuyerToken()}`,
        },
        cache: 'no-store',
      });
      const data = await response.json();
      if (!response.ok || !data.status) {
        throw new Error(data.message || 'មិនអាចទាញយកសារបានទេ។');
      }
      setMessages((data.data || []).map(formatMessage));
      setError('');
    } catch (chatError) {
      console.error('Unable to refresh buyer chat:', chatError);
      setError(chatError instanceof Error ? chatError.message : 'មិនអាចទាញយកសារបានទេ។');
    }
  }, [buyerId, shopId]);

  useEffect(() => {
    if (!isOpen || !buyerId || !shopId) return;

    let cancelled = false;
    let unsubscribe;
    const initialFetch = window.setTimeout(() => void fetchMessages(), 0);

    void subscribeToChat({
      buyerId,
      sellerId: shopId,
      participant: 'buyer',
      onMessage: () => void fetchMessages(),
    }).then((cleanup) => {
      if (cancelled) cleanup();
      else unsubscribe = cleanup;
    }).catch((chatError) => {
      console.error('Shop chat live updates failed to connect:', chatError);
    });

    const fallbackTimer = window.setInterval(() => void fetchMessages(), 30000);
    return () => {
      cancelled = true;
      window.clearTimeout(initialFetch);
      window.clearInterval(fallbackTimer);
      unsubscribe?.();
    };
  }, [buyerId, fetchMessages, isOpen, shopId]);

  const handleSend = async (event) => {
    event.preventDefault();
    const message = input.trim();
    if (!message || !shopId) return;

    try {
      const response = await fetch(`${API_URL}/api/buyer/send-message`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getBuyerToken()}`,
        },
        body: JSON.stringify({ seller_id: shopId, message }),
      });
      const data = await response.json();
      if (!response.ok || !data.status) {
        throw new Error(data.message || 'មិនអាចផ្ញើសារបានទេ។');
      }

      setInput('');
      await fetchMessages();
    } catch (chatError) {
      console.error('Unable to send buyer chat message:', chatError);
      setError(chatError instanceof Error ? chatError.message : 'មិនអាចផ្ញើសារបានទេ។');
    }
  };

  if (!isOpen) return null;

  const shopName = shopProfile?.seller_name || shopProfile?.name || 'ហាងទំនិញ';
  const profileImage = shopProfile?.profile_pic || shopProfile?.image || shopProfile?.avatar;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex h-[500px] w-80 flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white font-['Kantumruy_Pro'] shadow-2xl sm:w-96">
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3.5 text-white shadow-md">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white/40 bg-white/20 text-sm font-bold">
            {profileImage ? (
              <img src={`${API_URL}/storage/${profileImage}`} alt={shopName} className="h-full w-full object-cover" />
            ) : (
              shopName.charAt(0).toUpperCase()
            )}
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold">{shopName}</h3>
            <p className="text-[10px] text-blue-100">ជជែកជាមួយហាង</p>
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close chat"
            className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50 p-4">
        {loading && <p className="text-center text-xs text-slate-500">កំពុងភ្ជាប់ទៅហាង...</p>}
        {error && <p role="alert" className="rounded-lg bg-rose-50 p-2 text-xs text-rose-700">{error}</p>}
        {!loading && !error && messages.length === 0 && (
          <p className="text-center text-xs text-slate-500">ផ្ញើសារដំបូងទៅកាន់ហាងនេះ។</p>
        )}
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
              message.sender === 'user'
                ? 'rounded-br-none bg-blue-600 text-white shadow-sm'
                : 'rounded-bl-none border border-gray-100 bg-white text-gray-800 shadow-sm'
            }`}>
              {message.text}
              {message.time && <span className="mt-1 block text-[9px] opacity-70">{message.time}</span>}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-gray-100 bg-white p-3">
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="សរសេរសារ..."
          className="flex-1 rounded-xl border border-transparent bg-gray-100 px-4 py-2 text-xs text-gray-800 transition-all focus:border-blue-500 focus:bg-white focus:outline-none"
        />
        <button
          type="submit"
          disabled={!input.trim() || !buyerId}
          aria-label="Send message"
          className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-blue-600 text-white shadow-md transition-all hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
