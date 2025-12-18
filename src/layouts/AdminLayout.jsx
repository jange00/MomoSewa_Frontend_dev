import { Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import Navbar from "../features/navbar/components/Navbar";
import DashboardSidebar from "../features/admin-dashboard/components/DashboardSidebar";
import DashboardHeader from "../features/admin-dashboard/components/DashboardHeader";
import { useSocket } from "../hooks/useSocket";

const ADMIN_DASHBOARD_ROUTES = [
  "/admin/dashboard",
  "/admin/orders",
  "/admin/users",
  "/admin/vendors",
  "/admin/analytics",
  "/admin/notifications",
  "/admin/settings",
  "/admin/profile",
];

const AdminLayout = () => {
  const { pathname } = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // Include order detail pages in dashboard layout
  const isDashboardRoute = ADMIN_DASHBOARD_ROUTES.some((route) => pathname.startsWith(route)) || pathname.startsWith("/admin/orders/");

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  // Initialize socket connection for real-time notifications
  useSocket({
    autoConnect: true,
    onNotification: (data) => {
      console.log('New notification received:', data);
      window.dispatchEvent(new CustomEvent('socketNotification', { detail: data }));
    },
    onOrderUpdate: (data) => {
      console.log('Order update received:', data);
      window.dispatchEvent(new CustomEvent('socketOrderUpdate', { detail: data }));
    },
  });

  if (isDashboardRoute) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-charcoal-grey/3 via-white to-golden-amber/5">
        {/* Sidebar */}
        <DashboardSidebar isMobileOpen={isSidebarOpen} onClose={closeSidebar} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col lg:ml-64">
          {/* Header */}
          <DashboardHeader onMenuClick={toggleSidebar} />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    );
  }

  // Default layout with navbar for non-dashboard routes
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;

