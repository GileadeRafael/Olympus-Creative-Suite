
import React from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient';

interface HeaderProps {
    user: User;
}

export const Header: React.FC<HeaderProps> = ({ user }) => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="absolute top-0 right-0 p-4 z-10">
        <div className="group relative">
            <button className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold bg-white text-ocs-dark rounded-lg shadow-sm hover:bg-gray-100 transition-colors">
                <div className="w-6 h-6 rounded-full bg-ocs-green text-white flex items-center justify-center font-bold text-xs">
                    {user.email?.charAt(0).toUpperCase()}
                </div>
                <span className="truncate max-w-[100px]">{user.email}</span>
            </button>
            <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-ocs-darker rounded-lg shadow-xl py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
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