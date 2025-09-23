import type { User } from '@/types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export interface UserProfileResponse {
  id: number;
  username: string;
  fullName: string;
  role: string;
  createdAt: string;
  isActive: boolean;
  address?: string;
  phone?: string;
}

export interface UpdateProfileRequest {
  fullName?: string;
  address?: string;
  phone?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

const apiService = {
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
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || 'An unknown error occurred');
    }

    return response.json();
  },
};

export const userApi = {
  // Get user profile
  getProfile(userId: number): Promise<UserProfileResponse> {
    return apiService.get<{ success: boolean; data: UserProfileResponse }>(`/api/auth/profile/${userId}`)
      .then(response => response.data);
  },

  // Update user profile
  updateProfile(userId: number, updates: UpdateProfileRequest): Promise<UserProfileResponse> {
    return apiService.put<{ success: boolean; data: UserProfileResponse }, UpdateProfileRequest>(`/api/auth/profile/${userId}`, updates)
      .then(response => response.data);
  },

  // Change password
  changePassword(userId: number, passwordData: ChangePasswordRequest): Promise<void> {
    return apiService.post<void, ChangePasswordRequest>(`/api/auth/change-password/${userId}`, passwordData);
  },
};

export const userHelpers = {
  fromBackend(user: UserProfileResponse): User {
    return {
      id: user.id,
      username: user.username,
      email: '', // Email is no longer used
      firstName: user.fullName.split(' ')[0] || '',
      lastName: user.fullName.split(' ').slice(1).join(' ') || '',
      role: user.role as 'ROLE_USER' | 'ROLE_ADMIN',
    };
  },
};
