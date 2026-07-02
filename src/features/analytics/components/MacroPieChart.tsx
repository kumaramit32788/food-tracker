import { appRadius } from '@/constants/shape.ts';
import { Box, Stack, Typography, useTheme } from '@mui/material';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { MacroNutrients } from '@/types/nutritionEngine.types.ts';
import { macroCalorieBreakdown } from '@/utils/nutritionEngine.ts';

const MACRO_COLORS = {
  Protein: '#1976d2',
  Carbs: '#ed6c02',
  Fat: '#9c27b0',
} as const;

interface MacroPieChartProps {
  macros: MacroNutrients;
  title?: string;
}

export function MacroPieChart({ macros, title = 'Macro split (by calories)' }: MacroPieChartProps) {
  const theme = useTheme();
  const slices = macroCalorieBreakdown(macros);
  const totalCalories = slices.reduce((sum, slice) => sum + slice.value, 0);

  return (
    <Box>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
        {title}
      </Typography>
      {totalCalories <= 0 ? (
        <Typography variant="body2" color="text.secondary">
          No macros logged yet.
        </Typography>
      ) : (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: 'center' }}>
          <Box sx={{ width: '100%', maxWidth: 220, height: 220, mx: 'auto' }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={slices}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={78}
                  paddingAngle={2}
                >
                  {slices.map((slice) => (
                    <Cell
                      key={slice.name}
                      fill={MACRO_COLORS[slice.name as keyof typeof MACRO_COLORS]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name, item) => {
                    const grams = (item?.payload as { grams?: number })?.grams ?? 0;
                    return [`${Number(value ?? 0)} kcal (${grams}g)`, String(name)];
                  }}
                  contentStyle={{
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: appRadius.lg,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Box>
          <Stack spacing={1} sx={{ minWidth: 140 }}>
            {slices.map((slice) => (
              <Stack key={slice.name} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    bgcolor: MACRO_COLORS[slice.name as keyof typeof MACRO_COLORS],
                  }}
                />
                <Typography variant="body2">
                  {slice.name}: {slice.grams}g ({Math.round((slice.value / totalCalories) * 100)}%)
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Stack>
      )}
    </Box>
  );
}
