import { useQuery } from '@tanstack/react-query';
import { useWebSocketContext } from '@/providers/WebSocketProvider';
import { Circle } from 'lucide-react';

interface Presence {
  userId: string;
  status: 'online' | 'offline' | 'away';
  lastSeen?: string;
  currentActivity?: {
    type: string;
    name: string;
  };
}

interface PresenceIndicatorProps {
  userId: string;
  size?: 'sm' | 'md' | 'lg';
  showActivity?: boolean;
}

export function PresenceIndicator({ userId, size = 'md', showActivity = false }: PresenceIndicatorProps) {
  const { isConnected } = useWebSocketContext();

  const { data: presence } = useQuery({
    queryKey: ['presence', userId],
    queryFn: async () => {
      const res = await fetch(`/api/presence/${userId}`);
      if (!res.ok) throw new Error('Failed to fetch presence');
      return res.json();
    },
    enabled: isConnected,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-2 h-2';
      case 'md':
        return 'w-3 h-3';
      case 'lg':
        return 'w-4 h-4';
      default:
        return 'w-3 h-3';
    }
  };

  const getActivityIcon = (type?: string) => {
    if (!type) return null;
    switch (type) {
      case 'listening':
        return '🎵';
      case 'messaging':
        return '💬';
      case 'browsing':
        return '👀';
      default:
        return null;
    }
  };

  return (
    <div className="relative inline-flex items-center">
      <div
        className={`${getSizeClasses()} ${getStatusColor(
          presence?.status || 'offline'
        )} rounded-full border-2 border-background`}
      />
      {showActivity && presence?.currentActivity && (
        <span className="ml-2 text-sm text-muted-foreground">
          {getActivityIcon(presence.currentActivity.type)} {presence.currentActivity.name}
        </span>
      )}
    </div>
  );
} 