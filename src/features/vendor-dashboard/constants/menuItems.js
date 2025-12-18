import { 
  FiHome, 
  FiPackage, 
  FiShoppingBag, 
  FiBarChart2,
  FiSettings,
  FiUser,
  FiBell
} from "react-icons/fi";

/**
 * Vendor Dashboard menu items configuration
 * This can be easily extended or modified for different vendor permissions
 */
export const VENDOR_DASHBOARD_MENU_ITEMS = [
  { path: "/vendor/dashboard", label: "Dashboard", icon: FiHome },
  { path: "/vendor/orders", label: "Orders", icon: FiPackage },
  { path: "/vendor/products", label: "Products", icon: FiShoppingBag },
  { path: "/vendor/analytics", label: "Analytics", icon: FiBarChart2 },
  { path: "/vendor/notifications", label: "Notifications", icon: FiBell },
  { path: "/vendor/settings", label: "Settings", icon: FiSettings },
  { path: "/vendor/profile", label: "Profile", icon: FiUser },
];




