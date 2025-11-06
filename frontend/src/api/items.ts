import type { Item } from '@/types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export interface ItemResponse {
  id: number;
  title: string;
  description: string;
  price: number;
  quantityAvailable: number;
  imageUrl?: string;
  category?: string;
  sku?: string;
}

export interface CreateItemData {
  title: string;
  description: string;
  price: number;
  quantityAvailable: number;
  imageUrl?: string;
  category?: string;
  sku?: string;
}

export interface UpdateItemData {
  title?: string;
  description?: string;
  price?: number;
  quantityAvailable?: number;
  imageUrl?: string;
  category?: string;
  sku?: string;
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
    return apiService.get<{ success: boolean; data: ItemResponse[]; pagination: any }>('/api/items', params as Record<string, string>)
      .then(response => ({
        content: response.data,
        totalElements: response.data.length,
        totalPages: 1
      }));
  },

  // Get item by ID
  getById(id: number): Promise<ItemResponse> {
    return apiService.get<{ success: boolean; data: ItemResponse }>(`/api/items/${id}`)
      .then(response => response.data);
  },

  // Create new item
  create(item: CreateItemData): Promise<ItemResponse> {
    return apiService.post<{ success: boolean; data: ItemResponse }, CreateItemData>('/api/items', item)
      .then(response => response.data);
  },

  // Update existing item
  update(id: number, updates: UpdateItemData): Promise<ItemResponse> {
    return apiService.put<{ success: boolean; data: ItemResponse }, UpdateItemData>(`/api/items/${id}`, updates)
      .then(response => response.data);
  },

  // Replace entire item
  replace(id: number, item: CreateItemData): Promise<ItemResponse> {
    return apiService.put<{ success: boolean; data: ItemResponse }, CreateItemData>(`/api/items/${id}`, item)
      .then(response => response.data);
  },

  // Delete item
  delete(id: number): Promise<void> {
    return apiService.delete(`/api/items/${id}`);
  },

  // Upload image
  uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('token');
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return fetch(`${BASE_URL}/api/items/upload-image`, {
      method: 'POST',
      headers: headers,
      body: formData,
    })
      .then(response => {
        if (!response.ok) {
          return response.json().then(error => {
            throw new Error(error.message || 'Failed to upload image');
          });
        }
        return response.json();
      })
      .then(response => {
        // If the response is a relative path, make it absolute
        const imageUrl = response.data;
        if (imageUrl && imageUrl.startsWith('/')) {
          // Construct absolute URL using the base URL
          const baseUrl = BASE_URL.replace(/\/$/, ''); // Remove trailing slash
          return baseUrl + imageUrl;
        }
        return imageUrl;
      });
  },
};

// Helper functions to convert between backend and frontend data formats
export const itemHelpers = {
  fromBackend(item: ItemResponse): Item {
    return {
      id: item.id,
      title: item.title,
      description: item.description,
      price: item.price,
      quantityAvailable: item.quantityAvailable,
      category: item.category,
      imageUrl: item.imageUrl,
      sku: item.sku
    };
  },

  toBackend(item: Omit<Item, 'id'>): CreateItemData {
    return {
      title: item.title,
      description: item.description,
      price: item.price,
      quantityAvailable: item.quantityAvailable,
      category: item.category,
      imageUrl: item.imageUrl,
      sku: item.sku
    };
  }
};
