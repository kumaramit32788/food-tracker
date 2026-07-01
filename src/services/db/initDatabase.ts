import { seedService } from '@/services/db/seedService.ts';

let initPromise: Promise<void> | null = null;

export async function initializeDatabase(): Promise<void> {
  if (!initPromise) {
    initPromise = seedService.initialize();
  }

  return initPromise;
}
