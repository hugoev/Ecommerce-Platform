import { itemHelpers, itemsApi, type UpdateItemData } from '@/api/items';
import type { Item } from '@/types';
import { useCallback, useEffect, useState } from 'react';

interface UseItemsState {
  items: Item[];
  loading: boolean;
  error: string | null;
  totalElements: number;
  totalPages: number;
}

interface UseItemsActions {
  fetchItems: (params?: {
    search?: string;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
    pageNumber?: number;
    pageSize?: number;
  }) => Promise<void>;
  createItem: (item: Omit<Item, 'id'>) => Promise<void>;
  updateItem: (id: number, updates: UpdateItemData) => Promise<void>;
  deleteItem: (id: number) => Promise<void>;
  clearError: () => void;
}

export function useItems(): UseItemsState & UseItemsActions {
  const [state, setState] = useState<UseItemsState>({
    items: [],
    loading: false,
    error: null,
    totalElements: 0,
    totalPages: 0
  });

  const fetchItems = useCallback(async (params?: {
    search?: string;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
    pageNumber?: number;
    pageSize?: number;
  }) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await itemsApi.getAll(params);
      const items = response.content.map(itemHelpers.fromBackend);

      setState(prev => ({
        ...prev,
        items,
        loading: false,
        totalElements: response.totalElements,
        totalPages: response.totalPages
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch items'
      }));
    }
  }, []);

  const createItem = useCallback(async (item: Omit<Item, 'id'>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const itemData = itemHelpers.toBackend(item);
      const response = await itemsApi.create(itemData);
      const newItem = itemHelpers.fromBackend(response);

      setState(prev => ({
        ...prev,
        items: [...prev.items, newItem],
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to create item'
      }));
      throw error;
    }
  }, []);

  const updateItem = useCallback(async (id: number, updates: UpdateItemData) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await itemsApi.update(id, updates);
      const updatedItem = itemHelpers.fromBackend(response);

      setState(prev => ({
        ...prev,
        items: prev.items.map(item => item.id === id ? updatedItem : item),
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to update item'
      }));
      throw error;
    }
  }, []);

  const deleteItem = useCallback(async (id: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      await itemsApi.delete(id);

      setState(prev => ({
        ...prev,
        items: prev.items.filter(item => item.id !== id),
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to delete item'
      }));
      throw error;
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Fetch items on mount
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return {
    ...state,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    clearError
  };
}
