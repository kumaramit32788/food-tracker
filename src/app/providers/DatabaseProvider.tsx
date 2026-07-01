import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { initializeDatabase } from '@/services/db/initDatabase.ts';
import { LoadingScreen } from '@/components/common/LoadingScreen';

interface DatabaseProviderProps {
  children: ReactNode;
}

export function DatabaseProvider({ children }: DatabaseProviderProps) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeDatabase()
      .then(() => setReady(true))
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Failed to initialize database';
        setError(message);
      });
  }, []);

  if (error) {
    return <LoadingScreen message={`Database error: ${error}`} />;
  }

  if (!ready) {
    return <LoadingScreen message="Loading food database..." />;
  }

  return children;
}
