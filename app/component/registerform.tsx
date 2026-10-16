'use client';
import React, { useState } from 'react';
import { FiUser, FiMail, FiLock, FiArrowRight, FiX } from 'react-icons/fi';
import Seller from './seller';

export default function Registerform({ isOpen, onClose }) {
  const [isLoginMode, setIsLoginMode] = useState(false); 
  const [role, setRole] = useState('buyer'); 
  const [formData, setFormData] = useState({
    username: '', 
    email: '',
    password: '',
    storeName: '', 
  });
  
  const [profilePic, setProfilePic] = useState(null);
  const [backgroundImage, setBackgroundImage] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e, type) => {
    if (e.target.files && e.target.files[0]) {
      if (type === 'profile') setProfilePic(e.target.files[0]);
      if (type === 'background') setBackgroundImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      let apiEndpoint = '';
      let requestOptions = {};

      if (isLoginMode) {
        apiEndpoint = role === 'seller' 
          ? `${import.meta.env?.VITE_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL}/api/seller-login` 
          : `${import.meta.env?.VITE_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL}/api/buyer-login`;

        const loginPayload = role === 'seller'
          ? { seller_email: formData.email, seller_password: formData.password }
          : { email: formData.email, password: formData.password };

        requestOptions = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(loginPayload),
        };

      } else {
        if (role === 'seller') {
          apiEndpoint = `${import.meta.env?.VITE_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL}/api/seller-register`;
          
          const data = new FormData();
          data.append('seller_name', formData.storeName); 
          data.append('seller_email', formData.email);
          data.append('seller_password', formData.password);
          data.append('role', 'seller');
          
          if (profilePic) data.append('profile_pic', profilePic);
          if (backgroundImage) data.append('Image', backgroundImage);

          requestOptions = {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
            },
            body: data,
          };

        } else {
          apiEndpoint = `${import.meta.env?.VITE_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL}/api/buyer-register`;
          
          const buyerPayload = {
            username: formData.username,
            email: formData.email,
            password: formData.password,
          };

          requestOptions = {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify(buyerPayload),
          };
        }
      }

      const response = await fetch(apiEndpoint, requestOptions);
      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error(`Server returned non-JSON response. Check Laravel terminal.`);
      }

      if (!response.ok) {
        throw new Error(data.message || (data.errors ? Object.values(data.errors)[0][0] : 'Something went wrong.'));
      }

      const token = data.token || data.access_token || data.jwt;
      if (token) {
        localStorage.setItem('access_token', token);
        localStorage.setItem('jwt_token', token);
        localStorage.setItem('token', token);
      }

      const userData = data.user || data.buyer || data.seller || { email: formData.email, role: role };
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('user_role', role);

      if (isLoginMode) {
        setSuccessMessage('Login successful! Welcome back.');
        setTimeout(() => {
          onClose();
          window.location.reload(); 
        }, 1200);
      } else {
        setSuccessMessage(`${role === 'seller' ? 'Seller' : 'Buyer'} registration successful! You can now sign in.`);
        setTimeout(() => {
          setIsLoginMode(true);
          setSuccessMessage('');
        }, 1500);
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className={`fixed inset-0 z-[999] w-screen h-screen flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 transition-all duration-300 ease-in-out ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div 
        className={`w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 relative transform transition-all duration-300 ease-in-out my-auto ${
          isOpen ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-4 opacity-0'
        }`}
      >
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-1.5 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full transition-all cursor-pointer"
        >
          <FiX size={18} />
        </button>

        <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-800 p-8 text-white flex flex-col justify-between relative overflow-hidden order-2 md:order-1">
          <div className="absolute -top-20 -left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none"></div>

          <div>
            <span className="text-[10px] uppercase tracking-widest bg-blue-500/30 px-2.5 py-1 rounded-full font-semibold">
              LODA Marketplace
            </span>
          </div>

          <div className="my-auto space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">
              {isLoginMode ? 'Welcome Back!' : (role === 'seller' ? 'Start Selling With Us' : 'Join As a Buyer')}
            </h1>
            <p className="text-blue-100 text-xs leading-relaxed">
              {isLoginMode 
                ? 'Sign in to access your account, manage your orders, and explore more.'
                : (role === 'seller' 
                    ? 'Create your seller account to manage products and grow your business seamlessly.'
                    : 'Create your buyer account today to explore and purchase securely.')}
            </p>
          </div>

          <div className="text-[10px] text-blue-200">
            © {new Date().getFullYear()} LODA Inc.
          </div>
        </div>

        <div className="p-6 md:p-8 flex flex-col justify-center order-1 md:order-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              {isLoginMode ? `${role === 'seller' ? 'Seller' : 'Buyer'} Sign In` : `${role === 'seller' ? 'Seller' : 'Buyer'} Register`}
            </h2>
            <button 
              type="button"
              onClick={() => {
                setIsLoginMode(!isLoginMode);
                setError('');
                setSuccessMessage('');
              }} 
              className="text-xs font-medium text-blue-600 hover:underline cursor-pointer"
            >
              {isLoginMode ? 'Register' : 'Sign In'}
            </button>
          </div>

          {error && (
            <div className="mb-3 p-2.5 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-3 p-2.5 bg-green-50 border border-green-200 text-green-600 text-xs rounded-lg">
              {successMessage}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Account Role
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('buyer')}
                className={`py-2 text-xs font-medium rounded-lg transition-all duration-200 ${
                  role === 'buyer'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Buyer
              </button>
              <button
                type="button"
                onClick={() => setRole('seller')}
                className={`py-2 text-xs font-medium rounded-lg transition-all duration-200 ${
                  role === 'seller'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Seller
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {!isLoginMode && role === 'buyer' && (
              <div>
                <div className="relative flex items-center">
                  <FiUser className="absolute left-3.5 text-gray-400" size={16} />
                  <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                  />
                </div>
              </div>
            )}

            {!isLoginMode && role === 'seller' && (
              <>
                <Seller role={role} formData={formData} handleChange={handleChange} />
                
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Profile Picture (Required)
                  </label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => handleFileChange(e, 'profile')} 
                    required 
                    className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Background / Cover Image (Optional)
                  </label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => handleFileChange(e, 'background')} 
                    className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
                  />
                </div>
              </>
            )}

            <div>
              <div className="relative flex items-center">
                <FiMail className="absolute left-3.5 text-gray-400" size={16} />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <div className="relative flex items-center">
                <FiLock className="absolute left-3.5 text-gray-400" size={16} />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-lg shadow-md shadow-blue-600/20 transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              <span>
                {loading ? 'Processing...' : (isLoginMode ? `Sign In as ${role}` : `Register as ${role}`)}
              </span>
              <FiArrowRight size={14} />
            </button>
          </form>

          <div className="mt-4 text-center text-xs text-gray-500">
            {isLoginMode ? "Don't have an account? " : "Already have an account? "}
            <button 
              type="button"
              onClick={() => {
                setIsLoginMode(!isLoginMode);
                setError('');
                setSuccessMessage('');
              }}
              className="text-blue-600 font-medium hover:underline cursor-pointer"
            >
              {isLoginMode ? 'Register' : 'Log in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}