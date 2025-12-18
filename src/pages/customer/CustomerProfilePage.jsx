import { useState } from "react";
import { FiUser, FiMail, FiPhone, FiLock, FiEdit } from "react-icons/fi";
import toast from "react-hot-toast";
import Card from "../../ui/cards/Card";
import Button from "../../ui/buttons/Button";
import Input from "../../ui/inputs/Input";
import PasswordChangeDialog from "../../ui/modals/PasswordChangeDialog";

const CustomerProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: localStorage.getItem("name") || "Ram Bahadur",
    email: localStorage.getItem("email") || "ram@example.com",
    phone: localStorage.getItem("phone") || "+977 9800000000",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
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

    // Save to localStorage (replace with API call)
    localStorage.setItem("name", formData.name);
    localStorage.setItem("email", formData.email);
    localStorage.setItem("phone", formData.phone);
    setIsEditing(false);
    toast.success("Profile updated successfully");
  };

  const handleChangePhoto = () => {
    toast.info("Photo upload feature coming soon!");
    // TODO: Implement photo upload
  };

  const handleChangePassword = () => {
    setShowPasswordDialog(true);
  };

  const handleSavePassword = (formData) => {
    // TODO: Replace with actual API call
    // await api.put("/customer/password", formData);
    toast.success("Password changed successfully");
    setShowPasswordDialog(false);
  };

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
              <Button variant="secondary" size="sm" className="mb-2" onClick={handleChangePhoto}>
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
              Last password change: Never
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

