import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cn('block px-3 py-2 rounded hover:bg-gray-700/50', isActive && 'bg-gray-700');

const Sidebar: React.FC = () => (
  <aside className="w-48 bg-gray-800 text-white flex-shrink-0">
    <nav className="p-4 space-y-1">
      <NavLink to="/dashboard" className={linkClass}>
        Dashboard
      </NavLink>
      <NavLink to="/expenses" className={linkClass}>
        Expenses
      </NavLink>
      <NavLink to="/income" className={linkClass}>
        Income
      </NavLink>
      <NavLink to="/settings" className={linkClass}>
        Settings
      </NavLink>
    </nav>
  </aside>
);

export default Sidebar;
