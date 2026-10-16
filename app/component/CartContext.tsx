'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type CartItem = {
  id: number | string;
  name: string;
  price: number;
  quantity: number;
  variant: string;
};

type CartProduct = {
  id: number | string;
  name?: string;
  product_name?: string;
  price?: number | string;
  product_price?: number | string;
  quantity?: number;
  variant?: string;
  variant_id?: number | string | null;
};

type CartContextValue = {
  cart: CartItem[];
  addToCart: (product: CartProduct) => Promise<void>;
  removeFromCart: (productId: CartItem['id'], variant?: string) => Promise<void>;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  fetchCartItems: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  // មុខងារទាញយកទិន្នន័យពី Laravel API
  const fetchCartItems = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/cart/items`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      // ពិនិត្យមើលថាតើ Server ឆ្លើយតបមកជា JSON ដែរឬទេ (ការពាររឿង Error 500 HTML)
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error("Backend returned non-JSON response (Likely Server Error 500).");
        return;
      }

      const result: unknown = await response.json();
      if (!result || typeof result !== 'object') return;

      const payload = result as { status?: boolean; data?: unknown };
      if (response.ok && (payload.status || payload.data)) {
        const cartData = payload.data || result;
        if (!Array.isArray(cartData)) return;

        const formattedCart: CartItem[] = cartData.map((rawItem: unknown) => {
          if (!rawItem || typeof rawItem !== 'object') {
            throw new Error('Cart API returned an invalid item.');
          }

          const item = rawItem as {
            id?: number | string;
            product_id?: number | string;
            name?: string;
            price?: number | string;
            quantity?: number | string;
            variant?: string;
            product?: { product_name?: string; product_price?: number | string };
          };

          return {
            id: item.product_id || item.id || '',
            name: item.product?.product_name || item.name || 'Product',
            price: Number(item.product?.product_price ?? item.price ?? 0),
            quantity: Number(item.quantity ?? 0),
            variant: item.variant || 'Standard',
          };
        });
        setCart(formattedCart);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  useEffect(() => {
    // ហៅទាញយកទិន្នន័យម្ដងពេលចាប់ផ្ដើមដំបូង
    fetchCartItems();

    // កំណត់ឱ្យទាញយកទិន្នន័យថ្មីស្វ័យប្រវត្តិរៀងរាល់ ២ វិនាទី (2000 milliseconds)
    const interval = setInterval(() => {
      fetchCartItems();
    }, 2000);

    // សម្អាត interval ចោលនៅពេល Component ត្រូវបិទ (Cleanup) ដើម្បីការពារ Memory Leak
    return () => clearInterval(interval);
  }, []);

  const addToCart = async (product) => {
    const qty = product.quantity || 1;

    // ធ្វើបច្ចុប្បន្នភាព State លើ Frontend ជាបន្ទាន់ភ្លាមៗ
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => item.id === product.id && item.variant === (product.variant || 'Standard')
      );

      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + qty
        };
        return updated;
      } else {
        return [
          ...prevCart,
          {
            id: product.id,
            name: product.name || product.product_name || 'Product',
            price: product.price || product.product_price || 0,
            quantity: qty,
            variant: product.variant || 'Standard',
          },
        ];
      }
    });

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      if (!token) return;

      await fetch(`${API_BASE_URL}/api/cart/add`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          product_id: product.id,
          variant_id: product.variant_id || null,
          quantity: qty,
        }),
      });
    } catch (error) {
      console.error('Error syncing cart with backend:', error);
    }
  };

  const removeFromCart = async (productId, variant = 'Standard') => {
    setCart((prevCart) => prevCart.filter((item) => !(item.id === productId && item.variant === variant)));

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      if (!token) return;

      await fetch(`${API_BASE_URL}/api/cart/remove`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ product_id: productId }),
      });
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const clearCart = () => setCart([]);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, totalItems, totalPrice, fetchCartItems }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}