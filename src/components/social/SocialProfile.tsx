import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { UserPlus, Users, Music, ListMusic } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface UserProfile {
  id: string;
  name: string;
  image: string;
  bio?: string;
  followersCount: number;
  followingCount: number;
  playlistsCount: number;
  isFollowing: boolean;
}

interface SocialProfileProps {
  userId: string;
}

export function SocialProfile({ userId }: SocialProfileProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [isFollowing, setIsFollowing] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      const res = await fetch(`/api/users/${userId}`);
      if (!res.ok) throw new Error('Failed to fetch profile');
      const data = await res.json();
      setIsFollowing(data.isFollowing);
      return data;
    },
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/social/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: userId }),
      });
      if (!res.ok) throw new Error('Failed to follow user');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
      setIsFollowing(!isFollowing);
    },
  });

  const handleFollow = () => {
    followMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return <div>Profile not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start space-x-6">
        <div className="flex-shrink-0">
          <img
            src={profile.image || '/default-avatar.png'}
            alt={profile.name}
            className="w-24 h-24 rounded-full"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold">{profile.name}</h1>
          {profile.bio && (
            <p className="mt-2 text-muted-foreground">{profile.bio}</p>
          )}
          {session?.user?.id !== userId && (
            <button
              onClick={handleFollow}
              className={cn(
                "mt-4 px-4 py-2 rounded-full text-sm font-medium transition-colors",
                isFollowing
                  ? "bg-accent hover:bg-accent/80"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col items-center p-4 rounded-lg bg-card">
          <Users className="w-6 h-6 mb-2" />
          <span className="text-2xl font-bold">{profile.followersCount}</span>
          <span className="text-sm text-muted-foreground">Followers</span>
        </div>
        <div className="flex flex-col items-center p-4 rounded-lg bg-card">
          <UserPlus className="w-6 h-6 mb-2" />
          <span className="text-2xl font-bold">{profile.followingCount}</span>
          <span className="text-sm text-muted-foreground">Following</span>
        </div>
        <div className="flex flex-col items-center p-4 rounded-lg bg-card">
          <ListMusic className="w-6 h-6 mb-2" />
          <span className="text-2xl font-bold">{profile.playlistsCount}</span>
          <span className="text-sm text-muted-foreground">Playlists</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Activity</h2>
          <button
            onClick={() => router.push(`/profile/${userId}/activity`)}
            className="text-sm text-primary hover:text-primary/80"
          >
            View all
          </button>
        </div>
        {/* Activity feed component will be rendered here */}
      </div>
    </div>
  );
} 