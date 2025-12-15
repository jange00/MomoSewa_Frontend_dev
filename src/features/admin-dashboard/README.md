# Admin Dashboard Feature

This folder contains all admin dashboard related UI components, utilities, and constants.

## 📁 Folder Structure

```
admin-dashboard/
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
import DashboardSidebar from "../features/admin-dashboard/components/DashboardSidebar";
import DashboardHeader from "../features/admin-dashboard/components/DashboardHeader";
import DashboardWelcome from "../features/admin-dashboard/components/DashboardWelcome";
import DashboardStats from "../features/admin-dashboard/components/DashboardStats";
import DashboardQuickActions from "../features/admin-dashboard/components/DashboardQuickActions";
import DashboardRecentOrders from "../features/admin-dashboard/components/DashboardRecentOrders";
```

### Use Utilities

```javascript
import { formatDate, formatCurrency, getGreeting } from "../features/admin-dashboard/utils/formatDate";

const formattedDate = formatDate(new Date());
const formattedPrice = formatCurrency(12500);
const greeting = getGreeting(); // "Good Morning", "Good Afternoon", or "Good Evening"
```

### Use Constants

```javascript
import { ADMIN_DASHBOARD_MENU_ITEMS } from "../features/admin-dashboard/constants/menuItems";

// Access menu items configuration
ADMIN_DASHBOARD_MENU_ITEMS.forEach(item => {
  console.log(item.path, item.label);
});
```

## 🎯 Adding New Features

### Adding New Menu Items

Edit `constants/menuItems.js` to add, remove, or reorder dashboard menu items:

```javascript
export const ADMIN_DASHBOARD_MENU_ITEMS = [
  { path: "/admin/dashboard", label: "Dashboard", icon: FiHome },
  { path: "/admin/orders", label: "All Orders", icon: FiPackage },
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

Then import it directly where needed:

```javascript
import { newUtilityFunction } from "../features/admin-dashboard/utils/helpers";
```

## 📄 Admin Portal Pages

The admin portal includes the following pages:

- `/admin/dashboard` - Main dashboard with platform stats and overview
- `/admin/orders` - All orders management across the platform
- `/admin/users` - User management (customers and vendors)
- `/admin/vendors` - Vendor management and approval
- `/admin/analytics` - Platform-wide analytics and insights
- `/admin/notifications` - Notification center (to be implemented)
- `/admin/settings` - Platform settings (to be implemented)
- `/admin/profile` - Admin profile (to be implemented)

## 🎨 Design System

This feature follows the same design system as the customer and vendor dashboards:
- **Colors**: Deep Maroon (#8B2E3D), Golden Amber (#D69E28), Charcoal Grey (#333333)
- **Components**: Uses shared UI components from `src/ui/`
- **Layout**: Sidebar navigation with responsive header

## 🔧 Component Details

### DashboardSidebar
- Navigation sidebar with menu items
- User profile card
- Quick action button (Platform Analytics)
- Logout functionality
- Responsive mobile menu

### DashboardHeader
- Top header bar with search
- Notification bell with count
- Mobile menu toggle
- Sticky positioning

### DashboardWelcome
- Personalized greeting based on time of day
- Welcome message for admin

### DashboardStats
- Platform-wide statistics:
  - Total Orders
  - Total Users
  - Total Vendors
  - Platform Revenue
- Trend indicators for each stat

### DashboardQuickActions
- Quick access buttons to:
  - View Orders
  - Manage Users
  - Manage Vendors
  - Analytics
  - Settings
  - Security

### DashboardRecentOrders
- Recent orders overview
- Link to full orders page
- Uses RecentOrderCard component

## 📦 Dependencies

- `react-router-dom` - For navigation
- `react-icons/fi` - For icons
- `react-hot-toast` - For notifications (used in sidebar logout)

## 🔐 Security & Permissions

The admin dashboard is protected by:
- `ProtectedRoute` component checking for `USER_ROLES.ADMIN`
- Admin-specific layout wrapper
- Role-based route access

## 📝 Future API Integration

When you're ready to integrate with the backend:

1. Create a `services/` folder with API functions
2. Create a `hooks/` folder with custom hooks for data fetching
3. Replace mock data in page components with API calls
4. Update this README with API integration instructions

## 🎯 Admin-Specific Features

### User Management
- View all users (customers and vendors)
- Filter by role
- Search functionality
- User details and actions

### Vendor Management
- View all vendors
- Filter by status (active, pending)
- Vendor approval workflow
- Vendor details and actions

### Order Management
- View all orders across platform
- Filter by status
- Search orders
- Order details and management

### Analytics
- Platform-wide statistics
- Revenue tracking
- User growth metrics
- Vendor performance
- Recent activity feed

