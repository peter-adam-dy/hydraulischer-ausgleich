import { Badge } from '@mantine/core';
import { IconWifiOff } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';

export function OfflineIndicator() {
  const { t } = useTranslation();
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (online) return null;

  return (
    <Badge
      color="orange"
      variant="filled"
      leftSection={<IconWifiOff size={12} />}
      style={{ position: 'fixed', top: 8, right: 8, zIndex: 1000 }}
    >
      {t('common.offline')}
    </Badge>
  );
}
