import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "../features/navbar/components/Navbar";
import DashboardSidebar from "../features/vendor-dashboard/components/DashboardSidebar";
import DashboardHeader from "../features/vendor-dashboard/components/DashboardHeader";
import { getVendorStatus } from "../utils/pendingVendors";
import { USER_ROLES } from "../common/roleConstants";
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // Include order detail pages in dashboard layout
  const isDashboardRoute = VENDOR_DASHBOARD_ROUTES.some((route) => pathname.startsWith(route)) || pathname.startsWith("/vendor/orders/");

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  // Check vendor approval status for dashboard routes (but not for pending approval page itself)
  useEffect(() => {
    if (isDashboardRoute && pathname !== "/vendor/pending-approval") {
      const role = localStorage.getItem("role");
      const email = localStorage.getItem("email");

      if (role === USER_ROLES.VENDOR && email) {
        const vendorStatus = getVendorStatus(email);
        
        if (vendorStatus === "pending") {
          navigate("/vendor/pending-approval");
          return;
        } else if (vendorStatus === "rejected") {
          navigate("/vendor/pending-approval");
          return;
        } else if (vendorStatus !== "active") {
          navigate("/vendor/pending-approval");
          return;
        }
      }
    }
  }, [pathname, isDashboardRoute, navigate]);

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

