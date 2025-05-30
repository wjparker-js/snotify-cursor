
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSidebar } from "@/components/ui/sidebar";

interface TopNavProps {
  selectedTab?: string;
  setSelectedTab?: (tab: string) => void;
}

const TopNav: React.FC<TopNavProps> = ({ selectedTab: externalSelectedTab, setSelectedTab: externalSetSelectedTab }) => {
  const [selectedTab, setSelectedTab] = useState(externalSelectedTab || 'Albums');
  const tabs = ['Albums', 'Blogs', 'Playlists'];
  const location = useLocation();
  const { open: sidebarOpen, isMobile } = useSidebar();
  
  console.log("TopNav rendering with path:", location.pathname);
  console.log("TopNav - sidebar state:", sidebarOpen, "isMobile:", isMobile);

  useEffect(() => {
    const currentPath = location.pathname;
    console.log("TopNav path changed to:", currentPath);
    
    if (currentPath === '/' || currentPath.startsWith('/album')) {
      setSelectedTab('Albums');
      if (externalSetSelectedTab) externalSetSelectedTab('Albums');
    } else if (currentPath === '/blog' || currentPath.startsWith('/blog/')) {
      setSelectedTab('Blogs');
      if (externalSetSelectedTab) externalSetSelectedTab('Blogs');
    } else if (currentPath === '/playlists' || currentPath.startsWith('/playlist/')) {
      setSelectedTab('Playlists');
      if (externalSetSelectedTab) externalSetSelectedTab('Playlists');
    }
  }, [location.pathname, externalSetSelectedTab]);

  // If external selectedTab changes, update internal state
  useEffect(() => {
    if (externalSelectedTab && externalSelectedTab !== selectedTab) {
      setSelectedTab(externalSelectedTab);
    }
  }, [externalSelectedTab]);

  return (
    <div className="sticky top-0 z-10 backdrop-blur-md bg-black pt-3 pb-1">
      <div className="flex items-center justify-center gap-x-1 px-2 sm:px-4 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => (
          <Link 
            key={tab} 
            to={tab === 'Albums' ? '/' : tab === 'Blogs' ? '/blog' : '/playlists'}
            className={`
              px-2 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium mx-0.5 text-center
              ${selectedTab === tab 
                ? 'bg-theme-color text-white' 
                : 'bg-black text-white hover:bg-zinc-900'}
              min-w-[72px] sm:min-w-[90px]
            `}
            onClick={() => {
              console.log(`TopNav - Clicked on ${tab} tab`);
              setSelectedTab(tab);
              if (externalSetSelectedTab) externalSetSelectedTab(tab);
            }}
          >
            {tab}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TopNav;
