import React from 'react';
import { Settings } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import AccountButton from '@/components/auth/AccountButton';
import { Link } from "react-router-dom";
import { useSidebar } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TopBarProps {}

const TopBar: React.FC<TopBarProps> = () => {
  const auth = useAuth();
  const user = auth?.user;
  const { colorTheme } = useTheme();

  return (
    <div className="h-[29px] w-full bg-black border-b border-zinc-800 flex items-center justify-between px-4">
              <Link to="/" className="h-[12px] flex items-center hover:opacity-80 transition-opacity">
        <img 
          src="/lovable-uploads/8b5edd18-788f-4777-a313-70ccc56e19cf.png" 
          alt="Gerrbill Media" 
          className="h-full" 
          onError={(e) => {
            console.error("Logo failed to load");
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/placeholder.svg";
          }}
        />
      </Link>
      
      <div className="flex items-center gap-2 pr-5">
        {user && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to="/settings" className="text-white hover:text-theme-color transition-colors">
                  <Settings size={14} />
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Settings</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        <div className="text-white">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <AccountButton />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{user?.name || user?.email || 'Profile'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
};

export default TopBar;