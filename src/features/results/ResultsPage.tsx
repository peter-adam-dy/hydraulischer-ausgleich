import {
  Button,
  Card,
  Group,
  Text,
  Stack,
  Table,
  Badge,
  Tabs,
  Divider,
} from '@mantine/core';
import { IconPrinter } from '@tabler/icons-react';
import { useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import {
  useProject,
  useRooms,
  useRadiators,
  useSystemSettings,
} from '../../db/hooks.ts';
import { PageHeader } from '../../components/common/PageHeader.tsx';
import { HelpIcon } from '../../components/common/HelpIcon.tsx';
import { EmptyState } from '../../components/common/EmptyState.tsx';
import { calculateHydraulicBalance, type SystemResult } from '../../calculation/hydraulicBalance.ts';
import { db } from '../../db/index.ts';
import { useLiveQuery } from 'dexie-react-hooks';

function getCoverageBadge(percent: number, t: (key: string) => string) {
  if (percent < 90) return <Badge color="red" size="sm">{t('results.undersupplied')}</Badge>;
  if (percent <= 110) return <Badge color="green" size="sm">{t('results.adequate')}</Badge>;
  return <Badge color="yellow" size="sm">{t('results.oversupplied')}</Badge>;
}

export function ResultsPage() {
  const { t } = useTranslation();
  const { projectId } = useParams();
  const numProjectId = projectId ? Number(projectId) : undefined;
  const project = useProject(numProjectId);
  const rooms = useRooms(numProjectId);
  const radiators = useRadiators(numProjectId);
  const settings = useSystemSettings(numProjectId);

  // Get all circuit radiators for this project
  const circuitRadiators = useLiveQuery(async () => {
    if (!numProjectId) return [];
    const projectCircuits = await db.circuits.where('projectId').equals(numProjectId).toArray();
    const allCr = [];
    for (const circuit of projectCircuits) {
      if (circuit.id) {
        const crs = await db.circuitRadiators.where('circuitId').equals(circuit.id).toArray();
        allCr.push(...crs);
      }
    }
    return allCr;
  }, [numProjectId]) ?? [];

  const result: SystemResult | null = useMemo(() => {
    if (!project || !settings || rooms.length === 0) return null;
    return calculateHydraulicBalance(
      rooms,
      radiators,
      circuitRadiators,
      settings,
      project.designOutdoorTemp,
    );
  }, [project, rooms, radiators, circuitRadiators, settings]);

  if (!project || !settings) {
    return (
      <>
        <PageHeader title={t('results.title')} />
        <Text>{t('common.loading')}</Text>
      </>
    );
  }

  if (!result || rooms.length === 0) {
    return (
      <>
        <PageHeader title={t('results.title')} />
        <EmptyState
          title={t('results.noResults')}
          description={t('results.noResultsHint')}
        />
      </>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <PageHeader
        title={t('results.title')}
        rightSection={
          <Button
            variant="light"
            leftSection={<IconPrinter size={16} />}
            onClick={handlePrint}
          >
            {t('results.printView')}
          </Button>
        }
      />

      <Tabs defaultValue="heating-load">
        <Tabs.List mb="md">
          <Tabs.Tab value="heating-load">{t('results.heatingLoad')}</Tabs.Tab>
          <Tabs.Tab value="valves">{t('results.valveSettings')}</Tabs.Tab>
          <Tabs.Tab value="system">{t('results.systemOverview')}</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="heating-load">
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{t('results.room')}</Table.Th>
                <Table.Th ta="right">{t('results.transmission')}</Table.Th>
                <Table.Th ta="right">{t('results.ventilation')}</Table.Th>
                <Table.Th ta="right">{t('results.total')}</Table.Th>
                <Table.Th><Group gap={4}>Status<HelpIcon detail={t('help.coverageStatus')} title="Status" /></Group></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {result.rooms.map((room) => (
                <Table.Tr key={room.roomId}>
                  <Table.Td>{room.roomName}</Table.Td>
                  <Table.Td ta="right">{room.heatingLoad.transmissionLoss} W</Table.Td>
                  <Table.Td ta="right">{room.heatingLoad.ventilationLoss} W</Table.Td>
                  <Table.Td ta="right" fw={600}>{room.heatingLoad.totalHeatingLoad} W</Table.Td>
                  <Table.Td>{getCoverageBadge(room.coveragePercent, t)}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
            <Table.Tfoot>
              <Table.Tr>
                <Table.Td fw={700}>{t('results.total')}</Table.Td>
                <Table.Td ta="right" fw={700}>
                  {result.rooms.reduce((s, r) => s + r.heatingLoad.transmissionLoss, 0)} W
                </Table.Td>
                <Table.Td ta="right" fw={700}>
                  {result.rooms.reduce((s, r) => s + r.heatingLoad.ventilationLoss, 0)} W
                </Table.Td>
                <Table.Td ta="right" fw={700}>{result.totalHeatingLoad} W</Table.Td>
                <Table.Td />
              </Table.Tr>
            </Table.Tfoot>
          </Table>
        </Tabs.Panel>

        <Tabs.Panel value="valves">
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{t('results.room')}</Table.Th>
                <Table.Th>{t('results.radiator')}</Table.Th>
                <Table.Th>{t('system.valveType')}</Table.Th>
                <Table.Th ta="right"><Group gap={4} justify="flex-end">{t('results.flowRate')}<HelpIcon tooltip={t('help.flowRate')} /></Group></Table.Th>
                <Table.Th ta="right">{t('results.pressureLoss')}</Table.Th>
                <Table.Th ta="right"><Group gap={4} justify="flex-end">{t('results.kvValue')}<HelpIcon tooltip={t('help.kvValue')} /></Group></Table.Th>
                <Table.Th ta="center"><Group gap={4} justify="center">{t('results.valvePreset')}<HelpIcon detail={t('help.valvePreset')} title={t('results.valvePreset')} /></Group></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {result.rooms.flatMap((room) =>
                room.radiators.map((rad) => (
                  <Table.Tr key={rad.radiatorId}>
                    <Table.Td>{rad.roomName}</Table.Td>
                    <Table.Td>Typ {rad.radiatorType}</Table.Td>
                    <Table.Td><Text size="xs">{rad.effectiveValveType} DN{rad.effectiveValveDn}</Text></Table.Td>
                    <Table.Td ta="right">{rad.flowRate} L/h</Table.Td>
                    <Table.Td ta="right">{rad.pressureLoss} Pa</Table.Td>
                    <Table.Td ta="right">{rad.kvValue}</Table.Td>
                    <Table.Td ta="center">
                      <Badge size="lg" variant="filled">
                        {rad.valvePreset ?? '—'}
                      </Badge>
                    </Table.Td>
                  </Table.Tr>
                )),
              )}
            </Table.Tbody>
          </Table>
        </Tabs.Panel>

        <Tabs.Panel value="system">
          <Stack gap="md">
            <Card shadow="xs" padding="md" radius="md" withBorder>
              <Stack gap="xs">
                <Group justify="space-between">
                  <Text c="dimmed">{t('results.totalHeatingLoad')}</Text>
                  <Text fw={700} size="lg">{result.totalHeatingLoad} W</Text>
                </Group>
                <Group justify="space-between">
                  <Text c="dimmed">{t('results.totalFlowRate')}</Text>
                  <Text fw={700} size="lg">{result.totalFlowRate} L/h</Text>
                </Group>
                <Divider />
                <Group justify="space-between">
                  <Text c="dimmed">{t('system.supplyTemp')}</Text>
                  <Text>{settings.supplyTemp} °C</Text>
                </Group>
                <Group justify="space-between">
                  <Text c="dimmed">{t('system.returnTemp')}</Text>
                  <Text>{settings.returnTemp} °C</Text>
                </Group>
              </Stack>
            </Card>

            {result.criticalRadiator && (
              <Card shadow="xs" padding="md" radius="md" withBorder>
                <Group gap={4} mb="xs"><Text fw={500}>{t('results.criticalRadiator')}</Text><HelpIcon detail={t('help.criticalRadiator')} title={t('results.criticalRadiator')} /></Group>
                <Text size="sm">
                  {result.criticalRadiator.roomName} — Typ {result.criticalRadiator.radiatorType}
                </Text>
                <Text size="sm" c="dimmed">
                  {result.criticalRadiator.pressureLoss} Pa &middot;{' '}
                  {result.criticalRadiator.flowRate} L/h &middot;{' '}
                  Kv {result.criticalRadiator.kvValue}
                </Text>
              </Card>
            )}
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </>
  );
}
