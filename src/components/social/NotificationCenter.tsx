import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { Bell, Check, Trash2, MessageSquare, UserPlus, Music, Heart, Share2, Users, Play } from 'lucide-react';
import { useWebSocketContext } from '@/providers/WebSocketProvider';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface Notification {
  id: string;
  type: string;
  message: string;
  read: boolean;
  metadata?: {
    trackId?: string;
    playlistId?: string;
    userId?: string;
    action?: {
      type: string;
      label: string;
      url: string;
    };
  };
  createdAt: string;
}

export function NotificationCenter() {
  const router = useRouter();
  const { isConnected } = useWebSocketContext();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await fetch('/api/notifications');
      if (!res.ok) throw new Error('Failed to fetch notifications');
      return res.json();
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, read: true }),
      });
      if (!res.ok) throw new Error('Failed to mark notifications as read');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const res = await fetch(`/api/notifications?ids=${ids.join(',')}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete notifications');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notifications deleted');
    },
  });

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsReadMutation.mutate([notification.id]);
    }

    if (notification.metadata?.action) {
      router.push(notification.metadata.action.url);
    } else {
      switch (notification.type) {
        case 'track_like':
          router.push(`/track/${notification.metadata?.trackId}`);
          break;
        case 'playlist_update':
          router.push(`/playlist/${notification.metadata?.playlistId}`);
          break;
        case 'follow':
          router.push(`/profile/${notification.metadata?.userId}`);
          break;
        case 'messenger_invite':
          router.push('/messenger');
          break;
      }
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'messenger_invite':
        return <MessageSquare className="w-5 h-5" />;
      case 'follow':
        return <UserPlus className="w-5 h-5" />;
      case 'playlist_update':
        return <Music className="w-5 h-5" />;
      case 'track_like':
        return <Heart className="w-5 h-5" />;
      case 'track_share':
        return <Share2 className="w-5 h-5" />;
      case 'collaboration_invite':
        return <Users className="w-5 h-5" />;
      case 'now_playing':
        return <Play className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const unreadCount = notifications?.filter((n: Notification) => !n.read).length || 0;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-accent"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 text-xs font-medium text-white bg-primary rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-background border rounded-lg shadow-lg z-50">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Notifications</h3>
              {notifications?.length > 0 && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => markAsReadMutation.mutate(notifications.map((n: Notification) => n.id))}
                    className="p-1 hover:bg-accent rounded"
                    title="Mark all as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(notifications.map((n: Notification) => n.id))}
                    className="p-1 hover:bg-accent rounded text-red-500"
                    title="Clear all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {!isConnected && (
              <div className="p-4 text-sm text-yellow-600 bg-yellow-50">
                Reconnecting to real-time updates...
              </div>
            )}

            {isLoading ? (
              <div className="flex justify-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : notifications?.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No notifications yet
              </div>
            ) : (
              <div className="divide-y">
                {notifications?.map((notification: Notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 hover:bg-accent/50 transition-colors cursor-pointer ${
                      !notification.read ? 'bg-accent/20' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                          })}
                        </p>
                        {notification.metadata?.action && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(notification.metadata!.action!.url);
                            }}
                            className="mt-2 text-xs text-primary hover:underline"
                          >
                            {notification.metadata.action.label}
                          </button>
                        )}
                      </div>
                      {!notification.read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsReadMutation.mutate([notification.id]);
                          }}
                          className="flex-shrink-0 p-1 hover:bg-accent rounded"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 