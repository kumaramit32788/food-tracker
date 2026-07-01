import { AppProviders } from '@/app/providers/index.ts';
import { AppRouter } from '@/routes/AppRouter.tsx';

export function App() {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  );
}
