import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks.ts';
import { setThemeMode, toggleThemeMode } from '@/redux/slices/themeSlice.ts';
import type { ThemeMode } from '@/redux/slices/themeSlice.ts';

export function useThemeMode() {
  const dispatch = useAppDispatch();
  const mode = useAppSelector((state) => state.theme.mode);

  const toggle = useCallback(() => {
    dispatch(toggleThemeMode());
  }, [dispatch]);

  const setMode = useCallback(
    (nextMode: ThemeMode) => {
      dispatch(setThemeMode(nextMode));
    },
    [dispatch],
  );

  return {
    mode,
    isDark: mode === 'dark',
    toggle,
    setMode,
  };
}
