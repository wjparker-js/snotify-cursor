import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { Music, UserPlus, ListMusic, Heart } from 'lucide-react';
import { useWebSocketContext } from '@/providers/WebSocketProvider';

interface Activity {
  id: string;
  type: string;
  targetId?: string;
  metadata?: any;
  createdAt: string;
  user: {
    id: string;
    name: string;
    image: string;
  };
}

export function RealTimeActivityFeed() {
  const { isConnected } = useWebSocketContext();

  const { data: activities, isLoading } = useQuery({
    queryKey: ['activities'],
    queryFn: async () => {
      const res = await fetch('/api/activity');
      if (!res.ok) throw new Error('Failed to fetch activities');
      return res.json();
    },
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'play':
        return <Music className="w-5 h-5" />;
      case 'follow':
        return <UserPlus className="w-5 h-5" />;
      case 'playlist_create':
        return <ListMusic className="w-5 h-5" />;
      case 'like':
        return <Heart className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const getActivityMessage = (activity: Activity) => {
    switch (activity.type) {
      case 'play':
        return `played ${activity.metadata?.trackName || 'a track'}`;
      case 'follow':
        return `followed ${activity.metadata?.targetName || 'someone'}`;
      case 'playlist_create':
        return `created playlist "${activity.metadata?.playlistName || 'Untitled'}"`;
      case 'like':
        return `liked ${activity.metadata?.trackName || 'a track'}`;
      default:
        return 'performed an action';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!isConnected && (
        <div className="p-4 text-sm text-yellow-600 bg-yellow-50 rounded-lg">
          Reconnecting to real-time updates...
        </div>
      )}
      
      {activities?.map((activity: Activity) => (
        <div
          key={activity.id}
          className="flex items-start space-x-4 p-4 rounded-lg bg-card hover:bg-accent/50 transition-colors"
        >
          <div className="flex-shrink-0">
            <img
              src={activity.user.image || '/default-avatar.png'}
              alt={activity.user.name}
              className="w-10 h-10 rounded-full"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <span className="font-medium">{activity.user.name}</span>
              <span className="text-muted-foreground">
                {getActivityMessage(activity)}
              </span>
            </div>
            <div className="flex items-center space-x-2 mt-1">
              {getActivityIcon(activity.type)}
              <span className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>
      ))}

      {activities?.length === 0 && (
        <div className="text-center p-8 text-muted-foreground">
          No activities yet. Follow some users to see their activities here!
        </div>
      )}
    </div>
  );
} 