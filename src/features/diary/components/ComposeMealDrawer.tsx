import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import {
  Alert,
  Box,
  Button,
  Drawer,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useMemo, useState } from 'react';
import { MEAL_TYPE_LABELS } from '@/constants/mealTypes.ts';
import type { MealType } from '@/constants/mealTypes.ts';
import { useDiary } from '@/features/diary/hooks/useDiary.ts';
import { useLogToast } from '@/components/common/LogToast';
import { IngredientBuilderSection } from '@/features/foods/components/IngredientBuilderSection.tsx';
import { RecipeNutritionSummary } from '@/features/recipe/components/RecipeNutritionSummary.tsx';
import { useRecipePreview } from '@/features/recipe/hooks/useRecipes.ts';
import type { RecipeIngredientDraft } from '@/types/recipe.types.ts';
import { formatDisplayDate, isToday } from '@/utils/date.ts';
import { isPositiveNumber } from '@/utils/bindNumberField.ts';

interface ComposeMealDrawerProps {
  open: boolean;
  onClose: () => void;
  date: string;
  mealType: MealType;
  onLogged?: () => void;
}

export function ComposeMealDrawer({
  open,
  onClose,
  date,
  mealType,
  onLogged,
}: ComposeMealDrawerProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { logFood, isLogging } = useDiary(date);
  const { showFoodLogged, showItemsLogged } = useLogToast();
  const [ingredients, setIngredients] = useState<RecipeIngredientDraft[]>([]);
  const [logError, setLogError] = useState<string | null>(null);

  const ingredientInputs = useMemo(
    () =>
      ingredients
        .filter((item) => isPositiveNumber(item.quantity))
        .map((item) => ({
          foodId: item.foodId,
          quantity: item.quantity as number,
          unit: item.unit,
        })),
    [ingredients],
  );

  const previewQuery = useRecipePreview(ingredientInputs, 1, ingredients.length > 0);

  const handleClose = () => {
    setIngredients([]);
    setLogError(null);
    onClose();
  };

  const handleLogMeal = async () => {
    setLogError(null);

    if (ingredients.length === 0) {
      setLogError('Add at least one ingredient.');
      return;
    }

    try {
      const toLog = ingredients.filter((item) => isPositiveNumber(item.quantity));
      for (const ingredient of toLog) {
        await logFood({
          date,
          mealType,
          foodId: ingredient.foodId,
          quantity: { amount: ingredient.quantity as number, unit: ingredient.unit },
        });
      }

      if (toLog.length === 1) {
        showFoodLogged(toLog[0].foodName, mealType);
      } else if (toLog.length > 1) {
        showItemsLogged(toLog.length, mealType);
      }

      handleClose();
      onLogged?.();
    } catch (error) {
      setLogError(error instanceof Error ? error.message : 'Failed to log meal');
    }
  };

  const dateLabel = isToday(date) ? 'today' : formatDisplayDate(date);

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={handleClose}
        slotProps={{
          paper: {
            sx: {
              width: isMobile ? '100%' : 480,
              maxWidth: '100%',
            },
          },
        }}
      >
        <Stack spacing={2.5} sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Add ingredients
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {MEAL_TYPE_LABELS[mealType]} · {dateLabel}
              </Typography>
            </Box>
            <IconButton onClick={handleClose} aria-label="Close">
              <CloseOutlinedIcon />
            </IconButton>
          </Stack>

          <Typography variant="body2" color="text.secondary">
            Build your meal from ingredients. Nutrition is calculated automatically and each
            ingredient is logged separately.
          </Typography>

          <IngredientBuilderSection
            ingredients={ingredients}
            onIngredientsChange={setIngredients}
          />

          <RecipeNutritionSummary
            nutrition={previewQuery.data}
            servings={1}
            isLoading={previewQuery.isFetching}
          />

          {logError && <Alert severity="error">{logError}</Alert>}

          <Button
            variant="contained"
            size="large"
            disabled={isLogging || ingredients.length === 0}
            onClick={() => void handleLogMeal()}
            sx={{ alignSelf: 'flex-start' }}
          >
            {isLogging ? 'Logging...' : `Log ${ingredients.length} ingredient${ingredients.length === 1 ? '' : 's'}`}
          </Button>
        </Stack>
      </Drawer>
    </>
  );
}
