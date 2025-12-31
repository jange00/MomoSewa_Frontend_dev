import { useState, useMemo } from "react";
import { FiMapPin, FiCheck, FiPlus, FiX } from "react-icons/fi";
import toast from "react-hot-toast";
import Button from "../../../ui/buttons/Button";
import { useGet } from "../../../hooks/useApi";
import { API_ENDPOINTS } from "../../../api/config";
import { useAuth } from "../../../hooks/useAuth";
import apiClient from "../../../api/client";

const SavedAddresses = ({ onSelectAddress, selectedAddressId, currentFormData }) => {
  const { isAuthenticated } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddressLabel, setNewAddressLabel] = useState("");

  // Fetch addresses from API
  const { data: addressesData, isLoading, refetch } = useGet(
    'addresses',
    API_ENDPOINTS.ADDRESSES,
    { 
      showErrorToast: false,
      enabled: isAuthenticated, // Only fetch when authenticated
    }
  );

  // Memoize addresses to prevent unnecessary re-renders
  const savedAddresses = useMemo(() => {
    if (!addressesData) return [];
    if (Array.isArray(addressesData.data?.addresses)) {
      return addressesData.data.addresses;
    }
    if (Array.isArray(addressesData.data)) {
      return addressesData.data;
    }
    return [];
  }, [addressesData]);

  const handleSelect = (address) => {
    // Map API address structure to what DeliveryForm expects
    const mappedAddress = {
      id: address._id || address.id,
      label: address.label || 'Address',
      fullName: address.fullName || '',
      phone: address.phone || '',
      address: address.nearestLandmark || address.landmark || address.address || '',
      city: address.city || '',
      area: address.area || '',
      instructions: address.instructions || '',
      latitude: address.latitude,
      longitude: address.longitude,
      postalCode: address.postalCode || '',
    };
    onSelectAddress(mappedAddress);
  };

  const handleSaveCurrent = async (currentFormData) => {
    if (!currentFormData.fullName || !currentFormData.address || !currentFormData.city || !currentFormData.area) {
      toast.error("Please fill in at least name, address, city, and area to save this address");
      return;
    }

    if (!newAddressLabel.trim()) {
      toast.error("Please enter a label for this address (e.g., Home, Office)");
      return;
    }

    try {
      // Save address to backend API
      const response = await apiClient.post(API_ENDPOINTS.ADDRESSES, {
        label: newAddressLabel.trim(),
        city: currentFormData.city,
        area: currentFormData.area,
        nearestLandmark: currentFormData.address,
        phone: currentFormData.phone || '',
        postalCode: currentFormData.postalCode || '',
        fullName: currentFormData.fullName,
        latitude: currentFormData.latitude,
        longitude: currentFormData.longitude,
        instructions: currentFormData.instructions || '',
      });

      if (response.data.success) {
        toast.success("Address saved successfully!");
        setNewAddressLabel("");
        setShowAddForm(false);
        refetch(); // Refresh the addresses list
      }
    } catch (error) {
      console.error("Failed to save address:", error);
      toast.error(error.response?.data?.message || "Failed to save address");
    }
  };

  // Don't show if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-charcoal-grey/10 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-golden-amber/10 flex items-center justify-center">
            <FiMapPin className="w-5 h-5 text-golden-amber" />
          </div>
          <h3 className="text-lg font-bold text-charcoal-grey">Saved Addresses</h3>
        </div>
        <p className="text-sm text-charcoal-grey/50">Loading addresses...</p>
      </div>
    );
  }

  // Don't show if no addresses and not showing add form
  if (savedAddresses.length === 0 && !showAddForm) {
    return null;
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-charcoal-grey/10 p-6 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-golden-amber/10 flex items-center justify-center">
            <FiMapPin className="w-5 h-5 text-golden-amber" />
          </div>
          <h3 className="text-lg font-bold text-charcoal-grey">Saved Addresses</h3>
        </div>
        {!showAddForm && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowAddForm(true)}
          >
            <FiPlus className="w-4 h-4" />
            Save Current
          </Button>
        )}
      </div>

      {/* Save Current Address Form */}
      {showAddForm && (
        <div className="bg-charcoal-grey/5 rounded-xl p-4 border border-charcoal-grey/10">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-charcoal-grey">Save Current Address</p>
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewAddressLabel("");
              }}
              className="p-1 rounded-lg hover:bg-charcoal-grey/10 text-charcoal-grey/60"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Label (e.g., Home, Office, Work)"
              value={newAddressLabel}
              onChange={(e) => setNewAddressLabel(e.target.value)}
              className="w-full px-4 py-2 border border-charcoal-grey/12 rounded-xl focus:outline-none focus:ring-2 focus:ring-golden-amber/25 focus:border-golden-amber/35 text-charcoal-grey bg-white text-sm"
              onKeyPress={(e) => {
                if (e.key === "Enter" && newAddressLabel.trim()) {
                  handleSaveCurrent(currentFormData || {});
                }
              }}
            />
            <div className="flex gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleSaveCurrent(currentFormData || {})}
                className="flex-1"
              >
                Save
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setShowAddForm(false);
                  setNewAddressLabel("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Saved Addresses List */}
      {savedAddresses.length > 0 && (
        <div className="space-y-3">
          {savedAddresses.map((address) => {
            const addressId = address._id || address.id;
            const isSelected = selectedAddressId === addressId;
            
            return (
              <button
                key={addressId}
                onClick={() => handleSelect(address)}
                className={`w-full p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                  isSelected
                    ? "border-deep-maroon bg-deep-maroon/5 shadow-lg"
                    : "border-charcoal-grey/10 hover:border-charcoal-grey/20 hover:bg-charcoal-grey/2"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-charcoal-grey">{address.label || 'Address'}</span>
                      {isSelected && (
                        <FiCheck className="w-4 h-4 text-deep-maroon flex-shrink-0" />
                      )}
                      {address.isDefault && (
                        <span className="px-2 py-0.5 text-xs font-semibold bg-golden-amber/20 text-golden-amber rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="space-y-1 text-sm text-charcoal-grey/70">
                      {address.fullName && <p className="font-medium">{address.fullName}</p>}
                      {address.phone && <p>{address.phone}</p>}
                      <p>
                        {address.nearestLandmark || address.landmark || address.address || ''}
                        {address.area && `, ${address.area}`}
                        {address.city && `, ${address.city}`}
                      </p>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {savedAddresses.length === 0 && !showAddForm && (
        <p className="text-sm text-charcoal-grey/50 text-center py-4">
          No saved addresses yet. Save your current address for faster checkout next time!
        </p>
      )}
    </div>
  );
};

export default SavedAddresses;

