/**
 * Vendor Data Utility
 * Handles vendor data storage and retrieval from localStorage
 */

const VENDOR_STORAGE_KEYS = {
  ROLE: "role",
  NAME: "name",
  EMAIL: "email",
  PHONE: "phone",
  BUSINESS_NAME: "businessName",
  BUSINESS_ADDRESS: "businessAddress",
  BUSINESS_LICENSE: "businessLicense",
  STORE_NAME: "storeName",
  STORE_DESCRIPTION: "storeDescription",
  TOKEN: "token",
  VENDOR_ID: "vendorId",
};

/**
 * Save vendor details to localStorage
 */
export const saveVendorData = (vendorData) => {
  if (vendorData.role) localStorage.setItem(VENDOR_STORAGE_KEYS.ROLE, vendorData.role);
  if (vendorData.name) localStorage.setItem(VENDOR_STORAGE_KEYS.NAME, vendorData.name);
  if (vendorData.email) localStorage.setItem(VENDOR_STORAGE_KEYS.EMAIL, vendorData.email);
  if (vendorData.phone) localStorage.setItem(VENDOR_STORAGE_KEYS.PHONE, vendorData.phone);
  if (vendorData.businessName) localStorage.setItem(VENDOR_STORAGE_KEYS.BUSINESS_NAME, vendorData.businessName);
  if (vendorData.businessAddress) localStorage.setItem(VENDOR_STORAGE_KEYS.BUSINESS_ADDRESS, vendorData.businessAddress);
  if (vendorData.businessLicense) localStorage.setItem(VENDOR_STORAGE_KEYS.BUSINESS_LICENSE, vendorData.businessLicense);
  if (vendorData.storeName) localStorage.setItem(VENDOR_STORAGE_KEYS.STORE_NAME, vendorData.storeName);
  if (vendorData.storeDescription) localStorage.setItem(VENDOR_STORAGE_KEYS.STORE_DESCRIPTION, vendorData.storeDescription);
  if (vendorData.token) localStorage.setItem(VENDOR_STORAGE_KEYS.TOKEN, vendorData.token);
  if (vendorData.vendorId) localStorage.setItem(VENDOR_STORAGE_KEYS.VENDOR_ID, vendorData.vendorId);
};

/**
 * Get vendor data from localStorage
 */
export const getVendorData = () => {
  return {
    role: localStorage.getItem(VENDOR_STORAGE_KEYS.ROLE) || "",
    name: localStorage.getItem(VENDOR_STORAGE_KEYS.NAME) || "",
    email: localStorage.getItem(VENDOR_STORAGE_KEYS.EMAIL) || "",
    phone: localStorage.getItem(VENDOR_STORAGE_KEYS.PHONE) || "",
    businessName: localStorage.getItem(VENDOR_STORAGE_KEYS.BUSINESS_NAME) || "",
    businessAddress: localStorage.getItem(VENDOR_STORAGE_KEYS.BUSINESS_ADDRESS) || "",
    businessLicense: localStorage.getItem(VENDOR_STORAGE_KEYS.BUSINESS_LICENSE) || "",
    storeName: localStorage.getItem(VENDOR_STORAGE_KEYS.STORE_NAME) || "",
    storeDescription: localStorage.getItem(VENDOR_STORAGE_KEYS.STORE_DESCRIPTION) || "",
    token: localStorage.getItem(VENDOR_STORAGE_KEYS.TOKEN) || "",
    vendorId: localStorage.getItem(VENDOR_STORAGE_KEYS.VENDOR_ID) || "",
  };
};

/**
 * Clear all vendor data from localStorage
 */
export const clearVendorData = () => {
  Object.values(VENDOR_STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
};

/**
 * Update specific vendor field
 */
export const updateVendorField = (field, value) => {
  const key = VENDOR_STORAGE_KEYS[field.toUpperCase()];
  if (key) {
    localStorage.setItem(key, value);
  }
};



