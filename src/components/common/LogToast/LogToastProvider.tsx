import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import { Snackbar, Typography } from '@mui/material';
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { appRadius } from '@/constants/shape.ts';
import { MEAL_TYPE_LABELS } from '@/constants/mealTypes.ts';
import type { MealType } from '@/constants/mealTypes.ts';

interface LogToastContextValue {
  showFoodLogged: (foodName: string, mealType?: MealType) => void;
  showItemsLogged: (count: number, mealType?: MealType) => void;
  showFoodSaved: (foodName: string) => void;
}

const LogToastContext = createContext<LogToastContextValue | null>(null);

export function LogToastProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');

  const show = useCallback((text: string) => {
    setMessage(text);
    setOpen(true);
  }, []);

  const showFoodLogged = useCallback(
    (foodName: string, mealType?: MealType) => {
      const mealLabel = mealType ? MEAL_TYPE_LABELS[mealType].toLowerCase() : 'diary';
      show(`Added ${foodName} to ${mealLabel}`);
    },
    [show],
  );

  const showItemsLogged = useCallback(
    (count: number, mealType?: MealType) => {
      const mealLabel = mealType ? MEAL_TYPE_LABELS[mealType].toLowerCase() : 'diary';
      show(`Added ${count} item${count === 1 ? '' : 's'} to ${mealLabel}`);
    },
    [show],
  );

  const showFoodSaved = useCallback(
    (foodName: string) => {
      show(`Successfully added ${foodName}`);
    },
    [show],
  );

  const value = useMemo(
    () => ({ showFoodLogged, showItemsLogged, showFoodSaved }),
    [showFoodLogged, showItemsLogged, showFoodSaved],
  );

  return (
    <LogToastContext.Provider value={value}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={3500}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ mb: { xs: 2, sm: 3 } }}
      >
        <Typography
          component="div"
          variant="body2"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 2,
            py: 1.25,
            borderRadius: appRadius.lg,
            bgcolor: 'success.main',
            color: 'success.contrastText',
            fontWeight: 600,
            boxShadow: 3,
          }}
        >
          <CheckCircleOutlineOutlinedIcon sx={{ fontSize: 20 }} />
          {message}
        </Typography>
      </Snackbar>
    </LogToastContext.Provider>
  );
}

export function useLogToast() {
  const context = useContext(LogToastContext);
  if (!context) {
    throw new Error('useLogToast must be used within LogToastProvider');
  }
  return context;
}
