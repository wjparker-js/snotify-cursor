import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Cpu,
  HardDrive,
  Memory,
  Network,
  Server as ServerIcon,
  Activity,
} from 'lucide-react';

// In a real implementation, these would be fetched from your server monitoring system
const mockServerStats = {
  cpu: {
    usage: 45,
    cores: 4,
    temperature: 65,
  },
  memory: {
    total: 16,
    used: 8.5,
    free: 7.5,
  },
  storage: {
    total: 512,
    used: 256,
    free: 256,
  },
  network: {
    up: 2.5,
    down: 5.8,
    connections: 150,
  },
  uptime: '15 days, 7 hours',
  load: [1.2, 1.5, 1.8],
};

export default async function ServerStatus() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    redirect('/');
  }

  const stats = mockServerStats;

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Server Status</h1>
        <p className="text-muted-foreground">
          Monitor system resources and performance
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.cpu.usage}%</div>
            <Progress value={stats.cpu.usage} className="mt-2" />
            <div className="mt-2 text-sm text-muted-foreground">
              <p>Temperature: {stats.cpu.temperature}°C</p>
              <p>Cores: {stats.cpu.cores}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <Memory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.memory.used}GB / {stats.memory.total}GB
            </div>
            <Progress
              value={(stats.memory.used / stats.memory.total) * 100}
              className="mt-2"
            />
            <div className="mt-2 text-sm text-muted-foreground">
              <p>Free: {stats.memory.free}GB</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.storage.used}GB / {stats.storage.total}GB
            </div>
            <Progress
              value={(stats.storage.used / stats.storage.total) * 100}
              className="mt-2"
            />
            <div className="mt-2 text-sm text-muted-foreground">
              <p>Free: {stats.storage.free}GB</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.network.connections} connections
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              <p>Upload: {stats.network.up} MB/s</p>
              <p>Download: {stats.network.down} MB/s</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Load</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.load[0].toFixed(2)} / {stats.load[1].toFixed(2)} /{' '}
              {stats.load[2].toFixed(2)}
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              <p>1m / 5m / 15m</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <ServerIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uptime}</div>
            <div className="mt-2 text-sm text-muted-foreground">
              <p>System running since last restart</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Logs</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Add system logs component here */}
            <p className="text-sm text-muted-foreground">
              System logs will be displayed here
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Add performance metrics chart here */}
            <p className="text-sm text-muted-foreground">
              Performance metrics will be displayed here
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 