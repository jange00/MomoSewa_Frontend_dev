import { useState, useEffect, useRef, useMemo } from "react";
import { FiUser, FiMail, FiPhone, FiLock, FiEdit, FiUpload, FiTrash2 } from "react-icons/fi";
import toast from "react-hot-toast";
import Card from "../../ui/cards/Card";
import Button from "../../ui/buttons/Button";
import Input from "../../ui/inputs/Input";
import PasswordChangeDialog from "../../ui/modals/PasswordChangeDialog";
import { useAuth } from "../../hooks/useAuth";
import { useGet, usePatch } from "../../hooks/useApi";
import { API_ENDPOINTS } from "../../api/config";
import * as userService from "../../services/userService";

const CustomerProfilePage = () => {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [deletingPhoto, setDeletingPhoto] = useState(false);
  
  // Fetch profile from API (gracefully handle 404 if endpoint doesn't exist)
  const { data: profileData, isLoading, refetch } = useGet(
    'customer-profile',
    `${API_ENDPOINTS.USERS}/profile`,
    { 
      showErrorToast: false, // Don't show error toast for 404 - endpoint might not exist
      retry: false, // Don't retry on 404
    }
  );

  // Memoize apiProfile to prevent infinite loops
  const apiProfile = useMemo(() => {
    return profileData?.data || {};
  }, [profileData?.data]);
  
  const [formData, setFormData] = useState({
    name: user?.name || apiProfile.name || "",
    email: user?.email || apiProfile.email || "",
    phone: user?.phone || apiProfile.phone || "",
  });

  // Update form data when API data loads or user changes
  useEffect(() => {
    // Only update if values actually changed to prevent infinite loops
    if (apiProfile && Object.keys(apiProfile).length > 0) {
      setFormData(prev => {
        const newName = apiProfile.name || prev.name;
        const newEmail = apiProfile.email || prev.email;
        const newPhone = apiProfile.phone || prev.phone;
        
        // Only update if values changed
        if (newName !== prev.name || newEmail !== prev.email || newPhone !== prev.phone) {
          return {
            name: newName,
            email: newEmail,
            phone: newPhone,
          };
        }
        return prev;
      });
    } else if (user) {
      setFormData(prev => {
        const newName = user.name || prev.name;
        const newEmail = user.email || prev.email;
        const newPhone = user.phone || prev.phone;
        
        // Only update if values changed
        if (newName !== prev.name || newEmail !== prev.email || newPhone !== prev.phone) {
          return {
            name: newName,
            email: newEmail,
            phone: newPhone,
          };
        }
        return prev;
      });
    }
  }, [apiProfile, user]);

  // Update profile mutation
  const updateProfileMutation = usePatch(
    'customer-profile',
    `${API_ENDPOINTS.USERS}/profile`,
    { showSuccessToast: false, showErrorToast: false } // We'll handle toasts manually for better UX
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log("handleChange called:", { name, value, isEditing });
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    console.log("handleSave called with formData:", formData);
    
    // Validation
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!formData.email.trim()) {
      toast.error("Email is required");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (!formData.phone.trim()) {
      toast.error("Phone number is required");
      return;
    }

    try {
      console.log("Calling updateProfileMutation with:", {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      });
      
      const result = await updateProfileMutation.mutateAsync({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      });
      
      console.log("Update result:", result);

      if (result.success) {
        toast.success(result.message || "Profile updated successfully");
        // Update user state in auth context
        if (result.data?.user) {
          updateUser(result.data.user);
        } else {
          // Fallback: update user with form data
          updateUser({
            ...user,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
          });
        }
        setIsEditing(false);
        refetch(); // Refresh profile data
      }
    } catch (error) {
      console.error("Failed to update profile - Full error:", error);
      console.error("Error status:", error?.status, error?.response?.status);
      console.error("Error message:", error?.message);
      console.error("Error response data:", error?.response?.data);
      
      // Extract error message from different possible error structures
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          error?.details?.message ||
                          "Failed to update profile";
      
      const status = error?.status || error?.response?.status;
      
      // If 404, the endpoint doesn't exist yet
      if (status === 404) {
        toast.error("Profile update feature is not available yet. Please contact support.");
      } else if (status === 500) {
        toast.error(`Server error: ${errorMessage}. Please try again later.`);
      } else if (status === 400 || status === 422) {
        toast.error(`Validation error: ${errorMessage}`);
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleChangePhoto = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      console.log("No file selected");
      return;
    }

    console.log("File selected:", {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified
    });

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size must be less than 2MB");
      return;
    }

    try {
      setUploadingPhoto(true);
      console.log("Calling uploadProfilePicture with file:", file);
      const result = await userService.uploadProfilePicture(file);
      
      console.log("Upload result:", result);
      console.log("Result data:", result.data);
      console.log("User data:", result.data?.user);
      console.log("Profile picture URL:", result.data?.user?.profilePicture || result.data?.profilePicture);
      
      if (result.success) {
        toast.success("Profile picture updated successfully");
        // Update user state if new user data is returned
        if (result.data?.user) {
          console.log("Updating user with new data:", result.data.user);
          updateUser(result.data.user);
        } else if (result.data?.profilePicture) {
          // If profilePicture is returned directly, update user state
          console.log("Updating user with profilePicture URL:", result.data.profilePicture);
          updateUser({
            ...user,
            profilePicture: result.data.profilePicture
          });
        }
        // Always refetch to get latest data
        console.log("Refetching profile data...");
        await refetch();
        console.log("Refetch completed");
      }
    } catch (error) {
      console.error("Failed to upload profile picture - Full error:", error);
      console.error("Error status:", error?.status, error?.response?.status);
      console.error("Error message:", error?.message);
      console.error("Error response data:", error?.response?.data);
      
      // Extract error message from different possible error structures
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          error?.details?.message ||
                          "Failed to upload profile picture";
      
      const status = error?.status || error?.response?.status;
      
      // If 404, the endpoint doesn't exist yet
      if (status === 404) {
        toast.error("Profile picture upload is not available yet. Please contact support.");
      } else if (status === 500) {
        // Check if it's a cloud storage configuration issue
        const errorDetails = error?.details || error?.response?.data?.details || '';
        if (errorDetails.includes('cloud_name') || errorDetails.includes('cloud storage')) {
          toast.error("Profile picture upload is temporarily unavailable due to server configuration. Please try again later or contact support.");
        } else {
          toast.error(`Server error: ${errorMessage}. Please check the file format and size, then try again.`);
        }
      } else if (status === 400 || status === 422) {
        toast.error(`Validation error: ${errorMessage}`);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setUploadingPhoto(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeletePhoto = async () => {
    if (!profilePicture) return;
    
    if (!window.confirm("Are you sure you want to delete your profile picture?")) {
      return;
    }

    try {
      setDeletingPhoto(true);
      const result = await userService.deleteProfilePicture();
      
      if (result.success) {
        toast.success("Profile picture deleted successfully");
        // Update user state if new user data is returned
        if (result.data?.user) {
          updateUser(result.data.user);
        }
        refetch(); // Refresh profile data
      }
    } catch (error) {
      console.error("Failed to delete profile picture:", error);
      // If 404, the endpoint doesn't exist yet
      if (error.status === 404 || error.response?.status === 404) {
        toast.error("Delete profile picture feature is not available yet. Please contact support.");
      } else {
        toast.error(error.message || "Failed to delete profile picture");
      }
    } finally {
      setDeletingPhoto(false);
    }
  };

  const handleChangePassword = () => {
    setShowPasswordDialog(true);
  };

  const handleSavePassword = async (passwordData) => {
    try {
      console.log("Attempting to change password with data:", {
        currentPassword: passwordData.current ? "***" : "missing",
        newPassword: passwordData.new ? "***" : "missing",
        confirmPassword: passwordData.confirm ? "***" : "missing"
      });

      const result = await userService.changePassword({
        currentPassword: passwordData.current,
        newPassword: passwordData.new,
      });

      console.log("Password change result:", result);

      if (result && result.success) {
        toast.success(result.message || "Password changed successfully");
        setShowPasswordDialog(false);
      } else {
        // If result exists but success is false
        const errorMsg = result?.message || "Failed to change password. Please try again.";
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error("Failed to change password - Full error:", error);
      console.error("Error type:", typeof error);
      console.error("Error keys:", Object.keys(error || {}));
      console.error("Error status:", error?.status);
      console.error("Error response status:", error?.response?.status);
      console.error("Error message:", error?.message);
      console.error("Error response data:", error?.response?.data);
      console.error("Error details:", error?.details);

      // handleApiError returns an object with { message, details, status, success, response }
      // When thrown, we can access these properties directly
      const status = error?.status || error?.response?.status;
      const errorMessage = error?.message || error?.response?.data?.message || "Failed to change password";
      const errorDetails = error?.details || error?.response?.data?.details;

      if (status === 400 || status === 422) {
        // Validation error
        if (errorDetails) {
          if (Array.isArray(errorDetails)) {
            const detailMessages = errorDetails.map(d => {
              if (typeof d === 'string') return d;
              return d.message || d.field || JSON.stringify(d);
            }).join(", ");
            toast.error(`Validation error: ${detailMessages}`);
          } else if (typeof errorDetails === 'string') {
            toast.error(`Validation error: ${errorDetails}`);
          } else {
            toast.error(`Validation error: ${errorMessage}`);
          }
        } else {
          toast.error(`Validation error: ${errorMessage}`);
        }
      } else if (status === 401) {
        toast.error("Current password is incorrect. Please try again.");
      } else if (status === 403) {
        toast.error("You don't have permission to change your password. Please contact support.");
      } else if (status === 404) {
        console.error("Backend endpoint missing. Expected one of:");
        console.error("  - POST /api/v1/users/profile/change-password");
        console.error("  - POST /api/v1/users/change-password");
        toast.error("Password change feature is not available yet. Please contact support or check backend implementation.");
      } else if (status === 500) {
        toast.error("Server error. Please try again later or contact support.");
      } else if (status) {
        toast.error(`${errorMessage} (Status: ${status})`);
      } else {
        // Network error or other issue
        toast.error(errorMessage || "Failed to change password. Please check your connection and try again.");
      }
    }
  };

  // Get profile picture from multiple possible locations
  const profilePicture = apiProfile.profilePicture || 
                        apiProfile.user?.profilePicture ||
                        user?.profilePicture ||
                        profileData?.data?.user?.profilePicture ||
                        null;
  
  console.log("Profile picture sources:", {
    apiProfile: apiProfile.profilePicture,
    apiProfileUser: apiProfile.user?.profilePicture,
    user: user?.profilePicture,
    profileData: profileData?.data?.user?.profilePicture,
    final: profilePicture
  });
  
  const displayName = formData.name || user?.name || "Customer";

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 lg:p-8">
        <div className="max-w-4xl mx-auto flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-deep-maroon"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl lg:text-4xl font-black text-charcoal-grey mb-2">
              Profile & Settings
            </h1>
            <p className="text-charcoal-grey/70">
              Manage your account information and preferences
            </p>
          </div>
          {!isEditing ? (
            <Button 
              variant="secondary" 
              size="md" 
              onClick={() => {
                console.log("Edit button clicked, setting isEditing to true");
                setIsEditing(true);
              }}
            >
              <FiEdit className="w-5 h-5" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-3">
              <Button 
                variant="ghost" 
                size="md" 
                onClick={() => {
                  setIsEditing(false);
                  // Reset form data to original values
                  if (apiProfile && Object.keys(apiProfile).length > 0) {
                    setFormData({
                      name: apiProfile.name || "",
                      email: apiProfile.email || "",
                      phone: apiProfile.phone || "",
                    });
                  } else if (user) {
                    setFormData({
                      name: user.name || "",
                      email: user.email || "",
                      phone: user.phone || "",
                    });
                  }
                }}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                size="md" 
                onClick={handleSave}
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
        </div>

        {/* Profile Section */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-charcoal-grey mb-6">Personal Information</h2>
          
          {/* Profile Picture */}
          <div className="flex items-center gap-6 mb-6">
            <div className="relative">
              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt={displayName}
                  className="w-24 h-24 rounded-full object-cover shadow-lg border-2 border-golden-amber/20"
                  onError={(e) => {
                    console.error("Failed to load profile picture:", profilePicture);
                    console.error("Image error:", e);
                    // Fallback to placeholder if image fails to load
                    e.target.style.display = 'none';
                  }}
                  onLoad={() => {
                    console.log("Profile picture loaded successfully:", profilePicture);
                  }}
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-deep-maroon to-golden-amber flex items-center justify-center text-white font-bold text-3xl shadow-lg">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              {(uploadingPhoto || deletingPhoto) && (
                <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              )}
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <div className="flex gap-2 mb-2">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={handleChangePhoto}
                  disabled={uploadingPhoto || deletingPhoto}
                >
                  <FiUpload className="w-4 h-4 mr-2" />
                  {uploadingPhoto ? "Uploading..." : profilePicture ? "Change Photo" : "Upload Photo"}
                </Button>
                {profilePicture && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleDeletePhoto}
                    disabled={uploadingPhoto || deletingPhoto}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <FiTrash2 className="w-4 h-4 mr-2" />
                    {deletingPhoto ? "Deleting..." : "Delete"}
                  </Button>
                )}
              </div>
              <p className="text-xs text-charcoal-grey/60">
                JPG, PNG or GIF. Max size 2MB
              </p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              icon={FiUser}
              disabled={!isEditing}
            />
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              icon={FiMail}
              disabled={!isEditing}
            />
            <Input
              label="Phone Number"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              icon={FiPhone}
              disabled={!isEditing}
            />
          </div>
        </Card>

        {/* Preferences Section */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-charcoal-grey mb-6">Preferences</h2>
          <div className="space-y-4">
            <p className="text-charcoal-grey/60">
              Preference settings will be available here (dietary preferences, spice level, etc.)
            </p>
          </div>
        </Card>

        {/* Security Section */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-charcoal-grey mb-6">Security</h2>
          <div className="space-y-4">
            <Button variant="secondary" size="md" onClick={handleChangePassword}>
              <FiLock className="w-5 h-5" />
              Change Password
            </Button>
            <p className="text-sm text-charcoal-grey/60">
              {apiProfile.lastPasswordChange 
                ? `Last password change: ${new Date(apiProfile.lastPasswordChange).toLocaleDateString()}`
                : "Last password change: Never"
              }
            </p>
          </div>
        </Card>

        {/* Change Password Dialog */}
        <PasswordChangeDialog
          isOpen={showPasswordDialog}
          onClose={() => setShowPasswordDialog(false)}
          onConfirm={handleSavePassword}
        />
      </div>
    </div>
  );
};

export default CustomerProfilePage;

