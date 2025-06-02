import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Database,
  Table,
  FileText,
  RefreshCw,
  Download,
  Upload,
  Trash2,
} from 'lucide-react';

async function getDatabaseStats() {
  const [
    tableStats,
    dbSize,
    activeConnections,
    slowQueries,
  ] = await Promise.all([
    prisma.$queryRaw`
      SELECT 
        relname as table_name,
        n_live_tup as row_count,
        pg_size_pretty(pg_total_relation_size(relid)) as total_size
      FROM pg_stat_user_tables
      ORDER BY n_live_tup DESC
    `,
    prisma.$queryRaw`SELECT pg_size_pretty(pg_database_size(current_database())) as size`,
    prisma.$queryRaw`SELECT count(*) as count FROM pg_stat_activity`,
    prisma.$queryRaw`
      SELECT 
        query,
        calls,
        total_time,
        mean_time
      FROM pg_stat_statements
      ORDER BY mean_time DESC
      LIMIT 5
    `,
  ]);

  return {
    tableStats,
    dbSize: (dbSize as any)[0].size,
    activeConnections: (activeConnections as any)[0].count,
    slowQueries,
  };
}

export default async function DatabaseManagement() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    redirect('/');
  }

  const stats = await getDatabaseStats();

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Database Management</h1>
        <p className="text-muted-foreground">
          Monitor and manage your database
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database Size</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.dbSize}</div>
            <div className="mt-2 text-sm text-muted-foreground">
              <p>Active Connections: {stats.activeConnections}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Table Statistics</CardTitle>
            <Table className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(stats.tableStats as any[]).map((table) => (
                <div key={table.table_name}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {table.table_name}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {table.row_count} rows
                    </span>
                  </div>
                  <Progress
                    value={
                      (parseInt(table.row_count) /
                        parseInt((stats.tableStats as any[])[0].row_count)) *
                      100
                    }
                    className="mt-1"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Slow Queries</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(stats.slowQueries as any[]).map((query, index) => (
                <div key={index} className="text-sm">
                  <p className="font-medium">
                    {query.query.substring(0, 50)}...
                  </p>
                  <p className="text-muted-foreground">
                    Mean time: {query.mean_time.toFixed(2)}ms
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Database Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button className="w-full" variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Optimize Database
              </Button>
              <Button className="w-full" variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export Database
              </Button>
              <Button className="w-full" variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Import Database
              </Button>
              <Button className="w-full" variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Clear Cache
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Query Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Add query performance chart here */}
            <p className="text-sm text-muted-foreground">
              Query performance metrics will be displayed here
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 