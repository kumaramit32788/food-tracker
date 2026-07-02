import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import RamenDiningOutlinedIcon from '@mui/icons-material/RamenDiningOutlined';
import RestaurantMenuOutlinedIcon from '@mui/icons-material/RestaurantMenuOutlined';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { MacroCard } from '@/components/common/MacroCard';
import { PageHeader } from '@/components/layout/PageHeader';
import { BmiSummaryCard } from '@/features/analytics/components/BmiSummaryCard.tsx';
import { MacroPieChart } from '@/features/analytics/components/MacroPieChart.tsx';
import { WeeklyCalorieChart } from '@/features/analytics/components/WeeklyCalorieChart.tsx';
import { appRadius } from '@/constants/shape.ts';
import { MEAL_TYPES } from '@/constants/mealTypes.ts';
import type { MealType } from '@/constants/mealTypes.ts';
import { ROUTES } from '@/constants/routes.ts';
import { DiaryDatePicker } from '@/features/diary/components/DiaryDatePicker.tsx';
import { ComposeMealDrawer } from '@/features/diary/components/ComposeMealDrawer.tsx';
import { DiaryMealSection } from '@/features/diary/components/DiaryMealSection.tsx';
import { WaterTracker } from '@/features/diary/components/WaterTracker.tsx';
import { useDiary, useDiaryRange } from '@/features/diary/hooks/useDiary.ts';
import { useAuth } from '@/features/auth/hooks/useAuth.ts';
import { useFoods } from '@/hooks/useFoods.ts';
import {
  enumerateDateKeys,
  getLastNDaysRange,
  getLocalDateKey,
  getMonthRange,
  getMonthRangeFor,
  getWeekRange,
  isToday,
  parseDateKey,
} from '@/utils/date.ts';
import {
  calculateDailyIntakeFromDiaryEntries,
  calculateDailyTotalsByDate,
  calculatePeriodIntakeFromDiaryEntries,
} from '@/utils/nutritionEngine.ts';
import { distributeDailyGoalsToMeals } from '@/utils/mealGoals.ts';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

interface QuickActionProps {
  title: string;
  description: string;
  icon: ReactNode;
  color: string;
  onClick: () => void;
}

