

import React, { useState, useRef, useEffect } from 'react';
// FIX: The User type from Supabase is now recommended to be imported from '@supabase/auth-js' 
// to resolve type conflicts and ensure auth method types are correctly inferred.
import type { User } from '@supabase/auth-js';

interface HeaderProps {
    user: User;
    onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    setIsMenuOpen(false); // Close menu immediately for better UX
    onLogout();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
            setIsMenuOpen(false);
        }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="absolute top-0 right-0 p-4 z-10">
        <div className="relative" ref={menuRef}>
            <button 
                onClick={() => setIsMenuOpen(prev => !prev)}
                className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold bg-white text-ocs-dark rounded-lg shadow-sm hover:bg-gray-100 transition-colors dark:bg-ocs-darker dark:text-ocs-text dark:hover:bg-ocs-med"
            >
                <div className="w-6 h-6 rounded-full bg-ocs-green text-white flex items-center justify-center font-bold text-xs">
                    {user.email?.charAt(0).toUpperCase()}
                </div>
                <span className="truncate max-w-[100px]">{user.email}</span>
            </button>
            <div 
                className={`absolute top-full right-0 mt-2 w-48 bg-white dark:bg-ocs-darker rounded-lg shadow-xl py-1 transition-opacity duration-200 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
            >
                 <button 
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-ocs-text hover:bg-gray-100 dark:hover:bg-ocs-med"
                >
                    Sign Out
                </button>
            </div>
        </div>
    </header>
  );
};