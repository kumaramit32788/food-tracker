import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '@/redux/slices/authSlice.ts';
import themeReducer from '@/redux/slices/themeSlice.ts';

export const rootReducer = combineReducers({
  auth: authReducer,
  theme: themeReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
