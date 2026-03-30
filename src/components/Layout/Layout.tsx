import React from 'react';
import { Header } from './Header';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex flex-col h-screen w-full overflow-hidden relative" style={{ backgroundColor: 'var(--color-bg-main)' }}>
      <Header />
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 lg:p-8" style={{ backgroundColor: 'var(--color-bg-main)' }}>
        {children}
      </main>
    </div>
  );
};
