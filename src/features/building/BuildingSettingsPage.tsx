import { Card, Text, Group, Stack, Table, Button, Badge } from '@mantine/core';
import { IconEdit } from '@tabler/icons-react';
import { useParams, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../components/common/PageHeader.tsx';
import { HelpIcon } from '../../components/common/HelpIcon.tsx';
import { useProject } from '../../db/hooks.ts';
import { uValueTable, type UValueEntry } from '../../data/reference/uValues.ts';
import { findClimateZone } from '../../data/reference/climateZones.ts';

export function BuildingSettingsPage() {
  const { t } = useTranslation();
  const { projectId } = useParams();
  const navigate = useNavigate();
  const project = useProject(projectId ? Number(projectId) : undefined);

  if (!project) {
    return <Text>{t('common.loading')}</Text>;
  }

  const climateZone = findClimateZone(project.climateZoneId);
  const uValues: UValueEntry[] = uValueTable[project.buildingAgeClass] ?? [];

  const componentTypeLabels: Record<string, string> = {
    exterior_wall: t('rooms.componentTypes.exterior_wall'),
    interior_wall: t('rooms.componentTypes.interior_wall'),
    roof: t('rooms.componentTypes.roof'),
    floor: t('rooms.componentTypes.floor'),
    ceiling: t('rooms.componentTypes.ceiling'),
    window: t('rooms.windows'),
  };

  return (
    <>
      <PageHeader
        title={t('building.title')}
        backTo={`/project/${projectId}`}
        rightSection={
          <Button
            variant="light"
            leftSection={<IconEdit size={16} />}
            onClick={() => navigate(`/project/${projectId}/edit`)}
          >
            {t('common.edit')}
          </Button>
        }
      />

      <Stack gap="md">
        <Card shadow="xs" padding="md" radius="md" withBorder>
          <Stack gap="xs">
            <Group justify="space-between">
              <Text size="sm" c="dimmed">{t('projects.name')}</Text>
              <Text fw={500}>{project.name}</Text>
            </Group>
            <Group justify="space-between">
              <Text size="sm" c="dimmed">{t('building.type')}</Text>
              <Text>{t(`building.types.${project.buildingType}`)}</Text>
            </Group>
            <Group justify="space-between">
              <Text size="sm" c="dimmed">{t('building.ageClass')}</Text>
              <Badge variant="light">{t(`building.ageClasses.${project.buildingAgeClass}`)}</Badge>
            </Group>
            <Group justify="space-between">
              <Text size="sm" c="dimmed">{t('building.climateZone')}</Text>
              <Text>{climateZone ? `${climateZone.city} (${climateZone.state})` : project.climateZoneId}</Text>
            </Group>
            <Group justify="space-between">
              <Group gap={4}><Text size="sm" c="dimmed">{t('building.designOutdoorTemp')}</Text><HelpIcon tooltip={t('help.designOutdoorTemp')} /></Group>
              <Text fw={500}>{project.designOutdoorTemp} °C</Text>
            </Group>
          </Stack>
        </Card>

        <Card shadow="xs" padding="md" radius="md" withBorder>
          <Group gap={4} mb="sm"><Text fw={500}>{t('building.uValues')}</Text><HelpIcon detail={t('help.uValue')} title="U-Wert" /></Group>
          <Text size="xs" c="dimmed" mb="sm">{t('building.uValueOverride')}</Text>
          <Table striped>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Bauteil</Table.Th>
                <Table.Th ta="right">U-Wert [W/(m²·K)]</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {uValues.map((entry) => (
                <Table.Tr key={entry.componentType}>
                  <Table.Td>{componentTypeLabels[entry.componentType] ?? entry.componentType}</Table.Td>
                  <Table.Td ta="right">{entry.uValue.toFixed(2)}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Card>
      </Stack>
    </>
  );
}
