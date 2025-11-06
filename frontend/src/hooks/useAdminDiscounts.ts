import { adminApi, type CreateDiscountCodeRequest } from '@/api/admin';
import { useCallback, useEffect, useState } from 'react';

export interface DiscountCode {
  id: number;
  code: string;
  discountPercentage: number;
  expiryDate?: string;
  active: boolean;
  createdAt?: string;
  usageCount: number;
}

interface UseAdminDiscountsState {
  discountCodes: DiscountCode[];
  loading: boolean;
  error: string | null;
}

interface UseAdminDiscountsActions {
  fetchDiscountCodes: () => Promise<void>;
  createDiscountCode: (discount: CreateDiscountCodeRequest) => Promise<DiscountCode | null>;
  updateDiscountCode: (id: number, updates: Partial<CreateDiscountCodeRequest>) => Promise<void>;
  deleteDiscountCode: (id: number) => Promise<void>;
  toggleDiscountCode: (id: number) => Promise<void>;
  clearError: () => void;
}

export function useAdminDiscounts(): UseAdminDiscountsState & UseAdminDiscountsActions {
  const [state, setState] = useState<UseAdminDiscountsState>({
    discountCodes: [],
    loading: false,
    error: null,
  });

  const fetchDiscountCodes = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const discountCodeResponses = await adminApi.getAllDiscountCodes();

      // Transform API response to match our interface
      const discountCodes: DiscountCode[] = discountCodeResponses.map(response => ({
        id: response.id,
        code: response.code,
        discountPercentage: response.discountPercentage,
        expiryDate: response.expiryDate,
        active: response.active,
        createdAt: response.createdAt,
        usageCount: 0, // Backend doesn't provide usage count, default to 0
      }));

      setState(prev => ({
        ...prev,
        discountCodes,
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch discount codes',
      }));
    }
  }, []);

  const createDiscountCode = useCallback(async (discount: CreateDiscountCodeRequest): Promise<DiscountCode | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      await adminApi.createDiscountCode(discount);
      // Refresh the list to get the actual createdAt from the database
      await fetchDiscountCodes();
      
      setState(prev => ({ ...prev, loading: false }));
      return null; // Return value not needed since we refresh the list
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to create discount code',
      }));
      return null;
    }
  }, [fetchDiscountCodes]);

  const updateDiscountCode = useCallback(async (id: number, updates: Partial<CreateDiscountCodeRequest>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const updatedDiscount = await adminApi.updateDiscountCode(id, updates);

      setState(prev => ({
        ...prev,
        discountCodes: prev.discountCodes.map(code =>
          code.id === id ? {
            ...code,
            code: updatedDiscount.code,
            discountPercentage: updatedDiscount.discountPercentage,
            expiryDate: updatedDiscount.expiryDate,
            active: updatedDiscount.active
          } : code
        ),
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to update discount code',
      }));
    }
  }, []);

  const deleteDiscountCode = useCallback(async (id: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      await adminApi.deleteDiscountCode(id);

      setState(prev => ({
        ...prev,
        discountCodes: prev.discountCodes.filter(code => code.id !== id),
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to delete discount code',
      }));
    }
  }, []);

  const toggleDiscountCode = useCallback(async (id: number) => {
    let currentActiveStatus: boolean | undefined;

    setState(prev => {
      const currentDiscount = prev.discountCodes.find(code => code.id === id);
      if (!currentDiscount) {
        return { ...prev, loading: false, error: 'Discount code not found' };
      }

      currentActiveStatus = currentDiscount.active;

      // Optimistically update the UI
      return {
        ...prev,
        loading: true,
        error: null,
        discountCodes: prev.discountCodes.map(code =>
          code.id === id ? { ...code, active: !code.active } : code
        ),
      };
    });

    try {
      // Call the API to persist the change
      if (currentActiveStatus !== undefined) {
        await adminApi.updateDiscountCode(id, { active: !currentActiveStatus });
      }

      setState(prev => ({ ...prev, loading: false }));
    } catch (error) {
      // Revert the optimistic update on error
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to toggle discount code',
        discountCodes: prev.discountCodes.map(code =>
          code.id === id ? { ...code, active: currentActiveStatus || code.active } : code // Revert the change
        ),
      }));
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  useEffect(() => {
    fetchDiscountCodes();
  }, [fetchDiscountCodes]);

  return {
    ...state,
    fetchDiscountCodes,
    createDiscountCode,
    updateDiscountCode,
    deleteDiscountCode,
    toggleDiscountCode,
    clearError,
  };
}
