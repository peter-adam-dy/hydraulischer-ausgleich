import { Group, Title, ActionIcon } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { useNavigate } from 'react-router';
import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  backTo?: string;
  rightSection?: ReactNode;
}

export function PageHeader({ title, backTo, rightSection }: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <Group
      justify="space-between"
      mb="md"
      py="xs"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'var(--mantine-color-body)',
      }}
    >
      <Group gap="sm">
        {backTo && (
          <ActionIcon variant="subtle" onClick={() => navigate(backTo)}>
            <IconArrowLeft size={20} />
          </ActionIcon>
        )}
        <Title order={3}>{title}</Title>
      </Group>
      {rightSection}
    </Group>
  );
}
