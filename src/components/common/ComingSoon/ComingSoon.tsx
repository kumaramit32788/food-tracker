import type { ReactNode } from 'react';
import { Box, Chip, Stack } from '@mui/material';
import { EmptyState } from '@/components/common/EmptyState';

interface ComingSoonProps {
  title: string;
  description: string;
  icon?: ReactNode;
}

export function ComingSoon({ title, description, icon }: ComingSoonProps) {
  return (
    <Box>
      <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
        <Chip label="Coming in next milestone" color="primary" variant="outlined" size="small" />
      </Stack>
      <EmptyState title={title} description={description} icon={icon} />
    </Box>
  );
}
