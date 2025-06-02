import { Server } from 'ws';
import { Server as HTTPServer } from 'http';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

interface WebSocketMessage {
  type: 'activity' | 'notification' | 'playlist_update' | 'messenger_invite';
  payload: any;
}

interface WebSocketClient {
  id: string;
  userId: string;
  ws: WebSocket;
}

class WebSocketServer {
  private wss: Server;
  private clients: Map<string, WebSocketClient> = new Map();

  constructor(server: HTTPServer) {
    this.wss = new Server({ server });
    this.init();
  }

  private init() {
    this.wss.on('connection', async (ws: WebSocket, req: any) => {
      try {
        // Get session from request
        const session = await getServerSession(req, {}, authOptions);
        if (!session?.user?.id) {
          ws.close(1008, 'Unauthorized');
          return;
        }

        const clientId = session.user.id;
        this.clients.set(clientId, { id: clientId, userId: session.user.id, ws });

        // Send initial state
        this.sendInitialState(clientId);

        ws.on('message', async (message: string) => {
          try {
            const data: WebSocketMessage = JSON.parse(message);
            await this.handleMessage(clientId, data);
          } catch (error) {
            console.error('WebSocket message error:', error);
          }
        });

        ws.on('close', () => {
          this.clients.delete(clientId);
        });
      } catch (error) {
        console.error('WebSocket connection error:', error);
        ws.close(1011, 'Internal Server Error');
      }
    });
  }

  private async sendInitialState(clientId: string) {
    const client = this.clients.get(clientId);
    if (!client) return;

    // Get unread notifications
    const notifications = await prisma.notification.findMany({
      where: {
        userId: client.userId,
        read: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get recent activities
    const activities = await prisma.activityLog.findMany({
      where: {
        OR: [
          { userId: client.userId },
          {
            user: {
              followers: {
                some: {
                  followerId: client.userId,
                },
              },
            },
          },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    });

    client.ws.send(JSON.stringify({
      type: 'initial_state',
      payload: {
        notifications,
        activities,
      },
    }));
  }

  private async handleMessage(clientId: string, message: WebSocketMessage) {
    switch (message.type) {
      case 'messenger_invite':
        await this.handleMessengerInvite(clientId, message.payload);
        break;
      case 'playlist_update':
        await this.handlePlaylistUpdate(clientId, message.payload);
        break;
      default:
        console.warn('Unknown message type:', message.type);
    }
  }

  private async handleMessengerInvite(clientId: string, payload: any) {
    const { targetUserId, playlistId } = payload;
    const client = this.clients.get(clientId);
    if (!client) return;

    // Get target user's Facebook Messenger ID
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: {
        socialAccounts: {
          where: { provider: 'facebook' },
        },
      },
    });

    if (!targetUser?.socialAccounts[0]) {
      client.ws.send(JSON.stringify({
        type: 'error',
        payload: { message: 'User not connected to Facebook Messenger' },
      }));
      return;
    }

    // Send invitation through Facebook Messenger
    // This would integrate with Facebook's Messenger API
    // For now, we'll just notify the target user through our system
    await prisma.notification.create({
      data: {
        userId: targetUserId,
        type: 'messenger_invite',
        message: `${client.userId} invited you to collaborate on a playlist`,
        metadata: {
          playlistId,
          inviterId: client.userId,
        },
      },
    });

    // Notify the inviter
    client.ws.send(JSON.stringify({
      type: 'messenger_invite_sent',
      payload: { targetUserId, playlistId },
    }));
  }

  private async handlePlaylistUpdate(clientId: string, payload: any) {
    const { playlistId, update } = payload;
    const client = this.clients.get(clientId);
    if (!client) return;

    // Get playlist collaborators
    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId },
      include: {
        collaborators: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!playlist) return;

    // Notify all collaborators
    playlist.collaborators.forEach((collaborator) => {
      const collaboratorClient = this.clients.get(collaborator.user.id);
      if (collaboratorClient) {
        collaboratorClient.ws.send(JSON.stringify({
          type: 'playlist_update',
          payload: {
            playlistId,
            update,
            updatedBy: clientId,
          },
        }));
      }
    });
  }

  // Public methods for broadcasting events
  public async broadcastActivity(activity: any) {
    const { userId, type, targetId } = activity;

    // Get user's followers
    const followers = await prisma.follow.findMany({
      where: { followingId: userId },
      include: {
        follower: true,
      },
    });

    // Notify followers
    followers.forEach((follow) => {
      const client = this.clients.get(follow.follower.id);
      if (client) {
        client.ws.send(JSON.stringify({
          type: 'activity',
          payload: activity,
        }));
      }
    });
  }

  public async broadcastNotification(notification: any) {
    const client = this.clients.get(notification.userId);
    if (client) {
      client.ws.send(JSON.stringify({
        type: 'notification',
        payload: notification,
      }));
    }
  }
}

let wsServer: WebSocketServer;

export function initWebSocket(server: HTTPServer) {
  if (!wsServer) {
    wsServer = new WebSocketServer(server);
  }
  return wsServer;
}

export function getWebSocketServer() {
  if (!wsServer) {
    throw new Error('WebSocket server not initialized');
  }
  return wsServer;
} 