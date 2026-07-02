import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import FilterAltOffOutlinedIcon from '@mui/icons-material/FilterAltOffOutlined';
import KitchenOutlinedIcon from '@mui/icons-material/KitchenOutlined';
import { Alert, Box, Button, Chip, Stack } from '@mui/material';
import { useCallback, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { SearchInput } from '@/components/common/SearchInput';
import { PageHeader } from '@/components/layout/PageHeader';
import { isMealType, MEAL_TYPE_LABELS } from '@/constants/mealTypes.ts';
import { ROUTES } from '@/constants/routes.ts';
import {
  getLocalDateKey,
  isFutureDateKey,
  isValidDateKey,
} from '@/utils/date.ts';
import {
  CreateFoodDialog,
  FoodCategoryFilter,
  FoodDetailDrawer,
  FoodListSection,
} from '@/features/foods/components';
import { ComposeMealDrawer } from '@/features/diary/components/ComposeMealDrawer.tsx';
import { useDiary } from '@/features/diary/hooks/useDiary.ts';
import { useFoodBrowser } from '@/features/foods/hooks/useFoodBrowser.ts';
import type { Food } from '@/types/food.types.ts';
import type { CreateFoodInput } from '@/types/food.types.ts';
import type { CreateFoodFormValues } from '@/features/foods/validation/foodSchema.ts';

export function FoodsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mealParam = searchParams.get('meal');
  const dateParam = searchParams.get('date');
  const diaryMealType = isMealType(mealParam) ? mealParam : null;
  const logDate =
    isValidDateKey(dateParam) && !isFutureDateKey(dateParam) ? dateParam : getLocalDateKey();
  const {
    query,
    setQuery,
    category,
    setCategory,
    vegOnly,
    setVegOnly,
    mode,
    isLoading,
    foods,
    categoryCounts,
    displayFavorites,
    displayRecent,
    displayOthers,
    totalMatches,
    hasActiveFilters,
    clearFilters,
    toggleFavorite,
    togglingFavoriteId,
    deleteFood,
    isDeleting,
    createFood,
    isCreating,
    markFoodAsUsed,
    getFoodById,
  } = useFoodBrowser();

  const { logFood } = useDiary(logDate);

  const [selectedFoodId, setSelectedFoodId] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [composeMealOpen, setComposeMealOpen] = useState(false);
  const [createInitialValues, setCreateInitialValues] = useState<Partial<CreateFoodFormValues>>({});

  const trimmedQuery = query.trim();
  const isSearchWithNoResults = mode === 'search' && trimmedQuery.length > 0 && totalMatches === 0;

  const openCreateDialog = useCallback((prefillName?: string) => {
    setCreateInitialValues(prefillName ? { name: prefillName } : {});
    setCreateDialogOpen(true);
  }, []);

  const saveFoodOnly = useCallback(
    async (input: CreateFoodInput) => createFood(input) as Promise<Food>,
    [createFood],
  );

  const handleCreateFood = useCallback(
    async (input: CreateFoodInput) => {
      const food = (await createFood(input)) as Food;

      if (diaryMealType) {
        await logFood({
          date: logDate,
          mealType: diaryMealType,
          foodId: food.id,
          quantity: { amount: 1, unit: food.defaultServing.unit },
        });
        navigate(ROUTES.DASHBOARD);
        return food;
      }

      setSelectedFoodId(food.id);
      return food;
    },
    [createFood, diaryMealType, logDate, logFood, navigate],
  );

  const selectedFood = selectedFoodId ? getFoodById(selectedFoodId) : null;

  const handleSelectFood = useCallback((food: Food) => {
    setSelectedFoodId(food.id);
  }, []);

  const handleToggleFavorite = useCallback(
    async (food: Food) => {
      await toggleFavorite(food.id);
    },
    [toggleFavorite],
  );

  const handleDeleteFood = useCallback(
    async (food: Food) => {
      await deleteFood(food.id);
      setSelectedFoodId(null);
    },
    [deleteFood],
  );

  const handleFoodOpen = useCallback(
    (food: Food) => {
      void markFoodAsUsed(food.id);
    },
    [markFoodAsUsed],
  );

  if (isLoading) {
    return <LoadingScreen message="Loading food database..." />;
  }

  const resultsTitle =
    mode === 'search'
      ? `Search results (${totalMatches})`
      : mode === 'category'
        ? `${category} (${totalMatches})`
        : `Popular foods (${displayOthers.length} of ${foods.length})`;

  const resultsSubtitle =
    mode === 'browse'
      ? 'Select a category or search to browse the full database.'
      : undefined;

  const showEmptyState =
    hasActiveFilters &&
    displayFavorites.length === 0 &&
    displayRecent.length === 0 &&
    displayOthers.length === 0;

  return (
    <>
      <PageHeader
        title="Food Database"
        subtitle={`Browse and search ${foods.length} Indian foods with household units.`}
        action={
          <Button
            variant="contained"
            startIcon={<AddOutlinedIcon />}
            onClick={() => openCreateDialog()}
          >
            Add custom food
          </Button>
        }
      />

      <Box sx={{ mb: 3 }}>
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search rice, dal, paneer, idli..."
          fullWidth
        />
      </Box>

      {diaryMealType && (
        <Alert
          severity="info"
          sx={{ mb: 3 }}
          action={
            <Button
              color="inherit"
              size="small"
              startIcon={<KitchenOutlinedIcon />}
              onClick={() => setComposeMealOpen(true)}
            >
              Add ingredients
            </Button>
          }
        >
          Logging to {MEAL_TYPE_LABELS[diaryMealType]} · {logDate}
        </Alert>
      )}

      <FoodCategoryFilter
        selectedCategory={category}
        categoryCounts={categoryCounts}
        vegOnly={vegOnly}
        onCategoryChange={setCategory}
        onVegOnlyChange={setVegOnly}
      />

      {hasActiveFilters && (
        <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}>
          {query && <Chip label={`Search: ${query}`} size="small" />}
          {category && <Chip label={category} size="small" />}
          {vegOnly && <Chip label="Veg only" size="small" color="success" />}
          <Button
            size="small"
            startIcon={<FilterAltOffOutlinedIcon />}
            onClick={clearFilters}
          >
            Clear filters
          </Button>
        </Stack>
      )}

      {showEmptyState ? (
        <EmptyState
          title={
            isSearchWithNoResults
              ? `No results for "${trimmedQuery}"`
              : 'No foods found'
          }
          description={
            isSearchWithNoResults
              ? diaryMealType
                ? 'Add ingredients to build this meal, or enter nutrition manually.'
                : 'Add this food with calories, protein, carbs, and fat per 100g.'
              : 'Try a different search term, remove filters, or add your own custom food.'
          }
          actionLabel={
            isSearchWithNoResults
              ? diaryMealType
                ? `Add "${trimmedQuery}" manually`
                : `Add "${trimmedQuery}"`
              : 'Add custom food'
          }
          onAction={() => openCreateDialog(isSearchWithNoResults ? trimmedQuery : undefined)}
          secondaryActionLabel={
            isSearchWithNoResults && diaryMealType ? 'Add ingredients' : undefined
          }
          onSecondaryAction={
            isSearchWithNoResults && diaryMealType
              ? () => openCreateDialog(trimmedQuery)
              : undefined
          }
        />
      ) : (
        <>
          {(mode === 'browse' || displayFavorites.length > 0) && (
            <FoodListSection
              title="Favorites"
              subtitle="Foods you've starred for quick access"
              foods={displayFavorites}
              emptyMessage="Star foods to see them here."
              onSelect={handleSelectFood}
              onToggleFavorite={handleToggleFavorite}
              togglingFavoriteId={togglingFavoriteId}
            />
          )}

          {displayRecent.length > 0 && (
            <FoodListSection
              title="Recently viewed"
              foods={displayRecent}
              onSelect={handleSelectFood}
              onToggleFavorite={handleToggleFavorite}
              togglingFavoriteId={togglingFavoriteId}
            />
          )}

          <FoodListSection
            title={resultsTitle}
            subtitle={resultsSubtitle}
            foods={displayOthers}
            onSelect={handleSelectFood}
            onToggleFavorite={handleToggleFavorite}
            togglingFavoriteId={togglingFavoriteId}
          />

          {mode === 'browse' && foods.length > displayOthers.length && (
            <Alert severity="info" sx={{ mb: 3 }}>
              Showing a preview of {displayOthers.length} foods. Use search or category filters to find more.
            </Alert>
          )}
        </>
      )}

      <FoodDetailDrawer
        food={selectedFood}
        open={Boolean(selectedFood)}
        onClose={() => setSelectedFoodId(null)}
        onToggleFavorite={handleToggleFavorite}
        onDelete={handleDeleteFood}
        onOpen={handleFoodOpen}
        defaultMealType={diaryMealType ?? undefined}
        logDate={logDate}
        onLogged={diaryMealType ? () => navigate(`${ROUTES.DASHBOARD}`) : undefined}
        onAddIngredients={
          diaryMealType ? () => openCreateDialog() : undefined
        }
        togglingFavoriteId={togglingFavoriteId}
        isDeleting={isDeleting}
      />

      <CreateFoodDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={handleCreateFood}
        onSaveFood={saveFoodOnly}
        isSubmitting={isCreating}
        initialValues={createInitialValues}
        logContext={
          diaryMealType ? { date: logDate, mealType: diaryMealType } : undefined
        }
        onIngredientsLogged={() => navigate(ROUTES.DASHBOARD)}
      />

      {diaryMealType && (
        <ComposeMealDrawer
          open={composeMealOpen}
          onClose={() => setComposeMealOpen(false)}
          date={logDate}
          mealType={diaryMealType}
          onLogged={() => navigate(ROUTES.DASHBOARD)}
        />
      )}
    </>
  );
}
