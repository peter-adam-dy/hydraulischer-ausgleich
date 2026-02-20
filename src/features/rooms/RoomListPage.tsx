import { Button, Card, Group, Text, Stack, Badge } from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useRooms, deleteRoom } from '../../db/hooks.ts';
import { PageHeader } from '../../components/common/PageHeader.tsx';
import { EmptyState } from '../../components/common/EmptyState.tsx';
import { ConfirmDialog } from '../../components/common/ConfirmDialog.tsx';

export function RoomListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { projectId } = useParams();
  const rooms = useRooms(projectId ? Number(projectId) : undefined);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);

  return (
    <>
      <PageHeader
        title={t('rooms.title')}
        rightSection={
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => navigate(`/project/${projectId}/rooms/new`)}
          >
            {t('rooms.create')}
          </Button>
        }
      />

      {rooms.length === 0 ? (
        <EmptyState
          title={t('rooms.empty')}
          description={t('rooms.emptyHint')}
          action={
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => navigate(`/project/${projectId}/rooms/new`)}
            >
              {t('rooms.create')}
            </Button>
          }
        />
      ) : (
        <Stack gap="sm">
          {rooms.map((room) => (
            <Card
              key={room.id}
              shadow="xs"
              padding="md"
              radius="md"
              withBorder
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/project/${projectId}/rooms/${room.id}`)}
            >
              <Group justify="space-between" wrap="nowrap">
                <div>
                  <Text fw={500}>{room.name}</Text>
                  <Group gap="xs" mt={4}>
                    <Badge size="sm" variant="light">
                      {t(`rooms.usageTypes.${room.usageType}`)}
                    </Badge>
                    <Text size="xs" c="dimmed">
                      {(room.length * room.width).toFixed(1)} m² &middot; {room.desiredTemp} °C
                    </Text>
                  </Group>
                </div>
                <Button
                  variant="subtle"
                  color="red"
                  size="compact-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTarget({ id: room.id!, name: room.name });
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
          if (deleteTarget) deleteRoom(deleteTarget.id);
        }}
        title={t('rooms.delete')}
        message={t('rooms.deleteConfirm', { name: deleteTarget?.name })}
        confirmLabel={t('common.delete')}
        danger
      />
    </>
  );
}
