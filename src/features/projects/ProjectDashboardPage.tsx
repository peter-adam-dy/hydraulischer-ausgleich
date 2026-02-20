import { Card, Group, SimpleGrid, Stack, Text, Badge, ThemeIcon } from '@mantine/core';
import {
  IconBuilding,
  IconDoor,
  IconFlame,
  IconSettings,
  IconRoute,
  IconChartBar,
} from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../components/common/PageHeader.tsx';
import { useProject, useRooms, useRadiators } from '../../db/hooks.ts';
import { findClimateZone } from '../../data/reference/climateZones.ts';

export function ProjectDashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { projectId } = useParams();
  const project = useProject(projectId ? Number(projectId) : undefined);
  const rooms = useRooms(projectId ? Number(projectId) : undefined);
  const radiators = useRadiators(projectId ? Number(projectId) : undefined);

  if (!project) {
    return <Text>{t('common.loading')}</Text>;
  }

  const climateZone = findClimateZone(project.climateZoneId);

  const tiles = [
    {
      icon: IconDoor,
      label: t('nav.rooms'),
      path: `/project/${projectId}/rooms`,
      count: rooms.length,
      color: 'blue',
    },
    {
      icon: IconFlame,
      label: t('nav.radiators'),
      path: `/project/${projectId}/radiators`,
      count: radiators.length,
      color: 'orange',
    },
    {
      icon: IconSettings,
      label: t('nav.system'),
      path: `/project/${projectId}/system`,
      color: 'gray',
    },
    {
      icon: IconRoute,
      label: t('nav.pipes'),
      path: `/project/${projectId}/pipes`,
      color: 'teal',
    },
    {
      icon: IconChartBar,
      label: t('nav.results'),
      path: `/project/${projectId}/results`,
      color: 'green',
    },
  ];

  return (
    <>
      <PageHeader
        title={project.name}
        backTo="/"
      />

      <Stack gap="md">
        <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="sm">
          {tiles.map((tile) => (
            <Card
              key={tile.path}
              shadow="xs"
              padding="md"
              radius="md"
              withBorder
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(tile.path)}
            >
              <Stack align="center" gap="xs">
                <ThemeIcon size="lg" variant="light" color={tile.color}>
                  <tile.icon size={20} />
                </ThemeIcon>
                <Text size="sm" fw={500} ta="center">{tile.label}</Text>
                {tile.count !== undefined && (
                  <Badge size="sm" variant="light" color={tile.color}>{tile.count}</Badge>
                )}
              </Stack>
            </Card>
          ))}
        </SimpleGrid>

        <Card shadow="xs" padding="md" radius="md" withBorder
          style={{ cursor: 'pointer' }}
          onClick={() => navigate(`/project/${projectId}/building`)}
        >
          <Group gap="xs" mb="xs">
            <ThemeIcon size="sm" variant="light" color="violet">
              <IconBuilding size={14} />
            </ThemeIcon>
            <Text size="sm" fw={500}>{t('nav.building')}</Text>
          </Group>
          <Stack gap={4}>
            <Text size="xs" c="dimmed">
              {t(`building.types.${project.buildingType}`)} &middot; {t(`building.ageClasses.${project.buildingAgeClass}`)}
            </Text>
            <Text size="xs" c="dimmed">
              {climateZone ? `${climateZone.city}` : project.climateZoneId} &middot; {project.designOutdoorTemp}&nbsp;°C
            </Text>
          </Stack>
        </Card>
      </Stack>
    </>
  );
}
