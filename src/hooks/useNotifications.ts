import { useState, useEffect, useCallback } from 'react';

type NotificationPermission = 'granted' | 'denied' | 'default';

interface UseNotificationsReturn {
  permission: NotificationPermission;
  isAllowed: boolean;
  requestPermission: () => Promise<boolean>;
  toggleNotifications: () => Promise<void>;
}

export const useNotifications = (): UseNotificationsReturn => {
  const [permission, setPermission] = useState<NotificationPermission>(() => {
    if ('Notification' in window) {
      return Notification.permission;
    }
    return 'denied';
  });

  const isAllowed = permission === 'granted';

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, []);

  const toggleNotifications = useCallback(async () => {
    if (isAllowed) {
      // Can't revoke programmatically, just update local state
      // User needs to disable in browser settings
      console.info('To disable notifications, please use your browser settings');
    } else {
      await requestPermission();
    }
  }, [isAllowed, requestPermission]);

  return {
    permission,
    isAllowed,
    requestPermission,
    toggleNotifications,
  };
};

export const sendNotification = (title: string, options?: NotificationOptions) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    return new Notification(title, {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      ...options,
    });
  }
  return null;
};
