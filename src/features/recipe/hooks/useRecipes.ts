import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { recipeService } from '@/services/recipeService.ts';
import type { CreateRecipeInput, RecipeIngredientInput } from '@/types/recipe.types.ts';

export const RECIPES_QUERY_KEY = ['recipes'] as const;

export function useRecipes() {
  const queryClient = useQueryClient();

  const recipesQuery = useQuery({
    queryKey: RECIPES_QUERY_KEY,
    queryFn: () => recipeService.getAllRecipes(),
  });

  const invalidateRecipes = () => {
    void queryClient.invalidateQueries({ queryKey: RECIPES_QUERY_KEY });
  };

  const createRecipeMutation = useMutation({
    mutationFn: (input: CreateRecipeInput) => recipeService.createRecipe(input),
    onSuccess: invalidateRecipes,
  });

  const deleteRecipeMutation = useMutation({
    mutationFn: (id: string) => recipeService.deleteRecipe(id),
    onSuccess: invalidateRecipes,
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: (id: string) => recipeService.toggleFavorite(id),
    onSuccess: invalidateRecipes,
  });

  return {
    recipes: recipesQuery.data ?? [],
    isLoading: recipesQuery.isLoading,
    createRecipe: createRecipeMutation.mutateAsync,
    isCreating: createRecipeMutation.isPending,
    deleteRecipe: deleteRecipeMutation.mutateAsync,
    isDeleting: deleteRecipeMutation.isPending,
    toggleFavorite: toggleFavoriteMutation.mutateAsync,
    togglingFavoriteId: toggleFavoriteMutation.isPending
      ? (toggleFavoriteMutation.variables ?? null)
      : null,
    previewRecipe: (ingredients: RecipeIngredientInput[], servings: number) =>
      recipeService.calculateRecipePreview(ingredients, servings),
  };
}

export function useRecipePreview(
  ingredients: RecipeIngredientInput[],
  servings: number,
  enabled = true,
) {
  return useQuery({
    queryKey: [...RECIPES_QUERY_KEY, 'preview', ingredients, servings],
    queryFn: () => recipeService.calculateRecipePreview(ingredients, servings),
    enabled: enabled && ingredients.length > 0 && servings > 0,
  });
}
