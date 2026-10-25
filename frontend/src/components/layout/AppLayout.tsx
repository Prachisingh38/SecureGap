import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar, useSidebarState } from './Topbar';
import { Outlet } from 'react-router-dom';

export function AppLayout() {
  const { open, setOpen } = useSidebarState();
  return (
    <div className="min-h-screen bg-background">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="md:pl-72">
        <Topbar onMenu={() => setOpen(true)} />
        <main className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
