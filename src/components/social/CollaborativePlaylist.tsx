import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { UserPlus, UserMinus, Settings, MoreVertical, MessageSquare } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useWebSocket } from '@/hooks/useWebSocket';
import { FacebookMessenger } from './FacebookMessenger';
import { cn } from '@/lib/utils';

interface Collaborator {
  id: string;
  user: {
    id: string;
    name: string;
    image: string;
  };
  role: 'owner' | 'editor' | 'viewer';
}

interface Playlist {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  collaborators: Collaborator[];
}

interface CollaborativePlaylistProps {
  playlistId: string;
}

export function CollaborativePlaylist({ playlistId }: CollaborativePlaylistProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const { sendMessage, isConnected } = useWebSocket();
  const [isAddingCollaborator, setIsAddingCollaborator] = useState(false);
  const [newCollaboratorEmail, setNewCollaboratorEmail] = useState('');
  const [showMessenger, setShowMessenger] = useState(false);

  const { data: playlist, isLoading } = useQuery({
    queryKey: ['playlist', playlistId],
    queryFn: async () => {
      const res = await fetch(`/api/playlists/${playlistId}`);
      if (!res.ok) throw new Error('Failed to fetch playlist');
      return res.json();
    },
  });

  const addCollaboratorMutation = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: string }) => {
      const res = await fetch('/api/playlists/collaborative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playlistId,
          email,
          role,
        }),
      });
      if (!res.ok) throw new Error('Failed to add collaborator');
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['playlist', playlistId] });
      setIsAddingCollaborator(false);
      setNewCollaboratorEmail('');

      // Notify collaborators through WebSocket
      if (isConnected) {
        sendMessage({
          type: 'playlist_update',
          payload: {
            playlistId,
            update: `New collaborator added: ${data.user.name}`,
          },
        });
      }
    },
  });

  const removeCollaboratorMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/playlists/collaborative?playlistId=${playlistId}&userId=${userId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to remove collaborator');
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['playlist', playlistId] });

      // Notify collaborators through WebSocket
      if (isConnected) {
        sendMessage({
          type: 'playlist_update',
          payload: {
            playlistId,
            update: `Collaborator removed: ${data.user.name}`,
          },
        });
      }
    },
  });

  const updateCollaboratorRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const res = await fetch('/api/playlists/collaborative', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playlistId,
          userId,
          role,
        }),
      });
      if (!res.ok) throw new Error('Failed to update collaborator role');
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['playlist', playlistId] });

      // Notify collaborators through WebSocket
      if (isConnected) {
        sendMessage({
          type: 'playlist_update',
          payload: {
            playlistId,
            update: `Role updated for ${data.user.name}: ${data.role}`,
          },
        });
      }
    },
  });

  const isOwner = playlist?.collaborators.some(
    (c: Collaborator) => c.user.id === session?.user?.id && c.role === 'owner'
  );

  const isEditor = playlist?.collaborators.some(
    (c: Collaborator) => c.user.id === session?.user?.id && (c.role === 'owner' || c.role === 'editor')
  );

  if (isLoading) {
    return (
      <div className="flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!playlist) {
    return <div>Playlist not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Collaborators</h2>
        {(isOwner || isEditor) && (
          <div className="flex space-x-2">
            <button
              onClick={() => setShowMessenger(!showMessenger)}
              className="flex items-center space-x-2 px-4 py-2 rounded-full bg-[#1877F2] text-white hover:bg-[#1877F2]/90"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Invite via Messenger</span>
            </button>
            <button
              onClick={() => setIsAddingCollaborator(true)}
              className="flex items-center space-x-2 px-4 py-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Collaborator</span>
            </button>
          </div>
        )}
      </div>

      {showMessenger && (
        <div className="p-4 rounded-lg bg-card">
          <FacebookMessenger
            playlistId={playlistId}
            onInvite={(friendId) => {
              setShowMessenger(false);
            }}
          />
        </div>
      )}

      {isAddingCollaborator && (
        <div className="p-4 rounded-lg bg-card">
          <input
            type="email"
            value={newCollaboratorEmail}
            onChange={(e) => setNewCollaboratorEmail(e.target.value)}
            placeholder="Enter email address"
            className="w-full px-4 py-2 rounded-md border"
          />
          <div className="flex space-x-2 mt-2">
            <button
              onClick={() => addCollaboratorMutation.mutate({ email: newCollaboratorEmail, role: 'editor' })}
              className="flex-1 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Add as Editor
            </button>
            <button
              onClick={() => addCollaboratorMutation.mutate({ email: newCollaboratorEmail, role: 'viewer' })}
              className="flex-1 px-4 py-2 rounded-md bg-accent hover:bg-accent/80"
            >
              Add as Viewer
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {playlist.collaborators.map((collaborator: Collaborator) => (
          <div
            key={collaborator.id}
            className="flex items-center justify-between p-4 rounded-lg bg-card"
          >
            <div className="flex items-center space-x-4">
              <img
                src={collaborator.user.image || '/default-avatar.png'}
                alt={collaborator.user.name}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <p className="font-medium">{collaborator.user.name}</p>
                <p className="text-sm text-muted-foreground capitalize">{collaborator.role}</p>
              </div>
            </div>
            {isOwner && collaborator.user.id !== session?.user?.id && (
              <DropdownMenu>
                <DropdownMenuTrigger className="p-2 hover:bg-accent rounded-full">
                  <MoreVertical className="w-4 h-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {collaborator.role !== 'editor' && (
                    <DropdownMenuItem
                      onClick={() => updateCollaboratorRoleMutation.mutate({ userId: collaborator.user.id, role: 'editor' })}
                    >
                      Make Editor
                    </DropdownMenuItem>
                  )}
                  {collaborator.role !== 'viewer' && (
                    <DropdownMenuItem
                      onClick={() => updateCollaboratorRoleMutation.mutate({ userId: collaborator.user.id, role: 'viewer' })}
                    >
                      Make Viewer
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={() => removeCollaboratorMutation.mutate(collaborator.user.id)}
                    className="text-red-500"
                  >
                    Remove
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 