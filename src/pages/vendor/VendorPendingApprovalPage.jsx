import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FiClock, FiMail, FiCheckCircle, FiXCircle, FiLogOut } from "react-icons/fi";
import Card from "../../ui/cards/Card";
import Button from "../../ui/buttons/Button";
import Logo from "../../common/Logo";
import { USER_ROLES } from "../../common/roleConstants";
import { useAuth } from "../../hooks/useAuth";
import { useGet } from "../../hooks/useApi";
import { API_ENDPOINTS } from "../../api/config";
import toast from "react-hot-toast";
import apiClient from "../../api/client";

const VendorPendingApprovalPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const [vendorStatus, setVendorStatus] = useState(null);
  const [vendorData, setVendorData] = useState(null);
  const hasShownApprovalToast = useRef(false);
  const isApproved = useRef(false);

  // Determine which endpoint to use based on user role
  // Pending vendors (Customer role) should use /pending-approval
  // Approved vendors (Vendor role) should use /profile
  const isPendingVendor = user?.role === USER_ROLES.CUSTOMER;
  const isApprovedVendor = user?.role === USER_ROLES.VENDOR;

  // Fetch vendor approval status (for pending vendors who are still "Customer" role)
  const { data: vendorApprovalData, refetch: refetchApproval, error: approvalError } = useGet(
    'vendor-approval-status',
    `${API_ENDPOINTS.VENDORS}/pending-approval`,
    { 
      showErrorToast: false,
      ignore404: true, // Don't show toast for 404s (expected if vendor was approved)
      enabled: isAuthenticated && isPendingVendor && !isApproved.current,
      refetchInterval: (query) => {
        // Stop polling if approved
        if (isApproved.current) return false;
        // Poll more frequently to catch approval quickly (every 5 seconds)
        return 5000;
      },
      retry: false, // Don't retry - if it fails, we'll check the profile endpoint
      refetchOnWindowFocus: true, // Refetch when window gains focus (user might have been approved)
    }
  );

  // Fetch vendor profile (for approved vendors or to check if approved)
  // IMPORTANT: Also check this for pending vendors - they might have been approved
  const { data: vendorProfile, refetch: refetchProfile, error: profileError } = useGet(
    'vendor-profile',
    `${API_ENDPOINTS.VENDORS}/profile`,
    { 
      showErrorToast: false,
      ignore404: true, // Don't show toast for 404s (expected for pending vendors)
      enabled: isAuthenticated && !isApproved.current,
      refetchInterval: (query) => {
        // Stop polling if approved
        if (isApproved.current) return false;
        // Poll more frequently for all authenticated users (they might have been approved)
        // Poll every 5 seconds to catch approval quickly
        return 5000;
      },
      retry: false,
      refetchOnWindowFocus: true, // Refetch when window gains focus
    }
  );

  useEffect(() => {
    // Check authentication
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
      return;
    }

    // Handle errors gracefully - don't show toasts for expected 404s
    // 404 on /profile is expected for pending vendors
    // 404 on /pending-approval might mean the vendor was approved (check /profile instead)
    if (approvalError && approvalError.response?.status !== 404) {
      // Only log non-404 errors, don't show toast
      console.warn("Error fetching vendor approval status:", approvalError);
    }
    if (profileError && profileError.response?.status !== 404) {
      // Only log non-404 errors, don't show toast
      console.warn("Error fetching vendor profile:", profileError);
    }

    // Get vendor status from approval status endpoint or vendor profile
    // According to backend: Pending vendors are "Customer" role, approved vendors are "Vendor" role
    const approvalData = vendorApprovalData?.data?.vendor || {};
    const profileData = vendorProfile?.data?.vendor || {};
    
    // IMPORTANT: Check for approval FIRST before determining status
    // Approval can be detected by:
    // 1. User role changed to "Vendor" (most reliable)
    // 2. Status is "active" or "approved" in profile data
    // 3. Profile endpoint returns data (means vendor is approved - even if role not updated yet)
    // 4. Approval endpoint returns 404 AND profile exists (means approved, moved to profile)
    const profileExists = vendorProfile?.data?.vendor && Object.keys(vendorProfile.data.vendor).length > 0;
    const approvalNotFound = approvalError?.response?.status === 404 && profileExists;
    
    // Check approval status from multiple sources
    const statusFromProfile = profileData?.status;
    const statusFromApproval = approvalData?.status;
    const statusFromUser = user?.status || user?.vendorStatus || user?.approvalStatus;
    
    // Determine if approved - check this BEFORE setting default status
    const isApprovedNow = 
      user?.role === USER_ROLES.VENDOR || // Role changed to Vendor
      statusFromProfile === "active" || 
      statusFromProfile === "approved" ||
      statusFromUser === "active" ||
      statusFromUser === "approved" ||
      profileExists || // Profile exists = approved (even if status not set)
      approvalNotFound; // Approval endpoint 404 + profile exists = approved
    
    // If approved, handle redirect immediately
    if (isApprovedNow && !isApproved.current) {
      isApproved.current = true;
      
      // Set status to approved for display
      setVendorStatus("approved");
      
      // Only show toast if not already shown
      if (!hasShownApprovalToast.current) {
        hasShownApprovalToast.current = true;
        // Use a unique toast ID to prevent duplicates
        toast.success("Your vendor account has been approved! Redirecting to dashboard...", { 
          duration: 2000,
          id: 'vendor-approved', // Unique ID prevents duplicate toasts
        });
      }
      
      // Try to refresh user auth state by fetching user profile
      // This ensures the user object is updated with new role
      const refreshUserAuth = async () => {
        try {
          // Fetch current user to update auth state
          const userResponse = await apiClient.get(`${API_ENDPOINTS.USERS}/profile`);
          if (userResponse.data?.success && userResponse.data?.data?.user) {
            const updatedUser = userResponse.data.data.user;
            // Update user in auth context if updateUser is available
            if (updateUser) {
              updateUser(updatedUser);
            }
          }
        } catch (error) {
          console.log('Could not refresh user auth, will redirect anyway');
        }
      };
      
      // Refresh auth state then redirect
      refreshUserAuth().finally(() => {
        // Redirect immediately (no delay)
        navigate("/vendor/dashboard", { replace: true });
      });
      
      return; // Exit early to prevent rendering pending status
    }
    
    // Determine status - prioritize profile data if available (means vendor is approved)
    let status = statusFromProfile || 
                 statusFromApproval ||
                 statusFromUser;

    // If user role is Vendor, they're approved
    if (user?.role === USER_ROLES.VENDOR && !status) {
      status = "active";
    }

    // Default to pending if no status found and not approved
    if (!status && !isApprovedNow) {
      status = "pending";
    }

    setVendorStatus(status);

    // Set vendor data from approval status, profile, or user object
    const vendorData = profileData || approvalData || {};
    setVendorData({
      email: user?.email || vendorData.email,
      businessName: vendorData.businessName || user?.businessName,
      storeName: vendorData.storeName || user?.storeName,
      applicationDate: vendorData.applicationDate || vendorData.createdAt || user?.createdAt,
      ...vendorData,
    });
  }, [user, vendorApprovalData, vendorProfile, isAuthenticated, authLoading, navigate, approvalError, profileError]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // If approved, don't render pending page - redirect will happen
  if (isApproved.current) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-charcoal-grey/3 via-white to-golden-amber/5">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-deep-maroon mx-auto mb-4"></div>
          <p className="text-charcoal-grey/70">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  if (authLoading || !vendorStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-charcoal-grey/3 via-white to-golden-amber/5">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-deep-maroon mx-auto mb-4"></div>
          <p className="text-charcoal-grey/70">Checking approval status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-charcoal-grey/3 via-white to-golden-amber/5 p-4">
      <Card className="max-w-2xl w-full p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size="default" />
          </div>
          <h1 className="text-3xl font-black text-charcoal-grey mb-2">
            Vendor Application Status
          </h1>
        </div>

        {(vendorStatus === "active" || vendorStatus === "approved") && (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto">
              <FiCheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-charcoal-grey mb-2">
                Application Approved! 🎉
              </h2>
              <p className="text-charcoal-grey/70 mb-4">
                Your vendor account has been approved! You can now access your vendor dashboard.
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-sm text-green-800">
                <strong>Congratulations!</strong> Your vendor application has been approved. 
                You will be redirected to your dashboard shortly.
              </p>
            </div>

            <div className="flex gap-3 justify-center">
              <Button 
                variant="primary" 
                size="md"
                onClick={() => navigate("/vendor/dashboard", { replace: true })}
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        )}

        {vendorStatus === "pending" && (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-yellow-50 flex items-center justify-center mx-auto">
              <FiClock className="w-10 h-10 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-charcoal-grey mb-2">
                Application Under Review
              </h2>
              <p className="text-charcoal-grey/70 mb-4">
                Your vendor application is currently being reviewed by our admin team.
              </p>
            </div>

            {vendorData && (
              <div className="bg-charcoal-grey/5 rounded-xl p-6 space-y-4 text-left">
                <div className="flex items-center gap-3">
                  <FiMail className="w-5 h-5 text-charcoal-grey/60" />
                  <div>
                    <p className="text-xs text-charcoal-grey/60">Email</p>
                    <p className="font-semibold text-charcoal-grey">{vendorData.email}</p>
                  </div>
                </div>
                {vendorData.businessName && (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 flex items-center justify-center">
                      <span className="text-lg">🏪</span>
                    </div>
                    <div>
                      <p className="text-xs text-charcoal-grey/60">Business Name</p>
                      <p className="font-semibold text-charcoal-grey">{vendorData.businessName}</p>
                    </div>
                  </div>
                )}
                {vendorData.applicationDate && (
                  <div className="flex items-center gap-3">
                    <FiClock className="w-5 h-5 text-charcoal-grey/60" />
                    <div>
                      <p className="text-xs text-charcoal-grey/60">Application Date</p>
                      <p className="font-semibold text-charcoal-grey">
                        {new Date(vendorData.applicationDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-800">
                <strong>What happens next?</strong>
              </p>
              <ul className="text-sm text-blue-700 mt-2 space-y-1 text-left list-disc list-inside">
                <li>Our admin team will review your application</li>
                <li>You'll receive an email notification once approved</li>
                <li>This page will automatically update when your status changes</li>
              </ul>
            </div>

            <div className="flex gap-3 justify-center">
              <Button variant="ghost" size="md" onClick={handleLogout}>
                <FiLogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={async () => {
                  try {
                    // Refresh status from API
                    if (isPendingVendor) {
                      await refetchApproval();
                    }
                    if (isApprovedVendor || !isPendingVendor) {
                      await refetchProfile();
                    }
                    
                    // Wait a bit for state to update
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                    const approvalData = vendorApprovalData?.data?.vendor || {};
                    const profileData = vendorProfile?.data?.vendor || {};
                    const status = profileData?.status || approvalData?.status;
                    
                    // Check if approved - check profile data too (might be approved even if role not updated)
                    const profileExists = vendorProfile?.data?.vendor && Object.keys(vendorProfile.data.vendor).length > 0;
                    const isApprovedCheck = 
                      user?.role === USER_ROLES.VENDOR || 
                      status === "active" || 
                      status === "approved" ||
                      profileExists; // Profile exists = approved
                    
                    if (isApprovedCheck) {
                      if (!hasShownApprovalToast.current) {
                        hasShownApprovalToast.current = true;
                        toast.success("Your account has been approved!", { 
                          duration: 3000,
                          id: 'vendor-approved-manual', // Unique ID prevents duplicates
                        });
                      }
                      // Refresh user auth state if profile exists
                      if (profileExists && updateUser && vendorProfile.data.vendor) {
                        // Try to update user state with vendor data
                        const vendorUser = vendorProfile.data.vendor.userId || vendorProfile.data.vendor;
                        if (vendorUser) {
                          updateUser(vendorUser);
                        }
                      }
                      // Redirect immediately
                      navigate("/vendor/dashboard", { replace: true });
                    } else {
                      toast.success("Your application is still under review", { 
                        duration: 2000,
                        id: 'vendor-pending-status', // Unique ID prevents duplicates
                      });
                    }
                  } catch (error) {
                    // Silently handle errors - don't show toast for expected 404s
                    console.log("Status check:", error.response?.status === 404 ? "Not found (expected)" : error.message);
                    toast.success("Your application is still under review", { duration: 2000 });
                  }
                }}
              >
                Check Status
              </Button>
            </div>
          </div>
        )}

        {vendorStatus === "rejected" && (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto">
              <FiXCircle className="w-10 h-10 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-charcoal-grey mb-2">
                Application Rejected
              </h2>
              <p className="text-charcoal-grey/70 mb-4">
                Unfortunately, your vendor application has been rejected.
              </p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm text-red-800">
                If you believe this is an error, please contact our support team for assistance.
              </p>
            </div>

            <div className="flex gap-3 justify-center">
              <Button variant="ghost" size="md" onClick={handleLogout}>
                <FiLogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
              <Button variant="primary" size="md" onClick={() => navigate("/signup/vendor")}>
                Apply Again
              </Button>
            </div>
          </div>
        )}

        {vendorStatus === null && (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-charcoal-grey/10 flex items-center justify-center mx-auto">
              <FiXCircle className="w-10 h-10 text-charcoal-grey/60" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-charcoal-grey mb-2">
                No Application Found
              </h2>
              <p className="text-charcoal-grey/70 mb-4">
                We couldn't find a vendor application for your account.
              </p>
            </div>

            <div className="flex gap-3 justify-center">
              <Button variant="ghost" size="md" onClick={handleLogout}>
                <FiLogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
              <Button variant="primary" size="md" onClick={() => navigate("/signup/vendor")}>
                Apply as Vendor
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default VendorPendingApprovalPage;

