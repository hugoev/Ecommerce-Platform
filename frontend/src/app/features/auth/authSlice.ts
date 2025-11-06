import type { LoginCredentials, RegisterData, User } from '@/types';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// Helper function to decode JWT token
function decodeJWT(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

// Helper function to check if token is expired
function isTokenValid(token: string): boolean {
  try {
    const decoded = decodeJWT(token);
    if (!decoded || !decoded.exp) return false;
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch (error) {
    return false;
  }
}

// Helper function to restore auth state from localStorage
function getInitialAuthState(): AuthState {
  const token = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');

  if (token && isTokenValid(token) && storedUser) {
    try {
      const user = JSON.parse(storedUser);
      return {
        user,
        isAuthenticated: true,
        status: 'succeeded' as const,
        error: null,
      };
    } catch (error) {
      // If parsing fails, clear invalid data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  } else if (token && !isTokenValid(token)) {
    // Token expired, clear it
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  return {
    user: null,
    isAuthenticated: false,
    status: 'idle' as const,
    error: null,
  };
}

const initialState: AuthState = getInitialAuthState();

import { authApi } from '@/api/auth';

// Async thunk for user registration
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData: RegisterData, { rejectWithValue }) => {
    try {
      const user = await authApi.register(userData);
      return user;
    } catch (error: unknown) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Async thunk for user login
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const user = await authApi.login(credentials);
      return user;
    } catch (error: unknown) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.status = 'idle';
      state.error = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    clearAuth: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.status = 'idle';
      state.error = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.status = 'succeeded';
        state.isAuthenticated = true;
        state.user = action.payload;
        // Store user in localStorage for persistence
        localStorage.setItem('user', JSON.stringify(action.payload));
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<{ user: User; token: string }>) => {
        state.status = 'succeeded';
        state.isAuthenticated = true;
        state.user = action.payload.user;
        // Store user in localStorage for persistence
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearAuth } = authSlice.actions;

export default authSlice.reducer;
