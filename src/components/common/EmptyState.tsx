import { Stack, Text, ThemeIcon } from '@mantine/core';
import { IconInbox } from '@tabler/icons-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Stack align="center" py="xl" gap="md">
      <ThemeIcon size={48} variant="light" color="gray">
        <IconInbox size={28} />
      </ThemeIcon>
      <Text fw={500} c="dimmed">{title}</Text>
      {description && <Text size="sm" c="dimmed" ta="center" maw={300}>{description}</Text>}
      {action}
    </Stack>
  );
}
