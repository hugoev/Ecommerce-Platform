import type { Item } from '@/types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export interface ItemResponse {
  id: number;
  title: string;
  description: string;
  price: number;
  quantityAvailable: number;
}

export interface CreateItemData {
  title: string;
  description: string;
  price: number;
  quantityAvailable: number;
}

export interface UpdateItemData {
  title?: string;
  description?: string;
  price?: number;
  quantityAvailable?: number;
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
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || 'An unknown error occurred');
    }
  },
};

export const itemsApi = {
  // Get all items with optional search and sorting
  getAll(params?: {
    search?: string;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
    pageNumber?: number;
    pageSize?: number;
  }): Promise<{ content: ItemResponse[]; totalElements: number; totalPages: number }> {
    return apiService.get('/api/items', params as Record<string, string>);
  },

  // Get item by ID
  getById(id: number): Promise<ItemResponse> {
    return apiService.get(`/api/items/${id}`);
  },

  // Create new item
  create(item: CreateItemData): Promise<ItemResponse> {
    return apiService.post('/api/items', item);
  },

  // Update existing item
  update(id: number, updates: UpdateItemData): Promise<ItemResponse> {
    return apiService.put(`/api/items/${id}`, updates);
  },

  // Replace entire item
  replace(id: number, item: CreateItemData): Promise<ItemResponse> {
    return apiService.put(`/api/items/${id}`, item);
  },

  // Delete item
  delete(id: number): Promise<void> {
    return apiService.delete(`/api/items/${id}`);
  },
};

// Helper functions to convert between backend and frontend data formats
export const itemHelpers = {
  fromBackend(item: ItemResponse): Item {
    return {
      id: item.id,
      name: item.title,
      description: item.description,
      price: item.price,
      quantity: item.quantityAvailable,
      category: 'General' // Backend doesn't have category field
    };
  },

  toBackend(item: Omit<Item, 'id'>): CreateItemData {
    return {
      title: item.name,
      description: item.description,
      price: item.price,
      quantityAvailable: item.quantity
    };
  }
};
