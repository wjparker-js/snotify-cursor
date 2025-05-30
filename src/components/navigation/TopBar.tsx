import React from 'react';
import { Settings } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import AccountButton from '@/components/auth/AccountButton';
import { Link } from "react-router-dom";
import { useSidebar } from "@/components/ui/sidebar";

interface TopBarProps {}

const TopBar: React.FC<TopBarProps> = () => {
  const auth = useAuth();
  const user = auth?.user;
  const { colorTheme } = useTheme();

  return (
    <div className="h-[45px] w-full bg-black border-b border-zinc-800 flex items-center justify-between px-4">
      <Link to="/" className="h-[18px] flex items-center hover:opacity-80 transition-opacity">
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
          <Link to="/settings" className="text-white hover:text-theme-color transition-colors">
            <Settings size={18} />
          </Link>
        )}
        
        <div className="text-white">
          <AccountButton />
        </div>
      </div>
    </div>
  );
};

export default TopBar;