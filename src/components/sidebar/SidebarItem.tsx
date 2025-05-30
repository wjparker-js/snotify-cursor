
import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '@/context/ThemeContext';

interface SidebarItemProps {
  label: string;
  active?: boolean;
  href?: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ 
  label, 
  active = false,
  href 
}) => {
  const { colorTheme } = useTheme();
  
  const content = (
    <div className={`px-4 py-2 rounded-full text-sm font-medium ${
      active 
        ? 'bg-theme-color text-white' 
        : 'bg-zinc-800 text-white hover:bg-zinc-700'
    }`}>
      {label}
    </div>
  );

  if (href) {
    return (
      <Link to={href} className="text-theme-color">
        {content}
      </Link>
    );
  }

  return content;
};

export default SidebarItem;
