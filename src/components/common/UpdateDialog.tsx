import { Modal, Text, Group, Button } from '@mantine/core';
import { IconRefresh } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

interface UpdateDialogProps {
  opened: boolean;
  onDismiss: () => void;
}

async function applyUpdate() {
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

export function UpdateDialog({ opened, onDismiss }: UpdateDialogProps) {
  const { t } = useTranslation();

  return (
    <Modal
      opened={opened}
      onClose={onDismiss}
      title={t('common.updateAvailableTitle')}
      centered
      size="sm"
    >
      <Text size="sm" mb="lg">{t('common.updateAvailableMessage')}</Text>
      <Group justify="flex-end">
        <Button variant="default" onClick={onDismiss}>
          {t('common.later')}
        </Button>
        <Button leftSection={<IconRefresh size={16} />} onClick={applyUpdate}>
          {t('common.appUpdateButton')}
        </Button>
      </Group>
    </Modal>
  );
}
