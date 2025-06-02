import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
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
  FileText,
  Music,
  Image,
  Video,
  MoreHorizontal,
  Download,
  Trash2,
  RefreshCw,
  Upload,
} from 'lucide-react';

async function getFileStats() {
  const [trackStats, imageStats, videoStats] = await Promise.all([
    prisma.track.findMany({
      select: {
        id: true,
        title: true,
        fileSize: true,
        duration: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.image.findMany({
      select: {
        id: true,
        name: true,
        fileSize: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.video.findMany({
      select: {
        id: true,
        title: true,
        fileSize: true,
        duration: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
  ]);

  const totalSize = [
    ...trackStats,
    ...imageStats,
    ...videoStats,
  ].reduce((acc, file) => acc + (file.fileSize || 0), 0);

  return {
    trackStats,
    imageStats,
    videoStats,
    totalSize,
  };
}

export default async function FileManagement() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    redirect('/');
  }

  const stats = await getFileStats();

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">File Management</h1>
        <p className="text-muted-foreground">
          Manage media files and storage
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Storage</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatFileSize(stats.totalSize)}
            </div>
            <Progress
              value={(stats.totalSize / (1024 * 1024 * 1024 * 100)) * 100}
              className="mt-2"
            />
            <div className="mt-2 text-sm text-muted-foreground">
              <p>100GB Total Storage</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tracks</CardTitle>
            <Music className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.trackStats.length} files
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              <p>
                {formatFileSize(
                  stats.trackStats.reduce(
                    (acc, track) => acc + (track.fileSize || 0),
                    0
                  )
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Images & Videos</CardTitle>
            <Image className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.imageStats.length + stats.videoStats.length} files
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              <p>
                {formatFileSize(
                  [...stats.imageStats, ...stats.videoStats].reduce(
                    (acc, file) => acc + (file.fileSize || 0),
                    0
                  )
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Files</CardTitle>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </Button>
                <Button variant="outline" size="sm">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...stats.trackStats, ...stats.videoStats]
                  .sort(
                    (a, b) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime()
                  )
                  .slice(0, 10)
                  .map((file) => (
                    <TableRow key={file.id}>
                      <TableCell className="font-medium">
                        {'title' in file ? file.title : file.name}
                      </TableCell>
                      <TableCell>
                        {'duration' in file ? (
                          <Music className="h-4 w-4" />
                        ) : (
                          <Video className="h-4 w-4" />
                        )}
                      </TableCell>
                      <TableCell>{formatFileSize(file.fileSize || 0)}</TableCell>
                      <TableCell>
                        {'duration' in file
                          ? formatDuration(file.duration || 0)
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {new Date(file.createdAt).toLocaleDateString()}
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
      </div>
    </div>
  );
} 