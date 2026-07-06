import { appRadius } from '@/constants/shape.ts';
import KitchenOutlinedIcon from '@mui/icons-material/KitchenOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { MEAL_TYPES, MEAL_TYPE_LABELS } from '@/constants/mealTypes.ts';
import type { MealType } from '@/constants/mealTypes.ts';
import { useDiary } from '@/features/diary/hooks/useDiary.ts';
import { useLogToast } from '@/components/common/LogToast';
import { FavoriteButton } from '@/features/foods/components/FavoriteButton.tsx';
import { FoodModerationChip } from '@/features/foods/components/FoodModerationChip.tsx';
import { FoodNutritionGrid } from '@/features/foods/components/FoodNutritionGrid.tsx';
import type { Food } from '@/types/food.types.ts';
import type { QuantityInput, UnitType } from '@/types/unit.types.ts';
import {
  bindNumberInputState,
  coerceNumberValue,
  isPositiveNumber,
  type NumberFormValue,
} from '@/utils/bindNumberField.ts';
import { calculateFoodNutrition } from '@/utils/calculateNutrition.ts';
import {
  convertFromBaseUnit,
  convertToBaseUnit,
  getAvailableUnitsForFood,
  getDefaultServingForFood,
  roundServingAmount,
} from '@/utils/convertUnit.ts';
import { getLocalDateKey } from '@/utils/date.ts';
import { formatCalories } from '@/utils/formatNutrition.ts';

interface FoodDetailDrawerProps {
  food: Food | null;
  open: boolean;
  onClose: () => void;
  onToggleFavorite: (food: Food) => void;
  onDelete?: (food: Food) => void;
  onOpen?: (food: Food) => void;
  onLogged?: () => void;
  onAddIngredients?: () => void;
  defaultMealType?: MealType;
  logDate?: string;
  togglingFavoriteId?: string | null;
  isDeleting?: boolean;
}

