# Customer Dashboard Feature

This folder contains all customer dashboard related UI components, utilities, and constants.

## 📁 Folder Structure

```
customer-dashboard/
├── components/          # UI Components
│   ├── DashboardSidebar.jsx
│   └── DashboardHeader.jsx
├── utils/              # Utility Functions
│   └── formatDate.js
├── constants/          # Constants and Configuration
│   └── menuItems.js
└── README.md           # This file
```

## 🚀 Usage

### Import Components

Import directly from component files:

```javascript
import DashboardSidebar from "../features/customer-dashboard/components/DashboardSidebar";
import DashboardHeader from "../features/customer-dashboard/components/DashboardHeader";
import DashboardWelcome from "../features/customer-dashboard/components/DashboardWelcome";
import OrdersTabs from "../features/customer-dashboard/components/OrdersTabs";
```

### Use Utilities

```javascript
import { formatDate, formatCurrency, getGreeting } from "../features/customer-dashboard/utils/formatDate";

const formattedDate = formatDate(new Date());
const formattedPrice = formatCurrency(12500);
const greeting = getGreeting(); // "Good Morning", "Good Afternoon", or "Good Evening"
```

### Use Constants

```javascript
import { DASHBOARD_MENU_ITEMS } from "../features/customer-dashboard/constants/menuItems";

// Access menu items configuration
DASHBOARD_MENU_ITEMS.forEach(item => {
  console.log(item.path, item.label);
});
```

## 🎯 Adding New Features

### Adding New Menu Items

Edit `constants/menuItems.js` to add, remove, or reorder dashboard menu items:

```javascript
export const DASHBOARD_MENU_ITEMS = [
  { path: "/customer/dashboard", label: "Dashboard", icon: FiHome },
  { path: "/customer/orders", label: "My Orders", icon: FiPackage },
  // Add more items here
];
```

### Adding New Utility Functions

Add utility functions to `utils/formatDate.js` or create a new utility file:

```javascript
// utils/helpers.js
export const newUtilityFunction = (param) => {
  // Your utility logic
  return result;
};
```

Then import it directly where needed:

```javascript
import { newUtilityFunction } from "../features/customer-dashboard/utils/helpers";
```

## 📦 Dependencies

- `react-router-dom` - For navigation
- `react-icons/fi` - For icons

## 🔧 Configuration

### Menu Items

Edit `constants/menuItems.js` to customize the dashboard navigation menu.

## 📝 Future API Integration

When you're ready to integrate with the backend:

1. Create a `services/` folder with API functions
2. Create a `hooks/` folder with custom hooks for data fetching
3. Update this README with API integration instructions

