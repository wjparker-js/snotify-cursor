
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import Player from "./components/player/Player";
import TopBar from "./components/navigation/TopBar";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "./hooks/use-mobile";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ToastProvider } from "@/hooks/use-toast.tsx";

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
  
  // Always force dark mode
  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
    document.documentElement.setAttribute('data-color-theme', 'orange');
  }, []);

  console.log("App rendered, routes should be active. Mobile view:", isMobileView);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ThemeProvider>
            <ToastProvider>
              <TooltipProvider>
                <SidebarProvider defaultOpen={!isMobileView}>
                  <div className="flex flex-col h-screen overflow-hidden bg-black text-foreground w-full">
                    <TopBar />
                    <div className="flex flex-grow relative">
                      <Sidebar />
                      <div className="flex flex-col flex-grow w-full">
                        <div className="flex-grow overflow-y-auto bg-black">
                          <Routes>
                            <Route path="/" element={<Index />} />
                            <Route path="/album/:id" element={<Album />} />
                            <Route path="/playlists" element={<Playlists />} />
                            <Route path="/playlist/:id" element={<Playlist />} />
                            <Route path="/blog" element={<Blog />} />
                            <Route path="/blog/:id" element={<BlogPost />} />
                            <Route path="/settings" element={<Settings />} />
                            <Route path="/reset-password" element={<ResetPassword />} />
                            <Route path="*" element={<NotFound />} />
                          </Routes>
                        </div>
                        <Player />
                      </div>
                    </div>
                  </div>
                  <Toaster />
                  <Sonner />
                </SidebarProvider>
              </TooltipProvider>
            </ToastProvider>
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
