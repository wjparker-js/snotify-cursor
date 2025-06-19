import { wsLogger } from './logger.js';
import prisma from '../../integrations/mysql.js';

interface WebSocketMessage {
  type: string;
  data: any;
  userId?: string;
  connectionId?: string;
}

export const handlers = {
  auth: async (message: WebSocketMessage) => {
    try {
      const { userId } = message.data;
      if (!userId) {
        throw new Error('User ID is required for authentication');
      }

      // Update user's last seen and connection status
      await prisma.user.update({
        where: { id: userId },
        data: {
          lastSeen: new Date(),
          isConnected: true,
        },
      });

      wsLogger.info('User authenticated', { userId, connectionId: message.connectionId });
      return { type: 'auth', data: { success: true } };
    } catch (error) {
      wsLogger.error('Authentication failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: message.userId,
        connectionId: message.connectionId,
      });
      return { type: 'error', data: { message: 'Authentication failed' } };
    }
  },

  presence: async (message: WebSocketMessage) => {
    try {
      const { userId, currentActivity } = message.data;
      if (!userId) {
        throw new Error('User ID is required for presence update');
      }

      // Update user's presence
      await prisma.user.update({
        where: { id: userId },
        data: {
          lastSeen: new Date(),
          currentActivity,
        },
      });

      // Broadcast presence update to followers
      const followers = await prisma.follow.findMany({
        where: { followingId: userId },
        select: { followerId: true },
      });

      wsLogger.info('Presence updated', {
        userId,
        currentActivity,
        followersCount: followers.length,
      });

      return {
        type: 'presence',
        data: {
          userId,
          currentActivity,
        },
        broadcast: followers.map(f => f.followerId),
      };
    } catch (error) {
      wsLogger.error('Presence update failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: message.userId,
      });
      return { type: 'error', data: { message: 'Presence update failed' } };
    }
  },

  notification: async (message: WebSocketMessage) => {
    try {
      const { userId, type, data } = message;
      if (!userId) {
        throw new Error('User ID is required for notification');
      }

      // Create notification in database
      const notification = await prisma.notification.create({
        data: {
          userId,
          type,
          message: data.message,
          metadata: data.metadata,
        },
      });

      wsLogger.info('Notification created', {
        userId,
        notificationId: notification.id,
        type,
      });

      return {
        type: 'notification',
        data: notification,
        broadcast: [userId],
      };
    } catch (error) {
      wsLogger.error('Notification creation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: message.userId,
      });
      return { type: 'error', data: { message: 'Notification creation failed' } };
    }
  },

  activity: async (message: WebSocketMessage) => {
    try {
      const { userId, type, data } = message;
      if (!userId) {
        throw new Error('User ID is required for activity');
      }

      // Create activity log
      const activity = await prisma.activityLog.create({
        data: {
          userId,
          type,
          targetId: data.targetId,
          metadata: data.metadata,
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
      });

      // Get followers for broadcasting
      const followers = await prisma.follow.findMany({
        where: { followingId: userId },
        select: { followerId: true },
      });

      wsLogger.info('Activity logged', {
        userId,
        activityId: activity.id,
        type,
        followersCount: followers.length,
      });

      return {
        type: 'activity',
        data: activity,
        broadcast: followers.map(f => f.followerId),
      };
    } catch (error) {
      wsLogger.error('Activity logging failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: message.userId,
      });
      return { type: 'error', data: { message: 'Activity logging failed' } };
    }
  },

  disconnect: async (message: WebSocketMessage) => {
    try {
      const { userId } = message;
      if (!userId) {
        throw new Error('User ID is required for disconnect');
      }

      // Update user's connection status
      await prisma.user.update({
        where: { id: userId },
        data: {
          isConnected: false,
          lastSeen: new Date(),
        },
      });

      wsLogger.info('User disconnected', { userId, connectionId: message.connectionId });
      return { type: 'disconnect', data: { success: true } };
    } catch (error) {
      wsLogger.error('Disconnect handling failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: message.userId,
      });
      return { type: 'error', data: { message: 'Disconnect handling failed' } };
    }
  },
}; 