import { Button, Card, Group, Text, Stack, ActionIcon, Menu } from '@mantine/core';
import { IconPlus, IconDots, IconTrash, IconEdit, IconSettings } from '@tabler/icons-react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useProjects, deleteProject } from '../../db/hooks.ts';
import { PageHeader } from '../../components/common/PageHeader.tsx';
import { EmptyState } from '../../components/common/EmptyState.tsx';
import { ConfirmDialog } from '../../components/common/ConfirmDialog.tsx';

export function ProjectListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const projects = useProjects();
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);

  return (
    <>
      <PageHeader
        title={t('projects.title')}
        rightSection={
          <Group gap="xs">
            <ActionIcon variant="subtle" color="gray" onClick={() => navigate('/settings')}>
              <IconSettings size={20} />
            </ActionIcon>
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => navigate('/project/new')}
            >
              {t('projects.create')}
            </Button>
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
          {projects.map((project) => (
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
                <div>
                  <Text fw={500}>{project.name}</Text>
                  <Text size="sm" c="dimmed">
                    {t(`building.types.${project.buildingType}`)} &middot;{' '}
                    {t(`building.ageClasses.${project.buildingAgeClass}`)}
                  </Text>
                </div>
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
          ))}
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
