import { useState, useEffect } from "react";
import Card from "../../ui/cards/Card";
import Button from "../../ui/buttons/Button";
import Input from "../../ui/inputs/Input";
import PasswordChangeDialog from "../../ui/modals/PasswordChangeDialog";
import { ProfileSkeleton } from "../../ui/skeletons";
import toast from "react-hot-toast";
import { FiSave, FiUser, FiMail, FiPhone, FiLock } from "react-icons/fi";
import { useAuth } from "../../hooks/useAuth";
import { useGet, usePut } from "../../hooks/useApi";
import { API_ENDPOINTS } from "../../api/config";

const AdminProfilePage = () => {
  const { user } = useAuth();
  
  // Fetch admin profile from API
  const { data: profileData, isLoading } = useGet(
    'admin-profile',
    `${API_ENDPOINTS.USERS}/profile`,
    { showErrorToast: true }
  );

  const apiProfile = profileData?.data || {};
  
  const [profile, setProfile] = useState({
    name: user?.name || apiProfile.name || "Admin",
    email: user?.email || apiProfile.email || "admin@momosewa.com",
    phone: user?.phone || apiProfile.phone || "+977 9800000000",
  });

  // Update profile when API data loads
  useEffect(() => {
    if (apiProfile && Object.keys(apiProfile).length > 0) {
      setProfile(prev => ({
        name: apiProfile.name || prev.name,
        email: apiProfile.email || prev.email,
        phone: apiProfile.phone || prev.phone,
      }));
    } else if (user) {
      setProfile(prev => ({
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }));
    }
  }, [apiProfile, user]);

  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

  const handleChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  // Update profile mutation
  const updateProfileMutation = usePut(
    'admin-profile',
    `${API_ENDPOINTS.USERS}/profile`,
    { showSuccessToast: true, showErrorToast: true }
  );

  const handleSave = async () => {
    try {
      await updateProfileMutation.mutateAsync(profile);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  const handlePasswordChange = (passwordData) => {
    // TODO: Replace with actual API call
    console.log("Changing password:", passwordData);
    toast.success("Password changed successfully!");
    setShowPasswordDialog(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <ProfileSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-black text-charcoal-grey">Admin Profile</h1>
          <p className="text-charcoal-grey/70 mt-1">Manage your admin account information</p>
        </div>

        {/* Profile Card */}
        <Card className="p-6">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-deep-maroon to-golden-amber flex items-center justify-center text-white font-bold text-4xl shadow-lg">
              {(profile.name || 'A').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-black text-charcoal-grey">{profile.name}</h2>
              <p className="text-charcoal-grey/70">{profile.email}</p>
              <span className="inline-block mt-2 px-3 py-1 rounded-lg bg-deep-maroon/10 text-deep-maroon text-sm font-semibold">
                Admin
              </span>
            </div>
            {!isEditing && (
              <Button variant="primary" size="md" onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <Input
                label="Full Name"
                icon={FiUser}
                value={profile.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
              <Input
                label="Email"
                type="email"
                icon={FiMail}
                value={profile.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
              <Input
                label="Phone"
                icon={FiPhone}
                value={profile.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
              <div className="flex gap-3 pt-4">
                <Button variant="primary" size="md" onClick={handleSave}>
                  <FiSave className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
                <Button variant="ghost" size="md" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-charcoal-grey/70">
                <FiUser className="w-5 h-5" />
                <span className="font-semibold">Name:</span>
                <span>{profile.name}</span>
              </div>
              <div className="flex items-center gap-3 text-charcoal-grey/70">
                <FiMail className="w-5 h-5" />
                <span className="font-semibold">Email:</span>
                <span>{profile.email}</span>
              </div>
              <div className="flex items-center gap-3 text-charcoal-grey/70">
                <FiPhone className="w-5 h-5" />
                <span className="font-semibold">Phone:</span>
                <span>{profile.phone}</span>
              </div>
            </div>
          )}
        </Card>

        {/* Security */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <FiLock className="w-6 h-6 text-deep-maroon" />
            <h2 className="text-xl font-black text-charcoal-grey">Security</h2>
          </div>
          <Button 
            variant="secondary" 
            size="md" 
            className="w-full"
            onClick={() => setShowPasswordDialog(true)}
          >
            Change Password
          </Button>
        </Card>
      </div>

      {/* Password Change Dialog */}
      <PasswordChangeDialog
        isOpen={showPasswordDialog}
        onClose={() => setShowPasswordDialog(false)}
        onConfirm={handlePasswordChange}
      />
    </div>
  );
};

export default AdminProfilePage;

