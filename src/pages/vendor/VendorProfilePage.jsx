import { useState, useEffect, useRef } from "react";
import { FiUser, FiMail, FiPhone, FiLock, FiEdit, FiX } from "react-icons/fi";
import toast from "react-hot-toast";
import Card from "../../ui/cards/Card";
import Button from "../../ui/buttons/Button";
import Input from "../../ui/inputs/Input";
import { getVendorData, updateVendorField, saveVendorData } from "../../utils/vendorData";

const VendorProfilePage = () => {
  const vendorData = getVendorData();
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: vendorData.name || "",
    email: vendorData.email || "",
    phone: vendorData.phone || "",
  });

  useEffect(() => {
    const data = getVendorData();
    setFormData({
      name: data.name || "",
      email: data.email || "",
      phone: data.phone || "",
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // Validate form
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!/^[\w\.-]+@[\w\.-]+\.\w+$/.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Save vendor data
    saveVendorData({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
    });

    setIsEditing(false);
    toast.success("Profile updated successfully!");
    
    // TODO: Replace with actual API call
    // try {
    //   await api.put('/vendor/profile', formData);
    //   toast.success("Profile updated successfully!");
    //   setIsEditing(false);
    // } catch (error) {
    //   toast.error("Failed to update profile");
    // }
  };

  const handlePhotoChange = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File size must be less than 2MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      // In a real app, upload to server
      toast.success("Photo updated successfully!");
      // TODO: Upload to server and update profile picture URL
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordSave = () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    // TODO: Replace with actual API call
    // try {
    //   await api.put('/vendor/change-password', passwordData);
    //   toast.success("Password changed successfully!");
    //   setShowChangePassword(false);
    //   setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    // } catch (error) {
    //   toast.error("Failed to change password. Please check your current password.");
    // }

    toast.success("Password changed successfully!");
    setShowChangePassword(false);
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl lg:text-4xl font-black text-charcoal-grey mb-2">
              Profile
            </h1>
            <p className="text-charcoal-grey/70">
              Manage your vendor account information
            </p>
          </div>
          {!isEditing ? (
            <Button variant="secondary" size="md" onClick={() => setIsEditing(true)}>
              <FiEdit className="w-5 h-5" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-3">
              <Button variant="ghost" size="md" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="md" onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          )}
        </div>

        {/* Profile Section */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-charcoal-grey mb-6">Personal Information</h2>
          
          {/* Profile Picture */}
          <div className="flex items-center gap-6 mb-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-deep-maroon to-golden-amber flex items-center justify-center text-white font-bold text-3xl shadow-lg">
              {formData.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <Button variant="secondary" size="sm" className="mb-2" onClick={handlePhotoChange}>
                Change Photo
              </Button>
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

        {/* Security Section */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-charcoal-grey mb-6">Security</h2>
          {!showChangePassword ? (
            <div className="space-y-4">
              <Button variant="secondary" size="md" onClick={() => setShowChangePassword(true)}>
                <FiLock className="w-5 h-5" />
                Change Password
              </Button>
              <p className="text-sm text-charcoal-grey/60">
                Last password change: Never
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-charcoal-grey">Change Password</h3>
                <button
                  onClick={() => {
                    setShowChangePassword(false);
                    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                  }}
                  className="p-2 rounded-lg hover:bg-charcoal-grey/5 text-charcoal-grey/60"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              <Input
                label="Current Password"
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                icon={FiLock}
                placeholder="Enter current password"
              />
              <Input
                label="New Password"
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                icon={FiLock}
                placeholder="Enter new password"
              />
              <Input
                label="Confirm New Password"
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                icon={FiLock}
                placeholder="Confirm new password"
              />
              <div className="flex gap-3">
                <Button variant="primary" size="md" onClick={handlePasswordSave}>
                  Save Password
                </Button>
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => {
                    setShowChangePassword(false);
                    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default VendorProfilePage;

