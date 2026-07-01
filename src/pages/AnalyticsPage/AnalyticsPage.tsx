import {
  Box,
  Card,
  CardContent,
  Grid,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { BmiSummaryCard } from '@/features/analytics/components/BmiSummaryCard.tsx';
import { MacroPieChart } from '@/features/analytics/components/MacroPieChart.tsx';
import { WeeklyCalorieChart } from '@/features/analytics/components/WeeklyCalorieChart.tsx';
import {
  calculateLoggingStreak,
  collectLoggedDates,
  countLoggedDaysInRange,
} from '@/features/analytics/utils/streak.ts';
import { useAuth } from '@/features/auth/hooks/useAuth.ts';
import { useDiaryRange } from '@/features/diary/hooks/useDiary.ts';
import {
  enumerateDateKeys,
  getLastNDaysRange,
  getMonthRange,
  getWeekRange,
} from '@/utils/date.ts';
import {
  calculateDailyTotalsByDate,
  calculatePeriodIntakeFromDiaryEntries,
} from '@/utils/nutritionEngine.ts';

type AnalyticsPeriod = 'week' | 'month';

export function AnalyticsPage() {
  const { profile } = useAuth();
  const [period, setPeriod] = useState<AnalyticsPeriod>('week');
  const weekRange = getWeekRange();
  const monthRange = getMonthRange();
  const last7Range = getLastNDaysRange(7);
  const activeRange = period === 'week' ? weekRange : monthRange;

  const { data: weekEntries = [] } = useDiaryRange(weekRange.start, weekRange.end);
  const { data: monthEntries = [] } = useDiaryRange(monthRange.start, monthRange.end);
  const { data: last7Entries = [] } = useDiaryRange(last7Range.start, last7Range.end);

  const activeEntries = period === 'week' ? weekEntries : monthEntries;
  const periodSummary = useMemo(
    () => calculatePeriodIntakeFromDiaryEntries(activeEntries),
    [activeEntries],
  );
  const last7DailyTotals = useMemo(
    () =>
      calculateDailyTotalsByDate(
        last7Entries,
        enumerateDateKeys(last7Range.start, last7Range.end),
      ),
    [last7Entries, last7Range.end, last7Range.start],
  );
  const loggedDates = useMemo(() => collectLoggedDates(monthEntries), [monthEntries]);
  const streak = useMemo(() => calculateLoggingStreak(loggedDates), [loggedDates]);
  const daysInPeriod = enumerateDateKeys(activeRange.start, activeRange.end).length;
  const daysLoggedInPeriod = countLoggedDaysInRange(
    loggedDates,
    activeRange.start,
    activeRange.end,
  );

  const calorieGoal = profile?.calorieGoal ?? 2000;

  return (
    <>
      <PageHeader
        title="Analytics"
        subtitle="Track trends, macro balance, and logging consistency."
      />

      <Tabs
        value={period}
        onChange={(_, value: AnalyticsPeriod) => setPeriod(value)}
        sx={{ mb: 3 }}
      >
        <Tab label="This week" value="week" />
        <Tab label="This month" value="month" />
      </Tabs>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Days logged
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                {daysLoggedInPeriod}
                <Typography component="span" variant="body2" color="text.secondary">
                  {' '}
                  / {daysInPeriod}
                </Typography>
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Current streak
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                {streak} day{streak === 1 ? '' : 's'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Avg calories / day
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                {periodSummary.avgDaily.calories} kcal
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <BmiSummaryCard weightKg={profile?.weight} heightCm={profile?.height} />
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <WeeklyCalorieChart
                dailyTotals={last7DailyTotals}
                calorieGoal={calorieGoal}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <MacroPieChart
                macros={periodSummary.avgDaily}
                title={
                  period === 'week'
                    ? 'Avg macro split this week'
                    : 'Avg macro split this month'
                }
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                Period totals
              </Typography>
              {periodSummary.daysLogged > 0 ? (
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {periodSummary.total.calories} kcal total · P {periodSummary.total.protein}g · C{' '}
                    {periodSummary.total.carbs}g · F {periodSummary.total.fat}g · Fiber{' '}
                    {periodSummary.total.fiber}g
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Daily averages: {periodSummary.avgDaily.calories} kcal · P{' '}
                    {periodSummary.avgDaily.protein}g · C {periodSummary.avgDaily.carbs}g · F{' '}
                    {periodSummary.avgDaily.fat}g
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No meals logged in this period yet.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}
