import {
  Alert,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import { useCallback, useEffect, useState } from 'react';
import { FOODS_QUERY_KEY } from '@/features/foods/hooks/useFoods.ts';
import {
  communityFoodService,
  type CommunitySubmission,
} from '@/services/firebase/communityFoodService.ts';
import { foodRepository } from '@/services/db/repositories/foodRepository.ts';
import { isPersonalCustomFood } from '@/utils/foodVisibility.ts';
import { useQueryClient } from '@tanstack/react-query';

interface FoodModerationPanelProps {
  adminUid: string;
}

export function FoodModerationPanel({ adminUid }: FoodModerationPanelProps) {
  const queryClient = useQueryClient();
  const [pending, setPending] = useState<CommunitySubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  const loadPending = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const remoteItems = await communityFoodService.listPendingSubmissions(adminUid);
      const remoteIds = new Set(remoteItems.map((item) => item.id));

      const localPending = (await foodRepository.getAll()).filter(
        (food) =>
          isPersonalCustomFood(food) &&
          (food.moderationStatus === 'pending' || !food.moderationStatus) &&
          !remoteIds.has(food.id),
      );

      if (localPending.length > 0) {
        await Promise.all(
          localPending.map((food) =>
            communityFoodService.submitPendingFood(food, food.createdByUid ?? adminUid),
          ),
        );
        const refreshed = await communityFoodService.listPendingSubmissions(adminUid);
        setPending(refreshed.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)));
        return;
      }

      setPending(remoteItems.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load submissions');
    } finally {
      setIsLoading(false);
    }
  }, [adminUid]);

  useEffect(() => {
    void loadPending();
  }, [loadPending]);

  const handleReview = async (foodId: string, decision: 'approved' | 'rejected') => {
    setReviewingId(foodId);
    setError(null);
    try {
      await communityFoodService.reviewSubmission(foodId, adminUid, decision);
      setPending((items) => items.filter((item) => item.id !== foodId));
      void queryClient.invalidateQueries({ queryKey: FOODS_QUERY_KEY });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Review failed');
    } finally {
      setReviewingId(null);
    }
  };

  return (
    <Stack spacing={2}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="body2" color="text.secondary">
          {pending.length} pending
        </Typography>
        <Tooltip title="Refresh queue">
          <span>
            <IconButton size="small" onClick={() => void loadPending()} disabled={isLoading}>
              <RefreshOutlinedIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>

      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {isLoading ? (
        <Typography color="text.secondary">Loading pending submissions…</Typography>
      ) : pending.length === 0 ? (
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <GavelOutlinedIcon color="action" />
          <Typography color="text.secondary">No foods waiting for approval.</Typography>
        </Stack>
      ) : (
        pending.map((food) => (
          <Card key={food.id} variant="outlined">
            <CardContent>
              <Stack spacing={1.5}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {food.name}
                  </Typography>
                  <Chip label={food.category} size="small" />
                  {food.isVegetarian ? (
                    <Chip label="Veg" size="small" color="success" variant="outlined" />
                  ) : (
                    <Chip label="Non-veg" size="small" color="warning" variant="outlined" />
                  )}
                </Stack>

                <Typography variant="body2" color="text.secondary">
                  {food.nutritionPer100g.calories} kcal · P {food.nutritionPer100g.protein}g · C{' '}
                  {food.nutritionPer100g.carbs}g · F {food.nutritionPer100g.fat}g per 100g
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  Submitted {new Date(food.submittedAt).toLocaleString()}
                </Typography>

                <Stack direction="row" spacing={1}>
                  <Button
                    variant="contained"
                    size="small"
                    disabled={reviewingId === food.id}
                    onClick={() => void handleReview(food.id, 'approved')}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    disabled={reviewingId === food.id}
                    onClick={() => void handleReview(food.id, 'rejected')}
                  >
                    Reject
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        ))
      )}
    </Stack>
  );
}
