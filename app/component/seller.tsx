'use client';
import React from 'react';
import { FiShoppingBag } from 'react-icons/fi';

export default function Seller({ role, formData, handleChange }) {
  if (role !== 'seller') {
    return null;
  }

  return (
    <div>
      <div className="relative flex items-center">
        <FiShoppingBag className="absolute left-3.5 text-gray-400" size={16} />
        <input
          type="text"
          name="storeName"
          placeholder="Store Name"
          value={formData.storeName || ''}
          onChange={handleChange}
          required={role === 'seller'}
          className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
        />
      </div>
    </div>
  );
}