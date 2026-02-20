import { ActionIcon, Badge, Modal, Stack, Text, Tooltip } from '@mantine/core';
import { IconQuestionMark } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useState, type ReactNode } from 'react';

interface HelpIconProps {
  /** Short tooltip text shown on hover (max ~80 chars for readability) */
  tooltip?: string;
  /** Longer explanation shown in a modal dialog */
  detail?: ReactNode;
  /** Modal title when using detail */
  title?: string;
}

export function HelpIcon({ tooltip, detail, title }: HelpIconProps) {
  const [opened, setOpened] = useState(false);
  const { t } = useTranslation();

  // If we only have a short tooltip, use Mantine Tooltip
  if (tooltip && !detail) {
    return (
      <Tooltip
        label={tooltip}
        multiline
        w={260}
        withArrow
        position="top"
        events={{ hover: true, focus: true, touch: true }}
      >
        <ActionIcon
          variant="subtle"
          color="gray"
          size="xs"
          radius="xl"
          aria-label={tooltip}
        >
          <IconQuestionMark size={14} />
        </ActionIcon>
      </Tooltip>
    );
  }

  // If we have detail content, open a modal on click
  if (detail) {
    const tooltipContent = (
      <Stack gap={4} align="center">
        <Text size="xs">{tooltip ?? title ?? 'Hilfe'}</Text>
        <Badge size="xs" variant="light" color="blue">
          {t('help.clickForMore')}
        </Badge>
      </Stack>
    );

    return (
      <>
        <Tooltip
          label={tooltipContent}
          multiline
          w={200}
          withArrow
          events={{ hover: true, focus: true, touch: true }}
        >
          <ActionIcon
            variant="subtle"
            color="blue"
            size="xs"
            radius="xl"
            onClick={() => setOpened(true)}
            aria-label={tooltip ?? title ?? 'Hilfe'}
          >
            <IconQuestionMark size={14} />
          </ActionIcon>
        </Tooltip>
        <Modal
          opened={opened}
          onClose={() => setOpened(false)}
          title={title ?? 'Hilfe'}
          centered
          size="md"
        >
          {typeof detail === 'string' ? (
            <Text size="sm" style={{ whiteSpace: 'pre-line' }}>
              {detail}
            </Text>
          ) : (
            detail
          )}
        </Modal>
      </>
    );
  }

  return null;
}
