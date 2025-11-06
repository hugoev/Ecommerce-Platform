
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export interface AdminUserResponse {
  id: number;
  username: string;
  fullName: string;
  role: string;
  createdAt: string;
  isActive: boolean;
  address?: string;
  phone?: string;
}

export interface AdminItemResponse {
  id: number;
  title: string;
  description: string;
  price: number;
  quantityAvailable: number;
  imageUrl?: string;
  category?: string;
  sku?: string;
}

export interface CreateItemRequest {
  title: string;
  description: string;
  price: number;
  quantityAvailable: number;
  imageUrl?: string;
  category?: string;
  sku?: string;
}

export interface CreateDiscountCodeRequest {
  code: string;
  discountPercentage: number;
  expiryDate?: string;
  active?: boolean;
}

export interface DiscountCodeResponse {
  id: number;
  code: string;
  discountPercentage: number;
  expiryDate?: string;
  active: boolean;
  createdAt?: string;
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
        throw new Error('Unauthorized - Admin access required');
      }
      if (response.status === 403) {
        throw new Error('Forbidden - Admin privileges required');
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
        throw new Error('Unauthorized - Admin access required');
      }
      if (response.status === 403) {
        throw new Error('Forbidden - Admin privileges required');
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
        throw new Error('Unauthorized - Admin access required');
      }
      if (response.status === 403) {
        throw new Error('Forbidden - Admin privileges required');
      }
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || 'An unknown error occurred');
    }

    return response.json();
  },

  async delete<T>(endpoint: string): Promise<T> {
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized - Admin access required');
      }
      if (response.status === 403) {
        throw new Error('Forbidden - Admin privileges required');
      }
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || 'An unknown error occurred');
    }

    return response.json();
  },
};

export const adminApi = {
  // User Management
  getAllUsers(page?: number, size?: number): Promise<{ content: AdminUserResponse[]; totalElements: number; totalPages: number }> {
    const params: Record<string, string> = {};
    if (page !== undefined) params.page = page.toString();
    if (size !== undefined) params.size = size.toString();

    return apiService.get<{ success: boolean; data: AdminUserResponse[]; pagination: any }>('/api/admin/users', params)
      .then(response => ({
        content: response.data,
        totalElements: response.pagination?.totalElements || response.data.length,
        totalPages: response.pagination?.totalPages || 1
      }));
  },

  // Item Management (Admin)
  createItem(item: CreateItemRequest): Promise<AdminItemResponse> {
    return apiService.post<{ success: boolean; data: AdminItemResponse }, CreateItemRequest>('/api/admin/items', item)
      .then(response => response.data);
  },

  updateItem(id: number, item: Partial<CreateItemRequest>): Promise<AdminItemResponse> {
    return apiService.put<{ success: boolean; data: AdminItemResponse }, Partial<CreateItemRequest>>(`/api/admin/items/${id}`, item)
      .then(response => response.data);
  },

  // Discount Code Management
  getAllDiscountCodes(): Promise<DiscountCodeResponse[]> {
    return apiService.get<{ success: boolean; data: DiscountCodeResponse[] }>('/api/admin/discount-codes')
      .then(response => response.data);
  },

  createDiscountCode(discount: CreateDiscountCodeRequest): Promise<DiscountCodeResponse> {
    return apiService.post<DiscountCodeResponse, CreateDiscountCodeRequest>('/api/admin/discount-codes', discount);
  },

  updateDiscountCode(id: number, discount: Partial<CreateDiscountCodeRequest>): Promise<DiscountCodeResponse> {
    return apiService.put<DiscountCodeResponse, Partial<CreateDiscountCodeRequest>>(`/api/admin/discount-codes/${id}`, discount);
  },

  deleteDiscountCode(id: number): Promise<void> {
    return apiService.delete(`/api/admin/discount-codes/${id}`);
  },

  // Order Management (Admin)
  getAllOrders(): Promise<any[]> {
    return apiService.get<{ success: boolean; data: any[] }>('/api/orders/admin/all')
      .then(response => response.data);
  },

  getOrdersByStatus(status: string): Promise<any[]> {
    return apiService.get<{ success: boolean; data: any[] }>(`/api/orders/admin/status/${status}`)
      .then(response => response.data);
  },

  updateOrderStatus(orderId: number, status: string): Promise<any> {
    return apiService.put<{ success: boolean; data: any }, { statusString: string }>(`/api/orders/${orderId}/status`, { statusString: status })
      .then(response => response.data);
  },

  // User Management (Admin)
  updateUser(id: number, updates: { firstName?: string; lastName?: string; address?: string; phone?: string }): Promise<AdminUserResponse> {
    return apiService.put<AdminUserResponse, typeof updates>(`/api/admin/users/${id}`, updates);
  },

  activateUser(id: number): Promise<AdminUserResponse> {
    return apiService.post<AdminUserResponse, {}>(`/api/admin/users/${id}/activate`, {});
  },

  deactivateUser(id: number): Promise<AdminUserResponse> {
    return apiService.post<AdminUserResponse, {}>(`/api/admin/users/${id}/deactivate`, {});
  },

  deleteUser(id: number): Promise<void> {
    return apiService.delete(`/api/admin/users/${id}`);
  },

  changeUserRole(id: number, role: 'ROLE_USER' | 'ROLE_ADMIN'): Promise<AdminUserResponse> {
    return apiService.post<AdminUserResponse, {}>(`/api/admin/users/${id}/role?role=${role}`, {});
  },
};

// Helper functions
export const adminHelpers = {
  formatUserRole(role: string): string {
    return role.replace('ROLE_', '').toLowerCase();
  },

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  },
};

