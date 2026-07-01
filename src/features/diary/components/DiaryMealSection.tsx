import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import {
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import type { DiaryEntry } from '@/types/diary.types.ts';
import { MEAL_TYPE_LABELS } from '@/constants/mealTypes.ts';
import type { MealType } from '@/constants/mealTypes.ts';
import { formatCalories } from '@/utils/formatNutrition.ts';

interface DiaryMealSectionProps {
  mealType: MealType;
  entries: DiaryEntry[];
  onRemove: (entryId: string) => void;
  onAddFood: (mealType: MealType) => void;
}

export function DiaryMealSection({
  mealType,
  entries,
  onRemove,
  onAddFood,
}: DiaryMealSectionProps) {
  const totals = entries.reduce(
    (sum, entry) => ({
      calories: sum.calories + entry.nutrition.calories,
      protein: sum.protein + entry.nutrition.protein,
    }),
    { calories: 0, protein: 0 },
  );

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Stack
          direction="row"
          sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {MEAL_TYPE_LABELS[mealType]}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Chip
              size="small"
              label={`${Math.round(totals.calories)} kcal · P ${Math.round(totals.protein)}g`}
              variant="outlined"
            />
            <IconButton
              size="small"
              color="primary"
              aria-label={`Add food to ${MEAL_TYPE_LABELS[mealType]}`}
              onClick={() => onAddFood(mealType)}
            >
              <AddCircleOutlineOutlinedIcon />
            </IconButton>
          </Stack>
        </Stack>

        {entries.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No items logged yet. Tap + to add food.
          </Typography>
        ) : (
          <Stack spacing={1}>
            {entries.map((entry) => (
              <Stack
                key={entry.id}
                direction="row"
                sx={{
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: 'action.hover',
                }}
              >
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {entry.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {entry.quantity} {entry.unit} · {formatCalories(entry.nutrition.calories)}
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  color="error"
                  aria-label={`Remove ${entry.name}`}
                  onClick={() => onRemove(entry.id)}
                >
                  <DeleteOutlineOutlinedIcon fontSize="small" />
                </IconButton>
              </Stack>
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
