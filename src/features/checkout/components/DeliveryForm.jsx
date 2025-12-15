import { useState } from "react";
import Input from "../../../ui/inputs/Input";
import { FiUser, FiPhone, FiMapPin, FiHome, FiNavigation } from "react-icons/fi";
import MapLocationPicker from "./MapLocationPicker";
import SavedAddresses from "./SavedAddresses";
import Button from "../../../ui/buttons/Button";

const DeliveryForm = ({ formData, onChange }) => {
  const [showMap, setShowMap] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedAddressId, setSelectedAddressId] = useState(null);


  const handleChange = (field, value) => {
    onChange({ ...formData, [field]: value });
    setSelectedAddressId(null); // Clear selection when user manually edits
  };

  const handleLocationSelect = (locationData) => {
    setSelectedLocation({ lat: locationData.lat, lng: locationData.lng });
    
      // Auto-fill form fields from map selection
      const updatedForm = {
        ...formData,
        address: locationData.address || formData.address,
        city: locationData.city || formData.city,
        area: locationData.area || formData.area,
        latitude: locationData.lat,
        longitude: locationData.lng,
      };
    
    onChange(updatedForm);
    setSelectedAddressId(null); // Clear saved address selection
  };

  const handleSelectSavedAddress = (address) => {
    setSelectedAddressId(address.id);
    setSelectedLocation(
      address.latitude && address.longitude
        ? { lat: address.latitude, lng: address.longitude }
        : null
    );

    // Auto-fill form with saved address
    const updatedForm = {
      ...formData,
      fullName: address.fullName || formData.fullName,
      phone: address.phone || formData.phone,
      address: address.address || formData.address,
      city: address.city || formData.city,
      area: address.area || formData.area,
      instructions: address.instructions || formData.instructions,
      latitude: address.latitude,
      longitude: address.longitude,
    };

    onChange(updatedForm);
  };

  return (
    <div className="space-y-6">
      {/* Saved Addresses Section */}
      <SavedAddresses
        onSelectAddress={handleSelectSavedAddress}
        selectedAddressId={selectedAddressId}
        currentFormData={formData}
      />

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-charcoal-grey/10 p-6 space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-deep-maroon/10 flex items-center justify-center">
            <FiMapPin className="w-5 h-5 text-deep-maroon" />
          </div>
          <h3 className="text-xl font-bold text-charcoal-grey">Delivery Information</h3>
        </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-semibold text-charcoal-grey mb-2">
            Full Name <span className="text-deep-maroon">*</span>
          </label>
          <Input
            type="text"
            placeholder="Enter your full name"
            value={formData.fullName || ""}
            onChange={(e) => handleChange("fullName", e.target.value)}
            icon={FiUser}
            required
          />
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-sm font-semibold text-charcoal-grey mb-2">
            Phone Number <span className="text-deep-maroon">*</span>
          </label>
          <Input
            type="tel"
            placeholder="98XXXXXXXX"
            value={formData.phone || ""}
            onChange={(e) => handleChange("phone", e.target.value)}
            icon={FiPhone}
            required
          />
        </div>
      </div>

      {/* Delivery Address */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-semibold text-charcoal-grey">
            Delivery Address <span className="text-deep-maroon">*</span>
          </label>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowMap(true)}
            className="text-xs"
          >
            <FiMapPin className="w-4 h-4" />
            Select from Map
          </Button>
        </div>
        <Input
          type="text"
          placeholder="Street address, Ward number"
          value={formData.address || ""}
          onChange={(e) => handleChange("address", e.target.value)}
          icon={FiHome}
          required
        />
        {selectedLocation && (
          <p className="text-xs text-golden-amber mt-2 flex items-center gap-1">
            <FiMapPin className="w-3 h-3" />
            Location selected from map
          </p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* City */}
        <div>
          <label className="block text-sm font-semibold text-charcoal-grey mb-2">
            City <span className="text-deep-maroon">*</span>
          </label>
          <Input
            type="text"
            placeholder="Kathmandu"
            value={formData.city || ""}
            onChange={(e) => handleChange("city", e.target.value)}
            icon={FiNavigation}
            required
          />
        </div>

        {/* Area */}
        <div>
          <label className="block text-sm font-semibold text-charcoal-grey mb-2">
            Area <span className="text-deep-maroon">*</span>
          </label>
          <Input
            type="text"
            placeholder="Thamel, New Road, etc."
            value={formData.area || ""}
            onChange={(e) => handleChange("area", e.target.value)}
            icon={FiNavigation}
            required
          />
        </div>
      </div>

      {/* Delivery Instructions */}
      <div>
        <label className="block text-sm font-semibold text-charcoal-grey mb-2">
          Delivery Instructions (Optional)
        </label>
        <textarea
          placeholder="Any special instructions for delivery..."
          value={formData.instructions || ""}
          onChange={(e) => handleChange("instructions", e.target.value)}
          rows="3"
          className="w-full px-5 py-3 border border-charcoal-grey/12 rounded-2xl focus:outline-none focus:ring-2 focus:ring-golden-amber/25 focus:border-golden-amber/35 text-charcoal-grey bg-charcoal-grey/2 hover:bg-charcoal-grey/4 transition-all duration-300 placeholder:text-charcoal-grey/30 text-sm font-medium shadow-sm hover:shadow-md focus:shadow-lg resize-none"
        />
      </div>

        {/* Map Location Picker Modal */}
        {showMap && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <MapLocationPicker
                onLocationSelect={handleLocationSelect}
                selectedLocation={selectedLocation}
                onClose={() => setShowMap(false)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryForm;

