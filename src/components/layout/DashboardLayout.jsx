'use client';

import { useState } from 'react';
import { AppHeader } from '@/features/navigation/components/AppHeader';
import { AppSidebar } from '@/features/navigation/components/AppSidebar';
import { Footer } from './Footer';

export function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <div className="flex h-full">
        {/* Sidebar - Fixed on the left */}
        <AppSidebar isOpen={sidebarOpen} onClose={closeSidebar} />
        
        {/* Main content area - Header + Content + Footer */}
        <div className="flex-1 flex flex-col h-full">
          {/* Header - Full width next to sidebar */}
          <AppHeader onMenuClick={toggleSidebar} />
          
          {/* Main content - Scrollable area */}
          <main className="flex-1 px-4 sm:px-6 py-3 w-full overflow-y-auto overflow-x-hidden" style={{ minHeight: 0 }}>
            {children}
          </main>
          
          {/* Footer - Only in main content area, not overlapping sidebar */}
          <Footer />
        </div>
      </div>
    </div>
  );
}
