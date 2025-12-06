/**
 * Pending Vendors Utility
 * Manages vendor applications that are waiting for admin approval
 */

const PENDING_VENDORS_KEY = "pendingVendors";
const APPROVED_VENDORS_KEY = "approvedVendors";

/**
 * Get all pending vendors
 */
export const getPendingVendors = () => {
  try {
    const stored = localStorage.getItem(PENDING_VENDORS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error reading pending vendors:", error);
    return [];
  }
};

/**
 * Add a new pending vendor application
 */
export const addPendingVendor = (vendorData) => {
  try {
    const pendingVendors = getPendingVendors();
    const newVendor = {
      id: `VENDOR-${Date.now()}`,
      ...vendorData,
      status: "pending",
      applicationDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    
    // Check if vendor with same email already exists
    const existingVendor = pendingVendors.find(
      (v) => v.email === vendorData.email
    );
    
    if (existingVendor) {
      throw new Error("Vendor application with this email already exists");
    }
    
    pendingVendors.push(newVendor);
    localStorage.setItem(PENDING_VENDORS_KEY, JSON.stringify(pendingVendors));
    return newVendor;
  } catch (error) {
    console.error("Error adding pending vendor:", error);
    throw error;
  }
};

/**
 * Approve a pending vendor
 */
export const approveVendor = (vendorId) => {
  try {
    const pendingVendors = getPendingVendors();
    const vendorIndex = pendingVendors.findIndex((v) => v.id === vendorId);
    
    if (vendorIndex === -1) {
      throw new Error("Vendor not found");
    }
    
    const approvedVendor = {
      ...pendingVendors[vendorIndex],
      status: "active",
      approvedDate: new Date().toISOString(),
    };
    
    // Remove from pending list
    pendingVendors.splice(vendorIndex, 1);
    localStorage.setItem(PENDING_VENDORS_KEY, JSON.stringify(pendingVendors));
    
    // Add to approved vendors list
    const approvedVendors = getApprovedVendors();
    approvedVendors.push(approvedVendor);
    localStorage.setItem(APPROVED_VENDORS_KEY, JSON.stringify(approvedVendors));
    
    // Update vendor's localStorage data to mark as approved
    // This allows them to log in and access dashboard
    if (approvedVendor.email === localStorage.getItem("email")) {
      localStorage.setItem("vendorApproved", "true");
      localStorage.setItem("vendorStatus", "active");
    }
    
    // Trigger event for real-time updates
    window.dispatchEvent(new CustomEvent("vendorApproved", { detail: approvedVendor }));
    
    return approvedVendor;
  } catch (error) {
    console.error("Error approving vendor:", error);
    throw error;
  }
};

/**
 * Reject a pending vendor
 */
export const rejectVendor = (vendorId) => {
  try {
    const pendingVendors = getPendingVendors();
    const vendorIndex = pendingVendors.findIndex((v) => v.id === vendorId);
    
    if (vendorIndex === -1) {
      throw new Error("Vendor not found");
    }
    
    const rejectedVendor = {
      ...pendingVendors[vendorIndex],
      status: "rejected",
      rejectedDate: new Date().toISOString(),
    };
    
    // Remove from pending list
    pendingVendors.splice(vendorIndex, 1);
    localStorage.setItem(PENDING_VENDORS_KEY, JSON.stringify(pendingVendors));
    
    return rejectedVendor;
  } catch (error) {
    console.error("Error rejecting vendor:", error);
    throw error;
  }
};

/**
 * Get all approved vendors
 */
export const getApprovedVendors = () => {
  try {
    const stored = localStorage.getItem(APPROVED_VENDORS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error reading approved vendors:", error);
    return [];
  }
};

/**
 * Check if a vendor is approved by email
 */
export const isVendorApproved = (email) => {
  try {
    const approvedVendors = getApprovedVendors();
    const vendor = approvedVendors.find((v) => v.email === email);
    return vendor && vendor.status === "active";
  } catch (error) {
    console.error("Error checking vendor approval:", error);
    return false;
  }
};

/**
 * Get vendor approval status by email
 */
export const getVendorStatus = (email) => {
  try {
    // Check approved vendors first
    const approvedVendors = getApprovedVendors();
    const approvedVendor = approvedVendors.find((v) => v.email === email);
    if (approvedVendor) {
      return approvedVendor.status; // "active" or "suspended"
    }
    
    // Check pending vendors
    const pendingVendors = getPendingVendors();
    const pendingVendor = pendingVendors.find((v) => v.email === email);
    if (pendingVendor) {
      return "pending";
    }
    
    return null; // Vendor not found
  } catch (error) {
    console.error("Error getting vendor status:", error);
    return null;
  }
};

/**
 * Get vendor by email (from either pending or approved)
 */
export const getVendorByEmail = (email) => {
  try {
    // Check approved vendors first
    const approvedVendors = getApprovedVendors();
    const approvedVendor = approvedVendors.find((v) => v.email === email);
    if (approvedVendor) {
      return approvedVendor;
    }
    
    // Check pending vendors
    const pendingVendors = getPendingVendors();
    const pendingVendor = pendingVendors.find((v) => v.email === email);
    if (pendingVendor) {
      return pendingVendor;
    }
    
    return null;
  } catch (error) {
    console.error("Error getting vendor by email:", error);
    return null;
  }
};

