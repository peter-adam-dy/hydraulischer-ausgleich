import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { RouterProvider } from 'react-router';
import { theme } from './theme.ts';
import { router } from './Router.tsx';
import { OfflineIndicator } from '../components/common/OfflineIndicator.tsx';
import '../i18n/config.ts';

export function App() {
  return (
    <MantineProvider theme={theme}>
      <OfflineIndicator />
      <RouterProvider router={router} />
    </MantineProvider>
  );
}
