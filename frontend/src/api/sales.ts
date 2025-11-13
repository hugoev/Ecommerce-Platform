import type { Item } from '@/types';

// Normalize BASE_URL to remove trailing slashes
const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/+$/, '');

export interface SalesItemResponse {
  id: number;
  itemId: number;
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
    itemId: number;
    originalPrice: number; 
    salePrice: number; 
    discountPercentage: number; 
    saleStartDate: string; 
    saleEndDate: string; 
    isActive: boolean; 
  } {
    // Helper to convert date (could be array or string) to ISO string
    const normalizeDate = (date: any): string => {
      if (!date) {
        console.warn('Date is null or undefined');
        return '';
      }
      
      // If it's already a string, validate and return it
      if (typeof date === 'string') {
        // Check if it's a valid ISO string
        const parsed = new Date(date);
        if (!isNaN(parsed.getTime()) && parsed.getFullYear() >= 2000) {
          return date;
        }
        // If it's an invalid string or old date, log and return empty
        console.warn('Invalid or old date string:', date, 'parsed as:', parsed);
        return '';
      }
      
      // If it's an array (Jackson serialized OffsetDateTime), convert it
      if (Array.isArray(date)) {
        console.log('Date received as array:', date, 'Length:', date.length);
        
        // Jackson serializes OffsetDateTime as: [year, month, day, hour, minute, second, nanosecond, offsetSeconds]
        // Example: [2025, 12, 6, 14, 32, 2, 411578000, -21600]
        if (date.length >= 3) {
          const year = date[0];
          const month = date[1];
          const day = date[2];
          const hour = date.length > 3 ? date[3] : 0;
          const minute = date.length > 4 ? date[4] : 0;
          const second = date.length > 5 ? date[5] : 0;
          
          // Validate the values
          if (typeof year !== 'number' || typeof month !== 'number' || typeof day !== 'number') {
            console.error('Invalid date array format - non-numeric values:', date);
            return '';
          }
          
          // Check if year is suspiciously old (likely wrong conversion)
          if (year < 2000) {
            console.error('Date array has suspiciously old year:', date, 'Year:', year);
            return '';
          }
          
          // Validate ranges
          if (year < 2000 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) {
            console.error('Invalid date array values out of range:', date);
            return '';
          }
          
          // Note: month is 1-indexed in Jackson (1-12), but JavaScript Date uses 0-indexed (0-11)
          const jsDate = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
          
          if (isNaN(jsDate.getTime())) {
            console.error('Invalid date created from array:', date, '->', jsDate);
            return '';
          }
          
          // Double-check the year is correct
          if (jsDate.getUTCFullYear() !== year) {
            console.error('Date conversion mismatch:', date, 'expected year', year, 'got', jsDate.getUTCFullYear());
            return '';
          }
          
          const isoString = jsDate.toISOString();
          console.log('Converted array to ISO:', date, '->', isoString);
          return isoString;
        } else {
          console.error('Date array too short:', date);
          return '';
        }
      }
      
      // If it's a number (timestamp), convert it
      if (typeof date === 'number') {
        // Backend sends seconds as decimal (e.g., 1762462416.848)
        // JavaScript Date expects milliseconds, so multiply by 1000
        // The decimal part represents fractional seconds (nanoseconds)
        const milliseconds = date * 1000;
        
        const jsDate = new Date(milliseconds);
        if (isNaN(jsDate.getTime())) {
          console.error('Invalid timestamp:', date, '-> milliseconds:', milliseconds);
          return '';
        }
        if (jsDate.getFullYear() < 2000) {
          console.error('Timestamp too old:', date, '->', jsDate, 'milliseconds:', milliseconds);
          return '';
        }
        const isoString = jsDate.toISOString();
        console.log('Converted timestamp to ISO:', date, 'seconds ->', milliseconds, 'ms ->', isoString);
        return isoString;
      }
      
      // Fallback: try to convert to string
      console.warn('Unknown date format:', typeof date, date);
      return String(date);
    };
    
    return {
      id: salesItem.id,
      itemId: salesItem.itemId,
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
      saleStartDate: normalizeDate(salesItem.saleStartDate),
      saleEndDate: normalizeDate(salesItem.saleEndDate),
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
