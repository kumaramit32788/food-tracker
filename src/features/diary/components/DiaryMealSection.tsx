import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import CookieOutlinedIcon from '@mui/icons-material/CookieOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import DinnerDiningOutlinedIcon from '@mui/icons-material/DinnerDiningOutlined';
import FitnessCenterOutlinedIcon from '@mui/icons-material/FitnessCenterOutlined';
import KitchenOutlinedIcon from '@mui/icons-material/KitchenOutlined';
import LunchDiningOutlinedIcon from '@mui/icons-material/LunchDiningOutlined';
import RestaurantMenuOutlinedIcon from '@mui/icons-material/RestaurantMenuOutlined';
import WbSunnyOutlinedIcon from '@mui/icons-material/WbSunnyOutlined';
import {
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useState, type ReactNode } from 'react';
import { appRadius } from '@/constants/shape.ts';
import { MEAL_TYPE_LABELS } from '@/constants/mealTypes.ts';
import type { MealType } from '@/constants/mealTypes.ts';
import type { DiaryEntry } from '@/types/diary.types.ts';
import type { MacroNutrients } from '@/types/nutritionEngine.types.ts';
import { formatCalories } from '@/utils/formatNutrition.ts';

interface DiaryMealSectionProps {
  mealType: MealType;
  entries: DiaryEntry[];
  goals: MacroNutrients;
  onRemove: (entryId: string) => void;
  onAddFood: (mealType: MealType) => void;
  onAddIngredients: (mealType: MealType) => void;
}

const ACCENT = '#43a047';

const MEAL_ICONS: Record<MealType, ReactNode> = {
  'pre-workout': <FitnessCenterOutlinedIcon sx={{ fontSize: 20 }} />,
  breakfast: <WbSunnyOutlinedIcon sx={{ fontSize: 20 }} />,
  lunch: <LunchDiningOutlinedIcon sx={{ fontSize: 20 }} />,
  dinner: <DinnerDiningOutlinedIcon sx={{ fontSize: 20 }} />,
  snacks: <CookieOutlinedIcon sx={{ fontSize: 20 }} />,
};

