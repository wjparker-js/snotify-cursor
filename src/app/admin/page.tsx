import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import {
  Users,
  Music,
  HardDrive,
  Activity,
  Server,
  Database,
} from 'lucide-react';

async function getSystemStats() {
  const [
    userCount,
    trackCount,
    storageUsed,
    activeUsers,
    serverLoad,
    dbSize,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.track.count(),
    prisma.$queryRaw`SELECT pg_size_pretty(pg_database_size(current_database())) as size`,
    prisma.user.count({
      where: {
        lastSeen: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    }),
    // In a real implementation, you would get this from your server monitoring system
    Promise.resolve({ cpu: 45, memory: 60 }),
    prisma.$queryRaw`SELECT pg_size_pretty(pg_database_size(current_database())) as size`,
  ]);

  return {
    userCount,
    trackCount,
    storageUsed: (storageUsed as any)[0].size,
    activeUsers,
    serverLoad,
    dbSize: (dbSize as any)[0].size,
  };
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    redirect('/');
  }

  const stats = await getSystemStats();

  const statCards = [
    {
      title: 'Total Users',
      value: stats.userCount,
      icon: Users,
      change: '+12%',
      changeType: 'positive',
    },
    {
      title: 'Total Tracks',
      value: stats.trackCount,
      icon: Music,
      change: '+5%',
      changeType: 'positive',
    },
    {
      title: 'Storage Used',
      value: stats.storageUsed,
      icon: HardDrive,
      change: '+2.3GB',
      changeType: 'neutral',
    },
    {
      title: 'Active Users (24h)',
      value: stats.activeUsers,
      icon: Activity,
      change: '+8%',
      changeType: 'positive',
    },
    {
      title: 'Server Load',
      value: `${stats.serverLoad.cpu}% CPU`,
      icon: Server,
      change: '-5%',
      changeType: 'positive',
    },
    {
      title: 'Database Size',
      value: stats.dbSize,
      icon: Database,
      change: '+1.2GB',
      changeType: 'neutral',
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">System Overview</h1>
        <p className="text-muted-foreground">
          Monitor your system's performance and health
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="bg-card rounded-lg p-6 border shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <span
                  className={`text-sm ${
                    stat.changeType === 'positive'
                      ? 'text-green-500'
                      : stat.changeType === 'negative'
                      ? 'text-red-500'
                      : 'text-yellow-500'
                  }`}
                >
                  {stat.change}
                </span>
              </div>
              <h3 className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </h3>
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-lg p-6 border shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          {/* Add activity chart or list here */}
        </div>

        <div className="bg-card rounded-lg p-6 border shadow-sm">
          <h2 className="text-lg font-semibold mb-4">System Health</h2>
          {/* Add system health indicators here */}
        </div>
      </div>
    </div>
  );
} 