import { Box, Typography, useTheme } from '@mui/material';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { DailyMacroTotal } from '@/utils/nutritionEngine.ts';
import { formatShortWeekday } from '@/utils/date.ts';

interface WeeklyCalorieChartProps {
  dailyTotals: DailyMacroTotal[];
  calorieGoal?: number;
  title?: string;
}

export function WeeklyCalorieChart({
  dailyTotals,
  calorieGoal,
  title = 'Calories (last 7 days)',
}: WeeklyCalorieChartProps) {
  const theme = useTheme();
  const data = dailyTotals.map(({ date, total }) => ({
    date,
    label: formatShortWeekday(date),
    calories: total.calories,
  }));
  const hasData = data.some((point) => point.calories > 0);

  return (
    <Box>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
        {title}
      </Typography>
      {!hasData ? (
        <Typography variant="body2" color="text.secondary">
          Log meals to see your calorie trend.
        </Typography>
      ) : (
        <Box sx={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <Tooltip
                formatter={(value) => [`${Number(value ?? 0)} kcal`, 'Calories']}
                labelFormatter={(_, payload) => {
                  const point = payload?.[0]?.payload as { date?: string } | undefined;
                  return point?.date ?? '';
                }}
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 8,
                }}
              />
              {calorieGoal ? (
                <ReferenceLine
                  y={calorieGoal}
                  stroke={theme.palette.warning.main}
                  strokeDasharray="4 4"
                  label={{
                    value: 'Goal',
                    position: 'insideTopRight',
                    fill: theme.palette.warning.main,
                    fontSize: 11,
                  }}
                />
              ) : null}
              <Bar dataKey="calories" fill={theme.palette.primary.main} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Box>
  );
}
