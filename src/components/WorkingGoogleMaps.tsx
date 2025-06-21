import { useRef, useState } from "react";
import {
  LoadScript,
  Autocomplete,
  GoogleMap,
  Marker,
} from "@react-google-maps/api";

const libraries = ["places"];
const containerStyle = {
  width: "100%",
  height: "300px",
};

const defaultCenter = {
  lat: -26.2041, // Johannesburg
  lng: 28.0473,
};

interface AddressData {
  formattedAddress: string;
  lat: number;
  lng: number;
}

interface WorkingGoogleMapsProps {
  onAddressSelect?: (data: AddressData) => void;
  title?: string;
  placeholder?: string;
}

export default function WorkingGoogleMaps({
  onAddressSelect,
  title = "Pickup Address",
  placeholder = "Start typing an address...",
}: WorkingGoogleMapsProps) {
  const autocompleteRef = useRef(null);
  const [coords, setCoords] = useState(null);
  const [address, setAddress] = useState("");

  const onPlaceChanged = () => {
    const place = autocompleteRef.current.getPlace();

    if (!place || !place.geometry) {
      alert("Please select a valid address from the suggestions.");
      return;
    }

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    const formattedAddress = place.formatted_address;

    setCoords({ lat, lng });
    setAddress(formattedAddress);

    console.log("Address:", formattedAddress);
    console.log("Lat:", lat, "Lng:", lng);

    // Call parent callback if provided
    if (onAddressSelect) {
      onAddressSelect({
        formattedAddress,
        lat,
        lng,
      });
    }
  };

  return (
    <LoadScript
      googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
      libraries={libraries}
    >
      <div className="p-6 max-w-xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold">{title}</h1>

        <Autocomplete
          onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
          onPlaceChanged={onPlaceChanged}
        >
          <input
            type="text"
            placeholder={placeholder}
            className="border p-2 w-full rounded"
          />
        </Autocomplete>

        {coords && (
          <>
            <div className="bg-gray-100 p-2 rounded shadow">
              <p>
                <strong>Selected Address:</strong> {address}
              </p>
              <p>
                <strong>Latitude:</strong> {coords.lat}
              </p>
              <p>
                <strong>Longitude:</strong> {coords.lng}
              </p>
            </div>

            <GoogleMap
              mapContainerStyle={containerStyle}
              center={coords}
              zoom={15}
            >
              <Marker position={coords} />
            </GoogleMap>
          </>
        )}
      </div>
    </LoadScript>
  );
}
