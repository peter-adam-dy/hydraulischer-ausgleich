import { Modal, Text, Group, Button } from '@mantine/core';
import { useTranslation } from 'react-i18next';

interface ConfirmDialogProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
}

export function ConfirmDialog({
  opened,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  danger = false,
}: ConfirmDialogProps) {
  const { t } = useTranslation();

  return (
    <Modal opened={opened} onClose={onClose} title={title} centered size="sm">
      <Text size="sm" mb="lg">{message}</Text>
      <Group justify="flex-end">
        <Button variant="default" onClick={onClose}>
          {t('common.cancel')}
        </Button>
        <Button
          color={danger ? 'red' : 'blue'}
          onClick={() => { onConfirm(); onClose(); }}
        >
          {confirmLabel ?? t('common.confirm')}
        </Button>
      </Group>
    </Modal>
  );
}
