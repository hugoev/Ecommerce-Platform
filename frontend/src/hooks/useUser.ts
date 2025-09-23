import { userApi, type ChangePasswordRequest, type UpdateProfileRequest, type UserProfileResponse } from '@/api/user';
import { useCallback, useState } from 'react';

interface UseUserState {
  profile: UserProfileResponse | null;
  loading: boolean;
  error: string | null;
}

interface UseUserActions {
  fetchProfile: (userId: number) => Promise<void>;
  updateProfile: (userId: number, updates: UpdateProfileRequest) => Promise<void>;
  changePassword: (userId: number, passwordData: ChangePasswordRequest) => Promise<void>;
  clearError: () => void;
}

export function useUser(): UseUserState & UseUserActions {
  const [state, setState] = useState<UseUserState>({
    profile: null,
    loading: false,
    error: null,
  });

  const fetchProfile = useCallback(async (userId: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const profile = await userApi.getProfile(userId);
      setState(prev => ({
        ...prev,
        profile,
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch profile'
      }));
    }
  }, []);

  const updateProfile = useCallback(async (userId: number, updates: UpdateProfileRequest) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const updatedProfile = await userApi.updateProfile(userId, updates);
      setState(prev => ({
        ...prev,
        profile: updatedProfile,
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to update profile'
      }));
      throw error;
    }
  }, []);

  const changePassword = useCallback(async (userId: number, passwordData: ChangePasswordRequest) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      await userApi.changePassword(userId, passwordData);
      setState(prev => ({
        ...prev,
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to change password'
      }));
      throw error;
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    fetchProfile,
    updateProfile,
    changePassword,
    clearError,
  };
}
