import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Index from "./pages/Index";
import Album from "./pages/Album";
import Playlists from "./pages/Playlists";
import Playlist from "./pages/Playlist";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import ResetPassword from "./pages/ResetPassword";
import Sidebar from "./components/sidebar/Sidebar";
import TopBar from "./components/navigation/TopBar";

import { useIsMobile } from "./hooks/use-mobile";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ToastProvider } from "@/hooks/use-toast.tsx";
import AlbumDetailsPage from './pages/albums/[id]';
import { MediaPlayerProvider } from '@/contexts/MediaPlayerContext';
import MediaPlayer from '@/components/player/MediaPlayer';

// Create a new query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  const [selectedTab, setSelectedTab] = useState('Albums');
  const isMobileView = useIsMobile(700);
  const location = useLocation();
  
  // Always force dark mode
  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
    document.documentElement.setAttribute('data-color-theme', 'orange');
  }, []);

  console.log("App rendered, routes should be active. Mobile view:", isMobileView);

  return (
    <QueryClientProvider client={queryClient}>
      <MediaPlayerProvider>
        <AuthProvider>
          <ThemeProvider>
            <ToastProvider>
              <TooltipProvider>
                <SidebarProvider defaultOpen={!isMobileView}>
                  <div className="flex flex-col h-screen overflow-hidden bg-black text-foreground w-full">
                    <TopBar />
                    <div className="flex flex-1 min-h-0">
                      <Sidebar />
                      <div className="flex flex-col flex-1 w-full min-h-0">
                        <div className="flex-grow overflow-y-auto bg-black">
                          <Routes>
                            <Route path="/" element={<Index />} />
                            <Route path="/albums" element={<Index />} />
                            <Route path="/album/:id" element={<Album />} />
                            <Route path="/albums/:id" element={<AlbumDetailsPage />} />
                            <Route path="/playlists" element={<Playlists />} />
                            <Route path="/playlist/:id" element={<Playlist />} />
                            <Route path="/blog" element={<Blog />} />
                            <Route path="/blog/:id" element={<BlogPost />} />
                            <Route path="/settings" element={<Settings />} />
                            <Route path="/reset-password" element={<ResetPassword />} />
                            <Route path="*" element={<NotFound />} />
                          </Routes>
                        </div>
                        <MediaPlayer />
                      </div>
                    </div>
                    <Toaster />
                    <Sonner />
                  </div>
                </SidebarProvider>
              </TooltipProvider>
            </ToastProvider>
          </ThemeProvider>
        </AuthProvider>
      </MediaPlayerProvider>
    </QueryClientProvider>
  );
};

export default App;
