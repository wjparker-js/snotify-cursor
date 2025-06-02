import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { initWebSocket } from '@/lib/websocket/server';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Upgrade the HTTP connection to a WebSocket connection
    const { socket: ws, response } = Deno.upgradeWebSocket(req);
    
    // Initialize WebSocket server if not already initialized
    const wsServer = initWebSocket(req.socket.server);

    // Handle WebSocket connection
    wsServer.handleConnection(ws, session.user);

    return response;
  } catch (error) {
    console.error('WebSocket connection error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 