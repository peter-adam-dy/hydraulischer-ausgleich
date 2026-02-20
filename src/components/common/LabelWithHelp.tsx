import { Group } from '@mantine/core';
import { HelpIcon } from './HelpIcon.tsx';
import type { ReactNode } from 'react';

interface LabelWithHelpProps {
  label: string;
  required?: boolean;
  /** Short tooltip on hover */
  tooltip?: string;
  /** Longer explanation in a modal */
  detail?: ReactNode;
  /** Modal title */
  helpTitle?: string;
}

export function LabelWithHelp({ label, required, tooltip, detail, helpTitle }: LabelWithHelpProps) {
  return (
    <Group gap={4} display="inline-flex" align="center">
      {label}
      {required && (
        <span style={{ color: 'var(--mantine-color-error)' }} aria-hidden="true"> *</span>
      )}
      <HelpIcon tooltip={tooltip} detail={detail} title={helpTitle} />
    </Group>
  );
}
