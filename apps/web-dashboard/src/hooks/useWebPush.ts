import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { apiClient } from '@/lib/axios';

export function useWebPush() {
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || typeof window === 'undefined' || !('Notification' in window)) return;

    const registerPush = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          // Check if we already registered a token in this session
          const sessionRegistered = sessionStorage.getItem('web_push_registered');
          if (sessionRegistered) return;

          // Standard FCM / VAPID browser push token simulation for web platform
          const mockToken = `web-push-token-${user?.id}-${Math.random().toString(36).substring(7)}`;
          
          await apiClient.post('/v1/notifications/register-token', {
            token: mockToken,
            platform: 'web'
          });
          
          sessionStorage.setItem('web_push_registered', 'true');
          console.log('[WebPush] Registered web push token with backend:', mockToken);
        }
      } catch (err: any) {
        console.error('[WebPush] Error setting up notifications:', err.message);
      }
    };

    registerPush();
  }, [isAuthenticated, user]);
}
