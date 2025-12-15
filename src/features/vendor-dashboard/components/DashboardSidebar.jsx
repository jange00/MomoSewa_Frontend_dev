import { NavLink, useNavigate } from "react-router-dom";
import { 
  FiX
} from "react-icons/fi";
import { useState } from "react";
import toast from "react-hot-toast";
import Logo from "../../../common/Logo";
import { VENDOR_DASHBOARD_MENU_ITEMS } from "../constants/menuItems";
import { FiLogOut } from "react-icons/fi";
import { getVendorData, clearVendorData } from "../../../utils/vendorData";

const DashboardSidebar = ({ isMobileOpen, onClose }) => {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const vendorData = getVendorData();

  // Get user name from vendor data or default
  const userName = vendorData.name || vendorData.businessName || "Vendor";
  const userEmail = vendorData.email || "";

  const handleLogout = () => {
    setIsLoggingOut(true);
    // Clear all vendor data
    clearVendorData();
    toast.success("Logged out successfully");
    // Redirect to login
    setTimeout(() => {
      navigate("/login");
    }, 300);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white/98 backdrop-blur-xl border-r border-charcoal-grey/10 z-50 lg:z-auto transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-charcoal-grey/10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Logo size="default" />
                <div className="flex flex-col">
                  <h1 className="text-xl font-black text-charcoal-grey leading-tight">
                    <span className="text-deep-maroon">Momo</span>Sewa
                  </h1>
                  <span className="text-xs text-charcoal-grey/60 font-medium">Vendor Portal</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="lg:hidden p-2 rounded-lg hover:bg-charcoal-grey/5 text-charcoal-grey/60"
                aria-label="Close menu"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* User Profile Card */}
            <div className="bg-gradient-to-br from-deep-maroon/10 via-golden-amber/5 to-deep-maroon/10 rounded-xl p-4 border border-charcoal-grey/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-deep-maroon to-golden-amber flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-charcoal-grey truncate">{userName}</p>
                  {userEmail && (
                    <p className="text-xs text-charcoal-grey/60 truncate">{userEmail}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action - Manage Products Button */}
          <div className="px-4 pb-4">
            <NavLink
              to="/vendor/products"
              onClick={() => onClose && onClose()}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-deep-maroon via-[#7a2533] to-deep-maroon text-white font-bold text-sm hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-lg relative overflow-hidden group"
            >
              <span className="text-lg">🍽️</span>
              <span>Manage Products</span>
              <div className="absolute inset-0 bg-gradient-to-r from-golden-amber/25 via-transparent to-golden-amber/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </NavLink>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1">
              {VENDOR_DASHBOARD_MENU_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => onClose && onClose()}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 group ${
                        isActive
                          ? "bg-gradient-to-r from-deep-maroon to-[#7a2533] text-white shadow-lg"
                          : "text-charcoal-grey/70 hover:bg-charcoal-grey/5 hover:text-deep-maroon"
                      }`
                    }
                  >
                    <Icon className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </nav>

          {/* Footer Actions */}
          <div className="p-4 border-t border-charcoal-grey/10">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm text-red-600 hover:bg-red-50 transition-all duration-200 disabled:opacity-50"
            >
              <FiLogOut className="w-5 h-5" />
              <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default DashboardSidebar;

