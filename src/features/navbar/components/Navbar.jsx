import { FiSearch, FiShoppingCart, FiMenu, FiX } from "react-icons/fi";
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Logo from "../../../common/Logo";
import UserMenuDropdown from "./UserMenuDropdown";
import { USER_ROLES } from "../../../common/roleConstants";
import { DASHBOARD_MENU_ITEMS } from "../../customer-dashboard/constants/menuItems";
import { useAuth } from "../../../hooks/useAuth";
import { getUser, isAuthenticated } from "../../../utils/tokenManager";
import { useGet } from "../../../hooks/useApi";
import { API_ENDPOINTS } from "../../../api/config";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  // Normalize role (handle case variations from backend)
  const normalizeRole = (role) => {
    if (!role) return null;
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  };

  // Check if user is logged in (any role)
  const userRole = normalizeRole(user?.role);
  const [isCustomerLoggedIn, setIsCustomerLoggedIn] = useState(false);
  const [isAnyUserLoggedIn, setIsAnyUserLoggedIn] = useState(false);

  // Fetch cart data for customers
  const { data: cartData, refetch: refetchCart } = useGet(
    'cart',
    API_ENDPOINTS.CART,
    { 
      showErrorToast: false,
      enabled: isAuthenticated && userRole === USER_ROLES.CUSTOMER
    }
  );

  // Listen for cart updates
  useEffect(() => {
    const handleCartUpdate = () => {
      if (isAuthenticated && userRole === USER_ROLES.CUSTOMER) {
        refetchCart();
      }
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, [isAuthenticated, userRole, refetchCart]);

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

  // Update auth state when it changes
  useEffect(() => {
    setIsCustomerLoggedIn(
      isAuthenticated && userRole === USER_ROLES.CUSTOMER
    );
    setIsAnyUserLoggedIn(isAuthenticated && userRole); // Any authenticated user
  }, [isAuthenticated, userRole]);

  // Listen for auth state changes from other components (like logout/login)
  useEffect(() => {
    const handleAuthStateChange = () => {
      // Force re-check of auth state by reading directly from storage
      // This ensures we get the latest state even if useAuth hasn't updated yet
      const storedUser = getUser();
      const hasToken = isAuthenticated();
      const currentRole = normalizeRole(storedUser?.role);
      
      // Update state immediately based on storage
      setIsAnyUserLoggedIn(hasToken && currentRole);
      setIsCustomerLoggedIn(hasToken && currentRole === USER_ROLES.CUSTOMER);
    };

    window.addEventListener('authStateChanged', handleAuthStateChange);
    return () => {
      window.removeEventListener('authStateChanged', handleAuthStateChange);
    };
  }, []);

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/menu", label: "Menu" },
    { path: "/about", label: "About" },
    { path: "/contact", label: "Contact" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white/98 backdrop-blur-xl shadow-sm border-b border-charcoal-grey/8 sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo Section - Premium */}
          <Link to="/" className="flex items-center gap-3.5 group flex-shrink-0">
            <Logo size="default" />
            <div className="flex flex-col justify-center">
              <h1 className="text-2xl font-bold text-charcoal-grey group-hover:text-deep-maroon transition-colors duration-200 leading-none tracking-tight">
                <span className="font-extrabold">Momo</span>
                <span className="text-deep-maroon font-extrabold">Sewa</span>
              </h1>
            </div>
          </Link>

          {/* Desktop Navigation Links - Premium */}
          <div className="hidden lg:flex items-center gap-0.5 mx-10">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 ${
                  isActive(link.path)
                    ? "text-deep-maroon"
                    : "text-charcoal-grey/80 hover:text-deep-maroon"
                }`}
              >
                <span className="relative z-10">{link.label}</span>
                {isActive(link.path) && (
                  <>
                    <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-golden-amber rounded-full"></span>
                    <span className="absolute inset-0 bg-deep-maroon/5 rounded-lg"></span>
                  </>
                )}
                {!isActive(link.path) && (
                  <span className="absolute inset-0 bg-charcoal-grey/0 hover:bg-charcoal-grey/5 rounded-lg transition-colors duration-200"></span>
                )}
              </Link>
            ))}
          </div>

          {/* Search Bar - Premium */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <FiSearch className="w-5 h-5 text-charcoal-grey/35 group-focus-within:text-golden-amber transition-colors duration-300" />
              </div>
              <input
                type="text"
                placeholder="Search menu items..."
                className="w-full pl-12 pr-5 py-3 border border-charcoal-grey/12 rounded-2xl focus:outline-none focus:ring-2 focus:ring-golden-amber/25 focus:border-golden-amber/35 text-charcoal-grey bg-charcoal-grey/2 hover:bg-charcoal-grey/4 transition-all duration-300 placeholder:text-charcoal-grey/30 text-sm font-medium shadow-sm hover:shadow-md focus:shadow-lg"
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-golden-amber/0 to-transparent group-focus-within:via-golden-amber/3 pointer-events-none transition-all duration-300"></div>
            </div>
          </div>

          {/* Right Section - Premium */}
          <div className="flex items-center gap-3">
            {/* Shopping Cart - Premium */}
            <Link 
              to="/cart" 
              className="relative p-3 rounded-xl hover:bg-charcoal-grey/5 transition-all duration-300 group"
              aria-label="Shopping Cart"
            >
              <FiShoppingCart className="w-6 h-6 text-charcoal-grey/80 group-hover:text-deep-maroon transition-colors duration-300" />
              {isCustomerLoggedIn && cartItemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-deep-maroon to-[#6a1f2d] text-white text-[11px] font-bold shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 ring-2 ring-white">
                  {cartItemCount > 9 ? "9+" : cartItemCount}
                </span>
              )}
            </Link>

            {/* Divider */}
            <div className="hidden sm:block w-px h-8 bg-charcoal-grey/10"></div>

            {/* User Menu Dropdown (if logged in) or Login Button (if not logged in) */}
            {isAnyUserLoggedIn ? (
              <UserMenuDropdown />
            ) : (
              <Link
                to="/login"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-deep-maroon via-[#7a2533] to-deep-maroon text-white font-semibold text-sm hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-lg relative overflow-hidden group"
              >
                <span className="relative z-10 tracking-wide">Login</span>
                <div className="absolute inset-0 bg-gradient-to-r from-golden-amber/25 via-transparent to-golden-amber/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
            )}

            {/* Mobile Menu Button - Premium */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl hover:bg-charcoal-grey/5 transition-all duration-200 text-charcoal-grey/80 hover:text-charcoal-grey"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <FiX className="w-6 h-6" />
              ) : (
                <FiMenu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu - Premium */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-charcoal-grey/8 py-5 bg-white/98 backdrop-blur-xl">
            <div className="flex flex-col gap-1.5">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    isActive(link.path)
                      ? "text-deep-maroon bg-deep-maroon/8"
                      : "text-charcoal-grey/80 hover:text-deep-maroon hover:bg-charcoal-grey/5"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {/* Customer Dashboard Links - Mobile */}
              {isCustomerLoggedIn && (
                <>
                  <div className="px-5 pt-3 pb-1">
                    <p className="text-xs font-bold text-charcoal-grey/50 uppercase tracking-wider">
                      My Account
                    </p>
                  </div>
                  {DASHBOARD_MENU_ITEMS.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsMenuOpen(false)}
                        className={`px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center gap-3 ${
                          isActive(item.path)
                            ? "text-deep-maroon bg-deep-maroon/8"
                            : "text-charcoal-grey/80 hover:text-deep-maroon hover:bg-charcoal-grey/5"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </>
              )}

              {/* Mobile Search - Premium */}
              <div className="px-5 pt-3">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <FiSearch className="w-5 h-5 text-charcoal-grey/35" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search menu items..."
                    className="w-full pl-12 pr-5 py-3 border border-charcoal-grey/12 rounded-2xl focus:outline-none focus:ring-2 focus:ring-golden-amber/25 focus:border-golden-amber/35 text-charcoal-grey bg-charcoal-grey/2 text-sm font-medium shadow-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

