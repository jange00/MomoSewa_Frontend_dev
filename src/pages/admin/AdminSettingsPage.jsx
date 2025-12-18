import { useState } from "react";
import Card from "../../ui/cards/Card";
import Button from "../../ui/buttons/Button";
import Input from "../../ui/inputs/Input";
import PasswordChangeDialog from "../../ui/modals/PasswordChangeDialog";
import toast from "react-hot-toast";
import { FiSave, FiShield, FiBell, FiGlobe, FiCreditCard, FiKey, FiFileText, FiLock } from "react-icons/fi";

const AdminSettingsPage = () => {
  const [settings, setSettings] = useState({
    platformName: "MomoSewa",
    platformEmail: "admin@momosewa.com",
    platformPhone: "+977 9800000000",
    commissionRate: 15,
    deliveryFee: 50,
    minOrderAmount: 200,
    enableNotifications: true,
    enableEmailNotifications: true,
    enableSMSNotifications: false,
  });

  const handleChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showApiKeysModal, setShowApiKeysModal] = useState(false);
  const [showAccessLogsModal, setShowAccessLogsModal] = useState(false);

  const handleSave = () => {
    // TODO: Replace with actual API call
    toast.success("Settings saved successfully!");
    console.log("Saving settings:", settings);
  };

  const handlePasswordChange = (passwordData) => {
    // TODO: Replace with actual API call
    console.log("Changing admin password:", passwordData);
    toast.success("Admin password changed successfully!");
    setShowPasswordDialog(false);
  };

  const handleManageApiKeys = () => {
    // TODO: Replace with actual API call
    setShowApiKeysModal(true);
    toast.info("API Keys management - Coming soon");
  };

  const handleViewAccessLogs = () => {
    // TODO: Replace with actual API call
    setShowAccessLogsModal(true);
    toast.info("Access Logs - Coming soon");
  };

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-black text-charcoal-grey">Platform Settings</h1>
          <p className="text-charcoal-grey/70 mt-1">Manage platform configuration and preferences</p>
        </div>

        {/* General Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <FiGlobe className="w-6 h-6 text-deep-maroon" />
            <h2 className="text-xl font-black text-charcoal-grey">General Settings</h2>
          </div>
          <div className="space-y-4">
            <Input
              label="Platform Name"
              value={settings.platformName}
              onChange={(e) => handleChange("platformName", e.target.value)}
            />
            <Input
              label="Platform Email"
              type="email"
              value={settings.platformEmail}
              onChange={(e) => handleChange("platformEmail", e.target.value)}
            />
            <Input
              label="Platform Phone"
              value={settings.platformPhone}
              onChange={(e) => handleChange("platformPhone", e.target.value)}
            />
          </div>
        </Card>

        {/* Business Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <FiCreditCard className="w-6 h-6 text-deep-maroon" />
            <h2 className="text-xl font-black text-charcoal-grey">Business Settings</h2>
          </div>
          <div className="space-y-4">
            <Input
              label="Commission Rate (%)"
              type="number"
              value={settings.commissionRate}
              onChange={(e) => handleChange("commissionRate", e.target.value)}
            />
            <Input
              label="Default Delivery Fee (Rs.)"
              type="number"
              value={settings.deliveryFee}
              onChange={(e) => handleChange("deliveryFee", e.target.value)}
            />
            <Input
              label="Minimum Order Amount (Rs.)"
              type="number"
              value={settings.minOrderAmount}
              onChange={(e) => handleChange("minOrderAmount", e.target.value)}
            />
          </div>
        </Card>

        {/* Notification Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <FiBell className="w-6 h-6 text-deep-maroon" />
            <h2 className="text-xl font-black text-charcoal-grey">Notification Settings</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-charcoal-grey">Enable Notifications</p>
                <p className="text-sm text-charcoal-grey/60">Receive platform notifications</p>
              </div>
              <input
                type="checkbox"
                checked={settings.enableNotifications}
                onChange={(e) => handleChange("enableNotifications", e.target.checked)}
                className="w-5 h-5 rounded border-charcoal-grey/20 text-deep-maroon focus:ring-deep-maroon"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-charcoal-grey">Email Notifications</p>
                <p className="text-sm text-charcoal-grey/60">Receive notifications via email</p>
              </div>
              <input
                type="checkbox"
                checked={settings.enableEmailNotifications}
                onChange={(e) => handleChange("enableEmailNotifications", e.target.checked)}
                className="w-5 h-5 rounded border-charcoal-grey/20 text-deep-maroon focus:ring-deep-maroon"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-charcoal-grey">SMS Notifications</p>
                <p className="text-sm text-charcoal-grey/60">Receive notifications via SMS</p>
              </div>
              <input
                type="checkbox"
                checked={settings.enableSMSNotifications}
                onChange={(e) => handleChange("enableSMSNotifications", e.target.checked)}
                className="w-5 h-5 rounded border-charcoal-grey/20 text-deep-maroon focus:ring-deep-maroon"
              />
            </div>
          </div>
        </Card>

        {/* Security Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <FiShield className="w-6 h-6 text-deep-maroon" />
            <h2 className="text-xl font-black text-charcoal-grey">Security Settings</h2>
          </div>
          <div className="space-y-4">
            <Button 
              variant="secondary" 
              size="md" 
              className="w-full"
              onClick={() => setShowPasswordDialog(true)}
            >
              <FiLock className="w-4 h-4 mr-2" />
              Change Admin Password
            </Button>
            <Button 
              variant="secondary" 
              size="md" 
              className="w-full"
              onClick={handleManageApiKeys}
            >
              <FiKey className="w-4 h-4 mr-2" />
              Manage API Keys
            </Button>
            <Button 
              variant="secondary" 
              size="md" 
              className="w-full"
              onClick={handleViewAccessLogs}
            >
              <FiFileText className="w-4 h-4 mr-2" />
              View Access Logs
            </Button>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button variant="primary" size="lg" onClick={handleSave}>
            <FiSave className="w-5 h-5 mr-2" />
            Save Settings
          </Button>
        </div>
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

export default AdminSettingsPage;

