import { useState, useEffect } from "react";
import { FiSettings, FiBell, FiShield, FiCreditCard, FiLock, FiX } from "react-icons/fi";
import toast from "react-hot-toast";
import Card from "../../ui/cards/Card";
import Button from "../../ui/buttons/Button";
import Input from "../../ui/inputs/Input";
import Checkbox from "../../ui/inputs/Checkbox";
import { useGet } from "../../hooks/useApi";
import { updateVendorProfile } from "../../services/vendorService";
import { changePassword } from "../../services/userService";
import { API_ENDPOINTS } from "../../api/config";

const VendorSettingsPage = () => {
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Fetch vendor profile from API
  const { data: vendorProfileData, isLoading, error: vendorError, refetch } = useGet(
    'vendor-profile-settings',
    `${API_ENDPOINTS.VENDORS}/profile`,
    { 
      showErrorToast: false, // We'll handle errors manually
      retry: 1,
    }
  );

  const [settings, setSettings] = useState({
    storeName: "",
    // storeDescription: "",
    phone: "",
    email: "",
    address: "",
    autoAcceptOrders: localStorage.getItem("autoAcceptOrders") === "true" || false,
    emailNotifications: localStorage.getItem("emailNotifications") !== "false",
    smsNotifications: localStorage.getItem("smsNotifications") === "true" || false,
  });

  // Update settings when vendor profile data loads
  useEffect(() => {
    // Log error if present
    if (vendorError) {
      console.error('Error fetching vendor profile:', vendorError);
      toast.error(vendorError.message || 'Failed to load vendor profile');
      return;
    }

    if (vendorProfileData && !isLoading) {
      // Log the full response to understand the structure
      console.log('=== VENDOR PROFILE DATA DEBUG ===');
      console.log('Full vendor profile response:', vendorProfileData);
      console.log('Type of vendorProfileData:', typeof vendorProfileData);
      console.log('Is array?', Array.isArray(vendorProfileData));
      
      // Try multiple paths to extract vendor data
      // The API response structure could be:
      // 1. { success: true, data: { vendor: {...} } }
      // 2. { success: true, data: {...} }
      // 3. { vendor: {...} }
      // 4. Direct vendor object
      let data = null;
      
      if (vendorProfileData?.data?.vendor) {
        data = vendorProfileData.data.vendor;
        console.log('Found data at: vendorProfileData.data.vendor');
      } else if (vendorProfileData?.data && typeof vendorProfileData.data === 'object' && !Array.isArray(vendorProfileData.data)) {
        data = vendorProfileData.data;
        console.log('Found data at: vendorProfileData.data');
      } else if (vendorProfileData?.vendor) {
        data = vendorProfileData.vendor;
        console.log('Found data at: vendorProfileData.vendor');
      } else if (vendorProfileData && typeof vendorProfileData === 'object' && !Array.isArray(vendorProfileData) && vendorProfileData.email) {
        // Direct vendor object (has email field)
        data = vendorProfileData;
        console.log('Found data as direct vendor object');
      } else {
        data = {};
        console.log('No vendor data found, using empty object');
      }
      
      console.log('Extracted vendor data:', data);
      console.log('Available fields in data:', Object.keys(data));
      console.log('=== END DEBUG ===');
      
      // Only update if we have actual data
      if (data && Object.keys(data).length > 0) {
        // Extract userId data if it exists
        const userIdData = data.userId || {};
        
        setSettings(prev => ({
          storeName: data.businessName || data.storeName || data.name || userIdData.name || prev.storeName || "",
          // storeDescription: data.description || data.storeDescription || data.bio || prev.storeDescription || "",
          phone: userIdData.phone || data.phone || data.phoneNumber || prev.phone || "",
          email: userIdData.email || data.email || prev.email || "",
          address: data.businessAddress || data.address || data.location || prev.address || "",
          autoAcceptOrders: localStorage.getItem("autoAcceptOrders") === "true" || false,
          emailNotifications: localStorage.getItem("emailNotifications") !== "false",
          smsNotifications: localStorage.getItem("smsNotifications") === "true" || false,
        }));
      }
    }
  }, [vendorProfileData, isLoading, vendorError]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async () => {
    // Validate required fields
    if (!settings.storeName.trim() || !settings.phone.trim() || !settings.email.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate email format
    if (!/^[\w\.-]+@[\w\.-]+\.\w+$/.test(settings.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSaving(true);

    try {
      // Prepare profile data for API
      const profileData = {
        businessName: settings.storeName.trim(),
        // description: settings.storeDescription.trim(),
        phone: settings.phone.trim(),
        email: settings.email.trim(),
        businessAddress: settings.address.trim(),
      };

      // Update vendor profile via API
      await updateVendorProfile(profileData);

      // Save notification preferences to localStorage (these might not have backend endpoints)
      localStorage.setItem("autoAcceptOrders", settings.autoAcceptOrders.toString());
      localStorage.setItem("emailNotifications", settings.emailNotifications.toString());
      localStorage.setItem("smsNotifications", settings.smsNotifications.toString());

      // Refetch vendor profile to get updated data
      await refetch();

      toast.success("Settings saved successfully!");
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error(error.message || "Failed to save settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordSave = async () => {
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

    setIsChangingPassword(true);

    try {
      // Call change password API
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      toast.success("Password changed successfully!");
      setShowChangePassword(false);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      console.error("Failed to change password:", error);
      toast.error(error.message || "Failed to change password. Please check your current password.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 lg:p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-deep-maroon"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
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
          <Button 
            variant="primary" 
            size="md" 
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Changes"}
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
            {/* <Input
              label="Store Description"
              type="text"
              name="storeDescription"
              value={settings.storeDescription}
              onChange={handleChange}
              placeholder="Describe your store"
            /> */}
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
                <Button 
                  variant="primary" 
                  size="md" 
                  onClick={handlePasswordSave}
                  disabled={isChangingPassword}
                >
                  {isChangingPassword ? "Changing..." : "Save Password"}
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

