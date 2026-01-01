import { useState } from "react";
import Card from "../../ui/cards/Card";
import Button from "../../ui/buttons/Button";
import { FiSearch, FiMail, FiPhone, FiCalendar, FiShoppingBag, FiStar, FiDownload } from "react-icons/fi";
import VendorDetailModal from "../../features/admin-dashboard/modals/VendorDetailModal";
import toast from "react-hot-toast";
import { useGet, usePatch } from "../../hooks/useApi";
import { API_ENDPOINTS } from "../../api/config";
import apiClient from "../../api/client";

const AdminVendorsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch vendors from API
  // ISSUE: Backend might be querying for role: "Vendor" only
  // But pending vendors have role: "Customer" in database!
  // So we try multiple approaches:
  
  // Approach 1: Try the main vendors endpoint
  // Backend now returns: { success: true, data: { applications: [...] } } for pending vendors
  const { data: vendorsData, isLoading, error, refetch } = useGet(
    'admin-vendors',
    `${API_ENDPOINTS.ADMIN}/vendors`,
    { 
      showErrorToast: false, // Don't show error, we'll try fallback
      // Try with params to get all vendors including pending
      params: { includePending: true, status: 'all' }
    }
  );

  // Approach 1b: Also try the pending vendors endpoint specifically
  // GET /admin/vendors/pending returns { success: true, data: { applications: [...] } }
  const { data: pendingVendorsData } = useGet(
    'admin-vendors-pending',
    `${API_ENDPOINTS.ADMIN}/vendors/pending`,
    { 
      showErrorToast: false,
      // Only fetch if main endpoint doesn't return pending vendors
      enabled: !vendorsData?.data?.applications && !isLoading
    }
  );

  // Approach 2: Fallback - Try fetching all users and filter for vendors
  // This is a workaround if the vendors endpoint doesn't return pending vendors
  const { data: usersData } = useGet(
    'admin-users-fallback',
    `${API_ENDPOINTS.ADMIN}/users`,
    { 
      enabled: vendorsData?.data?.vendors?.length === 0 && !isLoading, // Only if vendors endpoint returns empty
      showErrorToast: false,
    }
  );

  // Log for debugging (remove in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('AdminVendorsPage - vendorsData:', vendorsData);
    console.log('AdminVendorsPage - error:', error);
  }
  
  // Handle different response structures
  let vendors = [];
  let pendingApplications = [];
  
  // First, try to get vendors from the vendors endpoint
  if (vendorsData) {
    if (vendorsData.data) {
      // NEW: Handle applications array (for pending vendor applications)
      // Backend now returns: { success: true, data: { applications: [...] } }
      if (vendorsData.data.applications && Array.isArray(vendorsData.data.applications)) {
        // These are vendor applications with user info directly on the object
        pendingApplications = vendorsData.data.applications;
      }
      // Also get approved vendors
      const approvedVendors = vendorsData.data.vendors || 
                               vendorsData.data.vendor || 
                               (Array.isArray(vendorsData.data) && !vendorsData.data.applications ? vendorsData.data : []);
      vendors = [...approvedVendors];
    } else if (Array.isArray(vendorsData)) {
      vendors = vendorsData;
    }
  }
  
  // Also check the pending vendors endpoint
  if (pendingVendorsData?.data?.applications) {
    pendingApplications = [...pendingApplications, ...pendingVendorsData.data.applications];
  }
  
  // Merge pending applications with approved vendors
  // Remove duplicates based on _id
  const allVendorsMap = new Map();
  
  // Add approved vendors first
  vendors.forEach(v => {
    const id = v._id || v.id;
    if (id) allVendorsMap.set(id, v);
  });
  
  // Add pending applications (will overwrite if same ID exists, which shouldn't happen)
  pendingApplications.forEach(app => {
    const id = app._id || app.id;
    if (id) allVendorsMap.set(id, app);
  });
  
  vendors = Array.from(allVendorsMap.values());
  
  // FALLBACK: If no vendors found, try to extract from users endpoint
  // This handles the case where pending vendors have role: "Customer"
  if (vendors.length === 0 && usersData) {
    let allUsers = [];
    if (usersData.data) {
      allUsers = usersData.data.users || 
                 usersData.data.user || 
                 (Array.isArray(usersData.data) ? usersData.data : []);
    } else if (Array.isArray(usersData)) {
      allUsers = usersData;
    }
    
    // Filter for vendors: either role is "Vendor" OR has vendor fields (businessName, storeName)
    vendors = allUsers.filter(user => {
      const hasVendorRole = user.role === 'Vendor' || user.role === 'vendor';
      const hasVendorFields = !!(user.businessName || user.storeName || user.businessAddress);
      return hasVendorRole || hasVendorFields;
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log('AdminVendorsPage - Using fallback: Found vendors from users endpoint:', vendors.length);
    }
  }
  
  // Normalize vendor data and status
  // IMPORTANT: For pending applications, user info (name, email, phone) is directly on the application object
  // NOT in userId (which is null for pending applications)
  vendors = vendors.map(vendor => {
    // Normalize status field - check multiple possible field names
    const status = vendor.status || 
                   vendor.approvalStatus || 
                   vendor.vendorStatus || 
                   (vendor.role === 'Customer' ? 'pending' : 'active') || 
                   'pending';
    
    // Normalize status to lowercase for consistent filtering
    const normalizedStatus = status.toLowerCase();
    
    // For pending applications: user info is directly on the object
    // For approved vendors: might be in userId or directly on object
    const name = vendor.name || 
                 vendor.userId?.name || 
                 '';
    const email = vendor.email || 
                  vendor.userId?.email || 
                  '';
    const phone = vendor.phone || 
                  vendor.userId?.phone || 
                  '';
    
    return {
      ...vendor,
      status: normalizedStatus,
      // Ensure we have all required fields
      _id: vendor._id || vendor.id,
      id: vendor.id || vendor._id,
      // ✅ Use direct fields (works for both applications and vendors)
      name: name,
      businessName: vendor.businessName || vendor.storeName || name || 'Vendor',
      email: email,
      phone: phone,
      // Preserve application-specific fields
      applicationDate: vendor.applicationDate || vendor.createdAt,
      businessAddress: vendor.businessAddress,
      businessLicense: vendor.businessLicense,
      storeName: vendor.storeName,
    };
  });
  
  // Log for debugging (remove in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('AdminVendorsPage - processed vendors:', vendors);
    console.log('AdminVendorsPage - pending vendors:', vendors.filter(v => v.status === 'pending'));
    console.log('AdminVendorsPage - all statuses:', [...new Set(vendors.map(v => v.status))]);
  }

  const filteredVendors = vendors.filter((vendor) => {
    const matchesSearch =
      (vendor.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (vendor.businessName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (vendor.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (vendor.phone || '').includes(searchQuery);
    const matchesStatus = selectedStatus === "all" || vendor.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleApproveVendor = async (vendorId) => {
    try {
      const vendorIdValue = vendorId || selectedVendor?._id || selectedVendor?.id;
      if (!vendorIdValue) {
        toast.error("Vendor ID is required");
        return;
      }
      
      // Check if this is a pending application (status is pending)
      const isPendingApplication = selectedVendor?.status === 'pending' || 
                                   selectedVendor?.status === 'Pending';
      
      // For pending applications, try applications endpoint first
      // For approved vendors, use vendors endpoint
      // Try multiple endpoint variations to handle different backend implementations
      const endpointsToTry = [];
      
      if (isPendingApplication) {
        // Try applications endpoint first (most likely for pending apps)
        endpointsToTry.push(`${API_ENDPOINTS.ADMIN}/vendors/applications/${vendorIdValue}/approve`);
        endpointsToTry.push(`${API_ENDPOINTS.ADMIN}/vendors/${vendorIdValue}/approve`);
      } else {
        // For approved vendors, use vendors endpoint
        endpointsToTry.push(`${API_ENDPOINTS.ADMIN}/vendors/${vendorIdValue}/approve`);
      }
      
      // Try each endpoint until one works
      let response;
      let lastError;
      
      for (const endpoint of endpointsToTry) {
        try {
          console.log(`Trying endpoint: ${endpoint}`);
          // Try with empty body first, then with body if needed
          response = await apiClient.put(endpoint, {});
          console.log(`Success with endpoint: ${endpoint}`);
          break; // Success, exit loop
        } catch (error) {
          lastError = error;
          console.log(`Failed with endpoint ${endpoint}:`, error.response?.status, error.response?.data);
          
          // If 400, try with a request body
          if (error.response?.status === 400) {
            try {
              console.log(`Retrying ${endpoint} with request body...`);
              response = await apiClient.put(endpoint, {
                applicationId: vendorIdValue,
                action: 'approve'
              });
              console.log(`Success with body: ${endpoint}`);
              break; // Success, exit loop
            } catch (bodyError) {
              console.log(`Failed with body too: ${endpoint}`);
              lastError = bodyError;
              // Continue to next endpoint
            }
          }
          
          // If 404, try next endpoint
          if (error.response?.status === 404 && endpointsToTry.indexOf(endpoint) < endpointsToTry.length - 1) {
            continue; // Try next endpoint
          }
        }
      }
      
      // If all endpoints failed, throw the last error
      if (!response) {
        throw lastError;
      }
      
      const result = response.data;
      if (result.success) {
        const vendorEmail = selectedVendor?.email || '';
        const successMessage = result.message || 
          "Vendor approved successfully! They can now log in to their account.";
        
        // Combine messages into one toast (react-hot-toast doesn't have toast.info)
        const fullMessage = vendorEmail 
          ? `${successMessage} Vendor ${vendorEmail} can now log in and access their dashboard.`
          : successMessage;
        
        toast.success(fullMessage, { duration: 5000 });
        refetch();
        setIsModalOpen(false);
        setSelectedVendor(null);
      } else {
        toast.error(result.message || "Failed to approve vendor");
      }
    } catch (error) {
      console.error("Failed to approve vendor:", error);
      console.error("Error details:", {
        status: error.response?.status,
        data: error.response?.data,
        endpoint: error.config?.url
      });
      
      // Provide more detailed error message
      let errorMessage = "Failed to approve vendor";
      
      // Log full error details for debugging
      if (error.response) {
        const errorData = error.response.data;
        console.error("Backend error response:", {
          status: error.response.status,
          statusText: error.response.statusText,
          data: errorData,
          headers: error.response.headers
        });
        
        if (error.response.status === 400) {
          // 400 Bad Request - usually means wrong format or missing data
          errorMessage = errorData?.message || 
            errorData?.error ||
            `Bad Request (400). Backend expects different format. Check console for details.`;
          
          // Show backend validation errors if available
          if (errorData?.errors && Array.isArray(errorData.errors)) {
            const validationErrors = errorData.errors.map(e => e.message || e).join(', ');
            errorMessage += ` Validation errors: ${validationErrors}`;
          }
        } else if (error.response.status === 404) {
          errorMessage = errorData?.message || 
            "Vendor application not found. It may have already been processed.";
        } else if (errorData?.message) {
          errorMessage = errorData.message;
        } else if (errorData?.error) {
          errorMessage = errorData.error;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    }
  };

  const handleRejectVendor = async (vendorId) => {
    try {
      const vendorIdValue = vendorId || selectedVendor?._id || selectedVendor?.id;
      if (!vendorIdValue) {
        toast.error("Vendor ID is required");
        return;
      }
      
      // Check if this is a pending application
      const isPendingApplication = selectedVendor?.status === 'pending' || 
                                   selectedVendor?.status === 'Pending';
      
      // For pending applications, use applications endpoint
      // For approved vendors, use vendors endpoint
      let endpoint;
      if (isPendingApplication) {
        endpoint = `${API_ENDPOINTS.ADMIN}/vendors/applications/${vendorIdValue}/reject`;
      } else {
        endpoint = `${API_ENDPOINTS.ADMIN}/vendors/${vendorIdValue}/reject`;
      }
      
      // Try the endpoint - if it fails with 404, try the alternative
      let response;
      try {
        response = await apiClient.put(
          endpoint,
          { reason: "Application rejected by admin" }
        );
      } catch (firstError) {
        // If first attempt fails and it's a pending application, try alternative endpoint
        if (isPendingApplication && firstError.response?.status === 404) {
          console.log('Trying alternative endpoint for pending application...');
          endpoint = `${API_ENDPOINTS.ADMIN}/vendors/${vendorIdValue}/reject`;
          response = await apiClient.put(
            endpoint,
            { reason: "Application rejected by admin" }
          );
        } else {
          throw firstError;
        }
      }
      
      const result = response.data;
      if (result.success) {
        toast.success(result.message || "Vendor rejected successfully!");
        refetch();
        setIsModalOpen(false);
        setSelectedVendor(null);
      } else {
        toast.error(result.message || "Failed to reject vendor");
      }
    } catch (error) {
      console.error("Failed to reject vendor:", error);
      console.error("Error details:", {
        status: error.response?.status,
        data: error.response?.data,
        endpoint: error.config?.url
      });
      
      // Provide more detailed error message
      let errorMessage = "Failed to reject vendor";
      if (error.response?.status === 400) {
        errorMessage = error.response?.data?.message || 
          "Invalid request. Please check if this is a valid pending vendor application.";
      } else if (error.response?.status === 404) {
        errorMessage = "Vendor application not found. It may have already been processed.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-deep-maroon mx-auto mb-4"></div>
          <p className="text-charcoal-grey/70">Loading vendors...</p>
        </div>
      </div>
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <div className="min-h-screen p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <Card className="p-8 text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-charcoal-grey mb-2">Error Loading Vendors</h2>
            <p className="text-charcoal-grey/70 mb-4">
              {error.message || 'Failed to load vendors. Please check your connection and try again.'}
            </p>
            <Button variant="primary" onClick={() => refetch()}>
              Retry
            </Button>
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 p-4 bg-red-50 rounded-lg text-left">
                <p className="text-sm font-semibold text-red-800 mb-2">Debug Info:</p>
                <pre className="text-xs text-red-700 overflow-auto">
                  {JSON.stringify(error, null, 2)}
                </pre>
              </div>
            )}
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-charcoal-grey">Vendor Management</h1>
            <p className="text-charcoal-grey/70 mt-1">Manage all platform vendors</p>
          </div>
          <Button
            variant="secondary"
            size="md"
            onClick={() => {
              // Export functionality
              toast.success("Export feature coming soon!");
            }}
          >
            <FiDownload className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>

        {/* Filters */}
        <Card className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-grey/35" />
              <input
                type="text"
                placeholder="Search vendors by name, business, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 border border-charcoal-grey/12 rounded-xl focus:outline-none focus:ring-2 focus:ring-golden-amber/25 focus:border-golden-amber/35 text-charcoal-grey bg-charcoal-grey/2"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedStatus === "all" ? "primary" : "ghost"}
                size="md"
                onClick={() => setSelectedStatus("all")}
              >
                All
              </Button>
              <Button
                variant={selectedStatus === "active" ? "primary" : "ghost"}
                size="md"
                onClick={() => setSelectedStatus("active")}
              >
                Active
              </Button>
              <Button
                variant={selectedStatus === "pending" ? "primary" : "ghost"}
                size="md"
                onClick={() => setSelectedStatus("pending")}
              >
                Pending
              </Button>
            </div>
          </div>
        </Card>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card className="p-4 text-center">
            <p className="text-sm text-charcoal-grey/60 mb-1">Total Vendors</p>
            <p className="text-2xl font-black text-charcoal-grey">{vendors.length}</p>
          </Card>
          <Card className="p-4 text-center bg-gradient-to-br from-green-50 to-transparent border-green-200">
            <p className="text-sm text-charcoal-grey/60 mb-1">Active</p>
            <p className="text-2xl font-black text-green-600">
              {vendors.filter((v) => v.status === "active").length}
            </p>
          </Card>
          <Card className="p-4 text-center bg-gradient-to-br from-yellow-50 to-transparent border-yellow-200">
            <p className="text-sm text-charcoal-grey/60 mb-1">Pending Review</p>
            <p className="text-2xl font-black text-yellow-600">
              {vendors.filter((v) => v.status === "pending").length}
            </p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-sm text-charcoal-grey/60 mb-1">Rejected</p>
            <p className="text-2xl font-black text-red-600">
              {vendors.filter((v) => v.status === "rejected").length}
            </p>
          </Card>
        </div>

        {/* Pending Vendors Alert */}
        {vendors.filter((v) => v.status === "pending").length > 0 && (
          <Card className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                  <span className="text-xl">⚠️</span>
                </div>
                <div>
                  <p className="font-bold text-charcoal-grey">
                    {vendors.filter((v) => v.status === "pending").length} vendor application(s) pending review
                  </p>
                  <p className="text-sm text-charcoal-grey/70">
                    Review and approve vendor applications to activate their accounts
                  </p>
                </div>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setSelectedStatus("pending")}
              >
                Review Now
              </Button>
            </div>
          </Card>
        )}

        {/* Vendors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVendors.map((vendor) => {
              const vendorId = vendor._id || vendor.id;
              // Check if vendor applied recently (within last 24 hours)
              const isNew = vendor.applicationDate && 
                (new Date() - new Date(vendor.applicationDate)) < 24 * 60 * 60 * 1000;
              
              return (
                <Card key={vendorId} className={`p-6 relative ${vendor.status === "pending" ? "border-l-4 border-yellow-500" : ""}`}>
                  {isNew && vendor.status === "pending" && (
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-1 rounded-full bg-red-500 text-white text-xs font-bold animate-pulse">
                        NEW
                      </span>
                    </div>
                  )}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-deep-maroon to-golden-amber flex items-center justify-center text-white font-bold text-lg">
                    {(vendor.name || vendor.businessName || 'V').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-charcoal-grey">{vendor.businessName || vendor.name || 'Vendor'}</h3>
                    {vendor.name && vendor.name !== vendor.businessName && (
                      <p className="text-xs text-charcoal-grey/60">{vendor.name}</p>
                    )}
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-lg font-medium ${
                    vendor.status === "active"
                      ? "bg-green-50 text-green-600"
                      : vendor.status === "pending"
                      ? "bg-yellow-50 text-yellow-600"
                      : "bg-red-50 text-red-600"
                  }`}
                >
                  {vendor.status}
                </span>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-charcoal-grey/70">
                  <FiMail className="w-4 h-4" />
                  <span className="truncate">{vendor.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-charcoal-grey/70">
                  <FiPhone className="w-4 h-4" />
                  <span>{vendor.phone}</span>
                </div>
                {vendor.status === "pending" ? (
                  <>
                    {(vendor.createdAt || vendor.joinDate || vendor.applicationDate) && (
                      <div className="flex items-center gap-2 text-sm text-charcoal-grey/70">
                        <FiCalendar className="w-4 h-4" />
                        <span>
                          Applied {vendor.joinDate || vendor.applicationDate || 
                            (vendor.createdAt ? new Date(vendor.createdAt).toLocaleDateString() : 'Recently')}
                        </span>
                      </div>
                    )}
                    {vendor.businessAddress && (
                      <div className="flex items-center gap-2 text-sm text-charcoal-grey/70">
                        <span className="font-semibold">Location:</span>
                        <span className="truncate">{vendor.businessAddress}</span>
                      </div>
                    )}
                    {vendor.businessLicense && (
                      <div className="flex items-center gap-2 text-sm text-charcoal-grey/70">
                        <span className="font-semibold">License:</span>
                        <span>{vendor.businessLicense}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {(vendor.createdAt || vendor.joinDate) && (
                      <div className="flex items-center gap-2 text-sm text-charcoal-grey/70">
                        <FiCalendar className="w-4 h-4" />
                        <span>
                          Joined {vendor.joinDate || 
                            (vendor.createdAt ? new Date(vendor.createdAt).toLocaleDateString() : 'N/A')}
                        </span>
                      </div>
                    )}
                    {(vendor.totalOrders !== undefined) && (
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-charcoal-grey/70">
                          <FiShoppingBag className="w-4 h-4" />
                          <span>{vendor.totalOrders || 0} orders</span>
                        </div>
                        {vendor.rating && (
                          <div className="flex items-center gap-1 text-golden-amber">
                            <FiStar className="w-4 h-4 fill-current" />
                            <span className="font-semibold">{vendor.rating}</span>
                          </div>
                        )}
                      </div>
                    )}
                    {(vendor.totalRevenue !== undefined) && (
                      <div className="flex items-center gap-2 text-sm text-charcoal-grey/70">
                        <span className="font-semibold">Revenue:</span>
                        <span>Rs. {(vendor.totalRevenue || 0).toLocaleString()}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => {
                    setSelectedVendor(vendor);
                    setIsModalOpen(true);
                  }}
                >
                  {vendor.status === "pending" ? "Review" : "View Details"}
                </Button>
                {vendor.status === "pending" ? (
                  <Button 
                    variant="primary" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => {
                      setSelectedVendor(vendor);
                      setIsModalOpen(true);
                    }}
                  >
                    Approve
                  </Button>
                ) : (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => {
                    setSelectedVendor(vendor);
                    setIsModalOpen(true);
                  }}
                >
                  Edit
                </Button>
                )}
              </div>
            </Card>
            );
            })}
        </div>

        {filteredVendors.length === 0 && (
          <Card className="p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-charcoal-grey mb-2">
              {vendors.length === 0 
                ? 'No Vendors Found' 
                : 'No Vendors Match Your Filters'}
            </h3>
            <p className="text-charcoal-grey/60 mb-4">
              {vendors.length === 0 
                ? 'There are no vendors registered yet. Vendors will appear here once they register.' 
                : 'Try adjusting your search or filter criteria.'}
            </p>
            {vendors.length === 0 && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg text-left max-w-md mx-auto">
                <p className="text-sm text-blue-800 font-semibold mb-2">💡 Tip:</p>
                <p className="text-sm text-blue-700">
                  When vendors register, they will appear here with a "pending" status. 
                  You can then review and approve their applications.
                </p>
              </div>
            )}
            {(searchQuery || selectedStatus !== "all") && vendors.length > 0 && (
              <Button 
                variant="secondary" 
                onClick={() => {
                  setSearchQuery("");
                  setSelectedStatus("all");
                }}
                className="mt-4"
              >
                Clear Filters
              </Button>
            )}
          </Card>
        )}
      </div>

      {/* Vendor Detail Modal */}
      <VendorDetailModal
        vendor={selectedVendor}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedVendor(null);
        }}
        onUpdate={async (vendorId, updatedData) => {
          try {
            // TODO: Implement vendor update API call
            await refetch();
            setIsModalOpen(false);
            setSelectedVendor(null);
          } catch (error) {
            console.error("Failed to update vendor:", error);
          }
        }}
        onApprove={handleApproveVendor}
        onReject={handleRejectVendor}
      />
    </div>
  );
};

export default AdminVendorsPage;

