import React, { useState } from 'react';
import { Image as ImageIcon, Send, X } from 'lucide-react';

export default function DailyPost({ onPostCreated }) {
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() && !image) return;

    // ១. ទាញយក Token ពី localStorage (សូមផ្ទៀងផ្ទាត់ឈ្មោះ Key ឱ្យត្រូវនឹងពេល Login របស់បង ឧទាហរណ៍: 'token', 'seller_token', ឬ 'auth_token')
    const token = localStorage.getItem('token') || localStorage.getItem('seller_token');

    const formData = new FormData();
    formData.append('Text', text);
    if (image) {
      formData.append('pic', image);
    }

    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/Post_shop`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}` // ២. បញ្ជូន Token ទៅជាមួយ Header យ៉ាងត្រឹមត្រូវ
        },
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        alert('Upload Post បានជោគជ័យ!');
        setText('');
        setImage(null);
        setImagePreview(null);
        if (onPostCreated) onPostCreated(data.data);
      } else {
        alert(data.message || 'មានបញ្ហាអ្វីមួយកើតឡើង!');
      }
    } catch (error) {
      console.error('Error uploading post:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden font-['Kantumruy_Pro'] my-6 p-6 sm:p-8">
      <div className="mb-5">
        <h3 className="font-bold text-gray-800 text-lg">បង្កើតការផុសថ្មី (Create New Post)</h3>
        <p className="text-xs text-gray-400">ចែករំលែកផលិតផល ឬព័ត៌មានថ្មីៗទៅកាន់អតិថិជនរបស់អ្នក</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="តើហាងរបស់អ្នកមានអ្វីថ្មីថ្ងៃនេះ? សរសេររៀបរាប់នៅទីនេះ..."
          rows="5"
          className="w-full p-4 text-sm bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:outline-none transition-all text-gray-800 resize-none shadow-inner"
        />

        {imagePreview && (
          <div className="relative w-full h-72 rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center shadow-md">
            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => { setImage(null); setImagePreview(null); }}
              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors cursor-pointer shadow-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <label className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors cursor-pointer text-xs font-semibold shadow-sm">
            <ImageIcon className="w-4 h-4" />
            <span>បន្ថែមរូបភាព</span>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange} 
              className="hidden" 
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{loading ? 'កំពុងផុស...' : 'ផុសឥឡូវនេះ'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}