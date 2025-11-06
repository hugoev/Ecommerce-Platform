import { salesApi, salesHelpers } from '@/api/sales';
import type { Item } from '@/types';
import { useEffect, useState } from 'react';

interface SalesItem extends Item {
  itemId: number;
  originalPrice: number;
  salePrice: number;
  discountPercentage: number;
  saleStartDate: string;
  saleEndDate: string;
  isActive: boolean;
}

interface UseSalesState {
  salesItems: SalesItem[];
  loading: boolean;
  error: string | null;
}

interface UseSalesActions {
  fetchSalesItems: () => Promise<void>;
  createSalesItem: (salesItem: {
    itemId: number;
    salePrice: number;
    saleStartDate: string;
    saleEndDate: string;
  }) => Promise<SalesItem | null>;
  updateSalesItem: (id: number, updates: Partial<{
    salePrice: number;
    saleStartDate: string;
    saleEndDate: string;
  }>) => Promise<SalesItem | null>;
  deleteSalesItem: (id: number) => Promise<void>;
  toggleActive: (id: number) => Promise<void>;
  clearError: () => void;
}

export function useSales(): UseSalesState & UseSalesActions {
  const [salesItems, setSalesItems] = useState<SalesItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSalesItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const salesItemResponses = await salesApi.getAll();
      const convertedSalesItems = salesItemResponses.map(salesHelpers.fromBackend);
      setSalesItems(convertedSalesItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sales items');
    } finally {
      setLoading(false);
    }
  };

  const createSalesItem = async (salesItem: {
    itemId: number;
    salePrice: number;
    saleStartDate: string;
    saleEndDate: string;
  }): Promise<SalesItem | null> => {
    try {
      setLoading(true);
      setError(null);
      const salesItemResponse = await salesApi.create(salesItem);
      const newSalesItem = salesHelpers.fromBackend(salesItemResponse);
      setSalesItems(prev => [...prev, newSalesItem]);
      return newSalesItem;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create sales item');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateSalesItem = async (id: number, updates: Partial<{
    salePrice: number;
    saleStartDate: string;
    saleEndDate: string;
  }>): Promise<SalesItem | null> => {
    try {
      setLoading(true);
      setError(null);
      const salesItemResponse = await salesApi.update(id, updates);
      const updatedSalesItem = salesHelpers.fromBackend(salesItemResponse);
      setSalesItems(prev => 
        prev.map(item => item.id === id ? updatedSalesItem : item)
      );
      return updatedSalesItem;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update sales item');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteSalesItem = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      await salesApi.delete(id);
      setSalesItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete sales item');
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const salesItemResponse = await salesApi.toggleActive(id);
      const updatedSalesItem = salesHelpers.fromBackend(salesItemResponse);
      setSalesItems(prev => 
        prev.map(item => item.id === id ? updatedSalesItem : item)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle sales item status');
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  useEffect(() => {
    fetchSalesItems();
  }, []);

  return {
    salesItems,
    loading,
    error,
    fetchSalesItems,
    createSalesItem,
    updateSalesItem,
    deleteSalesItem,
    toggleActive,
    clearError,
  };
}
