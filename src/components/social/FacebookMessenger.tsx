import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { MessageSquare, UserPlus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface FacebookFriend {
  id: string;
  name: string;
  picture: string;
}

interface FacebookMessengerProps {
  playlistId?: string;
  onInvite?: (friendId: string) => void;
}

export function FacebookMessenger({ playlistId, onInvite }: FacebookMessengerProps) {
  const { data: session } = useSession();
  const { sendMessage, isConnected } = useWebSocket();
  const [isLoading, setIsLoading] = useState(false);
  const [isMessengerReady, setIsMessengerReady] = useState(false);

  // Load Facebook SDK
  useEffect(() => {
    const loadFacebookSDK = () => {
      if (window.FB) {
        setIsMessengerReady(true);
        return;
      }

      window.fbAsyncInit = function() {
        window.FB.init({
          appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
          cookie: true,
          xfbml: true,
          version: 'v18.0'
        });

        window.FB.getLoginStatus((response: any) => {
          if (response.status === 'connected') {
            setIsMessengerReady(true);
          }
        });
      };

      (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s) as HTMLScriptElement;
        js.id = id;
        js.src = "https://connect.facebook.net/en_US/sdk.js";
        fjs.parentNode?.insertBefore(js, fjs);
      }(document, 'script', 'facebook-jssdk'));
    };

    loadFacebookSDK();
  }, []);

  // Fetch Facebook friends
  const { data: friends, isLoading: isLoadingFriends } = useQuery({
    queryKey: ['facebook-friends'],
    queryFn: async () => {
      if (!isMessengerReady) return [];
      
      return new Promise<FacebookFriend[]>((resolve, reject) => {
        window.FB.api('/me/friends', { fields: 'id,name,picture' }, (response: any) => {
          if (response.error) {
            reject(response.error);
          } else {
            resolve(response.data);
          }
        });
      });
    },
    enabled: isMessengerReady,
  });

  // Handle Facebook login
  const handleFacebookLogin = () => {
    window.FB.login((response: any) => {
      if (response.authResponse) {
        setIsMessengerReady(true);
        toast.success('Connected to Facebook Messenger');
      } else {
        toast.error('Failed to connect to Facebook Messenger');
      }
    }, { scope: 'public_profile,user_friends,pages_messaging' });
  };

  // Handle friend invitation
  const handleInvite = async (friendId: string) => {
    if (!isConnected) {
      toast.error('Not connected to server');
      return;
    }

    setIsLoading(true);
    try {
      // Send invitation through WebSocket
      sendMessage({
        type: 'messenger_invite',
        payload: {
          targetUserId: friendId,
          playlistId,
        },
      });

      // Send message through Facebook Messenger
      if (isMessengerReady) {
        window.FB.ui({
          method: 'send',
          link: `${window.location.origin}/playlist/${playlistId}`,
          to: friendId,
        });
      }

      toast.success('Invitation sent!');
      onInvite?.(friendId);
    } catch (error) {
      toast.error('Failed to send invitation');
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) {
    return null;
  }

  return (
    <div className="space-y-4">
      {!isMessengerReady ? (
        <button
          onClick={handleFacebookLogin}
          className="flex items-center space-x-2 px-4 py-2 rounded-full bg-[#1877F2] text-white hover:bg-[#1877F2]/90"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Connect Facebook Messenger</span>
        </button>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Invite Friends</h3>
          {isLoadingFriends ? (
            <div className="flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {friends?.map((friend) => (
                <div
                  key={friend.id}
                  className="flex items-center space-x-3 p-3 rounded-lg bg-card hover:bg-accent cursor-pointer"
                  onClick={() => handleInvite(friend.id)}
                >
                  <img
                    src={friend.picture}
                    alt={friend.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{friend.name}</p>
                    <button
                      className="flex items-center space-x-1 text-sm text-primary"
                      disabled={isLoading}
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Invite</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 