import type { LoginCredentials, RegisterData, User } from '@/types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

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
};

export const authApi = {
  register(userData: RegisterData): Promise<User> {
    return apiService.post<{ success: boolean; data: User }, RegisterData>('/api/auth/register', userData)
      .then(response => response.data);
  },

  login(credentials: LoginCredentials): Promise<User> {
    return apiService.post<{ success: boolean; data: User }, LoginCredentials>('/api/auth/login', credentials)
      .then(response => response.data);
  },
};
