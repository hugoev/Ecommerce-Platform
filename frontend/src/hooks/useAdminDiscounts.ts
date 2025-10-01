import { adminApi, type CreateDiscountCodeRequest } from '@/api/admin';
import { useCallback, useEffect, useState } from 'react';

export interface DiscountCode {
  id: number;
  code: string;
  discountPercentage: number;
  expiryDate?: string;
  isActive: boolean;
  createdAt: string;
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
      // For now, we'll use a placeholder since the backend might not have discount endpoints
      // In a real implementation, this would call adminApi.getAllDiscountCodes()
      const mockDiscountCodes: DiscountCode[] = [
        {
          id: 1,
          code: 'SAVE20',
          discountPercentage: 20,
          expiryDate: '2024-12-31',
          isActive: true,
          createdAt: '2024-01-15T10:00:00Z',
          usageCount: 45,
        },
        {
          id: 2,
          code: 'WELCOME10',
          discountPercentage: 10,
          expiryDate: '2024-06-30',
          isActive: true,
          createdAt: '2024-02-01T14:30:00Z',
          usageCount: 23,
        },
        {
          id: 3,
          code: 'FLASH50',
          discountPercentage: 50,
          expiryDate: '2024-03-15',
          isActive: false,
          createdAt: '2024-03-01T09:15:00Z',
          usageCount: 12,
        },
      ];

      setState(prev => ({
        ...prev,
        discountCodes: mockDiscountCodes,
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
      const newDiscount = await adminApi.createDiscountCode(discount);
      const discountCode: DiscountCode = {
        id: newDiscount.id,
        code: newDiscount.code,
        discountPercentage: newDiscount.discountPercentage,
        expiryDate: discount.expiryDate,
        isActive: true,
        createdAt: new Date().toISOString(),
        usageCount: 0,
      };

      setState(prev => ({
        ...prev,
        discountCodes: [...prev.discountCodes, discountCode],
        loading: false,
      }));

      return discountCode;
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to create discount code',
      }));
      return null;
    }
  }, []);

  const updateDiscountCode = useCallback(async (id: number, updates: Partial<CreateDiscountCodeRequest>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // For now, we'll use a placeholder since the backend might not support discount updates
      // In a real implementation, this would call adminApi.updateDiscountCode(id, updates)
      console.log('Updating discount code:', id, updates);

      setState(prev => ({
        ...prev,
        discountCodes: prev.discountCodes.map(code =>
          code.id === id ? { ...code, ...updates } : code
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
      // For now, we'll use a placeholder since the backend might not support discount deletion
      // In a real implementation, this would call adminApi.deleteDiscountCode(id)
      console.log('Deleting discount code:', id);

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
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // For now, we'll use a placeholder since the backend might not support discount toggling
      // In a real implementation, this would call adminApi.toggleDiscountCode(id)
      console.log('Toggling discount code:', id);

      setState(prev => ({
        ...prev,
        discountCodes: prev.discountCodes.map(code =>
          code.id === id ? { ...code, isActive: !code.isActive } : code
        ),
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to toggle discount code',
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
