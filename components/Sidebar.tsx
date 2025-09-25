
import React from 'react';
import type { Assistant } from '../constants';
import { SunIcon, MoonIcon, DiamondIcon } from './Icons';

interface SidebarProps {
  assistants: Assistant[];
  selectedAssistant: Assistant;
  onSelectAssistant: (assistant: Assistant) => void;
  onNewChat: () => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  unlockedAssistants: Set<string>;
}

const NavItem: React.FC<{
  assistant: Assistant;
  isActive: boolean;
  isLocked: boolean;
  onClick: () => void;
}> = ({ assistant, isActive, isLocked, onClick }) => (
    <div className="relative w-full group flex justify-center">
        <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 ${isActive && !isLocked ? assistant.iconBgColor : 'bg-transparent'} rounded-r-lg transition-all duration-300`} />
        <button
            onClick={onClick}
            className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 relative ${
            isActive && !isLocked
                ? `scale-110 ring-2 ring-offset-2 ring-offset-gray-100 dark:ring-offset-ocs-dark ${assistant.ringColor}`
                : 'bg-gray-200 dark:bg-ocs-darker'
            } ${isLocked ? 'grayscale opacity-60' : 'hover:rounded-xl'}`}
            aria-label={assistant.name}
        >
            <img src={assistant.icon} alt={assistant.name} className="w-full h-full object-cover rounded-full" />
             {isLocked && (
                <div className="absolute -top-1 -right-1 bg-ocs-purple text-white rounded-full p-0.5 shadow-md">
                    <DiamondIcon className="w-3 h-3" />
                </div>
            )}
        </button>
        <span className="absolute left-16 p-2 px-3 text-sm font-semibold text-white bg-ocs-dark rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-20">
            {assistant.name} {isLocked ? '(Bloqueado)' : ''}
        </span>
    </div>
);

export const Sidebar: React.FC<SidebarProps> = ({
  assistants,
  selectedAssistant,
  onSelectAssistant,
  onNewChat,
  theme,
  setTheme,
  unlockedAssistants,
}) => {
  return (
    <div className="w-20 bg-gray-100 dark:bg-ocs-dark/50 p-3 flex flex-col items-center justify-between border-r border-gray-200 dark:border-ocs-light/10">
      <button className="group" onClick={onNewChat} aria-label="New Chat">
        <img
            src={theme === 'dark' ? 'https://i.imgur.com/H7jW55P.png' : 'https://i.imgur.com/SF0WSiA.png'}
            alt="Olympus Creative Suite Logo"
            className="h-10 w-10 group-hover:scale-110 transition-transform"
        />
      </button>

      <nav className="flex flex-col items-center gap-4 w-full">
        {assistants.map((assistant) => (
          <NavItem
            key={assistant.id}
            assistant={assistant}
            isActive={selectedAssistant.id === assistant.id}
            isLocked={!unlockedAssistants.has(assistant.id)}
            onClick={() => onSelectAssistant(assistant)}
          />
        ))}
      </nav>

      <div className="flex flex-col items-center gap-4">
        <div className="flex flex-col items-center bg-gray-200 dark:bg-ocs-med/80 rounded-full p-1">
            <button
                onClick={() => setTheme('light')}
                className={`p-2 rounded-full transition-colors ${
                theme === 'light' ? 'bg-white text-gray-800' : 'text-gray-500 dark:text-ocs-text-dim'
                }`}
                aria-label="Light mode"
            >
                <SunIcon className="w-5 h-5" /> 
            </button>
            <button
                onClick={() => setTheme('dark')}
                className={`p-2 rounded-full transition-colors ${
                theme === 'dark' ? 'bg-ocs-light text-white' : 'text-gray-500 dark:text-ocs-text-dim'
                }`}
                aria-label="Dark mode"
            >
                <MoonIcon className="w-5 h-5" />
            </button>
        </div>
      </div>
    </div>
  );
};