import React from 'react';
import Sidebar from './Sidebar';

interface AppShellProps {
  children: React.ReactNode;
}

const AppShell: React.FC<AppShellProps> = ({ children }) => (
  <div className="flex min-h-screen w-full">
    <Sidebar />
    <main className="flex-1 p-4 overflow-auto">{children}</main>
  </div>
);

export default AppShell;
