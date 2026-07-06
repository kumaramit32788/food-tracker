import { zodResolver } from '@hookform/resolvers/zod';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
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
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { FOOD_CATEGORIES } from '@/constants/foodCategories.ts';
import { MEAL_TYPE_LABELS } from '@/constants/mealTypes.ts';
import type { MealType } from '@/constants/mealTypes.ts';
import { useDiary } from '@/features/diary/hooks/useDiary.ts';
import { useLogToast } from '@/components/common/LogToast';
import { IngredientBuilderSection } from '@/features/foods/components/IngredientBuilderSection.tsx';
import { RecipeNutritionSummary } from '@/features/recipe/components/RecipeNutritionSummary.tsx';
import { useRecipePreview } from '@/features/recipe/hooks/useRecipes.ts';
import {
  createFoodSchema,
  DEFAULT_CREATE_FOOD_VALUES,
  type CreateFoodFormInput,
  type CreateFoodFormValues,
} from '@/features/foods/validation/foodSchema.ts';
import { MASTER_UNIT_CONVERSIONS } from '@/constants/units.ts';
import type { CreateFoodInput } from '@/types/food.types.ts';
import type { Food } from '@/types/food.types.ts';
import type { RecipeIngredientDraft } from '@/types/recipe.types.ts';
import type { RecipeNutritionResult } from '@/utils/calculateRecipeNutrition.ts';
import { bindNumberField, isPositiveNumber } from '@/utils/bindNumberField.ts';

type InputMode = 'manual' | 'ingredients';

interface CreateFoodDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: CreateFoodInput) => Promise<Food | unknown>;
  onSaveFood?: (input: CreateFoodInput) => Promise<Food | unknown>;
  isSubmitting?: boolean;
  initialValues?: Partial<CreateFoodFormInput>;
  logContext?: { date: string; mealType: MealType };
  onIngredientsLogged?: () => void;
}

