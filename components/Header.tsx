
import React from 'react';
import { PlusIcon } from './Icons';

export const Header: React.FC = () => {
  return (
    <header className="absolute top-0 right-0 p-6 z-10">
      <button className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold bg-white text-ocs-dark rounded-lg shadow-sm hover:bg-gray-100 transition-colors">
        <span className="bg-ocs-blue text-white rounded-md p-0.5 flex items-center justify-center">
            <PlusIcon className="w-4 h-4" />
        </span>
        <span>Conta</span>
      </button>
    </header>
  );
};
