import { useQuery } from '@tanstack/react-query';
import { Music, Users, Heart, TrendingUp } from 'lucide-react';
import { useWebSocketContext } from '@/providers/WebSocketProvider';
import { PresenceIndicator } from './PresenceIndicator';

interface Recommendation {
  id: string;
  type: 'track' | 'playlist' | 'user';
  title: string;
  description: string;
  imageUrl?: string;
  metadata: {
    artist?: string;
    duration?: string;
    followers?: number;
    likes?: number;
    friends?: {
      id: string;
      name: string;
      image: string;
    }[];
  };
}

export function SocialRecommendations() {
  const { isConnected } = useWebSocketContext();

  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['social-recommendations'],
    queryFn: async () => {
      const res = await fetch('/api/recommendations/social');
      if (!res.ok) throw new Error('Failed to fetch recommendations');
      return res.json();
    },
  });

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'track':
        return <Music className="w-5 h-5" />;
      case 'playlist':
        return <TrendingUp className="w-5 h-5" />;
      case 'user':
        return <Users className="w-5 h-5" />;
      default:
        return null;
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
      <h2 className="text-lg font-semibold">Recommended for You</h2>
      
      {!isConnected && (
        <div className="p-4 text-sm text-yellow-600 bg-yellow-50 rounded-lg">
          Reconnecting to real-time updates...
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {recommendations?.map((rec: Recommendation) => (
          <div
            key={rec.id}
            className="p-4 rounded-lg bg-card hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-start space-x-4">
              {rec.imageUrl ? (
                <img
                  src={rec.imageUrl}
                  alt={rec.title}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-accent flex items-center justify-center">
                  {getRecommendationIcon(rec.type)}
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{rec.title}</h3>
                <p className="text-sm text-muted-foreground truncate">
                  {rec.description}
                </p>
                
                {rec.metadata.artist && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {rec.metadata.artist}
                  </p>
                )}
                
                {rec.metadata.friends && rec.metadata.friends.length > 0 && (
                  <div className="mt-2 flex items-center space-x-2">
                    <div className="flex -space-x-2">
                      {rec.metadata.friends.slice(0, 3).map((friend) => (
                        <div key={friend.id} className="relative">
                          <img
                            src={friend.image}
                            alt={friend.name}
                            className="w-6 h-6 rounded-full border-2 border-background"
                          />
                          <PresenceIndicator
                            userId={friend.id}
                            size="sm"
                            className="absolute bottom-0 right-0"
                          />
                        </div>
                      ))}
                    </div>
                    {rec.metadata.friends.length > 3 && (
                      <span className="text-xs text-muted-foreground">
                        +{rec.metadata.friends.length - 3} more
                      </span>
                    )}
                  </div>
                )}
                
                <div className="mt-2 flex items-center space-x-4 text-sm text-muted-foreground">
                  {rec.metadata.likes && (
                    <div className="flex items-center space-x-1">
                      <Heart className="w-4 h-4" />
                      <span>{rec.metadata.likes}</span>
                    </div>
                  )}
                  {rec.metadata.followers && (
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{rec.metadata.followers}</span>
                    </div>
                  )}
                  {rec.metadata.duration && (
                    <span>{rec.metadata.duration}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {recommendations?.length === 0 && (
        <div className="text-center p-8 text-muted-foreground">
          No recommendations yet. Follow some users to get personalized recommendations!
        </div>
      )}
    </div>
  );
} 