function toCreateFoodInput(values: CreateFoodFormValues): CreateFoodInput {
  const servingGrams =
    values.servingAmount * MASTER_UNIT_CONVERSIONS[values.servingUnit].toBase;

  return {
    name: values.name,
    category: values.category,
    isVegetarian: values.isVegetarian,
    baseUnit:
      values.servingUnit === 'ml' || values.servingUnit === 'L' || values.servingUnit === 'glass'
        ? 'ml'
        : 'g',
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

function toCreateFoodInputFromPreview(
  name: string,
  category: CreateFoodFormValues['category'],
  isVegetarian: boolean,
  preview: RecipeNutritionResult,
): CreateFoodInput {
  const totalWeight = preview.totalWeightG > 0 ? preview.totalWeightG : 100;

  return {
    name,
    category,
    isVegetarian,
    baseUnit: 'g',
    defaultServing: { unit: 'g', grams: totalWeight },
    availableUnits: [
      { unit: 'g', grams: 1 },
      { unit: 'piece', grams: totalWeight, label: 'Serving' },
    ],
    nutritionPer100g: preview.per100g,
  };
}

export function CreateFoodDialog({
  open,
  onClose,
  onSubmit,
  onSaveFood,
  isSubmitting = false,
  initialValues,
  logContext,
  onIngredientsLogged,
}: CreateFoodDialogProps) {
  const defaultMode: InputMode = logContext ? 'ingredients' : 'manual';
  const [inputMode, setInputMode] = useState<InputMode>(defaultMode);
  const [ingredients, setIngredients] = useState<RecipeIngredientDraft[]>([]);
  const [ingredientError, setIngredientError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoggingIngredients, setIsLoggingIngredients] = useState(false);
  const { logFood } = useDiary(logContext?.date ?? '');
  const { showFoodLogged, showItemsLogged } = useLogToast();

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateFoodFormInput, unknown, CreateFoodFormValues>({
    resolver: zodResolver(createFoodSchema),
    defaultValues: DEFAULT_CREATE_FOOD_VALUES,
  });

  const watchedName = watch('name');

  useEffect(() => {
    if (open) {
      reset({ ...DEFAULT_CREATE_FOOD_VALUES, ...initialValues });
      setInputMode(
        initialValues?.name?.trim() ? 'manual' : logContext ? 'ingredients' : 'manual',
      );
      setIngredients([]);
      setIngredientError(null);
      setSubmitError(null);
    }
  }, [open, initialValues, reset, logContext]);

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

  useEffect(() => {
    const preview = previewQuery.data;
    if (!preview || inputMode !== 'ingredients') {
      return;
    }

    setValue('calories', preview.per100g.calories);
    setValue('protein', preview.per100g.protein);
    setValue('carbs', preview.per100g.carbs);
    setValue('fat', preview.per100g.fat);
    setValue('fiber', preview.per100g.fiber);
    setValue('sugar', preview.per100g.sugar);
    setValue('sodium', preview.per100g.sodium);
    setValue('servingAmount', preview.totalWeightG > 0 ? preview.totalWeightG : 100);
    setValue('servingUnit', 'g');
  }, [previewQuery.data, inputMode, setValue]);

  const prefilledName = initialValues?.name?.trim();

  const handleClose = () => {
    reset(DEFAULT_CREATE_FOOD_VALUES);
    setIngredients([]);
    setIngredientError(null);
    setSubmitError(null);
    setInputMode(defaultMode);
    onClose();
  };

  const submitManual = handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      await onSubmit(toCreateFoodInput(values));
      handleClose();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to save food');
    }
  });

  const logIngredients = async (saveAsFood: boolean) => {
    setIngredientError(null);

    if (ingredients.length === 0) {
      setIngredientError('Add at least one ingredient.');
      return;
    }

    const name = watchedName.trim();
    if (saveAsFood && name.length < 2) {
      setIngredientError('Enter a name (at least 2 characters) to save this food.');
      return;
    }

    const preview = previewQuery.data;
    if (!preview) {
      setIngredientError('Nutrition is still calculating. Try again in a moment.');
      return;
    }

    setIsLoggingIngredients(true);

    try {
      if (saveAsFood) {
        const saveFn = onSaveFood ?? onSubmit;
        const food = (await saveFn(
          toCreateFoodInputFromPreview(
            name,
            watch('category'),
            watch('isVegetarian'),
            preview,
          ),
        )) as Food;

        if (logContext) {
          await logFood({
            date: logContext.date,
            mealType: logContext.mealType,
            foodId: food.id,
            quantity: {
              amount: preview.totalWeightG > 0 ? preview.totalWeightG : 100,
              unit: 'g',
            },
          });
          showFoodLogged(food.name, logContext.mealType);
          onIngredientsLogged?.();
        }
      } else if (logContext) {
        const toLog = ingredients.filter((item) => isPositiveNumber(item.quantity));
        for (const ingredient of toLog) {
          await logFood({
            date: logContext.date,
            mealType: logContext.mealType,
            foodId: ingredient.foodId,
            quantity: { amount: ingredient.quantity as number, unit: ingredient.unit },
          });
        }
        if (toLog.length === 1) {
          showFoodLogged(toLog[0].foodName, logContext.mealType);
        } else if (toLog.length > 1) {
          showItemsLogged(toLog.length, logContext.mealType);
        }
        onIngredientsLogged?.();
      }

      handleClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to log ingredients';
      if (saveAsFood) {
        setSubmitError(message);
      } else {
        setIngredientError(message);
      }
    } finally {
      setIsLoggingIngredients(false);
    }
  };

  const saveIngredientsAsFood = handleSubmit(async (values) => {
    setIngredientError(null);
    setSubmitError(null);

    if (ingredients.length === 0) {
      setIngredientError('Add at least one ingredient.');
      return;
    }

    const preview = previewQuery.data;
    if (!preview) {
      setIngredientError('Nutrition is still calculating. Try again in a moment.');
      return;
    }

    try {
      await onSubmit(
        toCreateFoodInputFromPreview(
          values.name,
          values.category,
          values.isVegetarian,
          preview,
        ),
      );
      handleClose();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to save food');
    }
  });

  const busy = isSubmitting || isLoggingIngredients;

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {prefilledName ? `Add "${prefilledName}"` : 'Add custom food'}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          {logContext && (
            <Alert severity="info">
              Logging to {MEAL_TYPE_LABELS[logContext.mealType]} · {logContext.date}
            </Alert>
          )}

          <Tabs
            value={inputMode}
            onChange={(_, value: InputMode) => setInputMode(value)}
            variant="fullWidth"
          >
            <Tab label="From ingredients" value="ingredients" />
            <Tab label="Enter manually" value="manual" />
          </Tabs>

          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={inputMode === 'ingredients' && logContext ? 'Meal name (optional)' : 'Food name'}
                error={Boolean(errors.name)}
                helperText={
                  errors.name?.message ??
                  (inputMode === 'ingredients' && logContext
                    ? 'Optional label when logging ingredients'
                    : undefined)
                }
              />
            )}
          />

          {inputMode === 'ingredients' ? (
            <>
              <IngredientBuilderSection
                ingredients={ingredients}
                onIngredientsChange={setIngredients}
              />

              <RecipeNutritionSummary
                nutrition={previewQuery.data}
                servings={1}
                isLoading={previewQuery.isFetching}
              />

              {!logContext && (
                <>
                  <Controller
                    name="category"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} select label="Category">
                        {FOOD_CATEGORIES.map((category) => (
                          <MenuItem key={category} value={category}>
                            {category}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
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
                </>
              )}
            </>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary">
                Enter nutrition per 100g. Calories, protein, carbs, and fat are required.
              </Typography>

              <Alert severity="info">
                Your food will be visible to you immediately. After admin approval it becomes
                available to all NutriTrack users.
              </Alert>

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
                          {...bindNumberField(field)}
                          type="number"
                          required
                          label={fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}
                          error={Boolean(errors[fieldName])}
                          helperText={fieldName === 'calories' ? 'kcal' : 'grams'}
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
                          {...bindNumberField(field)}
                          type="number"
                          label={fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}
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
                        {...bindNumberField(field)}
                        type="number"
                        label="Default serving amount"
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
            </>
          )}

          {ingredientError && <Alert severity="error">{ingredientError}</Alert>}
          {submitError && <Alert severity="error">{submitError}</Alert>}
          {Object.keys(errors).length > 0 && inputMode === 'manual' && (
            <Alert severity="error">Please fix the highlighted fields.</Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Button onClick={handleClose}>Cancel</Button>
        {inputMode === 'ingredients' ? (
          <>
            {logContext ? (
              <>
                <Button
                  variant="outlined"
                  disabled={busy || ingredients.length === 0}
                  onClick={() => void logIngredients(true)}
                >
                  Save food & log
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddOutlinedIcon />}
                  disabled={busy || ingredients.length === 0}
                  onClick={() => void logIngredients(false)}
                >
                  {isLoggingIngredients
                    ? 'Logging...'
                    : `Log ${ingredients.length} ingredient${ingredients.length === 1 ? '' : 's'}`}
                </Button>
              </>
            ) : (
              <Button
                variant="contained"
                disabled={busy || ingredients.length === 0}
                onClick={() => void saveIngredientsAsFood()}
              >
                {isSubmitting ? 'Saving...' : 'Save food'}
              </Button>
            )}
          </>
        ) : (
          <Button variant="contained" onClick={() => void submitManual()} disabled={busy}>
            {isSubmitting ? 'Saving...' : logContext ? 'Save & log food' : 'Save food'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
