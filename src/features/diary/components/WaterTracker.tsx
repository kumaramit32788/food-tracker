import { Button, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';

interface WaterTrackerProps {
  waterMl: number;
  onSave: (waterMl: number) => Promise<void>;
}

export function WaterTracker({ waterMl, onSave }: WaterTrackerProps) {
  const [value, setValue] = useState(waterMl);
  const [saving, setSaving] = useState(false);

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { sm: 'center' } }}>
      <TextField
        type="number"
        label="Water today (ml)"
        value={value}
        onChange={(event) => setValue(Number(event.target.value))}
        slotProps={{ htmlInput: { min: 0, step: 100 } }}
        sx={{ maxWidth: 200 }}
      />
      <Button
        variant="outlined"
        disabled={saving}
        onClick={async () => {
          setSaving(true);
          try {
            await onSave(value);
          } finally {
            setSaving(false);
          }
        }}
      >
        {saving ? 'Saving...' : 'Save water'}
      </Button>
      <Typography variant="body2" color="text.secondary">
        {(value / 1000).toFixed(1)} L logged
      </Typography>
    </Stack>
  );
}
