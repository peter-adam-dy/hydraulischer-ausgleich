import { AppShell } from '@mantine/core';
import { Outlet, useParams } from 'react-router';
import { BottomNavigation } from './BottomNavigation.tsx';

export function AppLayout() {
  const { projectId } = useParams();

  return (
    <AppShell
      padding="md"
      footer={projectId ? { height: 60 } : undefined}
      styles={{
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
