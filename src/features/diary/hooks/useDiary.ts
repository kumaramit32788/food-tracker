import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { diaryService } from '@/services/diaryService.ts';
import type { LogFoodInput, LogRecipeInput } from '@/services/diaryService.ts';

export const DIARY_QUERY_KEY = ['diary'] as const;

export function useDiaryRange(startDate: string, endDate: string) {
  return useQuery({
    queryKey: [...DIARY_QUERY_KEY, 'range', startDate, endDate],
    queryFn: () => diaryService.getEntriesInRange(startDate, endDate),
    enabled: Boolean(startDate && endDate),
  });
}

export function useDiary(date: string) {
  const queryClient = useQueryClient();

  const dayQuery = useQuery({
    queryKey: [...DIARY_QUERY_KEY, date],
    queryFn: () => diaryService.getDayWithEntries(date),
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const invalidateDiary = () => {
    void queryClient.invalidateQueries({ queryKey: DIARY_QUERY_KEY });
  };

  const logFoodMutation = useMutation({
    mutationFn: (input: LogFoodInput) => diaryService.logFood(input),
    onSuccess: invalidateDiary,
  });

  const logRecipeMutation = useMutation({
    mutationFn: (input: LogRecipeInput) => diaryService.logRecipe(input),
    onSuccess: invalidateDiary,
  });

  const removeEntryMutation = useMutation({
    mutationFn: (id: string) => diaryService.removeEntry(id),
    onSuccess: invalidateDiary,
  });

  const setWaterMutation = useMutation({
    mutationFn: (waterMl: number) => diaryService.setWaterMl(date, waterMl),
    onSuccess: invalidateDiary,
  });

  return {
    day: dayQuery.data?.day ?? null,
    entries: dayQuery.data?.entries ?? [],
    isLoading: dayQuery.isLoading,
    isError: dayQuery.isError,
    logFood: logFoodMutation.mutateAsync,
    logRecipe: logRecipeMutation.mutateAsync,
    removeEntry: removeEntryMutation.mutateAsync,
    setWaterMl: setWaterMutation.mutateAsync,
    isLogging: logFoodMutation.isPending || logRecipeMutation.isPending,
  };
}
