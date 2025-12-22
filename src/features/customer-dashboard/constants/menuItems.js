import { 
  FiHome, 
  FiPackage, 
  FiMapPin, 
  FiStar,
  FiBell,
  FiUser
} from "react-icons/fi";

// Dashboard menu items configuration
// This can be easily extended or modified for different user roles or permissions
export const DASHBOARD_MENU_ITEMS = [
  { path: "/customer/dashboard", label: "Dashboard", icon: FiHome },
  { path: "/customer/orders", label: "My Orders", icon: FiPackage },
  { path: "/customer/addresses", label: "Addresses", icon: FiMapPin },
  { path: "/customer/reviews", label: "My Reviews", icon: FiStar },
  { path: "/customer/notifications", label: "Notifications", icon: FiBell },
  { path: "/customer/profile", label: "Profile & Settings", icon: FiUser },
];

