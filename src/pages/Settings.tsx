
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/context/ThemeContext";
import { Separator } from "@/components/ui/separator";
import { Moon, Sun, Palette, UserX } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from '@/context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserManagement from '@/components/settings/UserManagement';

const Settings = () => {
  const { theme, colorTheme, toggleTheme, setColorTheme } = useTheme();
  const { user } = useAuth();
  
  // Define allowed admin emails
  const allowedEmails = ['wjparker@outlook.com', 'ghodgett59@gmail.com'];
  const isAdmin = user && allowedEmails.includes(user.email || '');
  
  return (
    <ScrollArea className="h-[calc(100vh-65px)]">
      <div className="container py-6 space-y-8 pb-36">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Customize your music experience</p>
        </div>
        
        <Separator />
        
        <Tabs defaultValue="appearance" className="w-full">
          <TabsList>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            {isAdmin && <TabsTrigger value="users">User Management</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="appearance" className="pt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>Manage how the application looks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                      <div>
                        <Label htmlFor="theme-switch" className="font-medium">
                          Theme Mode
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Switch between dark and light theme
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="theme-switch"
                      checked={theme === 'light'}
                      onCheckedChange={toggleTheme}
                    />
                  </div>
                  
                  {/* Theme Color Selection */}
                  <div className="pt-2">
                    <div className="flex items-center space-x-4 mb-4">
                      <Palette className="h-5 w-5" />
                      <div>
                        <Label className="font-medium">Theme Color</Label>
                        <p className="text-sm text-muted-foreground">
                          Choose your preferred accent color
                        </p>
                      </div>
                    </div>
                    
                    <RadioGroup 
                      value={colorTheme} 
                      onValueChange={(value) => setColorTheme(value as 'orange' | 'blue' | 'green' | 'purple')}
                      className="flex flex-wrap gap-3"
                    >
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center justify-center">
                          <RadioGroupItem 
                            value="orange" 
                            id="orange" 
                            className="sr-only peer" 
                          />
                          <Label 
                            htmlFor="orange" 
                            className="size-8 rounded-full bg-orange-700 cursor-pointer peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-ring peer-data-[state=checked]:ring-offset-2" 
                          />
                        </div>
                        <span className="text-xs">Orange</span>
                      </div>
                      
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center justify-center">
                          <RadioGroupItem 
                            value="blue" 
                            id="blue" 
                            className="sr-only peer" 
                          />
                          <Label 
                            htmlFor="blue" 
                            className="size-8 rounded-full bg-blue-600 cursor-pointer peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-ring peer-data-[state=checked]:ring-offset-2" 
                          />
                        </div>
                        <span className="text-xs">Blue</span>
                      </div>
                      
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center justify-center">
                          <RadioGroupItem 
                            value="green" 
                            id="green" 
                            className="sr-only peer" 
                          />
                          <Label 
                            htmlFor="green" 
                            className="size-8 rounded-full bg-green-600 cursor-pointer peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-ring peer-data-[state=checked]:ring-offset-2" 
                          />
                        </div>
                        <span className="text-xs">Green</span>
                      </div>
                      
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center justify-center">
                          <RadioGroupItem 
                            value="purple" 
                            id="purple" 
                            className="sr-only peer" 
                          />
                          <Label 
                            htmlFor="purple" 
                            className="size-8 rounded-full bg-purple-600 cursor-pointer peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-ring peer-data-[state=checked]:ring-offset-2" 
                          />
                        </div>
                        <span className="text-xs">Purple</span>
                      </div>
                    </RadioGroup>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {isAdmin && (
            <TabsContent value="users" className="pt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserX className="h-5 w-5" />
                    User Management
                  </CardTitle>
                  <CardDescription>
                    Manage user accounts (Admin only)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <UserManagement />
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </ScrollArea>
  );
};

export default Settings;
