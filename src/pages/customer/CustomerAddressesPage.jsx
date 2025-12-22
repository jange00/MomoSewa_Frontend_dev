import { useState, useEffect } from "react";
import { FiMapPin, FiEdit, FiTrash2, FiPlus, FiCheck, FiPhone } from "react-icons/fi";
import toast from "react-hot-toast";
import Card from "../../ui/cards/Card";
import Button from "../../ui/buttons/Button";
import ConfirmDialog from "../../ui/modals/ConfirmDialog";
import MapLocationPicker from "../../features/checkout/components/MapLocationPicker";
import { useAuth } from "../../hooks/useAuth";
import { useGet, usePost, usePatch, useDelete } from "../../hooks/useApi";
import { API_ENDPOINTS } from "../../api/config";
import apiClient from "../../api/client";

const CustomerAddressesPage = () => {
  const { isAuthenticated, user } = useAuth();
  
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

  const addresses = Array.isArray(addressesData?.data?.addresses) ? addressesData.data.addresses :
                    Array.isArray(addressesData?.data) ? addressesData.data : [];

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
    address: "",
    city: "",
    area: "",
    landmark: "",
    phone: "",
  });
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    variant: "danger",
  });

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
      address: address.address || "",
      city: address.city || "",
      area: address.area || "",
      landmark: address.landmark || "",
      phone: address.phone || "",
    });
    setIsAdding(false);
  };

  const handleSaveAddress = async () => {
    if (!formData.label || !formData.address || !formData.city || !formData.phone) {
      toast.error("Please fill in label, address, city, and phone number");
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
              ...formData,
              fullName: fullName,
            }
          );
          if (response.data.success) {
            toast.success(response.data.message || "Address updated successfully");
            refetch();
            setFormData({ label: "", address: "", city: "", area: "", landmark: "", phone: "" });
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
            ...formData,
            fullName: fullName,
            isDefault: addresses.length === 0,
          },
          {
            onSuccess: () => {
              refetch();
              setFormData({ label: "", address: "", city: "", area: "", landmark: "", phone: "" });
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
    setFormData({ label: "", address: "", city: "", area: "", landmark: "", phone: "" });
    setIsAdding(false);
    setEditingId(null);
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

        {/* Add/Edit Address Form */}
        {(isAdding || editingId) && (
          <Card className="p-6">
            <h2 className="text-xl font-bold text-charcoal-grey mb-4">
              {editingId ? "Edit Address" : "Add New Address"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-charcoal-grey mb-2">
                  Label (e.g., Home, Office)
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
              <div>
                <label className="block text-sm font-semibold text-charcoal-grey mb-2">
                  Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street address"
                  className="w-full px-4 py-2 border border-charcoal-grey/12 rounded-xl focus:outline-none focus:ring-2 focus:ring-golden-amber/25 focus:border-golden-amber/35 text-charcoal-grey bg-white text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-charcoal-grey mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Kathmandu"
                    className="w-full px-4 py-2 border border-charcoal-grey/12 rounded-xl focus:outline-none focus:ring-2 focus:ring-golden-amber/25 focus:border-golden-amber/35 text-charcoal-grey bg-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-charcoal-grey mb-2">
                    Area
                  </label>
                  <input
                    type="text"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    placeholder="Thamel"
                    className="w-full px-4 py-2 border border-charcoal-grey/12 rounded-xl focus:outline-none focus:ring-2 focus:ring-golden-amber/25 focus:border-golden-amber/35 text-charcoal-grey bg-white text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-charcoal-grey mb-2">
                  Landmark (Optional)
                </label>
                <input
                  type="text"
                  value={formData.landmark}
                  onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                  placeholder="Near ABC Mall"
                  className="w-full px-4 py-2 border border-charcoal-grey/12 rounded-xl focus:outline-none focus:ring-2 focus:ring-golden-amber/25 focus:border-golden-amber/35 text-charcoal-grey bg-white text-sm"
                />
              </div>
              <div className="flex gap-3">
                <Button variant="primary" size="md" className="flex-1" onClick={handleSaveAddress}>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {addresses.map((address) => {
              if (!address) return null;
              const addressId = address._id || address.id;
              if (!addressId) return null;
              return (
                <Card key={addressId} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-deep-maroon/10 via-golden-amber/5 to-deep-maroon/10 flex items-center justify-center">
                    <FiMapPin className="w-6 h-6 text-deep-maroon" />
                  </div>
                  <div>
                    <h3 className="font-bold text-charcoal-grey text-lg">{address.label}</h3>
                    {address.isDefault && (
                      <span className="inline-block px-2 py-1 rounded-full bg-golden-amber/10 text-golden-amber text-xs font-semibold border border-golden-amber/20">
                        Default
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 mb-4 text-charcoal-grey/80">
                {address.fullName && <p className="font-semibold">{address.fullName}</p>}
                {address.phone && (
                  <p className="text-sm text-charcoal-grey/60 flex items-center gap-2">
                    <FiPhone className="w-4 h-4" />
                    {address.phone}
                  </p>
                )}
                <p>{address.address}</p>
                {address.landmark && <p className="text-sm text-charcoal-grey/60">Near: {address.landmark}</p>}
                <p className="text-sm text-charcoal-grey/60">{address.area}, {address.city}</p>
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

        {!isLoading && addresses.length === 0 && (
          <Card className="p-12">
            <div className="text-center">
              <div className="text-6xl mb-4">📍</div>
              <h3 className="text-xl font-bold text-charcoal-grey mb-2">No addresses saved</h3>
              <p className="text-charcoal-grey/60 mb-6">
                Add your first delivery address to get started
              </p>
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

