import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { REHYDRATE } from 'redux-persist';
import { authService } from '@/services/authService.ts';
import { formatFirebaseAuthError } from '@/services/firebase/googleAuth.ts';
import { setCurrentSyncUid } from '@/services/firebase/syncContext.ts';
import type { AuthState, User, UserProfile } from '@/types/auth.types.ts';
import type { UserRole } from '@/types/userAccount.types.ts';

const initialState: AuthState = {
  user: null,
  profile: null,
  role: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  isSigningOut: false,
  isAuthReady: false,
  error: null,
};

export const signInWithGoogle = createAsyncThunk<
  { user: User; token: string; profile: UserProfile | null; role: UserRole } | null,
  void,
  { rejectValue: string }
>('auth/signInWithGoogle', async (_, { rejectWithValue }) => {
  try {
    return await authService.signInWithGoogle();
  } catch (error) {
    return rejectWithValue(formatFirebaseAuthError(error));
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

export const signOutUser = createAsyncThunk<void, void, { rejectValue: string }>(
  'auth/signOut',
  async (_, { rejectWithValue }) => {
    try {
      await authService.signOut();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign out failed';
      return rejectWithValue(message);
    }
  },
);

export const refreshUserRole = createAsyncThunk<UserRole | null, void>(
  'auth/refreshRole',
  async () => authService.refreshRole(),
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      setCurrentSyncUid(null);
      state.user = null;
      state.profile = null;
      state.role = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.isLoading = false;
      state.isSigningOut = false;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
    setAuthError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    setAuthReady: (state) => {
      state.isAuthReady = true;
    },
    hydrateAuth: (
      state,
      action: PayloadAction<{
        user: User;
        token: string;
        profile: UserProfile | null;
        role: UserRole;
      }>,
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.profile = action.payload.profile;
      state.role = action.payload.role;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
      setCurrentSyncUid(action.payload.user.id);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(REHYDRATE, (state) => {
        state.error = null;
        state.isLoading = false;
        state.isAuthReady = false;
      })
      .addCase(signInWithGoogle.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signInWithGoogle.fulfilled, (state, action) => {
        state.isLoading = false;
        if (!action.payload) {
          // Redirect in progress — keep loading until page returns
          state.isLoading = true;
          return;
        }
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.profile = action.payload.profile;
        state.role = action.payload.role;
        state.isAuthenticated = true;
        state.error = null;
        setCurrentSyncUid(action.payload.user.id);
      })
      .addCase(signInWithGoogle.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Google sign-in failed';
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
      })
      .addCase(signOutUser.pending, (state) => {
        state.isSigningOut = true;
        state.error = null;
      })
      .addCase(signOutUser.fulfilled, (state) => {
        setCurrentSyncUid(null);
        state.user = null;
        state.profile = null;
        state.role = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
        state.isLoading = false;
        state.isSigningOut = false;
      })
      .addCase(signOutUser.rejected, (state, action) => {
        state.isSigningOut = false;
        state.error = action.payload ?? 'Sign out failed';
      })
      .addCase(refreshUserRole.fulfilled, (state, action) => {
        if (action.payload) {
          state.role = action.payload;
        }
      });
  },
});

export const { logout, clearAuthError, setAuthError, hydrateAuth, setAuthReady } = authSlice.actions;
export default authSlice.reducer;
