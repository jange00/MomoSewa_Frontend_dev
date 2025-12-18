import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "../features/navbar/components/Navbar";
import DashboardSidebar from "../features/vendor-dashboard/components/DashboardSidebar";
import DashboardHeader from "../features/vendor-dashboard/components/DashboardHeader";
import { USER_ROLES } from "../common/roleConstants";
import { useSocket } from "../hooks/useSocket";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";

const VENDOR_DASHBOARD_ROUTES = [
  "/vendor/dashboard",
  "/vendor/orders",
  "/vendor/products",
  "/vendor/analytics",
  "/vendor/notifications",
  "/vendor/settings",
  "/vendor/profile",
];

const VendorLayout = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // Include order detail pages in dashboard layout
  const isDashboardRoute = VENDOR_DASHBOARD_ROUTES.some((route) => pathname.startsWith(route)) || pathname.startsWith("/vendor/orders/");

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

  // Check vendor approval status for dashboard routes (but not for pending approval page itself)
  useEffect(() => {
    if (authLoading) return; // Wait for auth to load
    
    if (isDashboardRoute && pathname !== "/vendor/pending-approval") {
      // Check if user is authenticated
      if (!isAuthenticated || !user) {
        return;
      }

      // IMPORTANT: If user role is "Vendor", they are approved (backend changes role after approval)
      // Don't redirect approved vendors based on status alone
      if (user.role === USER_ROLES.VENDOR) {
        // User is approved vendor - allow access to dashboard
        // Status might not be updated yet, but role change confirms approval
        return;
      }

      // If user role is not Vendor, check status
      // This handles the case where user is still "Customer" role but has vendor application
      const vendorStatus = user.status || user.vendorStatus || user.approvalStatus;
      
      // If status is pending or rejected, redirect to pending approval page
      if (vendorStatus === "pending" || vendorStatus === "rejected") {
        navigate("/vendor/pending-approval", { replace: true });
        return;
      }
      
      // If status is explicitly set and not "active"/"approved", redirect
      // But only if status exists (don't redirect if status is undefined/null)
      if (vendorStatus && vendorStatus !== "active" && vendorStatus !== "approved") {
        navigate("/vendor/pending-approval", { replace: true });
        return;
      }
      
      // If user role is Customer and no status, they might be pending
      // But don't redirect if we're not sure - let them access dashboard
      // The backend will handle authorization
    }
  }, [pathname, isDashboardRoute, navigate, user, isAuthenticated, authLoading]);

  // If on pending approval page, don't show dashboard layout
  if (pathname === "/vendor/pending-approval") {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    );
  }

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

export default VendorLayout;

