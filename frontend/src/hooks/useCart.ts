import { cartApi, cartHelpers, type CartResponse } from '@/api/cart';
import { useCallback, useEffect, useState } from 'react';

interface UseCartState {
  cart: CartResponse | null;
  loading: boolean;
  error: string | null;
}

interface UseCartActions {
  fetchCart: (userId: number) => Promise<void>;
  addItem: (userId: number, itemId: number, quantity: number) => Promise<void>;
  updateQuantity: (userId: number, itemId: number, quantity: number) => Promise<void>;
  removeItem: (userId: number, itemId: number) => Promise<void>;
  clearCart: (userId: number) => Promise<void>;
  increaseQuantity: (userId: number, itemId: number, amount: number) => Promise<void>;
  decreaseQuantity: (userId: number, itemId: number, amount: number) => Promise<void>;
  applyDiscount: (userId: number, discountCode: string) => Promise<void>;
  clearError: () => void;
}

export function useCart(): UseCartState & UseCartActions {
  const [state, setState] = useState<UseCartState>({
    cart: null,
    loading: false,
    error: null,
  });

  // Auto-fetch cart when component mounts (for authenticated users)
  useEffect(() => {
    // This will be handled by the CartPage component
    // but we can add logic here if needed
  }, []);

  const fetchCart = useCallback(async (_userId?: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const cartResponse = await cartApi.getCartSummary();
      const cart = cartHelpers.fromBackend(cartResponse);

      setState(prev => ({
        ...prev,
        cart,
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch cart'
      }));
    }
  }, []);

  const addItem = useCallback(async (userId: number, itemId: number, quantity: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      await cartApi.addItem(userId, itemId, quantity);
      // Refresh cart after adding item
      await fetchCart(userId);
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to add item to cart'
      }));
    }
  }, [fetchCart]);

  const updateQuantity = useCallback(async (userId: number, itemId: number, quantity: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      await cartApi.updateQuantity(userId, itemId, quantity);
      // Refresh cart after updating quantity
      await fetchCart(userId);
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to update quantity'
      }));
    }
  }, [fetchCart]);

  const removeItem = useCallback(async (userId: number, itemId: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      await cartApi.removeItem(userId, itemId);
      // Refresh cart after removing item
      await fetchCart(userId);
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to remove item'
      }));
    }
  }, [fetchCart]);

  const clearCart = useCallback(async (userId: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      await cartApi.clearCart(userId);
      // Refresh cart after clearing
      await fetchCart(userId);
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to clear cart'
      }));
    }
  }, [fetchCart]);

  const increaseQuantity = useCallback(async (userId: number, itemId: number, amount: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      await cartApi.increaseQuantity(userId, itemId, amount);
      // Refresh cart after increasing quantity
      await fetchCart(userId);
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to increase quantity'
      }));
    }
  }, [fetchCart]);

  const decreaseQuantity = useCallback(async (userId: number, itemId: number, amount: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      await cartApi.decreaseQuantity(userId, itemId, amount);
      // Refresh cart after decreasing quantity
      await fetchCart(userId);
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to decrease quantity'
      }));
    }
  }, [fetchCart]);

  const applyDiscount = useCallback(async (userId: number, discountCode: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const cartResponse = await cartApi.applyDiscount(userId, discountCode);
      const cart = cartHelpers.fromBackend(cartResponse);

      setState(prev => ({
        ...prev,
        cart,
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to apply discount'
      }));
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    fetchCart,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    increaseQuantity,
    decreaseQuantity,
    applyDiscount,
    clearError,
  };
}
