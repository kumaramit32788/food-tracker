import { Button, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import {
  bindNumberInputState,
  coerceNumberValue,
  type NumberFormValue,
} from '@/utils/bindNumberField.ts';

interface WaterTrackerProps {
  waterMl: number;
  onSave: (waterMl: number) => Promise<void>;
}

export function WaterTracker({ waterMl, onSave }: WaterTrackerProps) {
  const [value, setValue] = useState<NumberFormValue>(waterMl);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setValue(waterMl);
  }, [waterMl]);

  const displayValue = coerceNumberValue(value);

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { sm: 'center' } }}>
      <TextField
        label="Water today (ml)"
        {...bindNumberInputState(value, setValue)}
        slotProps={{ htmlInput: { min: 0, step: 100 } }}
        sx={{ maxWidth: 200 }}
      />
      <Button
        variant="outlined"
        disabled={saving}
        onClick={async () => {
          setSaving(true);
          try {
            await onSave(displayValue);
          } finally {
            setSaving(false);
          }
        }}
      >
        {saving ? 'Saving...' : 'Save water'}
      </Button>
      <Typography variant="body2" color="text.secondary">
        {(displayValue / 1000).toFixed(1)} L logged
      </Typography>
    </Stack>
  );
}