export function FoodDetailDrawer({
  food,
  open,
  onClose,
  onToggleFavorite,
  onDelete,
  onOpen,
  onLogged,
  onAddIngredients,
  defaultMealType,
  logDate,
  togglingFavoriteId,
  isDeleting = false,
}: FoodDetailDrawerProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [quantity, setQuantity] = useState<{ amount: NumberFormValue; unit: UnitType }>({
    amount: 1,
    unit: 'g',
  });
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [mealType, setMealType] = useState<MealType>('lunch');
  const diaryDate = logDate ?? getLocalDateKey();
  const { logFood, isLogging } = useDiary(diaryDate);
  const { showFoodLogged } = useLogToast();

  useEffect(() => {
    if (!food || !open) {
      return;
    }

    setQuantity(getDefaultServingForFood(food));
    setMealType(defaultMealType ?? 'lunch');
  }, [food?.id, open, defaultMealType]);

  useEffect(() => {
    if (!food || !open) {
      return;
    }

    onOpen?.(food);
  }, [food?.id, open, onOpen]);

  const availableUnits = useMemo(
    () => (food ? getAvailableUnitsForFood(food) : []),
    [food],
  );

  const servingQuantity: QuantityInput = {
    amount: coerceNumberValue(quantity.amount),
    unit: quantity.unit,
  };

  const servingNutrition = useMemo(() => {
    if (!food || !isPositiveNumber(quantity.amount)) {
      return null;
    }
    return calculateFoodNutrition(food, servingQuantity);
  }, [food, quantity.amount, quantity.unit, servingQuantity]);

  const content = food ? (
    <Stack spacing={2.5} sx={{ p: { xs: 2, sm: 3 } }}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            {food.name}
          </Typography>
          <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', gap: 0.75 }}>
            <Chip label={food.category} size="small" />
            {food.isCustom && !food.isCommunityFood && <Chip label="Custom" size="small" color="secondary" />}
            <FoodModerationChip food={food} />
            {food.isVegetarian && <Chip label="Vegetarian" size="small" color="success" variant="outlined" />}
            {food.isVegan && <Chip label="Vegan" size="small" color="success" />}
          </Stack>
        </Box>
        <Stack direction="row" spacing={0.5}>
          <FavoriteButton
            isFavorite={food.isFavorite}
            isLoading={togglingFavoriteId === food.id}
            onToggle={() => onToggleFavorite(food)}
            size="medium"
          />
          <IconButton onClick={onClose} aria-label="Close food details">
            <CloseOutlinedIcon />
          </IconButton>
        </Stack>
      </Stack>

      {food.aliases.length > 0 && (
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 0.6 }}>
            ALSO KNOWN AS
          </Typography>
          <Stack direction="row" spacing={0.75} sx={{ mt: 1, flexWrap: 'wrap', gap: 0.75 }}>
            {food.aliases.map((alias) => (
              <Chip key={alias} label={alias} size="small" variant="outlined" />
            ))}
          </Stack>
        </Box>
      )}

      <Divider />

      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
          Serving size
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <TextField
            label="Amount"
            {...bindNumberInputState(quantity.amount, (amount) =>
              setQuantity((prev) => ({ ...prev, amount })),
            )}
            slotProps={{ htmlInput: { min: 0, step: 1 } }}
            sx={{ flex: 1 }}
          />
          <TextField
            select
            label="Unit"
            value={quantity.unit}
            onChange={(event) => {
              const nextUnit = event.target.value as UnitType;
              setQuantity((prev) => {
                if (!food) {
                  return { ...prev, unit: nextUnit };
                }
                const baseAmount = convertToBaseUnit(food, {
                  amount: coerceNumberValue(prev.amount),
                  unit: prev.unit,
                });
                const nextAmount =
                  baseAmount > 0
                    ? roundServingAmount(convertFromBaseUnit(food, baseAmount, nextUnit))
                    : prev.amount;
                return { amount: nextAmount, unit: nextUnit };
              });
            }}
            sx={{ flex: 1 }}
          >
            {availableUnits.map((unit) => (
              <MenuItem key={unit.unit} value={unit.unit}>
                {unit.label ?? unit.unit}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </Box>

      {servingNutrition && (
        <Box
          sx={{
            p: 2,
            borderRadius: appRadius.sm,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
          }}
        >
          <Typography variant="overline" sx={{ opacity: 0.9 }}>
            For this serving
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            {formatCalories(servingNutrition.calories)}
          </Typography>
          <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2">P {servingNutrition.protein}g</Typography>
            <Typography variant="body2">C {servingNutrition.carbs}g</Typography>
            <Typography variant="body2">F {servingNutrition.fat}g</Typography>
          </Stack>
        </Box>
      )}

      <FoodNutritionGrid
        title="Per 100g reference"
        nutrition={food.nutritionPer100g}
        baseUnit={food.baseUnit}
      />

      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
          Log to diary
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <TextField
            select
            label="Meal"
            value={mealType}
            onChange={(event) => setMealType(event.target.value as MealType)}
            sx={{ flex: 1 }}
          >
            {MEAL_TYPES.map((type) => (
              <MenuItem key={type} value={type}>
                {MEAL_TYPE_LABELS[type]}
              </MenuItem>
            ))}
          </TextField>
          <Button
            variant="contained"
            disabled={isLogging || !isPositiveNumber(quantity.amount)}
            onClick={async () => {
              if (!food) {
                return;
              }
              await logFood({
                date: diaryDate,
                mealType,
                foodId: food.id,
                quantity: servingQuantity,
              });
              showFoodLogged(food.name, mealType);
              onClose();
              onLogged?.();
            }}
            sx={{ flex: 1 }}
          >
            {isLogging ? 'Logging...' : 'Log this serving'}
          </Button>
        </Stack>
        {defaultMealType && onAddIngredients && (
          <Button
            size="small"
            startIcon={<KitchenOutlinedIcon />}
            onClick={() => {
              onClose();
              onAddIngredients();
            }}
            sx={{ mt: 1 }}
          >
            Or build from ingredients
          </Button>
        )}
      </Box>

      {food.isCustom && !food.isCommunityFood && onDelete && (
        <Button
          color="error"
          variant="outlined"
          startIcon={<DeleteOutlineOutlinedIcon />}
          onClick={() => setConfirmDeleteOpen(true)}
          disabled={isDeleting}
        >
          Delete custom food
        </Button>
      )}
    </Stack>
  ) : null;

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        slotProps={{
          paper: {
            sx: {
              width: isMobile ? '100%' : 440,
              maxWidth: '100%',
            },
          },
        }}
      >
        {content}
      </Drawer>

      <Dialog open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)}>
        <DialogTitle>Delete custom food?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {food?.name} will be removed from your account on this device and synced to the cloud.
            This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            disabled={isDeleting}
            onClick={async () => {
              if (food && onDelete) {
                await onDelete(food);
                setConfirmDeleteOpen(false);
                onClose();
              }
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
