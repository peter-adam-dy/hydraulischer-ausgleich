import { Button, Card, Group, Stack, Text, SegmentedControl, FileButton, Divider } from '@mantine/core';
import { IconDownload, IconUpload, IconRefresh } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useRef, useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader.tsx';
import { exportAllData, downloadJson, importData } from '../../utils/exportImport.ts';

async function updateApp() {
  // Unregister all service workers
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((r) => r.unregister()));
  }
  // Clear all caches
  if ('caches' in window) {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));
  }
  // Reload from server
  window.location.reload();
}

export function ServicePage() {
  const { t, i18n } = useTranslation();
  const resetRef = useRef<() => void>(null);
  const [updating, setUpdating] = useState(false);

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

  const handleUpdate = async () => {
    setUpdating(true);
    await updateApp();
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
          <Text size="sm" c="dimmed" mb="md">{t('common.appUpdateHint')}</Text>
          <Button
            variant="light"
            leftSection={<IconRefresh size={16} />}
            onClick={handleUpdate}
            loading={updating}
          >
            {t('common.appUpdateButton')}
          </Button>
        </Card>

        <Divider />

        <Text size="xs" c="dimmed" ta="center">
          Hydraulischer Abgleich &middot; {__GIT_HASH__} &middot; {new Date(__GIT_DATE__).toLocaleDateString('de-DE')}
        </Text>
      </Stack>
    </>
  );
}
