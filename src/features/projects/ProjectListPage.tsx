import { Button, Card, Group, Text, Stack, ActionIcon, Menu, Badge, ThemeIcon } from '@mantine/core';
import { IconPlus, IconDots, IconTrash, IconEdit, IconSettings, IconBuilding, IconDoor, IconFlame } from '@tabler/icons-react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useProjects, deleteProject } from '../../db/hooks.ts';
import { db } from '../../db/index.ts';
import { PageHeader } from '../../components/common/PageHeader.tsx';
import { EmptyState } from '../../components/common/EmptyState.tsx';
import { ConfirmDialog } from '../../components/common/ConfirmDialog.tsx';

function useProjectCounts() {
  return useLiveQuery(async () => {
    const rooms = await db.rooms.toArray();
    const radiators = await db.radiators.toArray();
    const roomCounts = new Map<number, number>();
    const radiatorCounts = new Map<number, number>();
    for (const r of rooms) {
      roomCounts.set(r.projectId, (roomCounts.get(r.projectId) ?? 0) + 1);
    }
    for (const r of radiators) {
      radiatorCounts.set(r.projectId, (radiatorCounts.get(r.projectId) ?? 0) + 1);
    }
    return { roomCounts, radiatorCounts };
  }) ?? { roomCounts: new Map(), radiatorCounts: new Map() };
}

export function ProjectListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const projects = useProjects();
  const { roomCounts, radiatorCounts } = useProjectCounts();
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);

  return (
    <>
      <PageHeader
        title={t('app.title')}
        rightSection={
          <Group gap="xs">
            <ActionIcon variant="subtle" color="gray" onClick={() => navigate('/settings')}>
              <IconSettings size={20} />
            </ActionIcon>
            <ActionIcon variant="filled" color="blue" onClick={() => navigate('/project/new')}>
              <IconPlus size={18} />
            </ActionIcon>
          </Group>
        }
      />

      {projects.length === 0 ? (
        <EmptyState
          title={t('projects.empty')}
          description={t('projects.emptyHint')}
          action={
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => navigate('/project/new')}
            >
              {t('projects.create')}
            </Button>
          }
        />
      ) : (
        <Stack gap="sm">
          {projects.map((project) => {
            const rooms = roomCounts.get(project.id!) ?? 0;
            const rads = radiatorCounts.get(project.id!) ?? 0;
            return (
              <Card
                key={project.id}
                shadow="xs"
                padding="md"
                radius="md"
                withBorder
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/project/${project.id}`)}
              >
                <Group justify="space-between" wrap="nowrap">
                  <Group gap="sm" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                    <ThemeIcon size="lg" variant="light" color="blue">
                      <IconBuilding size={20} />
                    </ThemeIcon>
                    <div style={{ minWidth: 0 }}>
                      <Text fw={500} lineClamp={1}>{project.name}</Text>
                      <Text size="xs" c="dimmed" lineClamp={1}>
                        {t(`building.types.${project.buildingType}`)} &middot; {t(`building.ageClasses.${project.buildingAgeClass}`)}
                      </Text>
                      <Group gap={8} mt={4}>
                        <Badge size="xs" variant="light" color="blue" leftSection={<IconDoor size={10} />}>
                          {rooms}
                        </Badge>
                        <Badge size="xs" variant="light" color="orange" leftSection={<IconFlame size={10} />}>
                          {rads}
                        </Badge>
                      </Group>
                    </div>
                  </Group>
                  <Menu position="bottom-end" withinPortal>
                    <Menu.Target>
                      <ActionIcon
                        variant="subtle"
                        color="gray"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <IconDots size={16} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item
                        leftSection={<IconEdit size={14} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/project/${project.id}/edit`);
                        }}
                      >
                        {t('common.edit')}
                      </Menu.Item>
                      <Menu.Item
                        leftSection={<IconTrash size={14} />}
                        color="red"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget({ id: project.id!, name: project.name });
                        }}
                      >
                        {t('common.delete')}
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Group>
              </Card>
            );
          })}

          <Button
            variant="light"
            leftSection={<IconPlus size={16} />}
            onClick={() => navigate('/project/new')}
            fullWidth
          >
            {t('projects.create')}
          </Button>
        </Stack>
      )}

      <ConfirmDialog
        opened={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteProject(deleteTarget.id);
        }}
        title={t('projects.delete')}
        message={t('projects.deleteConfirm', { name: deleteTarget?.name })}
        confirmLabel={t('common.delete')}
        danger
      />
    </>
  );
}
