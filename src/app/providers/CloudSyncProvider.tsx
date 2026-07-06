import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { DIARY_QUERY_KEY } from '@/features/diary/hooks/useDiary.ts';
import { FOODS_QUERY_KEY } from '@/features/foods/hooks/useFoods.ts';
import { useAppSelector } from '@/redux/hooks.ts';
import { cloudSync } from '@/services/firebase/cloudSync.ts';

interface CloudSyncProviderProps {
  children: ReactNode;
}

export function CloudSyncProvider({ children }: CloudSyncProviderProps) {
  const queryClient = useQueryClient();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const isAuthReady = useAppSelector((state) => state.auth.isAuthReady);
  const isPullingRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !isAuthReady) {
      return;
    }

    const refreshFromCloud = async () => {
      if (isPullingRef.current || document.hidden) {
        return;
      }

      isPullingRef.current = true;
      try {
        await cloudSync.pullLatest();
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: DIARY_QUERY_KEY }),
          queryClient.invalidateQueries({ queryKey: FOODS_QUERY_KEY }),
        ]);
      } catch (error) {
        console.warn('[sync] Pull on focus failed', error);
      } finally {
        isPullingRef.current = false;
      }
    };

    const onVisible = () => {
      if (!document.hidden) {
        void refreshFromCloud();
      }
    };

    void refreshFromCloud();

    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);

    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
    };
  }, [isAuthenticated, isAuthReady, queryClient]);

  return children;
}
