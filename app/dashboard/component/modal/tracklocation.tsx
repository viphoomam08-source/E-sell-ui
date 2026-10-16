'use client';

import React, { useState } from 'react';
import { MapPin, Navigation, Loader2, ShieldAlert } from 'lucide-react';

export default function LocationPopup() {
  const [showModal, setShowModal] = useState(true); // បង្ហាញ Popup ពេលចូលមកដល់
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // មុខងារទាញយកទីតាំងពេលចុច "អនុញ្ញាត"
  const handleAllowLocation = () => {
    setShowModal(false); // បិទ Popup
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Browser របស់អ្នកមិនគាំទ្រការទាញយកទីតាំងទេ។');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        setLocation({ latitude, longitude });
        setLoading(false);
      },
      (err) => {
        setError('មិនអាចទាញយកទីតាំងបានទេ: ' + err.message);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // មុខងារពេលចុច "មិនអនុញ្ញាត"
  const handleDenyLocation = () => {
    setShowModal(false);
    setError('អ្នកបានបដិសេធការចូលប្រើទីតាំង។');
  };

  return (
    <div className="max-w-md mx-auto p-4 text-center">
      
      {/* ទីតាំងបង្ហាញលទ្ធផលខាងក្រៅ */}
      <div className="p-5 bg-white rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-sm font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
          <MapPin className="w-4 h-4 text-blue-600" /> 
          ប្រព័ន្ធទាញយកទីតាំង
        </h3>
        
        {loading && (
          <div className="flex items-center justify-center gap-2 text-xs text-blue-600 py-3">
            <Loader2 className="w-4 h-4 animate-spin" /> កំពុងស្វែងរកទីតាំងបច្ចុប្បន្ន...
          </div>
        )}

        {location && (
          <div className="mt-3 p-3 bg-blue-50 rounded-xl text-xs text-left text-gray-700 space-y-1">
            <p className="font-bold text-blue-900 mb-1">✅ ទីតាំងរបស់អ្នកសម្រេចជោគជ័យ៖</p>
            <p><span className="font-semibold">Latitude:</span> {location.latitude}</p>
            <p><span className="font-semibold">Longitude:</span> {location.longitude}</p>
          </div>
        )}

        {error && (
          <p className="mt-2 text-xs text-rose-500 font-medium flex items-center justify-center gap-1">
            <ShieldAlert className="w-4 h-4" /> {error}
          </p>
        )}

        {/* ប៊ូតុងបើក Popup សាកល្បងម្ដងទៀត */}
        {!showModal && !loading && (
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 bg-gray-900 text-white text-xs font-bold py-2 px-4 rounded-xl hover:bg-black transition-all cursor-pointer"
          >
            ផ្ទៀងផ្ទាត់ទីតាំងម្តងទៀត
          </button>
        )}
      </div>

      {/* Custom Popup Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-gray-100 text-center">
            
            {/* Icon */}
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
              <Navigation className="w-7 h-7" />
            </div>

            {/* Title */}
            <h3 className="text-base font-bold text-gray-900 mb-2">
              តើអ្នកចង់អនុញ្ញាតឱ្យស្គាល់ទីតាំងរបស់អ្នកដែរឬទេ?
            </h3>

            {/* Description */}
            <p className="text-xs text-gray-500 mb-6 leading-relaxed">
              យើងត្រូវការទីតាំងបច្ចុប្បន្នរបស់អ្នក ដើម្បីបង្ហាញហាង និងសេវាកម្មដែលនៅជិតអ្នកបំផុត។
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleDenyLocation}
                className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-gray-600 text-xs font-bold hover:bg-gray-50 transition-all cursor-pointer"
              >
                មិនអនុញ្ញាត
              </button>
              
              <button
                onClick={handleAllowLocation}
                className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-200 cursor-pointer"
              >
                អនុញ្ញាត
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}