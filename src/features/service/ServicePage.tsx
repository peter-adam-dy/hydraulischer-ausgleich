import { Button, Card, Group, Stack, Text, SegmentedControl, FileButton, Divider, Badge } from '@mantine/core';
import { IconDownload, IconUpload, IconRefresh, IconSearch } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useRef, useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader.tsx';
import { exportAllData, downloadJson, importData } from '../../utils/exportImport.ts';
import { useUpdateCheckContext } from '../../utils/UpdateCheckContext.ts';

async function forceUpdate() {
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((r) => r.unregister()));
  }
  if ('caches' in window) {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));
  }
  window.location.reload();
}

export function ServicePage() {
  const { t, i18n } = useTranslation();
  const resetRef = useRef<() => void>(null);
  const [forceUpdating, setForceUpdating] = useState(false);
  const { updateAvailable, checking, lastChecked, checkForUpdate } = useUpdateCheckContext();

  const handleExport = async () => {
    const data = await exportAllData();
    downloadJson(data);
  };

  const handleImport = async (file: File | null) => {
    if (!file) return;
    try {
      await importData(file);
    } catch {
      alert(t('common.error'));
    }
    resetRef.current?.();
  };

  const handleForceUpdate = async () => {
    setForceUpdating(true);
    await forceUpdate();
  };

  return (
    <>
      <PageHeader title={t('common.settings')} backTo="/" />

      <Stack gap="md">
        <Card shadow="xs" padding="md" radius="md" withBorder>
          <Text fw={500} mb="sm">{t('common.language')}</Text>
          <SegmentedControl
            fullWidth
            value={i18n.language}
            onChange={(lang) => i18n.changeLanguage(lang)}
            data={[
              { label: 'Deutsch', value: 'de' },
              { label: 'English', value: 'en' },
            ]}
          />
        </Card>

        <Card shadow="xs" padding="md" radius="md" withBorder>
          <Text fw={500} mb="sm">{t('common.dataManagement')}</Text>
          <Text size="sm" c="dimmed" mb="md">{t('common.dataManagementHint')}</Text>
          <Group>
            <Button
              variant="light"
              leftSection={<IconDownload size={16} />}
              onClick={handleExport}
            >
              {t('common.exportData')}
            </Button>
            <FileButton onChange={handleImport} accept="application/json" resetRef={resetRef}>
              {(props) => (
                <Button
                  variant="light"
                  leftSection={<IconUpload size={16} />}
                  {...props}
                >
                  {t('common.importData')}
                </Button>
              )}
            </FileButton>
          </Group>
        </Card>

        <Card shadow="xs" padding="md" radius="md" withBorder>
          <Text fw={500} mb="sm">{t('common.appUpdate')}</Text>

          <Group gap="xs" mb="md">
            <Button
              variant="light"
              size="compact-sm"
              leftSection={<IconSearch size={14} />}
              onClick={checkForUpdate}
              loading={checking}
            >
              {t('common.checkForUpdates')}
            </Button>
            {lastChecked && (
              <Text size="xs" c="dimmed">
                {t('common.lastChecked')}: {lastChecked.toLocaleTimeString()}
              </Text>
            )}
          </Group>

          {updateAvailable ? (
            <Button
              leftSection={<IconRefresh size={16} />}
              onClick={handleForceUpdate}
              loading={forceUpdating}
            >
              {t('common.appUpdateButton')}
            </Button>
          ) : (
            <Group gap="xs">
              <Badge color="green" variant="light">{t('common.appUpToDate')}</Badge>
              <Button
                variant="subtle"
                size="compact-xs"
                color="gray"
                leftSection={<IconRefresh size={12} />}
                onClick={handleForceUpdate}
                loading={forceUpdating}
              >
                {t('common.forceUpdate')}
              </Button>
            </Group>
          )}
        </Card>

        <Divider />

        <Stack gap={4} align="center">
          <Text size="xs" c="dimmed">Hydraulischer Abgleich</Text>
          <Text size="xs" c="dimmed" ff="monospace">{__GIT_HASH__} &middot; {new Date(__GIT_DATE__).toLocaleString('de-DE')}</Text>
        </Stack>
      </Stack>
    </>
  );
}
