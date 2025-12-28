import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { FiChevronDown, FiLogOut } from "react-icons/fi";
import { DASHBOARD_MENU_ITEMS } from "../../customer-dashboard/constants/menuItems";
import { VENDOR_DASHBOARD_MENU_ITEMS } from "../../vendor-dashboard/constants/menuItems";
import { ADMIN_DASHBOARD_MENU_ITEMS } from "../../admin-dashboard/constants/menuItems";
import { USER_ROLES, ROLE_DASHBOARD_ROUTES } from "../../../common/roleConstants";
import { useAuth } from "../../../hooks/useAuth";

const UserMenuDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  // Get user info from useAuth hook
  const userName = user?.name || user?.storeName || user?.businessName || "User";
  const userRole = user?.role;
  
  // Normalize role (handle case variations from backend)
  const normalizeRole = (role) => {
    if (!role) return null;
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  };
  
  const normalizedRole = normalizeRole(userRole);
  
  // Get menu items based on role
  const getMenuItems = () => {
    if (normalizedRole === USER_ROLES.CUSTOMER) {
      return DASHBOARD_MENU_ITEMS;
    } else if (normalizedRole === USER_ROLES.VENDOR) {
      return VENDOR_DASHBOARD_MENU_ITEMS;
    } else if (normalizedRole === USER_ROLES.ADMIN) {
      return ADMIN_DASHBOARD_MENU_ITEMS;
    }
    return [];
  };
  
  const menuItems = getMenuItems();
  const dashboardRoute = normalizedRole ? ROLE_DASHBOARD_ROUTES[normalizedRole] : null;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close dropdown when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    // Close dropdown
    setIsOpen(false);
    // Use logout from useAuth hook
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Show for any authenticated user (Customer, Vendor, or Admin)
  if (!isAuthenticated || !normalizedRole) {
    return null;
  }

  return (
    <div className="relative z-50" ref={dropdownRef}>
      {/* User Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-deep-maroon via-[#7a2533] to-deep-maroon text-white font-semibold text-sm hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-lg relative overflow-hidden group"
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-sm border border-white/30">
          {userName.charAt(0).toUpperCase()}
        </div>
        {/* User Name */}
        <span className="relative z-10 tracking-wide hidden sm:inline-block">
          {userName.split(" ")[0]}
        </span>
        {/* Chevron Icon */}
        <FiChevronDown
          className={`w-4 h-4 relative z-10 transition-transform duration-300 ${
            isOpen ? "transform rotate-180" : ""
          }`}
        />
        {/* Hover Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-golden-amber/25 via-transparent to-golden-amber/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Content */}
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-charcoal-grey/10 overflow-hidden">
            {/* User Info Section */}
            <div className="px-4 py-4 border-b border-charcoal-grey/10 bg-gradient-to-br from-deep-maroon/10 via-golden-amber/5 to-deep-maroon/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-deep-maroon to-golden-amber flex items-center justify-center text-white font-bold text-sm shadow-md">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-charcoal-grey text-sm truncate">{userName}</p>
                  <p className="text-xs text-charcoal-grey/60 font-medium">
                    {normalizedRole === USER_ROLES.CUSTOMER ? "My Account" : 
                     normalizedRole === USER_ROLES.VENDOR ? "Vendor Portal" : 
                     normalizedRole === USER_ROLES.ADMIN ? "Admin Panel" : "Account"}
                  </p>
                </div>
              </div>
            </div>

            {/* Dashboard Link Button - Prominent */}
            {dashboardRoute && (
              <div className="px-4 pt-2 pb-3">
                <Link
                  to={dashboardRoute}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-deep-maroon via-[#7a2533] to-deep-maroon text-white font-bold text-sm hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-lg relative overflow-hidden group"
                >
                  <span className="text-lg">🏠</span>
                  <span>{normalizedRole === USER_ROLES.CUSTOMER ? "Order Now" : "Go to Dashboard"}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-golden-amber/25 via-transparent to-golden-amber/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
              </div>
            )}

            {/* Menu Items */}
            <div className="py-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + "/");

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 font-semibold text-sm transition-all duration-200 ${
                      isActive
                        ? "bg-deep-maroon/10 text-deep-maroon"
                        : "text-charcoal-grey/70 hover:bg-charcoal-grey/5 hover:text-deep-maroon"
                    }`}
                  >
                    {Icon && <Icon className="w-5 h-5 flex-shrink-0" />}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Divider */}
            <div className="border-t border-charcoal-grey/10"></div>

            {/* Logout Button */}
            <div className="p-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold text-sm text-red-600 hover:bg-red-50 transition-all duration-200"
              >
                <FiLogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserMenuDropdown;

