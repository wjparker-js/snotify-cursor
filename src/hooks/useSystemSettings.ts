import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface SystemSettings {
  server: {
    host: string;
    port: number;
    environment: 'development' | 'staging' | 'production';
  };
  database: {
    host: string;
    port: number;
    name: string;
    pooling: boolean;
  };
  storage: {
    path: string;
    maxFileSize: number;
    allowedTypes: string;
  };
  notifications: {
    email: boolean;
    push: boolean;
    systemAlerts: boolean;
  };
  security: {
    twoFactorAuth: boolean;
    sessionTimeout: number;
    ipWhitelist: boolean;
  };
}

export function useSystemSettings() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery<SystemSettings>({
    queryKey: ['systemSettings'],
    queryFn: async () => {
      const response = await fetch('/api/admin/settings');
      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }
      return response.json();
    },
  });

  const updateSettings = useMutation({
    mutationFn: async (newSettings: SystemSettings) => {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSettings),
      });

      if (!response.ok) {
        throw new Error('Failed to update settings');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['systemSettings'] });
      toast.success('Settings updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update settings');
      console.error('Error updating settings:', error);
    },
  });

  const resetSettings = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to reset settings');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['systemSettings'] });
      toast.success('Settings reset to defaults');
    },
    onError: (error) => {
      toast.error('Failed to reset settings');
      console.error('Error resetting settings:', error);
    },
  });

  return {
    settings,
    isLoading,
    updateSettings: updateSettings.mutate,
    resetSettings: resetSettings.mutate,
    isUpdating: updateSettings.isPending,
    isResetting: resetSettings.isPending,
  };
} 