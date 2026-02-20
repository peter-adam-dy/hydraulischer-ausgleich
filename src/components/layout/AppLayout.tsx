import { AppShell } from '@mantine/core';
import { Outlet, useParams } from 'react-router';
import { BottomNavigation } from './BottomNavigation.tsx';

export function AppLayout() {
  const { projectId } = useParams();

  return (
    <AppShell
      padding="md"
      footer={projectId ? { height: 'calc(60px + env(safe-area-inset-bottom, 0px))' } : undefined}
      styles={{
        main: {
          paddingLeft: 'calc(var(--mantine-spacing-md) + env(safe-area-inset-left, 0px))',
          paddingRight: 'calc(var(--mantine-spacing-md) + env(safe-area-inset-right, 0px))',
          paddingTop: 'calc(var(--mantine-spacing-md) + env(safe-area-inset-top, 0px))',
        },
        footer: {
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        },
      }}
    >
      {projectId && (
        <AppShell.Footer>
          <BottomNavigation projectId={projectId} />
        </AppShell.Footer>
      )}

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
