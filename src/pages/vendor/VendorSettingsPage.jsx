import { useState, useEffect } from "react";
import { FiSettings, FiBell, FiShield, FiCreditCard, FiLock, FiX } from "react-icons/fi";
import toast from "react-hot-toast";
import Card from "../../ui/cards/Card";
import Button from "../../ui/buttons/Button";
import Input from "../../ui/inputs/Input";
import Checkbox from "../../ui/inputs/Checkbox";
import { getVendorData, saveVendorData } from "../../utils/vendorData";

const VendorSettingsPage = () => {
  const vendorData = getVendorData();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [settings, setSettings] = useState({
    storeName: vendorData.storeName || vendorData.businessName || "My Momo Store",
    storeDescription: vendorData.storeDescription || "Delicious momo delivered fresh to your door",
    phone: vendorData.phone || "+977 9800000000",
    email: vendorData.email || "vendor@example.com",
    address: vendorData.businessAddress || "",
    autoAcceptOrders: localStorage.getItem("autoAcceptOrders") === "true" || false,
    emailNotifications: localStorage.getItem("emailNotifications") !== "false",
    smsNotifications: localStorage.getItem("smsNotifications") === "true" || false,
  });

  useEffect(() => {
    const data = getVendorData();
    setSettings({
      storeName: data.storeName || data.businessName || "My Momo Store",
      storeDescription: data.storeDescription || "Delicious momo delivered fresh to your door",
      phone: data.phone || "+977 9800000000",
      email: data.email || "vendor@example.com",
      address: data.businessAddress || "",
      autoAcceptOrders: localStorage.getItem("autoAcceptOrders") === "true" || false,
      emailNotifications: localStorage.getItem("emailNotifications") !== "false",
      smsNotifications: localStorage.getItem("smsNotifications") === "true" || false,
    });
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = () => {
    // Validate required fields
    if (!settings.storeName.trim() || !settings.phone.trim() || !settings.email.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Save vendor data
    saveVendorData({
      storeName: settings.storeName,
      storeDescription: settings.storeDescription,
      phone: settings.phone,
      email: settings.email,
      businessAddress: settings.address,
    });

    // Save notification preferences
    localStorage.setItem("autoAcceptOrders", settings.autoAcceptOrders.toString());
    localStorage.setItem("emailNotifications", settings.emailNotifications.toString());
    localStorage.setItem("smsNotifications", settings.smsNotifications.toString());

    toast.success("Settings saved successfully!");
    
    // TODO: Replace with actual API call
    // try {
    //   await api.put('/vendor/settings', settings);
    //   toast.success("Settings saved successfully!");
    // } catch (error) {
    //   toast.error("Failed to save settings");
    // }
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
              Settings
            </h1>
            <p className="text-charcoal-grey/70">
              Configure your vendor account settings
            </p>
          </div>
          <Button variant="primary" size="md" onClick={handleSave}>
            Save Changes
          </Button>
        </div>

        {/* Store Information */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-deep-maroon/10 via-golden-amber/5 to-deep-maroon/10 flex items-center justify-center">
              <FiSettings className="w-5 h-5 text-deep-maroon" />
            </div>
            <h2 className="text-xl font-bold text-charcoal-grey">
              Store Information
            </h2>
          </div>
          <div className="space-y-4">
            <Input
              label="Store Name"
              type="text"
              name="storeName"
              value={settings.storeName}
              onChange={handleChange}
            />
            <Input
              label="Store Description"
              type="textarea"
              name="storeDescription"
              value={settings.storeDescription}
              onChange={handleChange}
            />
            <Input
              label="Phone Number"
              type="tel"
              name="phone"
              value={settings.phone}
              onChange={handleChange}
            />
            <Input
              label="Email"
              type="email"
              name="email"
              value={settings.email}
              onChange={handleChange}
            />
            <Input
              label="Address"
              type="text"
              name="address"
              value={settings.address}
              onChange={handleChange}
            />
          </div>
        </Card>

        {/* Order Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-deep-maroon/10 via-golden-amber/5 to-deep-maroon/10 flex items-center justify-center">
              <FiCreditCard className="w-5 h-5 text-deep-maroon" />
            </div>
            <h2 className="text-xl font-bold text-charcoal-grey">
              Order Settings
            </h2>
          </div>
          <div className="space-y-4">
            <Checkbox
              label="Auto-accept orders"
              name="autoAcceptOrders"
              checked={settings.autoAcceptOrders}
              onChange={handleChange}
            />
            <p className="text-sm text-charcoal-grey/60">
              When enabled, orders will be automatically accepted without manual approval
            </p>
          </div>
        </Card>

        {/* Notification Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-deep-maroon/10 via-golden-amber/5 to-deep-maroon/10 flex items-center justify-center">
              <FiBell className="w-5 h-5 text-deep-maroon" />
            </div>
            <h2 className="text-xl font-bold text-charcoal-grey">
              Notification Settings
            </h2>
          </div>
          <div className="space-y-4">
            <Checkbox
              label="Email notifications"
              name="emailNotifications"
              checked={settings.emailNotifications}
              onChange={handleChange}
            />
            <Checkbox
              label="SMS notifications"
              name="smsNotifications"
              checked={settings.smsNotifications}
              onChange={handleChange}
            />
          </div>
        </Card>

        {/* Security Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-deep-maroon/10 via-golden-amber/5 to-deep-maroon/10 flex items-center justify-center">
              <FiShield className="w-5 h-5 text-deep-maroon" />
            </div>
            <h2 className="text-xl font-bold text-charcoal-grey">
              Security
            </h2>
          </div>
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

export default VendorSettingsPage;

