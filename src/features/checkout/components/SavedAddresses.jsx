import { useState, useEffect } from "react";
import { FiMapPin, FiCheck, FiTrash2, FiPlus, FiX } from "react-icons/fi";
import toast from "react-hot-toast";
import Button from "../../../ui/buttons/Button";

const STORAGE_KEY = "momosewa_saved_addresses";

const SavedAddresses = ({ onSelectAddress, selectedAddressId, currentFormData }) => {
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddressLabel, setNewAddressLabel] = useState("");

  useEffect(() => {
    loadSavedAddresses();
  }, []);

  const loadSavedAddresses = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSavedAddresses(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Error loading saved addresses:", error);
    }
  };

  const saveAddresses = (addresses) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(addresses));
      setSavedAddresses(addresses);
    } catch (error) {
      console.error("Error saving addresses:", error);
    }
  };

  const handleSelect = (address) => {
    onSelectAddress(address);
  };

  const handleDelete = (addressId, e) => {
    e.stopPropagation();
    const address = savedAddresses.find((addr) => addr.id === addressId);
    if (address) {
      const updated = savedAddresses.filter((addr) => addr.id !== addressId);
      saveAddresses(updated);
      toast.success(`${address.label} address deleted`);
    }
  };

  const handleSaveCurrent = (currentFormData) => {
    if (!currentFormData.fullName || !currentFormData.address || !currentFormData.city) {
      toast.error("Please fill in at least name, address, and city to save this address");
      return;
    }

    if (!newAddressLabel.trim()) {
      toast.error("Please enter a label for this address (e.g., Home, Office)");
      return;
    }

    const newAddress = {
      id: Date.now().toString(),
      label: newAddressLabel.trim(),
      fullName: currentFormData.fullName,
      phone: currentFormData.phone,
      address: currentFormData.address,
      city: currentFormData.city,
      area: currentFormData.area,
      instructions: currentFormData.instructions,
      latitude: currentFormData.latitude,
      longitude: currentFormData.longitude,
      savedAt: new Date().toISOString(),
    };

    const updated = [...savedAddresses, newAddress];
    saveAddresses(updated);
    setNewAddressLabel("");
    setShowAddForm(false);
    toast.success("Address saved successfully!");
  };

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
          {savedAddresses.map((address) => (
            <button
              key={address.id}
              onClick={() => handleSelect(address)}
              className={`w-full p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                selectedAddressId === address.id
                  ? "border-deep-maroon bg-deep-maroon/5 shadow-lg"
                  : "border-charcoal-grey/10 hover:border-charcoal-grey/20 hover:bg-charcoal-grey/2"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-charcoal-grey">{address.label}</span>
                    {selectedAddressId === address.id && (
                      <FiCheck className="w-4 h-4 text-deep-maroon flex-shrink-0" />
                    )}
                  </div>
                  <div className="space-y-1 text-sm text-charcoal-grey/70">
                    <p className="font-medium">{address.fullName}</p>
                    {address.phone && <p>{address.phone}</p>}
                    <p>
                      {address.address}
                      {address.area && `, ${address.area}`}
                      {address.city && `, ${address.city}`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => handleDelete(address.id, e)}
                  className="p-2 rounded-lg hover:bg-red-50 hover:text-red-600 text-charcoal-grey/40 transition-all flex-shrink-0"
                  aria-label="Delete address"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            </button>
          ))}
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

