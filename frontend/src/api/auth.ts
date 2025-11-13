import { cartApi } from '@/api/cart';
import type { LoginCredentials, RegisterData, User } from '@/types';
import { guestCartUtils } from '@/utils/guestCart';

// Normalize BASE_URL to remove trailing slashes
const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/+$/, '');

const apiService = {
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

  async get<T>(endpoint: string): Promise<T> {
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
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
};

interface LoginResponse {
  user: User;
  token: string;
}

export const authApi = {
  register(userData: RegisterData): Promise<User> {
    return apiService.post<{ success: boolean; data: User }, RegisterData>('/api/auth/register', userData)
      .then(response => response.data);
  },

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await apiService.post<{ success: boolean; data: LoginResponse }, LoginCredentials>('/api/auth/login', credentials);

    // Store the JWT token in localStorage
    localStorage.setItem('token', response.data.token);

    // Transfer guest cart items to user's cart after successful login
    try {
      const guestCart = guestCartUtils.getCartSummary();
      if (guestCart && guestCart.items.length > 0) {
        const userId = response.data.user.id;

        // Add each guest cart item to the user's authenticated cart
        for (const item of guestCart.items) {
          try {
            await cartApi.addItem(userId, item.itemId, item.quantity);
          } catch (error) {
            console.warn('Failed to transfer guest cart item:', item, error);
          }
        }

        // Clear guest cart after successful transfer
        guestCartUtils.clearCart();
        console.log('✅ Guest cart items transferred to user cart');
      }
    } catch (error) {
      console.warn('Failed to transfer guest cart:', error);
      // Don't fail login if guest cart transfer fails
    }

    return response.data;
  },
};
