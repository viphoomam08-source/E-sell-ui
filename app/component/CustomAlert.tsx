'use client';
import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, X } from 'lucide-react';

export default function CustomAlert({ isOpen, type = 'success', message, onClose, onConfirm }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShow(true);
      if (type === 'success') {
        const timer = setTimeout(() => {
          handleClose();
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [isOpen, type]);

  const handleClose = () => {
    setShow(false);
    setTimeout(onClose, 200);
  };

  if (!isOpen) return null;

  const isSuccess = type === 'success';
  const isWarning = type === 'warning';

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-sm w-full p-6 text-center transform transition-all duration-300 ease-out relative overflow-hidden ${show ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
        
        {/* Top Accent Line */}
        <div className={`absolute top-0 left-0 right-0 h-1.5 transition-colors duration-300 ${
          isSuccess ? 'bg-emerald-500' : isWarning ? 'bg-amber-500' : 'bg-rose-500'
        }`} />

        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4 mt-2">
          {isSuccess && (
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>
          )}
          {isWarning && (
            <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">
              <AlertTriangle className="w-7 h-7" />
            </div>
          )}
          {!isSuccess && !isWarning && (
            <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center">
              <XCircle className="w-7 h-7" />
            </div>
          )}
        </div>

        {/* Title & Message */}
        <h3 className="text-lg font-bold text-slate-900 mb-1">
          {isSuccess ? 'Success!' : isWarning ? 'Account Required' : 'Error'}
        </h3>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed px-2">
          {message}
        </p>

        {/* Buttons */}
        <div className="flex gap-3 justify-center">
          {onConfirm ? (
            <>
              <button
                onClick={handleClose}
                className="flex-1 py-3 px-4 text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition-all duration-200 active:scale-95 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleClose();
                  onConfirm();
                }}
                className="flex-1 py-3 px-4 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg shadow-blue-600/25 transition-all duration-200 active:scale-95 cursor-pointer"
              >
                Register Now
              </button>
            </>
          ) : (
            <button
              onClick={handleClose}
              className="w-full py-3 px-4 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg shadow-blue-600/25 transition-all duration-200 active:scale-95 cursor-pointer"
            >
              OK
            </button>
          )}
        </div>

      </div>
    </div>
  );
}