import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const settingsSchema = z.object({
  server: z.object({
    host: z.string(),
    port: z.number().min(1).max(65535),
    environment: z.enum(['development', 'staging', 'production']),
  }),
  database: z.object({
    host: z.string(),
    port: z.number().min(1).max(65535),
    name: z.string(),
    pooling: z.boolean(),
  }),
  storage: z.object({
    path: z.string(),
    maxFileSize: z.number().min(1),
    allowedTypes: z.string(),
  }),
  notifications: z.object({
    email: z.boolean(),
    push: z.boolean(),
    systemAlerts: z.boolean(),
  }),
  security: z.object({
    twoFactorAuth: z.boolean(),
    sessionTimeout: z.number().min(1),
    ipWhitelist: z.boolean(),
  }),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const settings = await prisma.systemSettings.findFirst();
    if (!settings) {
      return new NextResponse('Settings not found', { status: 404 });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const validatedData = settingsSchema.parse(body);

    const settings = await prisma.systemSettings.upsert({
      where: { id: 1 },
      update: {
        server: validatedData.server,
        database: validatedData.database,
        storage: validatedData.storage,
        notifications: validatedData.notifications,
        security: validatedData.security,
        updatedAt: new Date(),
      },
      create: {
        id: 1,
        server: validatedData.server,
        database: validatedData.database,
        storage: validatedData.storage,
        notifications: validatedData.notifications,
        security: validatedData.security,
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse('Invalid request data', { status: 400 });
    }
    console.error('Error updating settings:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const defaultSettings = {
      server: {
        host: 'localhost',
        port: 3000,
        environment: 'development',
      },
      database: {
        host: 'localhost',
        port: 5432,
        name: 'snotify',
        pooling: true,
      },
      storage: {
        path: '/var/www/snotify/storage',
        maxFileSize: 100,
        allowedTypes: 'mp3,mp4,jpg,png',
      },
      notifications: {
        email: true,
        push: true,
        systemAlerts: true,
      },
      security: {
        twoFactorAuth: false,
        sessionTimeout: 30,
        ipWhitelist: false,
      },
    };

    const settings = await prisma.systemSettings.upsert({
      where: { id: 1 },
      update: defaultSettings,
      create: {
        id: 1,
        ...defaultSettings,
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error resetting settings:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 