import { useState, useMemo, useEffect, useCallback } from "react";
import { FiMapPin, FiEdit, FiTrash2, FiPlus, FiCheck, FiPhone, FiFilter } from "react-icons/fi";
import toast from "react-hot-toast";
import Card from "../../ui/cards/Card";
import Button from "../../ui/buttons/Button";
import ConfirmDialog from "../../ui/modals/ConfirmDialog";
import { useAuth } from "../../hooks/useAuth";
import { useGet, usePost, usePatch, useDelete } from "../../hooks/useApi";
import { API_ENDPOINTS } from "../../api/config";
import apiClient from "../../api/client";

const CustomerAddressesPage = () => {
  const { isAuthenticated, user } = useAuth();
  
  // Available cities for filtering
  const cities = [
    { value: 'all', label: 'All Cities' },
    { value: 'Kathmandu', label: 'Kathmandu' },
    { value: 'Bhaktapur', label: 'Bhaktapur' },
    { value: 'Lalitpur', label: 'Lalitpur' },
    { value: 'Kritipur', label: 'Kritipur' },
  ];

  // City filter state
  const [selectedCity, setSelectedCity] = useState('all');
  
  // Fetch addresses from API
  const { data: addressesData, isLoading, refetch } = useGet(
    'addresses',
    API_ENDPOINTS.ADDRESSES,
    { 
      showErrorToast: true,
      enabled: isAuthenticated, // Only fetch when authenticated
      refetchOnMount: true, // Always refetch when component mounts
    }
  );

  // Memoize addresses to prevent infinite loop
  const addresses = useMemo(() => {
    if (!addressesData) return [];
    if (Array.isArray(addressesData.data?.addresses)) {
      return addressesData.data.addresses;
    }
    if (Array.isArray(addressesData.data)) {
      return addressesData.data;
    }
    return [];
  }, [addressesData]);

  // Filter addresses based on selected city
  const filteredAddresses = useMemo(() => {
    if (selectedCity === 'all') {
      return addresses;
    }
    return addresses.filter(addr => 
      addr.city && addr.city.toLowerCase() === selectedCity.toLowerCase()
    );
  }, [selectedCity, addresses]);

  // Create address mutation
  const createAddressMutation = usePost('addresses', API_ENDPOINTS.ADDRESSES, {
    showSuccessToast: true,
    showErrorToast: true,
  });

  // Update address mutation
  const updateAddressMutation = usePatch('addresses', API_ENDPOINTS.ADDRESSES, {
    showSuccessToast: true,
    showErrorToast: true,
  });

  // Delete address mutation
  const deleteAddressMutation = useDelete('addresses', API_ENDPOINTS.ADDRESSES, {
    showSuccessToast: true,
    showErrorToast: true,
  });

  // Set default address - will use direct API call (PUT /addresses/:id/default)
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    label: "",
    city: "",
    area: "",
    nearestLandmark: "",
    phone: "",
    postalCode: "",
  });
  const [availableAreas, setAvailableAreas] = useState([]);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    variant: "danger",
  });

  // Fetch areas function
  const fetchAreas = useCallback(async (city) => {
    if (!city || !city.trim()) {
      setAvailableAreas([]);
      return;
    }
    
    try {
      setLoadingAreas(true);
      const response = await apiClient.get(`${API_ENDPOINTS.ADDRESSES}/areas/${encodeURIComponent(city.trim())}`);
      if (response.data.success) {
        setAvailableAreas(response.data.data.areas || []);
        
        // If editing and current area is not in the new city's areas, clear it
        setFormData(prev => {
          if (prev.area && !response.data.data.areas?.includes(prev.area)) {
            return { ...prev, area: "" };
          }
          return prev;
        });
      }
    } catch (error) {
      // Silently handle 404 errors (endpoint might not be implemented)
      if (error.response?.status === 404) {
        console.log(`Areas endpoint not available for city: ${city}`);
        setAvailableAreas([]);
        // Don't show error toast for 404 - endpoint might not be implemented
      } else {
        console.error('Error fetching areas:', error);
        setAvailableAreas([]);
        // Only show error for non-404 errors (network issues, server errors, etc.)
        if (error.response?.status !== 404) {
          toast.error('Failed to load areas for this city');
        }
      }
    } finally {
      setLoadingAreas(false);
    }
  }, []);

  // Fetch areas when city changes
  useEffect(() => {
    if (formData.city) {
      fetchAreas(formData.city);
    } else {
      setAvailableAreas([]);
      setFormData(prev => ({ ...prev, area: "" })); // Clear area when city changes
    }
  }, [formData.city, fetchAreas]);

  const handleDelete = (id) => {
    const address = addresses.find((addr) => (addr._id || addr.id) === id);
    setConfirmDialog({
      isOpen: true,
      title: "Delete Address",
      message: `Are you sure you want to delete "${address?.label || 'this address'}"? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await deleteAddressMutation.mutateAsync(id, {
            onSuccess: () => {
              refetch();
            },
          });
        } catch (error) {
          console.error("Failed to delete address:", error);
        }
      },
      variant: "danger",
    });
  };

  const handleSetDefault = async (id) => {
    try {
      // According to backend: PUT /addresses/:id/default
      const response = await apiClient.put(`${API_ENDPOINTS.ADDRESSES}/${id}/default`);
      if (response.data.success) {
        toast.success(response.data.message || "Default address updated");
        refetch();
      }
    } catch (error) {
      console.error("Failed to set default address:", error);
      toast.error(error.response?.data?.message || "Failed to set default address");
    }
  };

  const handleEdit = (address) => {
    setEditingId(address._id || address.id);
    setFormData({
      label: address.label || "",
      city: address.city || "",
      area: address.area || "",
      nearestLandmark: address.nearestLandmark || address.landmark || "",
      phone: address.phone || "",
      postalCode: address.postalCode || "",
    });
    setIsAdding(false);
    // Fetch areas for the city if city is set
    if (address.city) {
      fetchAreas(address.city);
    }
  };

  const handleSaveAddress = async () => {
    if (!formData.label || !formData.city || !formData.area || !formData.nearestLandmark || !formData.phone) {
      toast.error("Please fill in all required fields: label, city, area, nearest landmark, and phone number");
      return;
    }

    // Get fullName from user profile
    const fullName = user?.name || "";

    if (!fullName) {
      toast.error("Unable to get your name. Please refresh the page.");
      return;
    }

    try {
      if (editingId) {
        // Update existing address - use direct API call with ID in endpoint
        try {
          const response = await apiClient.put(
            `${API_ENDPOINTS.ADDRESSES}/${editingId}`,
            { 
              label: formData.label,
              city: formData.city,
              area: formData.area,
              nearestLandmark: formData.nearestLandmark,
              phone: formData.phone,
              postalCode: formData.postalCode || undefined,
              fullName: fullName,
            }
          );
          if (response.data.success) {
            toast.success(response.data.message || "Address updated successfully");
            refetch();
            setFormData({ label: "", city: "", area: "", nearestLandmark: "", phone: "", postalCode: "" });
            setAvailableAreas([]);
            setIsAdding(false);
            setEditingId(null);
          }
        } catch (error) {
          console.error("Failed to update address:", error);
          toast.error(error.response?.data?.message || "Failed to update address");
        }
      } else {
        // Add new address
        await createAddressMutation.mutateAsync(
          {
            label: formData.label,
            city: formData.city,
            area: formData.area,
            nearestLandmark: formData.nearestLandmark,
            phone: formData.phone,
            postalCode: formData.postalCode || undefined,
            fullName: fullName,
            isDefault: addresses.length === 0,
          },
          {
            onSuccess: () => {
              refetch();
              setFormData({ label: "", city: "", area: "", nearestLandmark: "", phone: "", postalCode: "" });
              setAvailableAreas([]);
              setIsAdding(false);
              setEditingId(null);
            },
          }
        );
      }
    } catch (error) {
      console.error("Failed to save address:", error);
    }
  };

  const handleCancel = () => {
    setFormData({ label: "", city: "", area: "", nearestLandmark: "", phone: "", postalCode: "" });
    setAvailableAreas([]);
    setIsAdding(false);
    setEditingId(null);
  };

  const handleCityChange = (e) => {
    setSelectedCity(e.target.value);
  };

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl lg:text-4xl font-black text-charcoal-grey mb-2">
              Saved Addresses
            </h1>
            <p className="text-charcoal-grey/70">
              Manage your delivery addresses
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={() => setIsAdding(!isAdding)}
          >
            <FiPlus className="w-5 h-5" />
            Add Address
          </Button>
        </div>

        {/* City Filter Section */}
        {!isLoading && addresses.length > 0 && (
          <Card className="p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <FiFilter className="w-5 h-5 text-charcoal-grey/60" />
                <label htmlFor="city-select" className="text-sm font-semibold text-charcoal-grey">
                  Filter by City:
                </label>
              </div>
              <select
                id="city-select"
                value={selectedCity}
                onChange={handleCityChange}
                className="px-4 py-2 border border-charcoal-grey/12 rounded-xl focus:outline-none focus:ring-2 focus:ring-golden-amber/25 focus:border-golden-amber/35 text-charcoal-grey bg-white text-sm font-medium min-w-[200px] cursor-pointer"
              >
                {cities.map(city => (
                  <option key={city.value} value={city.value}>
                    {city.label}
                  </option>
                ))}
              </select>
              <div className="ml-auto text-sm text-charcoal-grey/60">
                Showing <span className="font-semibold text-charcoal-grey">{filteredAddresses.length}</span> of <span className="font-semibold text-charcoal-grey">{addresses.length}</span> address{addresses.length !== 1 ? 'es' : ''}
              </div>
            </div>
          </Card>
        )}

        {/* Add/Edit Address Form */}
        {(isAdding || editingId) && (
          <Card className="p-6">
            <h2 className="text-xl font-bold text-charcoal-grey mb-4">
              {editingId ? "Edit Address" : "Add New Address"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-charcoal-grey mb-2">
                  Label (e.g., Home, Office) <span className="text-deep-maroon">*</span>
                </label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="Home, Office, Work..."
                  className="w-full px-4 py-2 border border-charcoal-grey/12 rounded-xl focus:outline-none focus:ring-2 focus:ring-golden-amber/25 focus:border-golden-amber/35 text-charcoal-grey bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-charcoal-grey mb-2">
                  Phone Number <span className="text-deep-maroon">*</span>
                </label>
                <div className="relative">
                  <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-charcoal-grey/40" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+977 9800000000"
                    className="w-full pl-10 pr-4 py-2 border border-charcoal-grey/12 rounded-xl focus:outline-none focus:ring-2 focus:ring-golden-amber/25 focus:border-golden-amber/35 text-charcoal-grey bg-white text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-charcoal-grey mb-2">
                    City <span className="text-deep-maroon">*</span>
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value, area: "" })}
                    className="w-full px-4 py-2 border border-charcoal-grey/12 rounded-xl focus:outline-none focus:ring-2 focus:ring-golden-amber/25 focus:border-golden-amber/35 text-charcoal-grey bg-white text-sm cursor-pointer"
                  >
                    <option value="">Select a city</option>
                    {cities.filter(c => c.value !== 'all').map(city => (
                      <option key={city.value} value={city.value}>
                        {city.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-charcoal-grey mb-2">
                    Area <span className="text-deep-maroon">*</span>
                  </label>
                  <select
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    disabled={!formData.city || loadingAreas}
                    className="w-full px-4 py-2 border border-charcoal-grey/12 rounded-xl focus:outline-none focus:ring-2 focus:ring-golden-amber/25 focus:border-golden-amber/35 text-charcoal-grey bg-white text-sm cursor-pointer disabled:bg-charcoal-grey/5 disabled:cursor-not-allowed disabled:text-charcoal-grey/40"
                  >
                    <option value="">
                      {loadingAreas 
                        ? 'Loading areas...' 
                        : !formData.city 
                          ? 'Select city first' 
                          : 'Select Area'
                      }
                    </option>
                    {availableAreas.map(area => (
                      <option key={area} value={area}>
                        {area}
                      </option>
                    ))}
                  </select>
                  {loadingAreas && (
                    <p className="text-xs text-charcoal-grey/60 mt-1">Loading areas...</p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-charcoal-grey mb-2">
                  Nearest Landmark <span className="text-deep-maroon">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nearestLandmark}
                  onChange={(e) => setFormData({ ...formData, nearestLandmark: e.target.value })}
                  placeholder="e.g., Near ABC Hospital, Opposite XYZ Mall"
                  className="w-full px-4 py-2 border border-charcoal-grey/12 rounded-xl focus:outline-none focus:ring-2 focus:ring-golden-amber/25 focus:border-golden-amber/35 text-charcoal-grey bg-white text-sm"
                />
                <p className="text-xs text-charcoal-grey/60 mt-1 italic">
                  Enter a nearby landmark to help locate your address
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-charcoal-grey mb-2">
                  Postal Code (Optional)
                </label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  placeholder="Enter postal code"
                  className="w-full px-4 py-2 border border-charcoal-grey/12 rounded-xl focus:outline-none focus:ring-2 focus:ring-golden-amber/25 focus:border-golden-amber/35 text-charcoal-grey bg-white text-sm"
                />
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="primary" 
                  size="md" 
                  className="flex-1" 
                  onClick={handleSaveAddress}
                  disabled={loadingAreas}
                >
                  {editingId ? "Update Address" : "Save Address"}
                </Button>
                <Button variant="ghost" size="md" className="flex-1" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-deep-maroon"></div>
          </div>
        )}

        {/* Addresses List */}
        {!isLoading && Array.isArray(addresses) && (
          <>
            {filteredAddresses.length === 0 ? (
              <Card className="p-12">
                <div className="text-center">
                  <div className="text-6xl mb-4">📍</div>
                  <h3 className="text-xl font-bold text-charcoal-grey mb-2">
                    {selectedCity === 'all' 
                      ? 'No addresses saved'
                      : `No addresses found in ${cities.find(c => c.value === selectedCity)?.label || selectedCity}`
                    }
                  </h3>
                  <p className="text-charcoal-grey/60 mb-6">
                    {selectedCity === 'all'
                      ? 'Add your first delivery address to get started'
                      : `Try selecting a different city or add a new address in ${cities.find(c => c.value === selectedCity)?.label || selectedCity}`
                    }
                  </p>
                  {selectedCity !== 'all' && (
                    <Button
                      variant="ghost"
                      size="md"
                      onClick={() => setSelectedCity('all')}
                      className="mb-4"
                    >
                      Show All Addresses
                    </Button>
                  )}
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => setIsAdding(true)}
                  >
                    <FiPlus className="w-5 h-5" />
                    Add Address
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredAddresses.map((address) => {
              if (!address) return null;
              const addressId = address._id || address.id;
              if (!addressId) return null;
              return (
                <Card 
                  key={addressId} 
                  className="p-6 hover:shadow-xl transition-all duration-300 group" 
                  leftBorder={address.isDefault ? "golden-amber" : "deep-maroon"}
                >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-deep-maroon/10 via-golden-amber/5 to-deep-maroon/10 flex items-center justify-center">
                    <FiMapPin className="w-5 h-5 text-deep-maroon" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-black text-charcoal-grey text-lg">{address.label}</h3>
                      {address.isDefault && (
                        <span className="px-2 py-0.5 rounded-full bg-golden-amber/10 text-golden-amber text-xs font-bold border border-golden-amber/20">
                          Default
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mb-4 p-3 bg-gradient-to-br from-charcoal-grey/5 to-transparent rounded-xl border border-charcoal-grey/10">
                <div className="space-y-2 text-sm">
                  {address.fullName && <p className="font-semibold text-charcoal-grey">{address.fullName}</p>}
                  {address.phone && (
                    <p className="text-charcoal-grey/80 flex items-center gap-2">
                      <FiPhone className="w-4 h-4 text-charcoal-grey/60" />
                      <span className="font-medium">{address.phone}</span>
                    </p>
                  )}
                  <p className="text-charcoal-grey/80">
                    <span className="font-semibold text-charcoal-grey">City:</span> {address.city}
                  </p>
                  <p className="text-charcoal-grey/80">
                    <span className="font-semibold text-charcoal-grey">Area:</span> {address.area}
                  </p>
                  {(address.nearestLandmark || address.landmark) && (
                    <p className="text-charcoal-grey/80">
                      <span className="font-semibold text-charcoal-grey">Nearest Landmark:</span> {address.nearestLandmark || address.landmark}
                    </p>
                  )}
                  {address.postalCode && (
                    <p className="text-charcoal-grey/80">
                      <span className="font-semibold text-charcoal-grey">Postal Code:</span> {address.postalCode}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-charcoal-grey/10">
                {!address.isDefault && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSetDefault(addressId)}
                  >
                    <FiCheck className="w-4 h-4" />
                    Set Default
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => handleEdit(address)}>
                  <FiEdit className="w-4 h-4" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(addressId)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <FiTrash2 className="w-4 h-4" />
                  Delete
                </Button>
              </div>
            </Card>
              );
            })}
              </div>
            )}
          </>
        )}

        {/* Confirmation Dialog */}
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
          onConfirm={confirmDialog.onConfirm || (() => {})}
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmText="Delete"
          cancelText="Cancel"
          variant={confirmDialog.variant}
        />
      </div>
    </div>
  );
};

export default CustomerAddressesPage;

