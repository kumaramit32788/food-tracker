import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { FoodCategory } from '@/constants/foodCategories.ts';
import { useFoods } from '@/features/foods/hooks/useFoods.ts';
import { useDebouncedValue } from '@/hooks/useDebouncedValue.ts';
import type { Food } from '@/types/food.types.ts';
import { groupSearchResults, searchFoods } from '@/utils/searchFoods.ts';

const BROWSE_PREVIEW_LIMIT = 48;

export type FoodBrowserMode = 'browse' | 'search' | 'category';

function sortByName(foods: Food[]) {
  return [...foods].sort((a, b) => a.name.localeCompare(b.name));
}

export function useFoodBrowser() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const [category, setCategory] = useState<FoodCategory | null>(null);
  const [vegOnly, setVegOnly] = useState(false);
  const debouncedQuery = useDebouncedValue(query);

  const { foods, favorites, recentFoods, isLoading, ...foodActions } = useFoods();

  const setQuery = (value: string) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value.trim()) {
          next.set('q', value);
        } else {
          next.delete('q');
        }
        return next;
      },
      { replace: true },
    );
  };

  const mode: FoodBrowserMode = debouncedQuery ? 'search' : category ? 'category' : 'browse';

  const categoryCounts = useMemo(() => {
    const counts = new Map<FoodCategory, number>();
    foods.forEach((food) => {
      counts.set(food.category, (counts.get(food.category) ?? 0) + 1);
    });
    return counts;
  }, [foods]);

  const filteredFoods = useMemo(() => {
    let results = searchFoods(foods, debouncedQuery, 200);

    if (category) {
      results = results.filter((food) => food.category === category);
    }

    if (vegOnly) {
      results = results.filter((food) => food.isVegetarian);
    }

    return results;
  }, [foods, debouncedQuery, category, vegOnly]);

  const grouped = useMemo(() => groupSearchResults(filteredFoods), [filteredFoods]);

  const browsePreview = useMemo(
    () => sortByName(foods.filter((food) => !vegOnly || food.isVegetarian)).slice(0, BROWSE_PREVIEW_LIMIT),
    [foods, vegOnly],
  );

  const displayFavorites = useMemo(() => {
    if (debouncedQuery) {
      return [];
    }
    const source = category || vegOnly ? grouped.favorites : favorites;
    return vegOnly && !category
      ? source.filter((food) => food.isVegetarian)
      : source;
  }, [grouped.favorites, favorites, debouncedQuery, category, vegOnly]);

  const displayRecent = useMemo(() => {
    if (debouncedQuery) {
      return [];
    }
    const source = category ? grouped.recent : recentFoods;
    const filtered = vegOnly ? source.filter((food) => food.isVegetarian) : source;
    return filtered;
  }, [grouped.recent, recentFoods, debouncedQuery, category, vegOnly]);

  const displayOthers = useMemo(() => {
    if (mode === 'browse') {
      return browsePreview;
    }
    if (debouncedQuery) {
      return filteredFoods;
    }
    return sortByName(grouped.others);
  }, [mode, browsePreview, grouped.others, debouncedQuery, filteredFoods]);

  const totalMatches = filteredFoods.length;

  const clearFilters = () => {
    setCategory(null);
    setVegOnly(false);
    setQuery('');
  };

  const hasActiveFilters = Boolean(debouncedQuery || category || vegOnly);

  return {
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
    ...foodActions,
  };
}
