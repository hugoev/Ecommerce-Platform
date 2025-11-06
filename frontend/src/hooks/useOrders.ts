import { orderHelpers, ordersApi } from '@/api/orders';
import type { Order } from '@/types';
import { useCallback, useState } from 'react';

interface UseOrdersState {
  orders: Order[];
  loading: boolean;
  error: string | null;
}

interface UseOrdersActions {
  fetchOrders: (userId: number) => Promise<void>;
  placeOrder: (userId: number) => Promise<Order | null>;
  updateOrderStatus: (orderId: number, status: string) => Promise<void>;
  clearError: () => void;
}

export function useOrders(): UseOrdersState & UseOrdersActions {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async (userId: number) => {
    try {
      setLoading(true);
      setError(null);
      const orderResponses = await ordersApi.getUserOrders(userId);
      const convertedOrders = orderResponses.map(orderHelpers.fromBackend);
      setOrders(convertedOrders);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, []);

  const placeOrder = async (userId: number): Promise<Order | null> => {
    try {
      setLoading(true);
      setError(null);
      const orderResponse = await ordersApi.placeOrder(userId);
      const newOrder = orderHelpers.fromBackend(orderResponse);
      setOrders(prev => [newOrder, ...prev]);
      return newOrder;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place order');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: number, status: string) => {
    try {
      setLoading(true);
      setError(null);
      const orderResponse = await ordersApi.updateOrderStatus(orderId, status);
      const updatedOrder = orderHelpers.fromBackend(orderResponse);
      setOrders(prev => 
        prev.map(order => order.id === orderId ? updatedOrder : order)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update order status');
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    orders,
    loading,
    error,
    fetchOrders,
    placeOrder,
    updateOrderStatus,
    clearError,
  };
}
