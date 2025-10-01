import { adminApi, type AdminUserResponse } from '@/api/admin';
import { useCallback, useEffect, useState } from 'react';

interface UseAdminUsersState {
  users: AdminUserResponse[];
  loading: boolean;
  error: string | null;
  totalElements: number;
  totalPages: number;
}

interface UseAdminUsersActions {
  fetchUsers: (page?: number, size?: number, search?: string) => Promise<void>;
  createUser: (user: { username: string; fullName: string; role: string }) => Promise<void>;
  updateUser: (id: number, updates: Partial<AdminUserResponse>) => Promise<void>;
  deleteUser: (id: number) => Promise<void>;
  clearError: () => void;
}

export function useAdminUsers(): UseAdminUsersState & UseAdminUsersActions {
  const [state, setState] = useState<UseAdminUsersState>({
    users: [],
    loading: false,
    error: null,
    totalElements: 0,
    totalPages: 0,
  });

  const fetchUsers = useCallback(async (page = 0, size = 10) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await adminApi.getAllUsers(page, size);
      setState(prev => ({
        ...prev,
        users: response.content,
        totalElements: response.totalElements,
        totalPages: response.totalPages,
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch users',
      }));
    }
  }, []);

  const createUser = useCallback(async (user: { username: string; fullName: string; role: string }) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // For now, we'll use a placeholder since the backend might not support user creation
      // In a real implementation, this would call an API endpoint
      console.log('Creating user:', user);
      // Refresh users list after creation
      await fetchUsers();
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to create user',
      }));
    }
  }, [fetchUsers]);

  const updateUser = useCallback(async (id: number, updates: Partial<AdminUserResponse>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // For now, we'll use a placeholder since the backend might not support user updates
      // In a real implementation, this would call an API endpoint
      console.log('Updating user:', id, updates);
      // Refresh users list after update
      await fetchUsers();
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to update user',
      }));
    }
  }, [fetchUsers]);

  const deleteUser = useCallback(async (id: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // For now, we'll use a placeholder since the backend might not support user deletion
      // In a real implementation, this would call an API endpoint
      console.log('Deleting user:', id);
      // Refresh users list after deletion
      await fetchUsers();
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to delete user',
      }));
    }
  }, [fetchUsers]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    ...state,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    clearError,
  };
}
