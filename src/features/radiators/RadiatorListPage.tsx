import { Button, Card, Group, Text, Stack, Badge } from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useRadiators, useRooms, deleteRadiator } from '../../db/hooks.ts';
import { PageHeader } from '../../components/common/PageHeader.tsx';
import { EmptyState } from '../../components/common/EmptyState.tsx';
import { ConfirmDialog } from '../../components/common/ConfirmDialog.tsx';

export function RadiatorListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { projectId } = useParams();
  const numProjectId = projectId ? Number(projectId) : undefined;
  const radiators = useRadiators(numProjectId);
  const rooms = useRooms(numProjectId);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const getRoomName = (roomId: number) => {
    const room = rooms.find((r) => r.id === roomId);
    return room?.name ?? '—';
  };

  return (
    <>
      <PageHeader
        title={t('radiators.title')}
        rightSection={
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => navigate(`/project/${projectId}/radiators/new`)}
          >
            {t('radiators.create')}
          </Button>
        }
      />

      {radiators.length === 0 ? (
        <EmptyState
          title={t('radiators.empty')}
          description={t('radiators.emptyHint')}
          action={
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => navigate(`/project/${projectId}/radiators/new`)}
            >
              {t('radiators.create')}
            </Button>
          }
        />
      ) : (
        <Stack gap="sm">
          {radiators.map((rad) => (
            <Card
              key={rad.id}
              shadow="xs"
              padding="md"
              radius="md"
              withBorder
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/project/${projectId}/radiators/${rad.id}`)}
            >
              <Group justify="space-between" wrap="nowrap">
                <div>
                  <Group gap="xs">
                    <Badge size="sm" variant="light">
                      {t(`radiators.types.${rad.type}`)}
                    </Badge>
                    <Text size="sm">{rad.height}×{rad.length} mm</Text>
                  </Group>
                  <Text size="xs" c="dimmed" mt={4}>
                    {getRoomName(rad.roomId)} &middot; {rad.ratedOutputDeltaT50} W (ΔT50)
                    {rad.valveType && (
                      <> &middot; <Badge size="xs" variant="outline" color="blue" ml={4}>{rad.valveType} DN{rad.valveDn ?? 15}</Badge></>
                    )}
                  </Text>
                </div>
                <Button
                  variant="subtle"
                  color="red"
                  size="compact-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTarget(rad.id!);
                  }}
                >
                  <IconTrash size={14} />
                </Button>
              </Group>
            </Card>
          ))}
        </Stack>
      )}

      <ConfirmDialog
        opened={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget !== null) deleteRadiator(deleteTarget);
        }}
        title={t('radiators.delete')}
        message={t('radiators.deleteConfirm')}
        confirmLabel={t('common.delete')}
        danger
      />
    </>
  );
}
