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
  // Place a new order
  placeOrder(): Promise<OrderResponse> {
    return apiService.post<{ success: boolean; data: OrderResponse }, {}>('/api/orders/place', {})
      .then(response => response.data);
  },

  // Get user's orders
  getUserOrders(): Promise<OrderResponse[]> {
    return apiService.get<{ success: boolean; data: OrderResponse[] }>('/api/orders')
      .then(response => response.data);
  },

  // Get order by ID
  getOrderById(orderId: number): Promise<OrderResponse> {
    return apiService.get<{ success: boolean; data: OrderResponse }>(`/api/orders/${orderId}`)
      .then(response => response.data);
  },

  // Update order status (admin only)
  updateOrderStatus(orderId: number, status: string): Promise<OrderResponse> {
    return apiService.put<{ success: boolean; data: OrderResponse }, { status: string }>(`/api/orders/${orderId}/status`, { status })
      .then(response => response.data);
  },

  // Get all orders (admin only)
  getAllOrders(): Promise<OrderResponse[]> {
    return apiService.get<{ success: boolean; data: OrderResponse[] }>('/api/orders/admin/all')
      .then(response => response.data);
  },
};

// Helper functions to convert between backend and frontend data formats
export const orderHelpers = {
  fromBackend(order: OrderResponse): Order {
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
