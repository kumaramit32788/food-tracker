import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { FOOD_CATEGORIES } from '@/constants/foodCategories.ts';
import { MASTER_UNIT_CONVERSIONS } from '@/constants/units.ts';
import {
  createFoodSchema,
  DEFAULT_CREATE_FOOD_VALUES,
  type CreateFoodFormValues,
} from '@/features/foods/validation/foodSchema.ts';
import type { CreateFoodInput } from '@/types/food.types.ts';
import type { Food } from '@/types/food.types.ts';

interface CreateFoodDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: CreateFoodInput) => Promise<Food | unknown>;
  isSubmitting?: boolean;
  initialValues?: Partial<CreateFoodFormValues>;
}

function toCreateFoodInput(values: CreateFoodFormValues): CreateFoodInput {
  const servingGrams =
    values.servingAmount * MASTER_UNIT_CONVERSIONS[values.servingUnit].toBase;

  return {
    name: values.name,
    category: values.category,
    isVegetarian: values.isVegetarian,
    baseUnit: values.servingUnit === 'ml' || values.servingUnit === 'L' || values.servingUnit === 'glass' ? 'ml' : 'g',
    defaultServing: {
      unit: values.servingUnit,
      grams: servingGrams / values.servingAmount,
    },
    availableUnits: [
      { unit: 'g', grams: 1 },
      {
        unit: values.servingUnit,
        grams: servingGrams / values.servingAmount,
        label: MASTER_UNIT_CONVERSIONS[values.servingUnit].label,
      },
    ],
    nutritionPer100g: {
      calories: values.calories,
      protein: values.protein,
      carbs: values.carbs,
      fat: values.fat,
      fiber: values.fiber,
      sugar: values.sugar,
      sodium: values.sodium,
    },
  };
}

export function CreateFoodDialog({
  open,
  onClose,
  onSubmit,
  isSubmitting = false,
  initialValues,
}: CreateFoodDialogProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateFoodFormValues>({
    resolver: zodResolver(createFoodSchema),
    defaultValues: DEFAULT_CREATE_FOOD_VALUES,
  });

  useEffect(() => {
    if (open) {
      reset({ ...DEFAULT_CREATE_FOOD_VALUES, ...initialValues });
    }
  }, [open, initialValues, reset]);

  const prefilledName = initialValues?.name?.trim();

  const handleClose = () => {
    reset(DEFAULT_CREATE_FOOD_VALUES);
    onClose();
  };

  const submit = handleSubmit(async (values) => {
    await onSubmit(toCreateFoodInput(values));
    reset(DEFAULT_CREATE_FOOD_VALUES);
    onClose();
  });

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {prefilledName ? `Add "${prefilledName}"` : 'Add custom food'}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Enter nutrition per 100g. Calories, protein, carbs, and fat are required to log this
            food accurately.
          </Typography>

          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Food name"
                error={Boolean(errors.name)}
                helperText={errors.name?.message}
              />
            )}
          />

          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <TextField {...field} select label="Category" error={Boolean(errors.category)}>
                {FOOD_CATEGORIES.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />

          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Nutrition per 100g
          </Typography>

          <Grid container spacing={2}>
            {(['calories', 'protein', 'carbs', 'fat'] as const).map((fieldName) => (
              <Grid key={fieldName} size={{ xs: 6, sm: 3 }}>
                <Controller
                  name={fieldName}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="number"
                      required
                      label={fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}
                      onChange={(event) => field.onChange(Number(event.target.value))}
                      error={Boolean(errors[fieldName])}
                      helperText={
                        fieldName === 'calories'
                          ? 'kcal'
                          : fieldName === 'protein' || fieldName === 'carbs' || fieldName === 'fat'
                            ? 'grams'
                            : undefined
                      }
                      slotProps={{ htmlInput: { min: 0, step: 0.1 } }}
                    />
                  )}
                />
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={2}>
            {(['fiber', 'sugar', 'sodium'] as const).map((fieldName) => (
              <Grid key={fieldName} size={{ xs: 4 }}>
                <Controller
                  name={fieldName}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="number"
                      label={fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}
                      onChange={(event) => field.onChange(Number(event.target.value))}
                      error={Boolean(errors[fieldName])}
                      slotProps={{ htmlInput: { min: 0, step: 0.1 } }}
                    />
                  )}
                />
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <Controller
                name="servingAmount"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Default serving amount"
                    onChange={(event) => field.onChange(Number(event.target.value))}
                    error={Boolean(errors.servingAmount)}
                    helperText={errors.servingAmount?.message}
                    slotProps={{ htmlInput: { min: 0.1, step: 0.5 } }}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Controller
                name="servingUnit"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Default unit">
                    {Object.values(MASTER_UNIT_CONVERSIONS).map((unit) => (
                      <MenuItem key={unit.unit} value={unit.unit}>
                        {unit.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
          </Grid>

          <Controller
            name="isVegetarian"
            control={control}
            render={({ field }) => (
              <TextField
                select
                label="Diet"
                value={field.value ? 'veg' : 'non-veg'}
                onChange={(event) => field.onChange(event.target.value === 'veg')}
              >
                <MenuItem value="veg">Vegetarian</MenuItem>
                <MenuItem value="non-veg">Non-vegetarian</MenuItem>
              </TextField>
            )}
          />

          {Object.keys(errors).length > 0 && (
            <Alert severity="error">Please fix the highlighted fields.</Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant="contained" onClick={() => void submit()} disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save food'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
