import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { foodService } from '@/services/foodService.ts';
import type { CreateFoodInput, Food } from '@/types/food.types.ts';

export const FOODS_QUERY_KEY = ['foods'] as const;

export function useFoods() {
  const queryClient = useQueryClient();

  const foodsQuery = useQuery({
    queryKey: FOODS_QUERY_KEY,
    queryFn: () => foodService.getAllFoods(),
  });

  const favoritesQuery = useQuery({
    queryKey: [...FOODS_QUERY_KEY, 'favorites'],
    queryFn: () => foodService.getFavorites(),
  });

  const recentQuery = useQuery({
    queryKey: [...FOODS_QUERY_KEY, 'recent'],
    queryFn: () => foodService.getRecentFoods(),
  });

  const invalidateFoods = () => {
    void queryClient.invalidateQueries({ queryKey: FOODS_QUERY_KEY });
  };

  const createFoodMutation = useMutation({
    mutationFn: (input: CreateFoodInput) => foodService.createCustomFood(input),
    onSuccess: invalidateFoods,
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: (id: string) => foodService.toggleFavorite(id),
    onSuccess: invalidateFoods,
  });

  const deleteFoodMutation = useMutation({
    mutationFn: (id: string) => foodService.deleteFood(id),
    onSuccess: invalidateFoods,
  });

  const markFoodAsUsedMutation = useMutation({
    mutationFn: (id: string) => foodService.markFoodAsUsed(id),
    onSuccess: (_result, id) => {
      const usedAt = new Date().toISOString();
      queryClient.setQueryData<Food[]>(FOODS_QUERY_KEY, (foods) =>
        foods?.map((food) => (food.id === id ? { ...food, lastUsedAt: usedAt } : food)),
      );
      void queryClient.invalidateQueries({ queryKey: [...FOODS_QUERY_KEY, 'recent'] });
    },
  });

  return {
    foods: foodsQuery.data ?? [],
    favorites: favoritesQuery.data ?? [],
    recentFoods: recentQuery.data ?? [],
    isLoading: foodsQuery.isLoading,
    isError: foodsQuery.isError,
    error: foodsQuery.error,
    createFood: createFoodMutation.mutateAsync,
    isCreating: createFoodMutation.isPending,
    toggleFavorite: toggleFavoriteMutation.mutateAsync,
    togglingFavoriteId: toggleFavoriteMutation.isPending
      ? (toggleFavoriteMutation.variables ?? null)
      : null,
    deleteFood: deleteFoodMutation.mutateAsync,
    isDeleting: deleteFoodMutation.isPending,
    markFoodAsUsed: markFoodAsUsedMutation.mutateAsync,
    getFoodById: (id: string) => foodsQuery.data?.find((food) => food.id === id) ?? null,
  };
}
