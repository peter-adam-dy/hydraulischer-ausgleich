import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { RouterProvider } from 'react-router';
import { theme } from './theme.ts';
import { router } from './Router.tsx';
import { OfflineIndicator } from '../components/common/OfflineIndicator.tsx';
import { UpdateDialog } from '../components/common/UpdateDialog.tsx';
import { useUpdateCheck } from '../utils/useUpdateCheck.ts';
import '../i18n/config.ts';

export function App() {
  const { updateAvailable, dismiss } = useUpdateCheck();

  return (
    <MantineProvider theme={theme}>
      <OfflineIndicator />
      <UpdateDialog opened={updateAvailable} onDismiss={dismiss} />
      <RouterProvider router={router} />
    </MantineProvider>
  );
}
