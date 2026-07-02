import { APP_BORDER_RADIUS_SM } from '@/constants/shape.ts';
import { zodResolver } from '@hookform/resolvers/zod';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { RECIPE_CATEGORIES } from '@/constants/foodCategories.ts';
import { AddIngredientDialog } from '@/features/recipe/components/AddIngredientDialog.tsx';
import { RecipeIngredientRow } from '@/features/recipe/components/RecipeIngredientRow.tsx';
import { RecipeNutritionSummary } from '@/features/recipe/components/RecipeNutritionSummary.tsx';
import { useRecipePreview, useRecipes } from '@/features/recipe/hooks/useRecipes.ts';
import {
  recipeSchema,
  type RecipeFormValues,
} from '@/features/recipe/validation/recipeSchema.ts';
import { useFoods } from '@/features/foods/hooks/useFoods.ts';
import type { RecipeIngredientDraft } from '@/types/recipe.types.ts';
import type { Food } from '@/types/food.types.ts';
import type { UnitType } from '@/types/unit.types.ts';

export function RecipeBuilder() {
  const { createRecipe, isCreating } = useRecipes();
  const { getFoodById } = useFoods();
  const [ingredients, setIngredients] = useState<RecipeIngredientDraft[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      name: '',
      category: 'Custom',
      servings: 2,
    },
  });

  const servings = watch('servings');

  const ingredientInputs = useMemo(
    () =>
      ingredients.map((item) => ({
        foodId: item.foodId,
        quantity: item.quantity,
        unit: item.unit,
      })),
    [ingredients],
  );

  const previewQuery = useRecipePreview(ingredientInputs, servings, ingredients.length > 0);

  const handleAddIngredient = (food: Food, quantity: number, unit: UnitType) => {
    setIngredients((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        foodId: food.id,
        foodName: food.name,
        quantity,
        unit,
      },
    ]);
  };

  const handleSave = handleSubmit(async (values) => {
    setSaveError(null);

    if (ingredients.length === 0) {
      setSaveError('Add at least one ingredient.');
      return;
    }

    try {
      await createRecipe({
        name: values.name,
        category: values.category,
        servings: values.servings,
        ingredients: ingredientInputs,
      });
      reset();
      setIngredients([]);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to save recipe');
    }
  });

  return (
    <Card>
      <CardContent>
        <Stack spacing={3}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            New recipe
          </Typography>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Recipe name"
                    placeholder="e.g. Home-style Dal Tadka"
                    error={Boolean(errors.name)}
                    helperText={errors.name?.message}
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Category" fullWidth>
                    {RECIPE_CATEGORIES.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Controller
                name="servings"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Servings"
                    onChange={(event) => field.onChange(Number(event.target.value))}
                    error={Boolean(errors.servings)}
                    helperText={errors.servings?.message}
                    slotProps={{ htmlInput: { min: 1 } }}
                    fullWidth
                  />
                )}
              />
            </Grid>
          </Grid>

          <Box>
            <Stack
              direction="row"
              sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Ingredients
              </Typography>
              <Button
                size="small"
                startIcon={<AddOutlinedIcon />}
                onClick={() => setAddDialogOpen(true)}
              >
                Add ingredient
              </Button>
            </Stack>

            <Stack spacing={1}>
              {ingredients.length === 0 ? (
                <Box
                  sx={{
                    py: 3,
                    px: 2,
                    textAlign: 'center',
                    borderRadius: APP_BORDER_RADIUS_SM,
                    border: 1,
                    borderColor: 'divider',
                    borderStyle: 'dashed',
                  }}
                >
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    No ingredients yet. Search your food database to build this recipe.
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<AddOutlinedIcon />}
                    onClick={() => setAddDialogOpen(true)}
                  >
                    Add first ingredient
                  </Button>
                </Box>
              ) : (
                ingredients.map((ingredient) => (
                  <RecipeIngredientRow
                    key={ingredient.id}
                    ingredient={ingredient}
                    food={getFoodById(ingredient.foodId) ?? undefined}
                    onChange={(updated) =>
                      setIngredients((prev) =>
                        prev.map((item) => (item.id === updated.id ? updated : item)),
                      )
                    }
                    onRemove={() =>
                      setIngredients((prev) => prev.filter((item) => item.id !== ingredient.id))
                    }
                  />
                ))
              )}
            </Stack>
          </Box>

          <RecipeNutritionSummary
            nutrition={previewQuery.data}
            servings={servings}
            isLoading={previewQuery.isFetching}
          />

          {saveError && <Alert severity="error">{saveError}</Alert>}

          <Button
            variant="contained"
            startIcon={<SaveOutlinedIcon />}
            onClick={() => void handleSave()}
            disabled={isCreating || ingredients.length === 0}
            sx={{ alignSelf: 'flex-start' }}
          >
            {isCreating ? 'Saving...' : 'Save recipe'}
          </Button>
        </Stack>
      </CardContent>

      <AddIngredientDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onAdd={handleAddIngredient}
      />
    </Card>
  );
}
