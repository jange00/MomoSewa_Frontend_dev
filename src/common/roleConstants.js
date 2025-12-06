// User Role Constants
export const USER_ROLES = {
  ADMIN: "Admin",
  VENDOR: "Vendor",
  CUSTOMER: "Customer",
};

// Role labels for display
export const ROLE_LABELS = {
  [USER_ROLES.ADMIN]: "Admin",
  [USER_ROLES.VENDOR]: "Vendor",
  [USER_ROLES.CUSTOMER]: "Customer",
};

// Role descriptions for UI
export const ROLE_DESCRIPTIONS = {
  [USER_ROLES.CUSTOMER]: "Order delicious momos and get them delivered to your doorstep",
  [USER_ROLES.VENDOR]: "Sell your momos and manage your business on MomoSewa",
  [USER_ROLES.ADMIN]: "Manage the platform and oversee all operations",
};

// Dashboard routes based on role
export const ROLE_DASHBOARD_ROUTES = {
  [USER_ROLES.ADMIN]: "/admin/dashboard",
  [USER_ROLES.VENDOR]: "/vendor/dashboard",
  [USER_ROLES.CUSTOMER]: "/customer/dashboard",
};

