import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import Header from '../components/dashboard/Header';

const DashboardLayout = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  const handleSidebarCollapse = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed left-0 top-0 h-full transition-all duration-300 z-40">
        <Sidebar 
          isOpen={true} 
          isCollapsed={sidebarCollapsed}
          onCollapseChange={handleSidebarCollapse}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleMobileSidebar}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={`fixed lg:hidden top-0 left-0 h-full transition-transform duration-300 z-50 ${
        mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <Sidebar isOpen={true} isMobile={true} onClose={toggleMobileSidebar} />
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        {/* Header */}
        <Header
          toggleSidebar={toggleSidebar}
          toggleMobileSidebar={toggleMobileSidebar}
          sidebarCollapsed={sidebarCollapsed}
        />

        {/* Page Content */}
        <main className="p-4 lg:p-6" style={{ paddingTop: '5rem' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
