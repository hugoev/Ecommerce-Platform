import type { Item } from '@/types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export interface SalesItemResponse {
  id: number;
  title: string;
  description: string;
  originalPrice: number;
  salePrice: number;
  discountPercentage: number;
  quantityAvailable: number;
  imageUrl?: string;
  category?: string;
  sku?: string;
  saleStartDate: string;
  saleEndDate: string;
  isActive: boolean;
}

export interface CreateSalesItemData {
  itemId: number;
  salePrice: number;
  saleStartDate: string;
  saleEndDate: string;
}

const apiService = {
  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${BASE_URL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, value);
        }
      });
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || 'An unknown error occurred');
    }

    return response.json();
  },

  async post<T, TBody>(endpoint: string, body: TBody): Promise<T> {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || 'An unknown error occurred');
    }

    return response.json();
  },

  async put<T, TBody>(endpoint: string, body: TBody): Promise<T> {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || 'An unknown error occurred');
    }

    return response.json();
  },

  async delete(endpoint: string): Promise<void> {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || 'An unknown error occurred');
    }
  },
};

export const salesApi = {
  // Get all sales items
  getAll(): Promise<SalesItemResponse[]> {
    return apiService.get<{ success: boolean; data: SalesItemResponse[] }>('/api/sales')
      .then(response => response.data);
  },

  // Get sales item by ID
  getById(id: number): Promise<SalesItemResponse> {
    return apiService.get<{ success: boolean; data: SalesItemResponse }>(`/api/sales/${id}`)
      .then(response => response.data);
  },

  // Create new sales item
  create(salesItem: CreateSalesItemData): Promise<SalesItemResponse> {
    return apiService.post<{ success: boolean; data: SalesItemResponse }, CreateSalesItemData>('/api/sales', salesItem)
      .then(response => response.data);
  },

  // Update sales item
  update(id: number, updates: Partial<CreateSalesItemData>): Promise<SalesItemResponse> {
    return apiService.put<{ success: boolean; data: SalesItemResponse }, Partial<CreateSalesItemData>>(`/api/sales/${id}`, updates)
      .then(response => response.data);
  },

  // Delete sales item
  delete(id: number): Promise<void> {
    return apiService.delete(`/api/sales/${id}`);
  },

  // Toggle sales item active status
  toggleActive(id: number): Promise<SalesItemResponse> {
    return apiService.put<{ success: boolean; data: SalesItemResponse }, {}>(`/api/sales/${id}/toggle`, {})
      .then(response => response.data);
  },
};

// Helper functions to convert between backend and frontend data formats
export const salesHelpers = {
  fromBackend(salesItem: SalesItemResponse): Item & { 
    originalPrice: number; 
    salePrice: number; 
    discountPercentage: number; 
    saleStartDate: string; 
    saleEndDate: string; 
    isActive: boolean; 
  } {
    return {
      id: salesItem.id,
      title: salesItem.title,
      description: salesItem.description,
      price: salesItem.salePrice, // Use sale price as the current price
      originalPrice: salesItem.originalPrice,
      salePrice: salesItem.salePrice,
      discountPercentage: salesItem.discountPercentage,
      quantityAvailable: salesItem.quantityAvailable,
      imageUrl: salesItem.imageUrl,
      category: salesItem.category,
      sku: salesItem.sku,
      saleStartDate: salesItem.saleStartDate,
      saleEndDate: salesItem.saleEndDate,
      isActive: salesItem.isActive,
    };
  },

  toBackend(salesItem: Partial<CreateSalesItemData>): CreateSalesItemData {
    return {
      itemId: salesItem.itemId!,
      salePrice: salesItem.salePrice!,
      saleStartDate: salesItem.saleStartDate!,
      saleEndDate: salesItem.saleEndDate!,
    };
  },
};
