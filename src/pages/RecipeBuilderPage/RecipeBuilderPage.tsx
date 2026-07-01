import {
  Alert,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import Button from '@mui/material/Button';
import { useState } from 'react';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { PageHeader } from '@/components/layout/PageHeader';
import { RecipeBuilder } from '@/features/recipe/components/RecipeBuilder.tsx';
import { SavedRecipeCard } from '@/features/recipe/components/SavedRecipeCard.tsx';
import { useRecipes } from '@/features/recipe/hooks/useRecipes.ts';
import type { Recipe } from '@/types/recipe.types.ts';
import { formatCalories, formatGrams } from '@/utils/formatNutrition.ts';

export function RecipeBuilderPage() {
  const { recipes, isLoading, deleteRecipe } = useRecipes();
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Recipe | null>(null);

  if (isLoading) {
    return <LoadingScreen message="Loading recipes..." />;
  }

  return (
    <>
      <PageHeader
        title="Recipe Builder"
        subtitle="Combine ingredients into dishes with auto-calculated nutrition."
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <RecipeBuilder />
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Stack spacing={2}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Saved recipes ({recipes.length})
            </Typography>

            {recipes.length === 0 ? (
              <EmptyState
                title="No recipes yet"
                description="Build your first home-cooked dish by adding ingredients from the food database."
              />
            ) : (
              <Grid container spacing={2}>
                {recipes.map((recipe) => (
                  <Grid key={recipe.id} size={{ xs: 12, sm: 6, lg: 12 }}>
                    <SavedRecipeCard
                      recipe={recipe}
                      onSelect={setSelectedRecipe}
                      onDelete={setDeleteTarget}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </Stack>
        </Grid>
      </Grid>

      <Dialog
        open={Boolean(selectedRecipe)}
        onClose={() => setSelectedRecipe(null)}
        fullWidth
        maxWidth="sm"
      >
        {selectedRecipe && (
          <>
            <DialogTitle>{selectedRecipe.name}</DialogTitle>
            <DialogContent>
              <Stack spacing={2}>
                <Alert severity="info">
                  {formatCalories(selectedRecipe.nutritionPerServing.calories)} per serving ·{' '}
                  {selectedRecipe.servings} servings · {selectedRecipe.totalWeightG}g total
                </Alert>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Ingredients
                </Typography>
                {selectedRecipe.ingredients.map((item) => (
                  <Box key={item.id}>
                    <Typography variant="body2">
                      {item.foodName} — {item.quantity} {item.unit}
                    </Typography>
                  </Box>
                ))}
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Per serving
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  P {formatGrams(selectedRecipe.nutritionPerServing.protein)} · C{' '}
                  {formatGrams(selectedRecipe.nutritionPerServing.carbs)} · F{' '}
                  {formatGrams(selectedRecipe.nutritionPerServing.fat)} · Fiber{' '}
                  {formatGrams(selectedRecipe.nutritionPerServing.fiber)}
                </Typography>
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedRecipe(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Delete recipe?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {deleteTarget?.name} will be removed from your local database.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={async () => {
              if (deleteTarget) {
                await deleteRecipe(deleteTarget.id);
                setDeleteTarget(null);
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
