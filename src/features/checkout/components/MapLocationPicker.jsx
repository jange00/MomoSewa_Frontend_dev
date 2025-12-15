import { useState, useCallback, useRef } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { FiMapPin, FiX, FiCheck } from "react-icons/fi";
import Button from "../../../ui/buttons/Button";

// Default center for Kathmandu, Nepal
const defaultCenter = {
  lat: 27.7172,
  lng: 85.3240,
};

const libraries = ["places"];

const MapLocationPicker = ({ onLocationSelect, selectedLocation, onClose }) => {
  const [map, setMap] = useState(null);
  const [markerPosition, setMarkerPosition] = useState(selectedLocation || defaultCenter);
  const [isSelecting, setIsSelecting] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const geocoderRef = useRef(null);

  // Load Google Maps API
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: apiKey,
    libraries,
  });

  const onMapClick = useCallback(
    async (event) => {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      const newPosition = { lat, lng };

      setMarkerPosition(newPosition);
      setIsSelecting(true);
      setIsGeocoding(true);

      // Reverse geocode to get address details
      try {
        if (!geocoderRef.current) {
          geocoderRef.current = new window.google.maps.Geocoder();
        }

        geocoderRef.current.geocode(
          { location: newPosition },
          (results, status) => {
            setIsGeocoding(false);
            setIsSelecting(false);

            if (status === "OK" && results && results[0]) {
              const addressComponents = results[0].address_components;
              const formattedAddress = results[0].formatted_address;

              // Extract address details
              let city = "";
              let area = "";
              let streetAddress = formattedAddress;

              addressComponents.forEach((component) => {
                const types = component.types;

                if (types.includes("locality") || types.includes("administrative_area_level_2")) {
                  city = component.long_name;
                } else if (types.includes("sublocality") || types.includes("sublocality_level_1")) {
                  area = component.long_name;
                } else if (types.includes("route") || types.includes("street_number")) {
                  // Street address parts
                }
              });

              // If city not found, try administrative_area_level_1
              if (!city) {
                const adminArea = addressComponents.find((c) =>
                  c.types.includes("administrative_area_level_1")
                );
                if (adminArea) city = adminArea.long_name;
              }

              // If area not found, try neighborhood
              if (!area) {
                const neighborhood = addressComponents.find((c) =>
                  c.types.includes("neighborhood")
                );
                if (neighborhood) area = neighborhood.long_name;
              }

              // Call the callback with location data
              onLocationSelect({
                lat,
                lng,
                address: streetAddress,
                city: city || "Kathmandu",
                area: area || "",
              });
            } else {
              // If geocoding fails, still return the coordinates
              onLocationSelect({
                lat,
                lng,
                address: "",
                city: "",
                area: "",
              });
            }
          }
        );
      } catch (error) {
        console.error("Geocoding error:", error);
        setIsGeocoding(false);
        setIsSelecting(false);
        // Still return coordinates even if geocoding fails
        onLocationSelect({
          lat,
          lng,
          address: "",
          city: "",
          area: "",
          postalCode: "",
        });
      }
    },
    [onLocationSelect]
  );

  const onMapLoad = useCallback((map) => {
    setMap(map);
    if (selectedLocation) {
      map.setCenter(selectedLocation);
    }
  }, [selectedLocation]);

  const handleConfirm = () => {
    onClose();
  };

  if (!apiKey) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-charcoal-grey/10 p-6">
        <div className="text-center py-8">
          <FiMapPin className="w-12 h-12 text-charcoal-grey/30 mx-auto mb-4" />
          <p className="text-charcoal-grey/60 mb-2 font-semibold">
            Google Maps API Key Required
          </p>
          <p className="text-sm text-charcoal-grey/50 mb-4">
            To use the map location picker, please add your Google Maps API key:
          </p>
          <div className="bg-charcoal-grey/5 rounded-lg p-4 text-left max-w-md mx-auto">
            <p className="text-xs font-mono text-charcoal-grey/70 mb-2">
              1. Create a .env file in the root directory
            </p>
            <p className="text-xs font-mono text-charcoal-grey/70 mb-2">
              2. Add: VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
            </p>
            <p className="text-xs font-mono text-charcoal-grey/70">
              3. Get your API key from Google Cloud Console
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            className="mt-4"
          >
            Close
          </Button>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-charcoal-grey/10 p-6">
        <div className="text-center py-8">
          <p className="text-charcoal-grey/60 mb-4">
            Map failed to load. Please check your Google Maps API key.
          </p>
          <p className="text-sm text-charcoal-grey/50 mb-4">
            Make sure VITE_GOOGLE_MAPS_API_KEY is set correctly in your .env file
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-charcoal-grey/10 p-6">
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-deep-maroon border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-charcoal-grey/60">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-charcoal-grey/10 p-6 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-deep-maroon/10 flex items-center justify-center">
            <FiMapPin className="w-5 h-5 text-deep-maroon" />
          </div>
          <h3 className="text-lg font-bold text-charcoal-grey">Select Location on Map</h3>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-charcoal-grey/5 text-charcoal-grey/60 hover:text-charcoal-grey transition-colors"
          aria-label="Close map"
        >
          <FiX className="w-5 h-5" />
        </button>
      </div>

      <div className="relative">
        <div className="w-full h-96 rounded-xl overflow-hidden border border-charcoal-grey/10">
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "100%" }}
            center={markerPosition}
            zoom={15}
            onLoad={onMapLoad}
            onClick={onMapClick}
            options={{
              zoomControl: true,
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: true,
            }}
          >
            <Marker position={markerPosition} />
          </GoogleMap>
        </div>

        {isGeocoding && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg border border-charcoal-grey/10">
            <div className="flex items-center gap-2">
              <div className="animate-spin w-4 h-4 border-2 border-deep-maroon border-t-transparent rounded-full"></div>
              <span className="text-sm font-medium text-charcoal-grey">Getting address...</span>
            </div>
          </div>
        )}

        {isSelecting && !isGeocoding && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg border border-charcoal-grey/10">
            <div className="flex items-center gap-2">
              <FiCheck className="w-4 h-4 text-golden-amber" />
              <span className="text-sm font-medium text-charcoal-grey">Location selected</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button
          variant="primary"
          size="md"
          onClick={handleConfirm}
          className="flex-1"
        >
          <FiCheck className="w-5 h-5" />
          Confirm Location
        </Button>
        <Button
          variant="secondary"
          size="md"
          onClick={onClose}
        >
          Cancel
        </Button>
      </div>

      <p className="text-xs text-charcoal-grey/50 text-center">
        Click on the map to select your delivery location. The address will be auto-filled.
      </p>
    </div>
  );
};

export default MapLocationPicker;

