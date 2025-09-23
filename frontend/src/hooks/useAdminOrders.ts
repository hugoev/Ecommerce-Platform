import { orderHelpers, ordersApi } from '@/api/orders';
import type { Order } from '@/types';
import { useEffect, useState } from 'react';

interface UseAdminOrdersState {
  orders: Order[];
  loading: boolean;
  error: string | null;
}

interface UseAdminOrdersActions {
  fetchAllOrders: () => Promise<void>;
  updateOrderStatus: (orderId: number, status: string) => Promise<void>;
  clearError: () => void;
}

export function useAdminOrders(): UseAdminOrdersState & UseAdminOrdersActions {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const orderResponses = await ordersApi.getAllOrders();
      const convertedOrders = orderResponses.map(orderHelpers.fromBackend);
      setOrders(convertedOrders);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
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

  useEffect(() => {
    fetchAllOrders();
  }, []);

  return {
    orders,
    loading,
    error,
    fetchAllOrders,
    updateOrderStatus,
    clearError,
  };
}
