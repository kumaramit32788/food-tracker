import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { FoodCategory } from '@/constants/foodCategories.ts';
import { useFoods } from '@/features/foods/hooks/useFoods.ts';
import type { Food } from '@/types/food.types.ts';
import { filterByDiet, type DietFilter } from '@/utils/dietFilter.ts';
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
  const [dietFilter, setDietFilter] = useState<DietFilter>('all');
  const activeQuery = query.trim();

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

  const mode: FoodBrowserMode = activeQuery ? 'search' : category ? 'category' : 'browse';

  const categoryCounts = useMemo(() => {
    const counts = new Map<FoodCategory, number>();
    foods.forEach((food) => {
      counts.set(food.category, (counts.get(food.category) ?? 0) + 1);
    });
    return counts;
  }, [foods]);

  const filteredFoods = useMemo(() => {
    let results = searchFoods(foods, activeQuery, 200);

    if (category) {
      results = results.filter((food) => food.category === category);
    }

    return filterByDiet(results, dietFilter);
  }, [foods, activeQuery, category, dietFilter]);

  const grouped = useMemo(() => groupSearchResults(filteredFoods), [filteredFoods]);

  const browsePreview = useMemo(
    () => sortByName(filterByDiet(foods, dietFilter)).slice(0, BROWSE_PREVIEW_LIMIT),
    [foods, dietFilter],
  );

  const displayFavorites = useMemo(() => {
    if (activeQuery) {
      return [];
    }
    const source = category || dietFilter !== 'all' ? grouped.favorites : favorites;
    return dietFilter !== 'all' && !category ? filterByDiet(source, dietFilter) : source;
  }, [grouped.favorites, favorites, activeQuery, category, dietFilter]);

  const displayRecent = useMemo(() => {
    if (activeQuery) {
      return [];
    }
    const source = category ? grouped.recent : recentFoods;
    return filterByDiet(source, dietFilter);
  }, [grouped.recent, recentFoods, activeQuery, category, dietFilter]);

  const displayOthers = useMemo(() => {
    if (mode === 'browse') {
      return browsePreview;
    }
    if (activeQuery) {
      return filteredFoods;
    }
    return sortByName(grouped.others);
  }, [mode, browsePreview, grouped.others, activeQuery, filteredFoods]);

  const totalMatches = filteredFoods.length;

  const clearFilters = () => {
    setCategory(null);
    setDietFilter('all');
    setQuery('');
  };

  const hasActiveFilters = Boolean(activeQuery || category || dietFilter !== 'all');

  return {
    query,
    setQuery,
    category,
    setCategory,
    dietFilter,
    setDietFilter,
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
