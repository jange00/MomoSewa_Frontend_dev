import { useState, useEffect } from "react";
import { FiMenu, FiBell, FiSearch } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useGet } from "../../../hooks/useApi";
import { API_ENDPOINTS } from "../../../api/config";
import { useAuth } from "../../../hooks/useAuth";
import { USER_ROLES } from "../../../common/roleConstants";
import { useQueryClient } from "@tanstack/react-query";

const DashboardHeader = ({ onMenuClick }) => {
  const [notificationCount, setNotificationCount] = useState(0);
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch unread notification count from API
  const { data: unreadCountData, refetch: refetchUnreadCount } = useGet(
    'notification-unread-count',
    `${API_ENDPOINTS.NOTIFICATIONS}/unread-count`,
    { 
      showErrorToast: false,
      refetchInterval: 30000, // Refetch every 30 seconds
      enabled: isAuthenticated,
    }
  );

  // Fetch cart data
  const { data: cartData, refetch: refetchCart } = useGet(
    'cart',
    API_ENDPOINTS.CART,
    { 
      showErrorToast: false,
      enabled: isAuthenticated && user?.role === USER_ROLES.CUSTOMER
    }
  );

  // Listen for cart updates
  useEffect(() => {
    const handleCartUpdate = () => {
      if (isAuthenticated && user?.role === USER_ROLES.CUSTOMER) {
        refetchCart();
      }
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, [isAuthenticated, user, refetchCart]);

  // Calculate cart item count
  // Backend returns: { success: true, data: { cart: { items: [], promoCode: null } } }
  const cartItems = Array.isArray(cartData?.data?.cart?.items) 
    ? cartData.data.cart.items 
    : Array.isArray(cartData?.data?.items) 
    ? cartData.data.items 
    : Array.isArray(cartData?.data) 
    ? cartData.data 
    : [];
  
  const cartItemCount = cartItems.length;

  // Update count from API or event
  useEffect(() => {
    if (unreadCountData?.data?.count !== undefined) {
      setNotificationCount(unreadCountData.data.count);
    }
  }, [unreadCountData]);

  // Listen for updates from notification pages and socket
  useEffect(() => {
    const handleUpdate = () => {
      // Invalidate and refetch unread count
      queryClient.invalidateQueries({ queryKey: ['notification-unread-count'] });
      refetchUnreadCount();
    };

    // Listen for custom events
    window.addEventListener("customerNotificationsUpdated", handleUpdate);
    window.addEventListener("socketNotification", handleUpdate);

    return () => {
      window.removeEventListener("customerNotificationsUpdated", handleUpdate);
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
          <div className="hidden md:flex flex-1 max-w-md">
            <div className="relative w-full group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <FiSearch className="w-5 h-5 text-charcoal-grey/35 group-focus-within:text-golden-amber transition-colors duration-300" />
              </div>
              <input
                type="text"
                placeholder="Search orders, items..."
                className="w-full pl-12 pr-5 py-2.5 border border-charcoal-grey/12 rounded-xl focus:outline-none focus:ring-2 focus:ring-golden-amber/25 focus:border-golden-amber/35 text-charcoal-grey bg-charcoal-grey/2 hover:bg-charcoal-grey/4 transition-all duration-300 placeholder:text-charcoal-grey/30 text-sm font-medium"
              />
            </div>
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-3">
          {/* Mobile Search Button */}
          <button className="md:hidden p-2 rounded-lg hover:bg-charcoal-grey/5 text-charcoal-grey/80 transition-all duration-200">
            <FiSearch className="w-5 h-5" />
          </button>

          {/* Notifications */}
          <Link
            to="/customer/notifications"
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

          {/* Cart */}
          <Link
            to="/cart"
            className="relative p-2 rounded-lg hover:bg-charcoal-grey/5 text-charcoal-grey/80 transition-all duration-200"
            aria-label="Shopping Cart"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {cartItemCount > 0 && (
              <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-br from-deep-maroon to-[#6a1f2d] text-white text-[10px] font-bold">
                {cartItemCount > 9 ? "9+" : cartItemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;

