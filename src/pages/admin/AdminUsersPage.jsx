import { useState } from "react";
import Card from "../../ui/cards/Card";
import Button from "../../ui/buttons/Button";
import { FiSearch, FiUser, FiMail, FiPhone, FiCalendar, FiDownload } from "react-icons/fi";
import UserDetailModal from "../../features/admin-dashboard/modals/UserDetailModal";
import { StatsCardSkeleton, Skeleton } from "../../ui/skeletons";
import toast from "react-hot-toast";
import { useGet } from "../../hooks/useApi";
import { API_ENDPOINTS } from "../../api/config";

const AdminUsersPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch users from API
  const { data: usersData, isLoading } = useGet(
    'admin-users',
    `${API_ENDPOINTS.ADMIN}/users`,
    { showErrorToast: true }
  );

  const users = usersData?.data?.users || usersData?.data || [];

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      (user.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.phone || '').includes(searchQuery);
    const matchesRole = selectedRole === "all" || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton variant="title" className="mb-2 w-48" />
              <Skeleton variant="text" className="w-64" />
            </div>
            <Skeleton variant="button" />
          </div>
          <Card className="p-6">
            <Skeleton variant="text" className="w-full h-10 rounded-lg" />
          </Card>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <StatsCardSkeleton count={4} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Skeleton variant="avatar" className="w-12 h-12" />
                    <div>
                      <Skeleton variant="heading" className="mb-2 w-24" />
                      <Skeleton variant="text" className="w-16 h-4" />
                    </div>
                  </div>
                  <Skeleton variant="text" className="w-16 h-6 rounded-lg" />
                </div>
                <div className="space-y-2 mb-4">
                  <Skeleton variant="text" className="w-full" />
                  <Skeleton variant="text" className="w-3/4" />
                  <Skeleton variant="text" className="w-1/2" />
                </div>
                <div className="flex gap-2">
                  <Skeleton variant="button" className="flex-1" />
                  <Skeleton variant="button" className="flex-1" />
                </div>
              </Card>
            ))}
          </div>
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
            <h1 className="text-3xl font-black text-charcoal-grey">User Management</h1>
            <p className="text-charcoal-grey/70 mt-1">Manage all platform users</p>
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
                placeholder="Search users by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 border border-charcoal-grey/12 rounded-xl focus:outline-none focus:ring-2 focus:ring-golden-amber/25 focus:border-golden-amber/35 text-charcoal-grey bg-charcoal-grey/2"
              />
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
          <Card className="p-4 text-center">
            <p className="text-sm text-charcoal-grey/60 mb-1">Total Users</p>
            <p className="text-2xl font-black text-charcoal-grey">{users.length}</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-sm text-charcoal-grey/60 mb-1">Customers</p>
            <p className="text-2xl font-black text-deep-maroon">
              {users.filter((u) => u.role === "Customer").length}
            </p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-sm text-charcoal-grey/60 mb-1">Vendors</p>
            <p className="text-2xl font-black text-golden-amber">
              {users.filter((u) => u.role === "Vendor").length}
            </p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-sm text-charcoal-grey/60 mb-1">Active</p>
            <p className="text-2xl font-black text-green-600">
              {users.filter((u) => u.status === "active").length}
            </p>
          </Card>
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => {
            const userId = user._id || user.id;
            return (
            <Card key={userId} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-deep-maroon to-golden-amber flex items-center justify-center text-white font-bold text-lg">
                    {(user.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-charcoal-grey">{user.name}</h3>
                    <span className="text-xs px-2 py-1 rounded-lg bg-charcoal-grey/10 text-charcoal-grey/70 font-medium">
                      {user.role}
                    </span>
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-lg font-medium ${
                    user.status === "active"
                      ? "bg-green-50 text-green-600"
                      : "bg-red-50 text-red-600"
                  }`}
                >
                  {user.status}
                </span>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-charcoal-grey/70">
                  <FiMail className="w-4 h-4" />
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-charcoal-grey/70">
                  <FiPhone className="w-4 h-4" />
                  <span>{user.phone}</span>
                </div>
                {(user.createdAt || user.joinDate) && (
                  <div className="flex items-center gap-2 text-sm text-charcoal-grey/70">
                    <FiCalendar className="w-4 h-4" />
                    <span>
                      Joined {user.joinDate || 
                        (user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A')}
                    </span>
                  </div>
                )}
                {(user.totalOrders !== undefined) && (
                  <div className="flex items-center gap-2 text-sm text-charcoal-grey/70">
                    <FiUser className="w-4 h-4" />
                    <span>{user.totalOrders || 0} orders</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => {
                    setSelectedUser(user);
                    setIsModalOpen(true);
                  }}
                >
                  View Details
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex-1"
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
            <p className="text-charcoal-grey/60">No users found</p>
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
        onUpdate={async (userId, updatedData) => {
          try {
            // TODO: Implement user update API call
            // await updateUserMutation.mutateAsync({ id: userId, ...updatedData });
            console.log("Update user:", userId, updatedData);
            toast.info("User update feature coming soon");
            setIsModalOpen(false);
            setSelectedUser(null);
          } catch (error) {
            console.error("Failed to update user:", error);
          }
        }}
      />
    </div>
  );
};

export default AdminUsersPage;

