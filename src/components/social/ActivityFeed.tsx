import { useEffect, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { Music, UserPlus, PlayCircle, ListPlus, Heart } from 'lucide-react';
import { useMediaPlayer } from '@/contexts/MediaPlayerContext';
import { cn } from '@/lib/utils';

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

export function ActivityFeed() {
  const { playTrack } = useMediaPlayer();
  const [page, setPage] = useState(1);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['activities'],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await fetch(`/api/activity?page=${pageParam}&limit=10`);
      if (!res.ok) throw new Error('Failed to fetch activities');
      return res.json();
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.currentPage < lastPage.pagination.pages) {
        return lastPage.pagination.currentPage + 1;
      }
      return undefined;
    },
  });

  const activities = data?.pages.flatMap((page) => page.activities) || [];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'play':
        return <PlayCircle className="w-5 h-5" />;
      case 'follow':
        return <UserPlus className="w-5 h-5" />;
      case 'playlist_create':
        return <ListPlus className="w-5 h-5" />;
      case 'like':
        return <Heart className="w-5 h-5" />;
      default:
        return <Music className="w-5 h-5" />;
    }
  };

  const getActivityMessage = (activity: Activity) => {
    const userName = activity.user.name;
    switch (activity.type) {
      case 'play':
        return `${userName} played ${activity.metadata?.track?.title}`;
      case 'follow':
        return `${userName} followed ${activity.metadata?.followedUser?.name}`;
      case 'playlist_create':
        return `${userName} created playlist ${activity.metadata?.playlist?.name}`;
      case 'like':
        return `${userName} liked ${activity.metadata?.track?.title}`;
      default:
        return `${userName} performed an action`;
    }
  };

  const handlePlayTrack = (track: any) => {
    if (track) {
      playTrack(track);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Activity Feed</h2>
      <div className="space-y-4">
        {status === 'loading' ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : status === 'error' ? (
          <div className="text-red-500">Failed to load activities</div>
        ) : (
          <>
            {activities.map((activity: Activity) => (
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
                    {getActivityIcon(activity.type)}
                    <p className="text-sm text-muted-foreground">
                      {getActivityMessage(activity)}
                    </p>
                  </div>
                  {activity.type === 'play' && activity.metadata?.track && (
                    <button
                      onClick={() => handlePlayTrack(activity.metadata.track)}
                      className="mt-2 flex items-center space-x-2 text-sm text-primary hover:text-primary/80"
                    >
                      <PlayCircle className="w-4 h-4" />
                      <span>Play this track</span>
                    </button>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
            {hasNextPage && (
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {isFetchingNextPage ? 'Loading more...' : 'Load more'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
} 