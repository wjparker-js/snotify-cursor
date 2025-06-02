import React from 'react';
import { Home, Library, User } from 'lucide-react';
import Link from 'next/link';

const navItems = [
  { name: 'Home', href: '/', icon: <Home className="w-6 h-6" /> },
  { name: 'Library', href: '/library', icon: <Library className="w-6 h-6" /> },
  { name: 'Profile', href: '/profile', icon: <User className="w-6 h-6" /> },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-spotify-dark border-r border-spotify-gray flex flex-col py-6 px-4 min-h-screen">
      <div className="flex items-center mb-10">
        <div className="bg-spotify-green rounded-full w-10 h-10 flex items-center justify-center mr-3">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-black">
            <circle cx="12" cy="12" r="12" fill="#1ED760" />
            <path d="M7.5 15.5C10.5 14 13.5 14 16.5 15.5" stroke="#191414" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M8.5 12.5C11.5 11.5 14.5 11.5 17.5 12.5" stroke="#191414" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M9.5 9.5C12.5 8.5 15.5 8.5 18.5 9.5" stroke="#191414" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <span className="text-2xl font-bold text-white tracking-tight">Snotify</span>
      </div>
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => (
          <Link key={item.name} href={item.href} legacyBehavior>
            <a className="flex items-center gap-3 px-3 py-2 rounded-lg text-white hover:bg-spotify-gray transition-colors font-medium">
              {item.icon}
              <span>{item.name}</span>
            </a>
          </Link>
        ))}
      </nav>
      <div className="mt-auto pt-8 text-xs text-spotify-gray-light">
        <p>&copy; {new Date().getFullYear()} Snotify</p>
      </div>
    </aside>
  );
} 