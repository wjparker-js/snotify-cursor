import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface WebSocketMessage {
  type: 'activity' | 'notification' | 'playlist_update' | 'messenger_invite' | 'initial_state';
  payload: any;
}

export function useWebSocket() {
  const ws = useRef<WebSocket | null>(null);
  const queryClient = useQueryClient();

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/ws`;

    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.current.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        handleMessage(message);
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    };

    ws.current.onclose = () => {
      console.log('WebSocket disconnected');
      // Attempt to reconnect after 5 seconds
      setTimeout(connect, 5000);
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }, []);

  const handleMessage = useCallback((message: WebSocketMessage) => {
    switch (message.type) {
      case 'initial_state':
        // Update queries with initial state
        queryClient.setQueryData(['notifications'], message.payload.notifications);
        queryClient.setQueryData(['activities'], message.payload.activities);
        break;

      case 'activity':
        // Update activities query
        queryClient.setQueryData(['activities'], (old: any) => {
          if (!old) return [message.payload];
          return [message.payload, ...old];
        });
        break;

      case 'notification':
        // Update notifications query
        queryClient.setQueryData(['notifications'], (old: any) => {
          if (!old) return [message.payload];
          return [message.payload, ...old];
        });
        // Show toast for new notification
        toast(message.payload.message);
        break;

      case 'playlist_update':
        // Invalidate playlist query to refetch
        queryClient.invalidateQueries({ queryKey: ['playlist', message.payload.playlistId] });
        // Show toast for playlist update
        toast(`Playlist updated: ${message.payload.update}`);
        break;

      case 'messenger_invite':
        // Show toast for messenger invite
        toast(`New invitation from ${message.payload.inviterId}`);
        break;

      default:
        console.warn('Unknown message type:', message.type);
    }
  }, [queryClient]);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [connect]);

  return {
    sendMessage,
    isConnected: ws.current?.readyState === WebSocket.OPEN,
  };
} 