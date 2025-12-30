import { useState, useEffect } from "react";
import { FiSettings, FiBell, FiCreditCard, FiEdit } from "react-icons/fi";
import toast from "react-hot-toast";
import Card from "../../ui/cards/Card";
import Button from "../../ui/buttons/Button";
import Input from "../../ui/inputs/Input";
import Checkbox from "../../ui/inputs/Checkbox";
import { ProfileSkeleton } from "../../ui/skeletons";
import { useGet } from "../../hooks/useApi";
import { updateVendorProfile } from "../../services/vendorService";
import { API_ENDPOINTS } from "../../api/config";

const VendorSettingsPage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
    // Validate required fields (email and phone are read-only, so we don't validate them)
    if (!settings.storeName.trim() || !settings.address.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSaving(true);

    try {
      // Prepare profile data for API (exclude email and phone as they are read-only)
      const profileData = {
        businessName: settings.storeName.trim(),
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

      setIsEditing(false);
      toast.success("Settings saved successfully!");
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error(error.message || "Failed to save settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset to original values from API
    if (vendorProfileData && !isLoading) {
      let data = null;
      
      if (vendorProfileData?.data?.vendor) {
        data = vendorProfileData.data.vendor;
      } else if (vendorProfileData?.data && typeof vendorProfileData.data === 'object' && !Array.isArray(vendorProfileData.data)) {
        data = vendorProfileData.data;
      } else if (vendorProfileData?.vendor) {
        data = vendorProfileData.vendor;
      }
      
      if (data) {
        const userIdData = data.userId || {};
        setSettings(prev => ({
          ...prev,
          storeName: data.businessName || data.storeName || data.name || userIdData.name || "",
          address: data.businessAddress || data.address || data.location || "",
        }));
      }
    }
    setIsEditing(false);
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
          {!isEditing ? (
            <Button variant="secondary" size="md" onClick={() => setIsEditing(true)}>
              <FiEdit className="w-5 h-5" />
              Edit Settings
            </Button>
          ) : (
            <div className="flex gap-3">
              <Button 
                variant="ghost" 
                size="md" 
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                size="md" 
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
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
              disabled={!isEditing}
            />
            {/* <Input
              label="Store Description"
              type="text"
              name="storeDescription"
              value={settings.storeDescription}
              onChange={handleChange}
              placeholder="Describe your store"
              disabled={!isEditing}
            /> */}
            <Input
              label="Phone Number"
              type="tel"
              name="phone"
              value={settings.phone}
              onChange={handleChange}
              disabled={true}
            />
            <Input
              label="Email"
              type="email"
              name="email"
              value={settings.email}
              onChange={handleChange}
              disabled={true}
            />
            <Input
              label="Address"
              type="text"
              name="address"
              value={settings.address}
              onChange={handleChange}
              disabled={!isEditing}
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
      </div>
    </div>
  );
};

export default VendorSettingsPage;

