import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as SecureStore from 'expo-secure-store';
import { AuthState, LoginCredentials, RegisterCredentials, User } from '@/types/auth';
import { authService } from '@/services/api';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const user = await authService.login(credentials);
      console.log('Login successful:', user);
      // Store token and user securely
      await SecureStore.setItemAsync(TOKEN_KEY, user.accessToken);
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
      return user;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (credentials: RegisterCredentials, { rejectWithValue }) => {
    try {
      const user = await authService.register(credentials);
      // Store token and user securely
      await SecureStore.setItemAsync(TOKEN_KEY, user.accessToken);
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
      return user;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Registration failed');
    }
  }
);

export const loadStoredAuth = createAsyncThunk(
  'auth/loadStored',
  async (_, { rejectWithValue }) => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      const userStr = await SecureStore.getItemAsync(USER_KEY);
      
      if (token && userStr) {
        const user = JSON.parse(userStr);
        return { user, token };
      }
      return rejectWithValue('No stored auth');
    } catch (error) {
      return rejectWithValue('Failed to load stored auth');
    }
  }
);

export const loginWithBiometric = createAsyncThunk(
  'auth/biometricLogin',
  async ({ user, token }: { user: User; token: string }, { rejectWithValue }) => {
    try {
      // Store in standard auth keys for session persistence
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
      return { user, token };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Biometric login failed');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
  }
);

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(loginUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(loginUser.fulfilled, (state, action: PayloadAction<User>) => {
      state.isLoading = false;
      state.user = action.payload;
      state.token = action.payload.accessToken;
      state.isAuthenticated = true;
      state.error = null;
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
      state.isAuthenticated = false;
    });

    // Register
    builder.addCase(registerUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(registerUser.fulfilled, (state, action: PayloadAction<User>) => {
      state.isLoading = false;
      state.user = action.payload;
      state.token = action.payload.accessToken;
      state.isAuthenticated = true;
      state.error = null;
    });
    builder.addCase(registerUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
      state.isAuthenticated = false;
    });

    // Load stored auth
    builder.addCase(loadStoredAuth.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(loadStoredAuth.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    });
    builder.addCase(loadStoredAuth.rejected, (state) => {
      state.isLoading = false;
      state.isAuthenticated = false;
    });

    // Biometric Login
    builder.addCase(loginWithBiometric.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(loginWithBiometric.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
    });
    builder.addCase(loginWithBiometric.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
      state.isAuthenticated = false;
    });

    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