function sumEntryMacros(entries: DiaryEntry[]): MacroNutrients {
  return entries.reduce(
    (sum, entry) => ({
      calories: sum.calories + entry.nutrition.calories,
      protein: sum.protein + entry.nutrition.protein,
      carbs: sum.carbs + entry.nutrition.carbs,
      fat: sum.fat + entry.nutrition.fat,
      fiber: sum.fiber + entry.nutrition.fiber,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
  );
}

interface MealProgressRingProps {
  progress: number;
  icon: ReactNode;
  color: string;
  trackColor: string;
}

function MealProgressRing({ progress, icon, color, trackColor }: MealProgressRingProps) {
  const size = 52;
  const stroke = 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const displayProgress = Math.min(progress, 100);
  const offset = circumference - (displayProgress / 100) * circumference;

  return (
    <Box sx={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <Box
        component="svg"
        width={size}
        height={size}
        sx={{ transform: 'rotate(-90deg)', display: 'block' }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.4s ease' }}
        />
      </Box>
      <Box
        sx={{
          position: 'absolute',
          inset: stroke,
          display: 'grid',
          placeItems: 'center',
          color,
        }}
      >
        {icon}
      </Box>
    </Box>
  );
}

interface MacroStatProps {
  label: string;
  consumed: number;
  goal: number;
  unit: string;
}

function MacroStat({ label, consumed, goal, unit }: MacroStatProps) {
  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 0,
        px: 1.5,
        py: 1,
        borderRadius: appRadius.sm,
        bgcolor: 'action.hover',
      }}
    >
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block' }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 700 }}>
        {Math.round(consumed)}
        <Typography component="span" variant="caption" color="text.secondary">
          /{goal}
          {unit}
        </Typography>
      </Typography>
    </Box>
  );
}

export function DiaryMealSection({
  mealType,
  entries,
  goals,
  onRemove,
  onAddFood,
  onAddIngredients,
}: DiaryMealSectionProps) {
  const theme = useTheme();
  const [addMenuAnchor, setAddMenuAnchor] = useState<HTMLElement | null>(null);
  const consumed = sumEntryMacros(entries);
  const calorieProgress = goals.calories > 0 ? (consumed.calories / goals.calories) * 100 : 0;
  const isOverGoal = calorieProgress > 100;
  const overBy = Math.max(0, Math.round(consumed.calories - goals.calories));
  const accentColor = isOverGoal ? theme.palette.warning.main : ACCENT;
  const trackColor = alpha(accentColor, 0.15);

  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        borderColor: isOverGoal ? alpha(theme.palette.warning.main, 0.5) : 'divider',
      }}
    >
      <CardContent sx={{ p: 2.25, '&:last-child': { pb: 2.25 } }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 2 }}>
          <MealProgressRing
            progress={calorieProgress}
            icon={MEAL_ICONS[mealType]}
            color={accentColor}
            trackColor={trackColor}
          />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                {MEAL_TYPE_LABELS[mealType]}
              </Typography>
              <IconButton
                size="small"
                color="primary"
                aria-label={`Add to ${MEAL_TYPE_LABELS[mealType]}`}
                onClick={(event) => setAddMenuAnchor(event.currentTarget)}
                sx={{ mt: -0.5, mr: -0.5 }}
              >
                <AddCircleOutlineOutlinedIcon fontSize="small" />
              </IconButton>
            </Stack>
            <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', mt: 0.5, flexWrap: 'wrap' }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {formatCalories(consumed.calories)}
                <Typography component="span" variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  {' '}
                  / {formatCalories(goals.calories)}
                </Typography>
              </Typography>
              <Chip
                size="small"
                label={`${Math.round(calorieProgress)}%`}
                sx={{
                  height: 20,
                  fontSize: 11,
                  fontWeight: 700,
                  bgcolor: alpha(accentColor, 0.1),
                  color: isOverGoal ? 'warning.dark' : ACCENT,
                }}
              />
              {isOverGoal ? (
                <Chip
                  size="small"
                  label={`+${overBy}`}
                  color="warning"
                  variant="outlined"
                  sx={{ height: 20, fontSize: 11 }}
                />
              ) : null}
            </Stack>
          </Box>
        </Stack>

        <Menu
          anchorEl={addMenuAnchor}
          open={Boolean(addMenuAnchor)}
          onClose={() => setAddMenuAnchor(null)}
        >
          <MenuItem
            onClick={() => {
              setAddMenuAnchor(null);
              onAddFood(mealType);
            }}
          >
            <ListItemIcon>
              <RestaurantMenuOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Search food" secondary="Pick from the database" />
          </MenuItem>
          <MenuItem
            onClick={() => {
              setAddMenuAnchor(null);
              onAddIngredients(mealType);
            }}
          >
            <ListItemIcon>
              <KitchenOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Add ingredients" secondary="Build from multiple items" />
          </MenuItem>
        </Menu>

        <Stack direction="row" spacing={1} sx={{ mb: entries.length > 0 ? 2 : 0, mt: 2 }}>
          <MacroStat label="Protein" consumed={consumed.protein} goal={goals.protein} unit="g" />
          <MacroStat label="Carbs" consumed={consumed.carbs} goal={goals.carbs} unit="g" />
          <MacroStat label="Fat" consumed={consumed.fat} goal={goals.fat} unit="g" />
        </Stack>

        {entries.length === 0 ? (
          <Box
            sx={{
              py: 2,
              px: 1.5,
              textAlign: 'center',
              borderRadius: appRadius.sm,
              border: 1,
              borderColor: 'divider',
              borderStyle: 'dashed',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              No items yet — tap + to log food
            </Typography>
          </Box>
        ) : (
          <Stack spacing={0.75}>
            {entries.map((entry) => (
              <Stack
                key={entry.id}
                direction="row"
                sx={{
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 1,
                  py: 1,
                  px: 1.25,
                  borderRadius: appRadius.sm,
                  bgcolor: 'action.hover',
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                    {entry.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {entry.quantity} {entry.unit} · {formatCalories(entry.nutrition.calories)} · P{' '}
                    {Math.round(entry.nutrition.protein)}g · C {Math.round(entry.nutrition.carbs)}g · F{' '}
                    {Math.round(entry.nutrition.fat)}g
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  color="error"
                  aria-label={`Remove ${entry.name}`}
                  onClick={() => onRemove(entry.id)}
                  sx={{ flexShrink: 0 }}
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
