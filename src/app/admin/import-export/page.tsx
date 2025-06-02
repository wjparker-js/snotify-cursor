import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Download,
  Upload,
  FileText,
  Database,
  Music,
  Image,
  Video,
  MoreHorizontal,
  Trash2,
  RefreshCw,
} from 'lucide-react';

// In a real implementation, these would be fetched from your system
const mockTransfers = [
  {
    id: '1',
    type: 'export',
    format: 'JSON',
    size: 1024 * 1024 * 10, // 10MB
    createdAt: new Date('2024-03-15T10:00:00Z'),
    status: 'completed',
    items: 150,
  },
  {
    id: '2',
    type: 'import',
    format: 'CSV',
    size: 1024 * 1024 * 5, // 5MB
    createdAt: new Date('2024-03-14T10:00:00Z'),
    status: 'completed',
    items: 75,
  },
  {
    id: '3',
    type: 'export',
    format: 'SQL',
    size: 1024 * 1024 * 20, // 20MB
    createdAt: new Date('2024-03-13T10:00:00Z'),
    status: 'completed',
    items: 300,
  },
];

export default async function ImportExport() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    redirect('/');
  }

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'JSON':
        return <FileText className="h-4 w-4" />;
      case 'CSV':
        return <FileText className="h-4 w-4" />;
      case 'SQL':
        return <Database className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Import & Export</h1>
        <p className="text-muted-foreground">
          Manage data transfers and migrations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Export Data</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button className="w-full" variant="outline">
                <Database className="mr-2 h-4 w-4" />
                Export Database
              </Button>
              <Button className="w-full" variant="outline">
                <Music className="mr-2 h-4 w-4" />
                Export Tracks
              </Button>
              <Button className="w-full" variant="outline">
                <Image className="mr-2 h-4 w-4" />
                Export Media
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Import Data</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button className="w-full" variant="outline">
                <Database className="mr-2 h-4 w-4" />
                Import Database
              </Button>
              <Button className="w-full" variant="outline">
                <Music className="mr-2 h-4 w-4" />
                Import Tracks
              </Button>
              <Button className="w-full" variant="outline">
                <Image className="mr-2 h-4 w-4" />
                Import Media
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transfer History</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockTransfers.length}</div>
            <div className="mt-2 text-sm text-muted-foreground">
              <p>Total Transfers</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Data</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatFileSize(
                mockTransfers.reduce((acc, transfer) => acc + transfer.size, 0)
              )}
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              <p>Transferred</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Transfers</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockTransfers.map((transfer) => (
                  <TableRow key={transfer.id}>
                    <TableCell className="capitalize">{transfer.type}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getFormatIcon(transfer.format)}
                        <span>{transfer.format}</span>
                      </div>
                    </TableCell>
                    <TableCell>{formatFileSize(transfer.size)}</TableCell>
                    <TableCell>{transfer.items}</TableCell>
                    <TableCell>
                      {transfer.createdAt.toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <span className="capitalize">{transfer.status}</span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0"
                          >
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transfer Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Default Format</p>
                  <p className="text-sm text-muted-foreground">
                    JSON for data export
                  </p>
                </div>
                <Button variant="outline">Configure</Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Compression</p>
                  <p className="text-sm text-muted-foreground">
                    Enable for large files
                  </p>
                </div>
                <Button variant="outline">Configure</Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Validation</p>
                  <p className="text-sm text-muted-foreground">
                    Verify data integrity
                  </p>
                </div>
                <Button variant="outline">Configure</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 