
import { guestCartUtils } from '@/utils/guestCart';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export interface CartItemResponse {
  itemId: number;
  itemName: string;
  quantity: number;
  price: number;
  lineTotal: number;
}

export interface CartResponse {
  items: CartItemResponse[];
  subtotal: number;
  tax: number;
  discountAmount: number;
  appliedDiscountCode?: string;
  total: number;
}

export interface AddItemRequest {
  quantity: number;
}

export interface UpdateQuantityRequest {
  quantity: number;
}

export interface ChangeQuantityRequest {
  amount: number;
}

export interface ApplyDiscountRequest {
  discountCode: string;
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

    const token = localStorage.getItem('token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized - Please log in');
      }
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || 'An unknown error occurred');
    }

    return response.json();
  },

  async post<T, TBody>(endpoint: string, body: TBody): Promise<T> {
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized - Please log in');
      }
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || 'An unknown error occurred');
    }

    return response.json();
  },

  async put<T, TBody>(endpoint: string, body: TBody): Promise<T> {
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized - Please log in');
      }
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || 'An unknown error occurred');
    }

    return response.json();
  },

  async delete(endpoint: string): Promise<void> {
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized - Please log in');
      }
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || 'An unknown error occurred');
    }
  },
};

export const cartApi = {
  // Get cart summary with calculated totals
  getCartSummary(userId: number): Promise<CartResponse> {
    return apiService.get<CartResponse>(`/api/cart/${userId}/summary`);
  },

  // Add item to cart (handles both authenticated and guest users)
  async addItem(userId: number, itemId: number, quantity: number): Promise<void> {
    try {
      // Try authenticated cart first
      await apiService.post<void, AddItemRequest>(`/api/cart/${userId}/items/${itemId}`, { quantity });
    } catch (error) {
      // If 401 Unauthorized, fall back to guest cart
      if (error instanceof Error && error.message.includes('Unauthorized')) {
        // For guest cart, we need item details, but we don't have them here
        // This should be handled at the component level where we have item details
        throw new Error('LOGIN_REQUIRED');
      }
      throw error;
    }
  },

  // Update item quantity
  updateQuantity(userId: number, itemId: number, quantity: number): Promise<void> {
    return apiService.put<void, UpdateQuantityRequest>(`/api/cart/${userId}/items/${itemId}`, { quantity });
  },

  // Remove item from cart
  removeItem(userId: number, itemId: number): Promise<void> {
    return apiService.delete(`/api/cart/${userId}/items/${itemId}`);
  },

  // Clear entire cart
  clearCart(userId: number): Promise<void> {
    return apiService.delete(`/api/cart/${userId}`);
  },

  // Increase item quantity
  increaseQuantity(userId: number, itemId: number, amount: number): Promise<void> {
    return apiService.post<void, ChangeQuantityRequest>(`/api/cart/${userId}/items/${itemId}/increase`, { amount });
  },

  // Decrease item quantity
  decreaseQuantity(userId: number, itemId: number, amount: number): Promise<void> {
    return apiService.post<void, ChangeQuantityRequest>(`/api/cart/${userId}/items/${itemId}/decrease`, { amount });
  },

  // Apply discount code
  applyDiscount(userId: number, discountCode: string): Promise<CartResponse> {
    return apiService.post<CartResponse, ApplyDiscountRequest>(`/api/cart/${userId}/discount`, { discountCode });
  },

  // Guest cart operations (for when user is not logged in)
  addItemToGuestCart(itemId: number, itemName: string, price: number, quantity: number): void {
    guestCartUtils.addItem(itemId, itemName, price, quantity);
  },

  getGuestCart(): any {
    return guestCartUtils.getCartSummary();
  },

  clearGuestCart(): void {
    guestCartUtils.clearCart();
  },

  hasGuestCartItems(): boolean {
    return guestCartUtils.hasItems();
  },
};

// Helper functions to convert between backend and frontend data formats
export const cartHelpers = {
  fromBackend(cart: CartResponse): CartResponse {
    return {
      items: cart.items,
      subtotal: cart.subtotal,
      tax: cart.tax,
      discountAmount: cart.discountAmount,
      appliedDiscountCode: cart.appliedDiscountCode,
      total: cart.total,
    };
  },
};
