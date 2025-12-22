import { 
  FiHome, 
  FiPackage, 
  FiUsers, 
  FiShoppingBag,
  FiBarChart2,
  FiSettings,
  FiBell,
  FiUser
} from "react-icons/fi";

 // Admin Dashboard menu items configuration
 // This can be easily extended or modified for different admin permissions
 
export const ADMIN_DASHBOARD_MENU_ITEMS = [
  { path: "/admin/dashboard", label: "Dashboard", icon: FiHome },
  { path: "/admin/orders", label: "All Orders", icon: FiPackage },
  { path: "/admin/users", label: "Users", icon: FiUsers },
  { path: "/admin/vendors", label: "Vendors", icon: FiShoppingBag },
  { path: "/admin/analytics", label: "Analytics", icon: FiBarChart2 },
  { path: "/admin/notifications", label: "Notifications", icon: FiBell },
  { path: "/admin/settings", label: "Settings", icon: FiSettings },
  { path: "/admin/profile", label: "Profile", icon: FiUser },
];

