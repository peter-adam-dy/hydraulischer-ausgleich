import { Group, UnstyledButton, Text, Stack } from '@mantine/core';
import {
  IconBuilding,
  IconDoor,
  IconFlame,
  IconSettings,
  IconChartBar,
} from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';

interface BottomNavigationProps {
  projectId: string;
}

export function BottomNavigation({ projectId }: BottomNavigationProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { icon: IconBuilding, label: t('nav.building'), path: `/project/${projectId}/building` },
    { icon: IconDoor, label: t('nav.rooms'), path: `/project/${projectId}/rooms` },
    { icon: IconFlame, label: t('nav.radiators'), path: `/project/${projectId}/radiators` },
    { icon: IconSettings, label: t('nav.system'), path: `/project/${projectId}/system` },
    { icon: IconChartBar, label: t('nav.results'), path: `/project/${projectId}/results` },
  ];

  return (
    <Group h="100%" justify="space-around" px="xs" wrap="nowrap">
      {tabs.map((tab) => {
        const isActive = location.pathname.startsWith(tab.path);
        return (
          <UnstyledButton
            key={tab.path}
            onClick={() => navigate(tab.path)}
            style={{ flex: 1 }}
          >
            <Stack align="center" gap={2}>
              <tab.icon
                size={22}
                stroke={1.5}
                color={isActive ? 'var(--mantine-color-blue-6)' : 'var(--mantine-color-gray-6)'}
              />
              <Text
                size="xs"
                c={isActive ? 'blue.6' : 'gray.6'}
                fw={isActive ? 600 : 400}
                ta="center"
                lineClamp={1}
              >
                {tab.label}
              </Text>
            </Stack>
          </UnstyledButton>
        );
      })}
    </Group>
  );
}
