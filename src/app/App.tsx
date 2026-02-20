import '@mantine/core/styles.css';
import './safearea.css';
import { MantineProvider } from '@mantine/core';
import { RouterProvider } from 'react-router';
import { theme } from './theme.ts';
import { router } from './Router.tsx';
import { OfflineIndicator } from '../components/common/OfflineIndicator.tsx';
import { UpdateDialog } from '../components/common/UpdateDialog.tsx';
import { useUpdateCheck } from '../utils/useUpdateCheck.ts';
import { UpdateCheckContext } from '../utils/UpdateCheckContext.ts';
import '../i18n/config.ts';

export function App() {
  const updateCheck = useUpdateCheck();

  return (
    <MantineProvider theme={theme}>
      <UpdateCheckContext.Provider value={updateCheck}>
        <OfflineIndicator />
        <UpdateDialog opened={updateCheck.updateAvailable} onDismiss={updateCheck.dismiss} />
        <RouterProvider router={router} />
      </UpdateCheckContext.Provider>
    </MantineProvider>
  );
}
