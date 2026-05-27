import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/sidebar/Sidebar';
import Header from '@/components/header/Header';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 min-h-screen ml-0 md:ml-[280px] bg-background">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <div className="p-gutter md:p-margin-page max-w-container-max mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
