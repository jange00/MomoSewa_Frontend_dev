import { useState, useEffect } from "react";
import { FiMenu, FiBell, FiSearch } from "react-icons/fi";
import { Link } from "react-router-dom";

const DashboardHeader = ({ onMenuClick }) => {
  const [notificationCount, setNotificationCount] = useState(0);

  // Calculate notification count from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("adminNotifications");
    if (stored) {
      try {
        const notifications = JSON.parse(stored);
        const unreadCount = notifications.filter((n) => !n.isRead).length;
        setNotificationCount(unreadCount);
      } catch (e) {
        setNotificationCount(5); // Fallback
      }
    } else {
      setNotificationCount(5); // Default mock count
    }

    // Listen for updates
    const handleUpdate = () => {
      const stored = localStorage.getItem("adminNotifications");
      if (stored) {
        try {
          const notifications = JSON.parse(stored);
          const unreadCount = notifications.filter((n) => !n.isRead).length;
          setNotificationCount(unreadCount);
        } catch (e) {
          setNotificationCount(5);
        }
      }
    };

    window.addEventListener("adminNotificationsUpdated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("adminNotificationsUpdated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

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
                placeholder="Search orders, users, vendors..."
                className="w-full pl-12 pr-5 py-2.5 border border-charcoal-grey/12 rounded-xl focus:outline-none focus:ring-2 focus:ring-golden-amber/25 focus:border-golden-amber/35 text-charcoal-grey bg-charcoal-grey/2 hover:bg-charcoal-grey/4 transition-all duration-300 placeholder:text-charcoal-grey/30 text-sm font-medium"
              />
            </div>
          </div> */}
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-3">
          {/* Mobile Search Button */}
          <button className="md:hidden p-2 rounded-lg hover:bg-charcoal-grey/5 text-charcoal-grey/80 transition-all duration-200">
            <FiSearch className="w-5 h-5" />
          </button>

          {/* Notifications */}
          <Link
            to="/admin/notifications"
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

