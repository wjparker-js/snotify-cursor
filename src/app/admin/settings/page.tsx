'use client';

import { useEffect, useState } from 'react';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Server,
  Database,
  FileText,
  Bell,
  Shield,
} from 'lucide-react';
import { Loader2 } from 'lucide-react';

export default function SystemSettings() {
  const {
    settings,
    isLoading,
    updateSettings,
    resetSettings,
    isUpdating,
    isResetting,
  } = useSystemSettings();

  const [formData, setFormData] = useState({
    server: {
      host: '',
      port: 3000,
      environment: 'development' as const,
    },
    database: {
      host: '',
      port: 5432,
      name: '',
      pooling: true,
    },
    storage: {
      path: '',
      maxFileSize: 100,
      allowedTypes: '',
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
  });

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
  };

  const handleReset = () => {
    resetSettings();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">System Settings</h1>
        <p className="text-muted-foreground">
          Configure system parameters and preferences
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Server className="h-5 w-5" />
              <CardTitle>Server Configuration</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="host">Host</Label>
                  <Input
                    id="host"
                    value={formData.server.host}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        server: { ...formData.server, host: e.target.value },
                      })
                    }
                    placeholder="Enter host"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="port">Port</Label>
                  <Input
                    id="port"
                    type="number"
                    value={formData.server.port}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        server: {
                          ...formData.server,
                          port: parseInt(e.target.value),
                        },
                      })
                    }
                    placeholder="Enter port"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="environment">Environment</Label>
                <Select
                  value={formData.server.environment}
                  onValueChange={(value: 'development' | 'staging' | 'production') =>
                    setFormData({
                      ...formData,
                      server: { ...formData.server, environment: value },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select environment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <CardTitle>Database Settings</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dbHost">Database Host</Label>
                  <Input
                    id="dbHost"
                    value={formData.database.host}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        database: { ...formData.database, host: e.target.value },
                      })
                    }
                    placeholder="Enter database host"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dbPort">Database Port</Label>
                  <Input
                    id="dbPort"
                    type="number"
                    value={formData.database.port}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        database: {
                          ...formData.database,
                          port: parseInt(e.target.value),
                        },
                      })
                    }
                    placeholder="Enter database port"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dbName">Database Name</Label>
                <Input
                  id="dbName"
                  value={formData.database.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      database: { ...formData.database, name: e.target.value },
                    })
                  }
                  placeholder="Enter database name"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="dbPooling"
                  checked={formData.database.pooling}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      database: { ...formData.database, pooling: checked },
                    })
                  }
                />
                <Label htmlFor="dbPooling">Enable Connection Pooling</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <CardTitle>Storage Settings</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="storagePath">Storage Path</Label>
                <Input
                  id="storagePath"
                  value={formData.storage.path}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      storage: { ...formData.storage, path: e.target.value },
                    })
                  }
                  placeholder="Enter storage path"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
                  <Input
                    id="maxFileSize"
                    type="number"
                    value={formData.storage.maxFileSize}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        storage: {
                          ...formData.storage,
                          maxFileSize: parseInt(e.target.value),
                        },
                      })
                    }
                    placeholder="Enter max file size"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="allowedTypes">Allowed File Types</Label>
                  <Input
                    id="allowedTypes"
                    value={formData.storage.allowedTypes}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        storage: {
                          ...formData.storage,
                          allowedTypes: e.target.value,
                        },
                      })
                    }
                    placeholder="Enter allowed file types"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <CardTitle>Notification Settings</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Send notifications via email
                  </p>
                </div>
                <Switch
                  checked={formData.notifications.email}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      notifications: {
                        ...formData.notifications,
                        email: checked,
                      },
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Send push notifications
                  </p>
                </div>
                <Switch
                  checked={formData.notifications.push}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      notifications: {
                        ...formData.notifications,
                        push: checked,
                      },
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>System Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Send system alerts
                  </p>
                </div>
                <Switch
                  checked={formData.notifications.systemAlerts}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      notifications: {
                        ...formData.notifications,
                        systemAlerts: checked,
                      },
                    })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <CardTitle>Security Settings</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Require 2FA for admin access
                  </p>
                </div>
                <Switch
                  checked={formData.security.twoFactorAuth}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      security: {
                        ...formData.security,
                        twoFactorAuth: checked,
                      },
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Session Timeout</Label>
                  <p className="text-sm text-muted-foreground">
                    Auto-logout after inactivity
                  </p>
                </div>
                <Select
                  value={formData.security.sessionTimeout.toString()}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      security: {
                        ...formData.security,
                        sessionTimeout: parseInt(value),
                      },
                    })
                  }
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Select timeout" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>IP Whitelist</Label>
                  <p className="text-sm text-muted-foreground">
                    Restrict access to specific IPs
                  </p>
                </div>
                <Switch
                  checked={formData.security.ipWhitelist}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      security: {
                        ...formData.security,
                        ipWhitelist: checked,
                      },
                    })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={isResetting}
          >
            {isResetting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Resetting...
              </>
            ) : (
              'Reset to Defaults'
            )}
          </Button>
          <Button type="submit" disabled={isUpdating}>
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </div>
    </form>
  );
} 