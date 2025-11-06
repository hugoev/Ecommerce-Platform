import type { Order } from '@/types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export interface OrderResponse {
  id: number;
  orderDate: string;
  status: string;
  total: number;
  subtotal: number;
  tax: number;
  discountAmount: number;
  appliedDiscountCode?: string;
  username: string;
  items: OrderItemResponse[];
}

export interface OrderItemResponse {
  itemId: number;
  itemName: string;
  quantity: number;
  priceAtPurchase: number;
}

export interface UpdateOrderStatusRequest {
  status: string;
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
};

export const ordersApi = {
  // Place a new order (requires user ID)
  placeOrder(userId: number): Promise<OrderResponse> {
    return apiService.post<OrderResponse, {}>(`/api/orders/${userId}/place`, {})
      .then(response => {
        // Backend returns OrderDto directly (not wrapped in ApiResponse)
        // Map orderItems to items and userUsername to username
        return {
          id: response.id,
          orderDate: response.orderDate,
          status: response.status,
          total: response.total,
          subtotal: response.subtotal,
          tax: response.tax,
          discountAmount: response.discountAmount || 0,
          appliedDiscountCode: response.appliedDiscountCode,
          username: response.username || (response as any).userUsername || '',
          items: response.items || (response as any).orderItems || [],
        };
      });
  },

  // Get user's orders (requires user ID)
  getUserOrders(userId: number): Promise<OrderResponse[]> {
    return apiService.get<OrderResponse[]>(`/api/orders/${userId}`)
      .then(response => {
        // Backend returns OrderDto[] directly (not wrapped in ApiResponse)
        // Map orderItems to items and userUsername to username
        return Array.isArray(response) ? response.map(order => ({
          id: order.id || (order as any).id,
          orderDate: order.orderDate || (order as any).orderDate,
          status: order.status || (order as any).status,
          total: order.total || (order as any).total,
          subtotal: order.subtotal || (order as any).subtotal,
          tax: order.tax || (order as any).tax,
          discountAmount: order.discountAmount || (order as any).discountAmount || 0,
          appliedDiscountCode: order.appliedDiscountCode || (order as any).appliedDiscountCode,
          username: order.username || (order as any).userUsername || '',
          items: order.items || (order as any).orderItems || [],
        })) : [];
      });
  },

  // Get order by ID (requires user ID for security)
  getOrderById(userId: number, orderId: number): Promise<OrderResponse> {
    return apiService.get<{ success: boolean; data: OrderResponse }>(`/api/orders/${userId}/${orderId}`)
      .then(response => response.data);
  },

  // Update order status (admin only)
  updateOrderStatus(orderId: number, status: string): Promise<OrderResponse> {
    return apiService.put<{ success: boolean; data: OrderResponse }, { statusString: string }>(`/api/orders/${orderId}/status`, { statusString: status })
      .then(response => response.data);
  },

  // Get all orders (admin only)
  getAllOrders(): Promise<OrderResponse[]> {
    return apiService.get<{ success: boolean; data: OrderResponse[] }>('/api/orders/admin/all')
      .then(response => response.data);
  },

  // Get orders by status (admin only)
  getOrdersByStatus(status: string): Promise<OrderResponse[]> {
    return apiService.get<{ success: boolean; data: OrderResponse[] }>(`/api/orders/admin/status/${status}`)
      .then(response => response.data);
  },
};

// Helper functions to convert between backend and frontend data formats
export const orderHelpers = {
  fromBackend(order: OrderResponse): Order {
    // Normalize the orderDate to handle different backend formats
    const normalizeDate = (date: any): string => {
      if (!date) {
        console.warn('Order date is null or undefined');
        return new Date().toISOString(); // Fallback to current date
      }
      
      // If it's already a string, validate and return it
      if (typeof date === 'string') {
        // Check if it's a valid ISO string
        const parsed = new Date(date);
        if (!isNaN(parsed.getTime()) && parsed.getFullYear() >= 2000) {
          return date;
        }
        // If it's an invalid string or old date, log and return current date
        console.warn('Invalid or old date string:', date, 'parsed as:', parsed);
        return new Date().toISOString();
      }
      
      // If it's an array (Jackson serialized OffsetDateTime), convert it
      if (Array.isArray(date)) {
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
            return new Date().toISOString();
          }
          
          // Check if year is suspiciously old (likely wrong conversion)
          if (year < 2000) {
            console.error('Date array has suspiciously old year:', date, 'Year:', year);
            return new Date().toISOString();
          }
          
          // Validate ranges
          if (year < 2000 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) {
            console.error('Invalid date array values out of range:', date);
            return new Date().toISOString();
          }
          
          // Note: month is 1-indexed in Jackson (1-12), but JavaScript Date uses 0-indexed (0-11)
          const jsDate = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
          
          if (isNaN(jsDate.getTime())) {
            console.error('Invalid date created from array:', date, '->', jsDate);
            return new Date().toISOString();
          }
          
          // Double-check the year is correct
          if (jsDate.getUTCFullYear() !== year) {
            console.error('Date conversion mismatch:', date, 'expected year', year, 'got', jsDate.getUTCFullYear());
            return new Date().toISOString();
          }
          
          const isoString = jsDate.toISOString();
          return isoString;
        } else {
          console.error('Date array too short:', date);
          return new Date().toISOString();
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
          return new Date().toISOString();
        }
        if (jsDate.getFullYear() < 2000) {
          console.error('Timestamp too old:', date, '->', jsDate, 'milliseconds:', milliseconds);
          return new Date().toISOString();
        }
        const isoString = jsDate.toISOString();
        return isoString;
      }
      
      // Fallback: try to convert to string
      console.warn('Unknown date format:', typeof date, date);
      return new Date().toISOString();
    };

    return {
      id: order.id,
      orderDate: normalizeDate(order.orderDate),
      status: order.status,
      total: order.total,
      subtotal: order.subtotal,
      tax: order.tax,
      discountAmount: order.discountAmount || 0,
      appliedDiscountCode: order.appliedDiscountCode,
      username: order.username || '',
      items: (order.items && Array.isArray(order.items) ? order.items : []).map(item => ({
        itemId: item.itemId,
        itemName: item.itemName || 'Unknown Item',
        quantity: item.quantity || 0,
        priceAtPurchase: item.priceAtPurchase || 0,
      })),
    };
  },

  toBackend(order: Order): OrderResponse {
    return {
      id: order.id,
      orderDate: order.orderDate,
      status: order.status,
      total: order.total,
      subtotal: order.subtotal,
      tax: order.tax,
      discountAmount: order.discountAmount,
      appliedDiscountCode: order.appliedDiscountCode,
      username: order.username,
      items: order.items.map(item => ({
        itemId: item.itemId,
        itemName: item.itemName,
        quantity: item.quantity,
        priceAtPurchase: item.priceAtPurchase,
      })),
    };
  },
};
