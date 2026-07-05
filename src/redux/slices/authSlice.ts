import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { authService } from '@/services/authService.ts';
import type { AuthState, User, UserProfile } from '@/types/auth.types.ts';

const initialState: AuthState = {
  user: null,
  profile: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const loginDevice = createAsyncThunk<
  { user: User; token: string; profile: UserProfile | null },
  void,
  { rejectValue: string }
>('auth/loginDevice', async (_, { rejectWithValue }) => {
  try {
    const { user, token } = await authService.loginDevice();
    const profile = await authService.getProfile();
    return { user, token, profile };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed';
    return rejectWithValue(message);
  }
});

export const setupAccount = createAsyncThunk<
  { user: User; token: string; profile: UserProfile },
  UserProfile,
  { rejectValue: string }
>('auth/setupAccount', async (profile, { rejectWithValue }) => {
  try {
    return await authService.setupAccount(profile);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Account setup failed';
    return rejectWithValue(message);
  }
});

export const saveUserProfile = createAsyncThunk<
  UserProfile,
  UserProfile,
  { rejectValue: string; state: { auth: AuthState } }
>('auth/saveProfile', async (profile, { rejectWithValue }) => {
  try {
    return await authService.saveProfile(profile);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save profile';
    return rejectWithValue(message);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      authService.logout();
      state.user = null;
      state.profile = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.isLoading = false;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
    hydrateAuth: (
      state,
      action: PayloadAction<{ user: User; token: string; profile: UserProfile | null }>,
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.profile = action.payload.profile;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginDevice.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginDevice.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.profile = action.payload.profile;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginDevice.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Login failed';
        state.isAuthenticated = false;
      })
      .addCase(setupAccount.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(setupAccount.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.profile = action.payload.profile;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(setupAccount.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Account setup failed';
        state.isAuthenticated = false;
      })
      .addCase(saveUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(saveUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
        if (state.user) {
          state.user.name = action.payload.name;
        }
        state.error = null;
      })
      .addCase(saveUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Failed to save profile';
      });
  },
});

export const { logout, clearAuthError, hydrateAuth } = authSlice.actions;
export default authSlice.reducer;
