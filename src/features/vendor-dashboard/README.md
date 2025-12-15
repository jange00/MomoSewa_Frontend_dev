# Vendor Dashboard Feature

This folder contains all vendor dashboard related UI components, utilities, and constants.

## 📁 Folder Structure

```
vendor-dashboard/
├── components/          # UI Components
│   ├── DashboardSidebar.jsx
│   ├── DashboardHeader.jsx
│   ├── DashboardWelcome.jsx
│   ├── DashboardStats.jsx
│   ├── DashboardQuickActions.jsx
│   └── DashboardRecentOrders.jsx
├── utils/              # Utility Functions
│   └── formatDate.js
├── constants/          # Constants and Configuration
│   └── menuItems.js
├── modals/             # Modal Components
│   └── (modals can be added here)
└── README.md           # This file
```

## 🚀 Usage

### Import Components

Import directly from component files:

```javascript
import DashboardSidebar from "../features/vendor-dashboard/components/DashboardSidebar";
import DashboardHeader from "../features/vendor-dashboard/components/DashboardHeader";
import DashboardWelcome from "../features/vendor-dashboard/components/DashboardWelcome";
```

### Use Utilities

```javascript
import { formatDate, formatCurrency, getGreeting } from "../features/vendor-dashboard/utils/formatDate";

const formattedDate = formatDate(new Date());
const formattedPrice = formatCurrency(12500);
const greeting = getGreeting(); // "Good Morning", "Good Afternoon", or "Good Evening"
```

### Use Constants

```javascript
import { VENDOR_DASHBOARD_MENU_ITEMS } from "../features/vendor-dashboard/constants/menuItems";

// Access menu items configuration
VENDOR_DASHBOARD_MENU_ITEMS.forEach(item => {
  console.log(item.path, item.label);
});
```

## 🎯 Adding New Features

### Adding New Menu Items

Edit `constants/menuItems.js` to add, remove, or reorder dashboard menu items:

```javascript
export const VENDOR_DASHBOARD_MENU_ITEMS = [
  { path: "/vendor/dashboard", label: "Dashboard", icon: FiHome },
  { path: "/vendor/orders", label: "Orders", icon: FiPackage },
  // Add more items here
];
```

### Adding New Utility Functions

Add utility functions to `utils/formatDate.js` or create a new utility file:

```javascript
// utils/helpers.js
export const newUtilityFunction = (param) => {
  // Implementation
};
```

## 📄 Vendor Portal Pages

The vendor portal includes the following pages:

- `/vendor/dashboard` - Main dashboard with stats and overview
- `/vendor/orders` - Order management
- `/vendor/products` - Product/menu management
- `/vendor/analytics` - Sales and analytics
- `/vendor/notifications` - Notification center
- `/vendor/settings` - Vendor settings
- `/vendor/profile` - Vendor profile

## 🎨 Design System

This feature follows the same design system as the customer dashboard:
- **Colors**: Deep Maroon (#8B2E3D), Golden Amber (#D69E28), Charcoal Grey (#333333)
- **Components**: Uses shared UI components from `src/ui/`
- **Layout**: Sidebar navigation with responsive header



