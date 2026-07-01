import ExpandLessOutlinedIcon from '@mui/icons-material/ExpandLessOutlined';
import ExpandMoreOutlinedIcon from '@mui/icons-material/ExpandMoreOutlined';
import { Box, Button, Card, CardContent, Collapse, Stack } from '@mui/material';
import { useState } from 'react';
import { DiaryDateCalendar } from '@/features/diary/components/DiaryDateCalendar.tsx';
import {
  formatDisplayDate,
  getLocalDateKey,
  isToday,
  parseDateKey,
} from '@/utils/date.ts';

interface DiaryDatePickerProps {
  selectedDate: string;
  onSelectDate: (dateKey: string) => void;
  loggedDates: Set<string>;
  viewMonth: Date;
  onViewMonthChange: (month: Date) => void;
}

export function DiaryDatePicker({
  selectedDate,
  onSelectDate,
  loggedDates,
  viewMonth,
  onViewMonthChange,
}: DiaryDatePickerProps) {
  const today = getLocalDateKey();
  const [open, setOpen] = useState(false);
  const viewingToday = isToday(selectedDate);
  const dateLabel = viewingToday ? 'Today' : formatDisplayDate(selectedDate);

  const handleSelectDate = (dateKey: string) => {
    onSelectDate(dateKey);
    onViewMonthChange(parseDateKey(dateKey));
    setOpen(false);
  };

  const handleReset = () => {
    onSelectDate(today);
    onViewMonthChange(parseDateKey(today));
    setOpen(false);
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Button
          onClick={() => setOpen((value) => !value)}
          endIcon={open ? <ExpandLessOutlinedIcon /> : <ExpandMoreOutlinedIcon />}
          aria-expanded={open}
          aria-label={open ? 'Hide calendar' : 'Show calendar'}
          sx={{
            px: 1.5,
            py: 1,
            fontWeight: 700,
            fontSize: '1rem',
            color: 'text.primary',
            justifyContent: 'flex-start',
          }}
        >
          {dateLabel}
        </Button>
        {!viewingToday && (
          <Button size="small" variant="outlined" onClick={handleReset}>
            Reset
          </Button>
        )}
      </Stack>

      <Collapse in={open}>
        <Card sx={{ mt: 1.5 }}>
          <CardContent>
            <DiaryDateCalendar
              selectedDate={selectedDate}
              onSelectDate={handleSelectDate}
              loggedDates={loggedDates}
              viewMonth={viewMonth}
              onViewMonthChange={onViewMonthChange}
              showFooterActions={false}
            />
          </CardContent>
        </Card>
      </Collapse>
    </Box>
  );
}
