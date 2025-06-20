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

      // Update user's last seen (only updatedAt field exists in schema)
      await prisma.user.update({
        where: { id: userId },
        data: {
          updatedAt: new Date(),
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

      // Update user's last activity (only updatedAt field exists in schema)
      await prisma.user.update({
        where: { id: userId },
        data: {
          updatedAt: new Date(),
        },
      });

      // TODO: Implement follow system - currently follow model doesn't exist in schema
      // For now, we'll just log the presence update without broadcasting
      wsLogger.info('Presence updated', {
        userId,
        currentActivity,
      });

      return {
        type: 'presence',
        data: {
          userId,
          currentActivity,
        },
        // broadcast: [], // No followers to broadcast to yet
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

      // TODO: Implement notification system - currently notification model doesn't exist in schema
      // For now, we'll just log the notification without storing it
      wsLogger.info('Notification requested', {
        userId,
        type,
        message: data.message,
      });

      return {
        type: 'notification',
        data: {
          id: Date.now(), // Temporary ID
          userId,
          type,
          message: data.message,
          createdAt: new Date(),
        },
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

      // TODO: Implement activity log system - currently activityLog model doesn't exist in schema
      // For now, we'll just log the activity without storing it
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const activity = {
        id: Date.now(), // Temporary ID
        userId,
        type,
        targetId: data.targetId,
        metadata: data.metadata,
        createdAt: new Date(),
        user,
      };

      wsLogger.info('Activity logged', {
        userId,
        activityId: activity.id,
        type,
      });

      return {
        type: 'activity',
        data: activity,
        // broadcast: [], // No followers to broadcast to yet
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

      // Update user's last activity time (only updatedAt field exists in schema)
      await prisma.user.update({
        where: { id: userId },
        data: {
          updatedAt: new Date(),
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