import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Users,
  Server,
  Database,
  FileText,
  Settings,
  Activity,
  Backup,
  Upload,
  Download,
  Shield,
} from 'lucide-react';

const navItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: Activity,
  },
  {
    title: 'User Management',
    href: '/admin/users',
    icon: Users,
  },
  {
    title: 'Server Status',
    href: '/admin/server',
    icon: Server,
  },
  {
    title: 'Database',
    href: '/admin/database',
    icon: Database,
  },
  {
    title: 'File Management',
    href: '/admin/files',
    icon: FileText,
  },
  {
    title: 'Backup & Restore',
    href: '/admin/backup',
    icon: Backup,
  },
  {
    title: 'Import/Export',
    href: '/admin/import-export',
    icon: Upload,
  },
  {
    title: 'System Settings',
    href: '/admin/settings',
    icon: Settings,
  },
  {
    title: 'Access Control',
    href: '/admin/access',
    icon: Shield,
  },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="w-64 bg-card border-r h-screen p-4">
      <div className="mb-8">
        <h1 className="text-xl font-bold">Admin Panel</h1>
      </div>

      <div className="space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 pt-8 border-t">
        <div className="text-sm text-muted-foreground">
          <p>Server Status:</p>
          <div className="mt-2 flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span>All Systems Operational</span>
          </div>
        </div>
      </div>
    </nav>
  );
} 