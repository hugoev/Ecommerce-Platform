import type { User } from '@/types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const apiService = {
  async post<T>(endpoint: string, body: any): Promise<T> {
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
};

export const authApi = {
  register(userData: any): Promise<User> {
    return apiService.post<User>('/api/auth/register', userData);
  },

  login(credentials: any): Promise<User> {
    return apiService.post<User>('/api/auth/login', credentials);
  },
};
