import { appRadius } from '@/constants/shape.ts';
import ChevronLeftOutlinedIcon from '@mui/icons-material/ChevronLeftOutlined';
import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';
import { Box, Button, IconButton, Stack, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import {
  formatDisplayDate,
  formatMonthYear,
  getLocalDateKey,
  isFutureDateKey,
  isToday,
  parseDateKey,
} from '@/utils/date.ts';

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface DiaryDateCalendarProps {
  selectedDate: string;
  onSelectDate: (dateKey: string) => void;
  loggedDates: Set<string>;
  viewMonth: Date;
  onViewMonthChange: (month: Date) => void;
  showFooterActions?: boolean;
}

export function DiaryDateCalendar({
  selectedDate,
  onSelectDate,
  loggedDates,
  viewMonth,
  onViewMonthChange,
  showFooterActions = true,
}: DiaryDateCalendarProps) {
  const today = getLocalDateKey();

  const days = useMemo(() => {
    const month = dayjs(viewMonth);
    const gridStart = month.startOf('month').startOf('week');
    const gridEnd = month.endOf('month').endOf('week');
    const result: dayjs.Dayjs[] = [];
    let current = gridStart;

    while (current.isBefore(gridEnd) || current.isSame(gridEnd, 'day')) {
      result.push(current);
      current = current.add(1, 'day');
    }

    return result;
  }, [viewMonth]);

  const currentMonth = viewMonth.getMonth();

  const goToPreviousMonth = () => {
    onViewMonthChange(dayjs(viewMonth).subtract(1, 'month').toDate());
  };

  const goToNextMonth = () => {
    const next = dayjs(viewMonth).add(1, 'month').toDate();
    if (dayjs(next).startOf('month').isAfter(dayjs(), 'month')) {
      return;
    }
    onViewMonthChange(next);
  };

  const canGoNext = !dayjs(viewMonth).add(1, 'month').startOf('month').isAfter(dayjs(), 'month');

  return (
    <Box>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <IconButton aria-label="Previous month" onClick={goToPreviousMonth} size="small">
          <ChevronLeftOutlinedIcon />
        </IconButton>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {formatMonthYear(viewMonth)}
        </Typography>
        <IconButton
          aria-label="Next month"
          onClick={goToNextMonth}
          size="small"
          disabled={!canGoNext}
        >
          <ChevronRightOutlinedIcon />
        </IconButton>
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 0.5,
          mb: 0.5,
        }}
      >
        {WEEKDAY_LABELS.map((label) => (
          <Typography
            key={label}
            variant="caption"
            color="text.secondary"
            sx={{ textAlign: 'center', fontWeight: 700 }}
          >
            {label}
          </Typography>
        ))}
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 0.5,
        }}
      >
        {days.map((day) => {
          const dateKey = day.format('YYYY-MM-DD');
          const isOutsideMonth = day.month() !== currentMonth;
          const isFuture = isFutureDateKey(dateKey);
          const isSelected = dateKey === selectedDate;
          const hasLogs = loggedDates.has(dateKey);
          const isTodayDate = isToday(dateKey);

          return (
            <Button
              key={dateKey}
              onClick={() => onSelectDate(dateKey)}
              disabled={isFuture}
              aria-label={formatDisplayDate(dateKey)}
              aria-pressed={isSelected}
              sx={{
                minWidth: 0,
                p: 0.75,
                borderRadius: appRadius.sm,
                flexDirection: 'column',
                gap: 0.25,
                opacity: isOutsideMonth ? 0.35 : 1,
                bgcolor: isSelected ? 'primary.main' : 'transparent',
                color: isSelected ? 'primary.contrastText' : 'text.primary',
                border: isTodayDate && !isSelected ? 1 : 0,
                borderColor: 'primary.main',
                '&:hover': {
                  bgcolor: isSelected ? 'primary.dark' : 'action.hover',
                },
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: isSelected || isTodayDate ? 700 : 500 }}>
                {day.date()}
              </Typography>
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: hasLogs
                    ? isSelected
                      ? 'primary.contrastText'
                      : 'primary.main'
                    : 'transparent',
                }}
              />
            </Button>
          );
        })}
      </Box>

      {showFooterActions && (
        <Stack direction="row" spacing={1} sx={{ mt: 2, justifyContent: 'flex-end' }}>
          {selectedDate !== today && (
            <Button size="small" onClick={() => onSelectDate(today)}>
              Go to today
            </Button>
          )}
          <Button
            size="small"
            onClick={() => {
              onSelectDate(today);
              onViewMonthChange(parseDateKey(today));
            }}
          >
            This month
          </Button>
        </Stack>
      )}
    </Box>
  );
}
