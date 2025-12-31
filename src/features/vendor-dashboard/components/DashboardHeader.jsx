import { useState, useEffect } from "react";
import { FiMenu, FiBell, FiSearch, FiX } from "react-icons/fi";
import { Link, useLocation } from "react-router-dom";
import { useGet } from "../../../hooks/useApi";
import { API_ENDPOINTS } from "../../../api/config";
import { useQueryClient } from "@tanstack/react-query";

const DashboardHeader = ({ onMenuClick }) => {
  const location = useLocation();
  const [notificationCount, setNotificationCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const queryClient = useQueryClient();

  // Fetch unread notification count from API
  const { data: unreadCountData, refetch: refetchUnreadCount } = useGet(
    'vendor-notification-unread-count',
    `${API_ENDPOINTS.NOTIFICATIONS}/unread-count`,
    { 
      showErrorToast: false,
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  );

  // Update count from API
  useEffect(() => {
    if (unreadCountData?.data?.count !== undefined) {
      setNotificationCount(unreadCountData.data.count);
    }
  }, [unreadCountData]);

  // Listen for updates from notification pages and socket
  useEffect(() => {
    const handleUpdate = () => {
      // Invalidate and refetch unread count
      queryClient.invalidateQueries({ queryKey: ['vendor-notification-unread-count'] });
      refetchUnreadCount();
    };

    // Listen for custom events
    window.addEventListener("vendorNotificationsUpdated", handleUpdate);
    window.addEventListener("socketNotification", handleUpdate);

    return () => {
      window.removeEventListener("vendorNotificationsUpdated", handleUpdate);
      window.removeEventListener("socketNotification", handleUpdate);
    };
  }, [queryClient, refetchUnreadCount]);

  return (
    <header className="sticky top-0 z-30 bg-white/98 backdrop-blur-xl border-b border-charcoal-grey/10 shadow-sm">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Left Section - Menu Toggle & Search */}
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-charcoal-grey/5 text-charcoal-grey/80 transition-all duration-200"
            aria-label="Toggle menu"
          >
            <FiMenu className="w-6 h-6" />
          </button>

          {/* Search Bar */}
          {/* <div className="hidden md:flex flex-1 max-w-md">
            <div className="relative w-full group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <FiSearch className="w-5 h-5 text-charcoal-grey/35 group-focus-within:text-golden-amber transition-colors duration-300" />
              </div>
              <input
                type="text"
                placeholder={
                  location.pathname.includes("/orders") 
                    ? "Search orders..." 
                    : location.pathname.includes("/products")
                    ? "Search products..."
                    : "Search orders, products..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchQuery.trim()) {
                    // Navigate to appropriate page with search
                    if (location.pathname.includes("/orders")) {
                      // Search is handled in the orders page
                    } else if (location.pathname.includes("/products")) {
                      // Search is handled in the products page
                    } else {
                      // Default: navigate to orders page
                      window.location.href = `/vendor/orders?search=${encodeURIComponent(searchQuery)}`;
                    }
                  }
                }}
                className="w-full pl-12 pr-5 py-2.5 border border-charcoal-grey/12 rounded-xl focus:outline-none focus:ring-2 focus:ring-golden-amber/25 focus:border-golden-amber/35 text-charcoal-grey bg-charcoal-grey/2 hover:bg-charcoal-grey/4 transition-all duration-300 placeholder:text-charcoal-grey/30 text-sm font-medium"
              />
            </div>
          </div> */}
        </div>

        {/* Mobile Search Bar */}
        {showMobileSearch && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-charcoal-grey/10 p-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <FiSearch className="w-5 h-5 text-charcoal-grey/35" />
              </div>
              <input
                type="text"
                placeholder="Search orders, products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-12 py-2.5 border border-charcoal-grey/12 rounded-xl focus:outline-none focus:ring-2 focus:ring-golden-amber/25 focus:border-golden-amber/35 text-charcoal-grey bg-charcoal-grey/2 text-sm font-medium"
                autoFocus
              />
              <button
                onClick={() => {
                  setShowMobileSearch(false);
                  setSearchQuery("");
                }}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-charcoal-grey/60 hover:text-charcoal-grey"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Right Section - Actions */}
        <div className="flex items-center gap-3">
          {/* Mobile Search Button */}
          <button
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            className="md:hidden p-2 rounded-lg hover:bg-charcoal-grey/5 text-charcoal-grey/80 transition-all duration-200"
          >
            {showMobileSearch ? <FiX className="w-5 h-5" /> : <FiSearch className="w-5 h-5" />}
          </button>

          {/* Notifications */}
          <Link
            to="/vendor/notifications"
            className="relative p-2 rounded-lg hover:bg-charcoal-grey/5 text-charcoal-grey/80 transition-all duration-200"
            aria-label="Notifications"
          >
            <FiBell className="w-5 h-5" />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-deep-maroon to-[#6a1f2d] text-white text-xs font-bold shadow-lg">
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;

