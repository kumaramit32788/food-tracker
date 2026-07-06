import { CssBaseline, ThemeProvider } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { AuthProvider } from '@/app/providers/AuthProvider.tsx';
import { DatabaseProvider } from '@/app/providers/DatabaseProvider.tsx';
import { LogToastProvider } from '@/components/common/LogToast';
import { persistor, store } from '@/app/store/index.ts';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { useAppSelector } from '@/redux/hooks.ts';
import { createAppTheme } from '@/theme/index.ts';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ThemedApp({ children }: { children: ReactNode }) {
  const mode = useAppSelector((state) => state.theme.mode);
  const theme = useMemo(() => createAppTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemedApp>
          <DatabaseProvider>
            <AuthProvider>
              <LogToastProvider>
                <PersistGate loading={<LoadingScreen message="Restoring your session..." />} persistor={persistor}>
                  {children}
                </PersistGate>
              </LogToastProvider>
            </AuthProvider>
          </DatabaseProvider>
        </ThemedApp>
      </QueryClientProvider>
    </Provider>
  );
}
