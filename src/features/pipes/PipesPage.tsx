import {
  Button,
  Card,
  Group,
  Text,
  Stack,
  TextInput,
  NumberInput,
  Select,
  ActionIcon,
  Divider,
  Switch,
} from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import {
  useCircuits,
  useCircuitRadiators,
  useRadiators,
  useRooms,
  createCircuit,
  updateCircuit,
  deleteCircuit,
  addRadiatorToCircuit,
  updateCircuitRadiator,
  removeRadiatorFromCircuit,
} from '../../db/hooks.ts';
import { PageHeader } from '../../components/common/PageHeader.tsx';
import { HelpIcon } from '../../components/common/HelpIcon.tsx';
import { EmptyState } from '../../components/common/EmptyState.tsx';
import { ConfirmDialog } from '../../components/common/ConfirmDialog.tsx';

function CircuitCard({ circuitId, projectId }: { circuitId: number; projectId: number }) {
  const { t } = useTranslation();
  const circuitRadiators = useCircuitRadiators(circuitId);
  const allRadiators = useRadiators(projectId);
  const rooms = useRooms(projectId);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const getRadiatorLabel = (radiatorId: number) => {
    const rad = allRadiators.find((r) => r.id === radiatorId);
    if (!rad) return '—';
    const room = rooms.find((r) => r.id === rad.roomId);
    return `${room?.name ?? '?'} - Typ ${rad.type} (${rad.ratedOutputDeltaT50} W)`;
  };

  const availableRadiators = allRadiators.filter(
    (r) => !circuitRadiators.some((cr) => cr.radiatorId === r.id),
  );

  const handleAddRadiator = async (radiatorId: string | null) => {
    if (radiatorId) {
      await addRadiatorToCircuit({
        circuitId,
        radiatorId: Number(radiatorId),
        estimatedPipeLength: 10,
        sortOrder: circuitRadiators.length,
      });
    }
  };

  return (
    <>
      <Stack gap="xs">
        {circuitRadiators.map((cr) => {
          const hasSeparateReturn = cr.pipeLengthReturn !== undefined;
          const totalLength = cr.estimatedPipeLength + (cr.pipeLengthReturn ?? cr.estimatedPipeLength);
          return (
            <Card key={cr.id} padding="xs" radius="sm" withBorder bg="gray.0">
              <Group justify="space-between" mb={4}>
                <Text size="xs" fw={500} lineClamp={1} style={{ flex: 1 }}>
                  {getRadiatorLabel(cr.radiatorId)}
                </Text>
                <ActionIcon
                  variant="subtle"
                  color="red"
                  size="sm"
                  onClick={() => setDeleteTarget(cr.id!)}
                >
                  <IconTrash size={14} />
                </ActionIcon>
              </Group>
              <Group gap="xs" wrap="nowrap" mb={4}>
                <NumberInput
                  size="xs"
                  label={hasSeparateReturn ? t('pipes.supplyLength') : t('pipes.distanceToBoiler')}
                  suffix=" m"
                  min={1}
                  step={1}
                  style={{ flex: 1 }}
                  value={cr.estimatedPipeLength}
                  onChange={(val) => {
                    if (typeof val === 'number' && cr.id) {
                      updateCircuitRadiator(cr.id, { estimatedPipeLength: val });
                    }
                  }}
                />
                {hasSeparateReturn && (
                  <NumberInput
                    size="xs"
                    label={t('pipes.returnLength')}
                    suffix=" m"
                    min={1}
                    step={1}
                    style={{ flex: 1 }}
                    value={cr.pipeLengthReturn}
                    onChange={(val) => {
                      if (typeof val === 'number' && cr.id) {
                        updateCircuitRadiator(cr.id, { pipeLengthReturn: val });
                      }
                    }}
                  />
                )}
              </Group>
              <Group justify="space-between">
                <Switch
                  size="xs"
                  label={t('pipes.separateReturn')}
                  checked={hasSeparateReturn}
                  onChange={(e) => {
                    if (cr.id) {
                      if (e.currentTarget.checked) {
                        updateCircuitRadiator(cr.id, { pipeLengthReturn: cr.estimatedPipeLength });
                      } else {
                        updateCircuitRadiator(cr.id, { pipeLengthReturn: undefined as unknown as number });
                      }
                    }
                  }}
                />
                <Text size="xs" c="dimmed">{t('pipes.totalLength')}: {totalLength}&nbsp;m</Text>
              </Group>
            </Card>
          );
        })}

        {availableRadiators.length > 0 && (
          <Select
            size="xs"
            placeholder={t('pipes.assignRadiator')}
            data={availableRadiators.map((r) => ({
              value: String(r.id),
              label: getRadiatorLabel(r.id!),
            }))}
            value={null}
            onChange={handleAddRadiator}
            allowDeselect
          />
        )}
      </Stack>

      <ConfirmDialog
        opened={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget !== null) removeRadiatorFromCircuit(deleteTarget);
        }}
        title={t('radiators.delete')}
        message={t('radiators.deleteConfirm')}
        confirmLabel={t('common.delete')}
        danger
      />
    </>
  );
}

export function PipesPage() {
  const { t } = useTranslation();
  const { projectId } = useParams();
  const numProjectId = projectId ? Number(projectId) : undefined;
  const circuits = useCircuits(numProjectId);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const handleCreateCircuit = async () => {
    if (!numProjectId) return;
    const name = `${t('pipes.circuitDefaultName')} ${circuits.length + 1}`;
    await createCircuit({ projectId: numProjectId, name });
  };

  return (
    <>
      <PageHeader title={t('pipes.title')} backTo={`/project/${projectId}`} rightSection={<HelpIcon detail={t('help.circuit')} title={t('pipes.circuits')} />} />

      <Stack gap="md">
        {circuits.length === 0 ? (
          <EmptyState
            title={t('pipes.empty')}
            description={t('pipes.emptyHint')}
          />
        ) : (
          circuits.map((circuit) => (
            <Card key={circuit.id} shadow="xs" padding="md" radius="md" withBorder>
              <Group justify="space-between" mb="sm">
                <TextInput
                  size="xs"
                  variant="unstyled"
                  styles={{ input: { fontWeight: 500, fontSize: 'var(--mantine-font-size-sm)' } }}
                  value={circuit.name}
                  onChange={(e) => {
                    if (circuit.id) {
                      updateCircuit(circuit.id, { name: e.currentTarget.value });
                    }
                  }}
                />
                <ActionIcon
                  variant="subtle"
                  color="red"
                  onClick={() => setDeleteTarget(circuit.id!)}
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </Group>
              <Divider mb="sm" />
              <CircuitCard circuitId={circuit.id!} projectId={Number(projectId)} />
            </Card>
          ))
        )}

        <Button
          variant="light"
          leftSection={<IconPlus size={16} />}
          onClick={handleCreateCircuit}
          fullWidth
        >
          {t('pipes.createCircuit')}
        </Button>
      </Stack>

      <ConfirmDialog
        opened={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget !== null) deleteCircuit(deleteTarget);
        }}
        title={t('pipes.deleteCircuit')}
        message={t('pipes.deleteCircuit') + '?'}
        confirmLabel={t('common.delete')}
        danger
      />
    </>
  );
}