function QuickActionCard({ title, description, icon, color, onClick }: QuickActionProps) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardActionArea onClick={onClick} sx={{ height: '100%' }}>
        <CardContent>
          <Stack spacing={2}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: appRadius.sm,
                display: 'grid',
                placeItems: 'center',
                bgcolor: alpha(color, 0.12),
                color,
              }}
            >
              {icon}
            </Box>
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                {title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {description}
              </Typography>
            </Box>
            <Stack direction="row" spacing={0.5} sx={{ color: 'primary.main', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Open
              </Typography>
              <ArrowForwardIcon sx={{ fontSize: 18 }} />
            </Stack>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { foods } = useFoods();
  const today = getLocalDateKey();
  const [selectedDate, setSelectedDate] = useState(today);
  const [viewMonth, setViewMonth] = useState(() => parseDateKey(today));
  const [composeMeal, setComposeMeal] = useState<MealType | null>(null);
  const weekRange = getWeekRange();
  const monthRange = getMonthRange();
  const last7Range = getLastNDaysRange(7);
  const calendarRange = getMonthRangeFor(viewMonth);
  const { entries, day, removeEntry, setWaterMl } = useDiary(selectedDate);
  const { data: monthEntriesForCalendar = [] } = useDiaryRange(
    calendarRange.start,
    calendarRange.end,
  );
  const { data: weekEntries = [] } = useDiaryRange(weekRange.start, weekRange.end);
  const { data: monthEntries = [] } = useDiaryRange(monthRange.start, monthRange.end);
  const { data: last7Entries = [] } = useDiaryRange(last7Range.start, last7Range.end);
  const theme = useTheme();
  const viewingToday = isToday(selectedDate);

  const calorieGoal = profile?.calorieGoal ?? 2000;
  const proteinGoal = profile?.proteinGoal ?? 120;
  const carbsGoal = profile?.carbsGoal ?? 250;
  const fatGoal = profile?.fatGoal ?? 65;
  const fiberGoal = profile?.fiberGoal ?? 25;

  const intake = useMemo(
    () =>
      calculateDailyIntakeFromDiaryEntries(
        {
          calories: calorieGoal,
          protein: proteinGoal,
          carbs: carbsGoal,
          fat: fatGoal,
          fiber: fiberGoal,
        },
        entries,
      ),
    [entries, calorieGoal, proteinGoal, carbsGoal, fatGoal, fiberGoal],
  );

  const weekSummary = useMemo(
    () => calculatePeriodIntakeFromDiaryEntries(weekEntries),
    [weekEntries],
  );
  const monthSummary = useMemo(
    () => calculatePeriodIntakeFromDiaryEntries(monthEntries),
    [monthEntries],
  );
  const last7DailyTotals = useMemo(
    () =>
      calculateDailyTotalsByDate(
        last7Entries,
        enumerateDateKeys(last7Range.start, last7Range.end),
      ),
    [last7Entries, last7Range.end, last7Range.start],
  );

  const mealGoals = useMemo(
    () =>
      distributeDailyGoalsToMeals({
        calories: calorieGoal,
        protein: proteinGoal,
        carbs: carbsGoal,
        fat: fatGoal,
        fiber: fiberGoal,
      }),
    [calorieGoal, proteinGoal, carbsGoal, fatGoal, fiberGoal],
  );

  const { dailyTotal, remainingCalories, warnings, progress } = intake;

  const entriesByMeal = useMemo(
    () =>
      MEAL_TYPES.reduce(
        (acc, mealType) => {
          acc[mealType] = entries.filter((entry) => entry.mealType === mealType);
          return acc;
        },
        {} as Record<(typeof MEAL_TYPES)[number], typeof entries>,
      ),
    [entries],
  );

  const loggedDates = useMemo(
    () => new Set(monthEntriesForCalendar.map((entry) => entry.date)),
    [monthEntriesForCalendar],
  );

  const progressLabel = viewingToday ? "Today's progress" : 'Daily progress';
  const mealsLabel = viewingToday ? "Today's meals" : 'Meals';

  return (
    <>
      <PageHeader
        title={`${getGreeting()}, ${user?.name?.split(' ')[0] ?? 'there'}`}
        action={
          <Button
            variant="contained"
            startIcon={<AddCircleOutlineOutlinedIcon />}
            onClick={() =>
              navigate(`${ROUTES.FOODS}?date=${selectedDate}`)
            }
          >
            Log meal
          </Button>
        }
      />

      <DiaryDatePicker
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        loggedDates={loggedDates}
        viewMonth={viewMonth}
        onViewMonthChange={setViewMonth}
      />

      {warnings.length > 0 && (
        <Stack spacing={1} sx={{ mb: 3 }}>
          {warnings.map((warning) => (
            <Alert key={warning} severity="warning">
              {warning}
            </Alert>
          ))}
        </Stack>
      )}

      <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
        {progressLabel}
      </Typography>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MacroCard
            label="Calories"
            consumed={dailyTotal.calories}
            goal={calorieGoal}
            unit=""
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MacroCard
            label="Protein"
            consumed={dailyTotal.protein}
            goal={proteinGoal}
            unit="g"
            color="#1976d2"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MacroCard
            label="Carbs"
            consumed={dailyTotal.carbs}
            goal={carbsGoal}
            unit="g"
            color="#ed6c02"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MacroCard
            label="Fat"
            consumed={dailyTotal.fat}
            goal={fatGoal}
            unit="g"
            color="#9c27b0"
          />
        </Grid>
      </Grid>

      <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
        {mealsLabel}
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2.5}>
          {MEAL_TYPES.map((mealType) => (
            <Grid key={mealType} size={{ xs: 12, md: 6 }}>
              <DiaryMealSection
                mealType={mealType}
                entries={entriesByMeal[mealType]}
                goals={mealGoals[mealType]}
                onRemove={(id) => void removeEntry(id)}
                onAddFood={(meal) =>
                  navigate(`${ROUTES.FOODS}?meal=${meal}&date=${selectedDate}`)
                }
                onAddIngredients={(meal) => setComposeMeal(meal)}
              />
            </Grid>
          ))}
        </Grid>

        <Card sx={{ mb: 2, mt: 2 }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
              Water intake
            </Typography>
            <WaterTracker
              waterMl={day?.waterMl ?? 0}
              onSave={async (waterMl) => {
                await setWaterMl(waterMl);
              }}
            />
          </CardContent>
        </Card>
      </Box>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Remaining calories
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  color: remainingCalories < 0 ? 'error.main' : 'text.primary',
                }}
              >
                {remainingCalories} kcal
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Fiber {viewingToday ? 'today' : 'logged'}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                {dailyTotal.fiber}g
                <Typography component="span" variant="body2" color="text.secondary">
                  {' '}
                  / {fiberGoal}g ({progress.fiber}%)
                </Typography>
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <BmiSummaryCard weightKg={profile?.weight} heightCm={profile?.height} />
        </Grid>
      </Grid>

      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <WeeklyCalorieChart dailyTotals={last7DailyTotals} calorieGoal={calorieGoal} />
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <MacroPieChart
                macros={dailyTotal}
                title={viewingToday ? "Today's macro split" : 'Macro split for selected day'}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {(weekSummary.daysLogged > 0 || monthSummary.daysLogged > 0) && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Period totals
            </Typography>
            <Grid container spacing={2}>
              {weekSummary.daysLogged > 0 && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    This week ({weekSummary.daysLogged} day{weekSummary.daysLogged === 1 ? '' : 's'})
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {weekSummary.total.calories} kcal total · {weekSummary.avgDaily.calories} kcal/day
                    avg
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    P {weekSummary.total.protein}g · C {weekSummary.total.carbs}g · F{' '}
                    {weekSummary.total.fat}g · Fiber {weekSummary.total.fiber}g
                  </Typography>
                </Grid>
              )}
              {monthSummary.daysLogged > 0 && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    This month ({monthSummary.daysLogged} day
                    {monthSummary.daysLogged === 1 ? '' : 's'})
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {monthSummary.total.calories} kcal total · {monthSummary.avgDaily.calories}{' '}
                    kcal/day avg
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    P {monthSummary.total.protein}g · C {monthSummary.total.carbs}g · F{' '}
                    {monthSummary.total.fat}g · Fiber {monthSummary.total.fiber}g
                  </Typography>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      )}

      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
        Quick actions
      </Typography>
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <QuickActionCard
            title="Browse foods"
            description={`Search ${foods.length || '549+'} Indian foods with household units.`}
            icon={<RestaurantMenuOutlinedIcon />}
            color={theme.palette.primary.main}
            onClick={() => navigate(ROUTES.FOODS)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <QuickActionCard
            title="Build a recipe"
            description="Combine ingredients into home-cooked dishes."
            icon={<RamenDiningOutlinedIcon />}
            color="#ed6c02"
            onClick={() => navigate(ROUTES.RECIPE_BUILDER)}
          />
        </Grid>
      </Grid>

      <ComposeMealDrawer
        open={composeMeal !== null}
        onClose={() => setComposeMeal(null)}
        date={selectedDate}
        mealType={composeMeal ?? 'lunch'}
        onLogged={() => setComposeMeal(null)}
      />
    </>
  );
}
