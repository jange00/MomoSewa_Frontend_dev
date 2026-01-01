import { useState, useMemo } from "react";
import Card from "../../ui/cards/Card";
import Button from "../../ui/buttons/Button";
import { FiSearch, FiUser, FiMail, FiPhone, FiCalendar, FiDownload, FiRefreshCw, FiX } from "react-icons/fi";
import UserDetailModal from "../../features/admin-dashboard/modals/UserDetailModal";
import toast from "react-hot-toast";
import { useGet, usePut } from "../../hooks/useApi";
import { API_ENDPOINTS } from "../../api/config";
import apiClient from "../../api/client";
import { StatsCardSkeleton, UserCardSkeleton } from "../../ui/skeletons";

const AdminUsersPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch users from API
  const { data: usersData, isLoading, error, refetch } = useGet(
    'admin-users',
    `${API_ENDPOINTS.ADMIN}/users`,
    { showErrorToast: true }
  );

  const users = usersData?.data?.users || usersData?.data || [];

  // Calculate stats
  const stats = useMemo(() => {
    return {
      total: users.length,
      customers: users.filter((u) => u.role === "Customer").length,
      vendors: users.filter((u) => u.role === "Vendor").length,
      active: users.filter((u) => u.status === "active").length,
    };
  }, [users]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        (user.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.phone || '').includes(searchQuery);
      const matchesRole = selectedRole === "all" || user.role === selectedRole;
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, selectedRole]);

  // User update mutation
  const updateUserMutation = usePut(
    'admin-users',
    `${API_ENDPOINTS.ADMIN}/users`,
    { showSuccessToast: true, showErrorToast: true }
  );

  const handleUpdateUser = async (userId, updatedData) => {
    try {
      const userIdValue = userId || selectedUser?._id || selectedUser?.id;
      if (!userIdValue) {
        toast.error("User ID is required");
        return;
      }

      // Try updating via admin endpoint first
      try {
        await apiClient.put(
          `${API_ENDPOINTS.ADMIN}/users/${userIdValue}`,
          updatedData
        );
        toast.success("User updated successfully!");
        refetch(); // Refresh the users list
        setIsModalOpen(false);
        setSelectedUser(null);
      } catch (apiError) {
        // Fallback to users endpoint
        try {
          await apiClient.put(
            `${API_ENDPOINTS.USERS}/${userIdValue}`,
            updatedData
          );
          toast.success("User updated successfully!");
          refetch();
          setIsModalOpen(false);
          setSelectedUser(null);
        } catch (fallbackError) {
          throw fallbackError;
        }
      }
    } catch (error) {
      console.error("Failed to update user:", error);
      toast.error(error.response?.data?.message || "Failed to update user");
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedRole("all");
  };

  const hasActiveFilters = searchQuery || selectedRole !== "all";

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Skeleton */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="h-9 w-64 bg-charcoal-grey/10 rounded-lg animate-pulse mb-2"></div>
              <div className="h-5 w-48 bg-charcoal-grey/10 rounded-lg animate-pulse"></div>
            </div>
            <div className="flex gap-2">
              <div className="h-10 w-24 bg-charcoal-grey/10 rounded-xl animate-pulse"></div>
              <div className="h-10 w-32 bg-charcoal-grey/10 rounded-xl animate-pulse"></div>
            </div>
          </div>

          {/* Filters Skeleton */}
          <Card className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 h-11 bg-charcoal-grey/10 rounded-xl animate-pulse"></div>
              <div className="flex gap-2">
                <div className="h-11 w-16 bg-charcoal-grey/10 rounded-xl animate-pulse"></div>
                <div className="h-11 w-24 bg-charcoal-grey/10 rounded-xl animate-pulse"></div>
                <div className="h-11 w-20 bg-charcoal-grey/10 rounded-xl animate-pulse"></div>
              </div>
            </div>
          </Card>

          {/* Stats Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <StatsCardSkeleton count={4} />
          </div>

          {/* Users Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <UserCardSkeleton count={6} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <Card className="p-8 text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-charcoal-grey mb-2">Error Loading Users</h2>
            <p className="text-charcoal-grey/70 mb-4">
              {error.message || 'Failed to load users. Please check your connection and try again.'}
            </p>
            <Button variant="primary" onClick={() => refetch()}>
              <FiRefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-charcoal-grey">User Management</h1>
            <p className="text-charcoal-grey/70 mt-1">Manage all platform users</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="md"
              onClick={() => refetch()}
              className="flex items-center gap-2"
            >
              <FiRefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Button
              variant="ghost"
              size="md"
              onClick={() => {
                toast.success("Export feature coming soon!");
              }}
              className="flex items-center gap-2"
            >
              <FiDownload className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Active Filters Bar */}
        {hasActiveFilters && (
          <Card className="p-4 bg-gradient-to-r from-deep-maroon/5 to-golden-amber/5 border-deep-maroon/10">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-charcoal-grey">Active Filters:</span>
                {searchQuery && (
                  <span className="px-3 py-1 rounded-full bg-deep-maroon/10 text-deep-maroon text-sm font-medium flex items-center gap-2">
                    Search: "{searchQuery}"
                    <button onClick={() => setSearchQuery("")} className="hover:text-deep-maroon/70">
                      <FiX className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedRole !== "all" && (
                  <span className="px-3 py-1 rounded-full bg-deep-maroon/10 text-deep-maroon text-sm font-medium flex items-center gap-2">
                    Role: {selectedRole}
                    <button onClick={() => setSelectedRole("all")} className="hover:text-deep-maroon/70">
                      <FiX className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-deep-maroon hover:bg-deep-maroon/10"
              >
                Clear All
              </Button>
            </div>
          </Card>
        )}

        {/* Filters */}
        <Card className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-grey/35" />
              <input
                type="text"
                placeholder="Search users by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-12 py-2.5 border border-charcoal-grey/12 rounded-xl focus:outline-none focus:ring-2 focus:ring-golden-amber/25 focus:border-golden-amber/35 text-charcoal-grey bg-charcoal-grey/2 hover:bg-charcoal-grey/4 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal-grey/60 hover:text-charcoal-grey"
                >
                  <FiX className="w-5 h-5" />
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedRole === "all" ? "primary" : "ghost"}
                size="md"
                onClick={() => setSelectedRole("all")}
              >
                All
              </Button>
              <Button
                variant={selectedRole === "Customer" ? "primary" : "ghost"}
                size="md"
                onClick={() => setSelectedRole("Customer")}
              >
                Customers
              </Button>
              <Button
                variant={selectedRole === "Vendor" ? "primary" : "ghost"}
                size="md"
                onClick={() => setSelectedRole("Vendor")}
              >
                Vendors
              </Button>
            </div>
          </div>
        </Card>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card className="p-4 text-center bg-gradient-to-br from-charcoal-grey/5 to-transparent border-charcoal-grey/10">
            <p className="text-sm text-charcoal-grey/60 mb-1">Total Users</p>
            <p className="text-2xl font-black text-charcoal-grey">{stats.total}</p>
          </Card>
          <Card className="p-4 text-center bg-gradient-to-br from-deep-maroon/5 to-transparent border-deep-maroon/10">
            <p className="text-sm text-charcoal-grey/60 mb-1">Customers</p>
            <p className="text-2xl font-black text-deep-maroon">{stats.customers}</p>
          </Card>
          <Card className="p-4 text-center bg-gradient-to-br from-golden-amber/5 to-transparent border-golden-amber/10">
            <p className="text-sm text-charcoal-grey/60 mb-1">Vendors</p>
            <p className="text-2xl font-black text-golden-amber">{stats.vendors}</p>
          </Card>
          <Card className="p-4 text-center bg-gradient-to-br from-green-50 to-transparent border-green-200">
            <p className="text-sm text-charcoal-grey/60 mb-1">Active</p>
            <p className="text-2xl font-black text-green-600">{stats.active}</p>
          </Card>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between text-sm text-charcoal-grey/70">
          <p>
            Showing <span className="font-bold text-charcoal-grey">{filteredUsers.length}</span> of{" "}
            <span className="font-bold text-charcoal-grey">{users.length}</span> users
            {hasActiveFilters && " (filtered)"}
          </p>
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => {
            const userId = user._id || user.id;
            const userImage = user.profilePicture || user.avatar || user.image;
            const joinDate = user.joinDate || (user.createdAt ? new Date(user.createdAt).toLocaleDateString() : null);
            
            // Get role badge styling
            const getRoleBadgeClass = () => {
              if (user.role === "Vendor") return "bg-golden-amber/10 text-golden-amber";
              if (user.role === "Admin") return "bg-deep-maroon/10 text-deep-maroon";
              return "bg-charcoal-grey/10 text-charcoal-grey/70";
            };
            
            return (
            <Card key={userId} className="p-6 hover:shadow-xl transition-all duration-300 group border-l-4 border-l-deep-maroon/20 hover:border-l-deep-maroon">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 flex-1">
                  {/* Profile Image/Avatar */}
                  {userImage ? (
                    <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-deep-maroon/10 to-golden-amber/10 flex items-center justify-center flex-shrink-0 border-2 border-deep-maroon/20">
                      <img 
                        src={userImage} 
                        alt={user.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = `<span class="text-white font-bold text-lg">${(user.name || 'U').charAt(0).toUpperCase()}</span>`;
                          e.target.parentElement.className = "w-14 h-14 rounded-full bg-gradient-to-br from-deep-maroon to-golden-amber flex items-center justify-center text-white font-bold text-lg flex-shrink-0";
                        }}
                      />
                    </div>
                  ) : (
                    <div className={`w-14 h-14 rounded-full bg-gradient-to-br from-deep-maroon to-golden-amber flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-lg`}>
                      {(user.name || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                    <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-charcoal-grey text-lg truncate">{user.name || 'User'}</h3>
                    <span className={`inline-block mt-1 text-xs px-2.5 py-1 rounded-lg font-semibold ${getRoleBadgeClass()}`}>
                      {user.role || 'User'}
                    </span>
                  </div>
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-lg font-semibold flex-shrink-0 ${
                    user.status === "active"
                      ? "bg-green-50 text-green-600 border border-green-200"
                      : user.status === "inactive"
                      ? "bg-gray-50 text-gray-600 border border-gray-200"
                      : "bg-red-50 text-red-600 border border-red-200"
                  }`}
                >
                  {user.status || 'active'}
                </span>
              </div>
              
              <div className="space-y-2.5 mb-4 pb-4 border-b border-charcoal-grey/10">
                <div className="flex items-center gap-2 text-sm text-charcoal-grey/70 group-hover:text-charcoal-grey transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-deep-maroon/5 flex items-center justify-center flex-shrink-0">
                    <FiMail className="w-4 h-4 text-deep-maroon" />
                  </div>
                  <span className="truncate flex-1">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2 text-sm text-charcoal-grey/70 group-hover:text-charcoal-grey transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-golden-amber/5 flex items-center justify-center flex-shrink-0">
                      <FiPhone className="w-4 h-4 text-golden-amber" />
                    </div>
                    <span>{user.phone}</span>
                  </div>
                )}
                {joinDate && (
                  <div className="flex items-center gap-2 text-sm text-charcoal-grey/70 group-hover:text-charcoal-grey transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-charcoal-grey/5 flex items-center justify-center flex-shrink-0">
                      <FiCalendar className="w-4 h-4 text-charcoal-grey/60" />
                    </div>
                    <span>Joined {joinDate}</span>
                  </div>
                )}
                {(user.totalOrders !== undefined && user.totalOrders > 0) && (
                  <div className="flex items-center gap-2 text-sm text-charcoal-grey/70 group-hover:text-charcoal-grey transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                      <FiUser className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="font-semibold">{user.totalOrders} {user.totalOrders === 1 ? 'order' : 'orders'}</span>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex-1 group-hover:bg-deep-maroon/5 group-hover:text-deep-maroon transition-colors"
                  onClick={() => {
                    setSelectedUser(user);
                    setIsModalOpen(true);
                  }}
                >
                  View Details
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="flex-1 group-hover:bg-deep-maroon group-hover:text-white transition-colors"
                  onClick={() => {
                    setSelectedUser(user);
                    setIsModalOpen(true);
                  }}
                >
                  Edit
                </Button>
              </div>
            </Card>
            );
          })}
        </div>

        {filteredUsers.length === 0 && (
          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <FiUser className="w-16 h-16 text-charcoal-grey/30 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-charcoal-grey mb-2">
                {users.length === 0 ? 'No Users Found' : 'No Users Match Your Filters'}
              </h3>
              <p className="text-charcoal-grey/60 mb-4">
                {users.length === 0 
                  ? 'There are no users registered yet. Users will appear here once they register.' 
                  : 'Try adjusting your search or filter criteria.'}
              </p>
              {hasActiveFilters && (
                <Button variant="secondary" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          </Card>
        )}
      </div>

      {/* User Detail Modal */}
      <UserDetailModal
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedUser(null);
        }}
        onUpdate={handleUpdateUser}
      />
    </div>
  );
};

export default AdminUsersPage;

