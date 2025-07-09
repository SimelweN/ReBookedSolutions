/**
 * Google Maps Setup and Validation
 * Handles Google Maps API configuration and testing
 */

import { ENV } from "@/config/environment";

export interface MapsConfig {
  isConfigured: boolean;
  apiKey: string;
  errors: string[];
  warnings: string[];
  features: {
    places: boolean;
    geocoding: boolean;
    maps: boolean;
  };
}

/**
 * Validate Google Maps configuration
 */
export function validateMapsConfig(): MapsConfig {
  const config: MapsConfig = {
    isConfigured: false,
    apiKey: "",
    errors: [],
    warnings: [],
    features: {
      places: false,
      geocoding: false,
      maps: false,
    },
  };

  const apiKey = ENV.VITE_GOOGLE_MAPS_API_KEY;

  // Check if key exists
  if (!apiKey || apiKey.trim() === "") {
    config.errors.push("Google Maps API key is missing");
    return config;
  }

  // Check if it's a demo/placeholder key
  if (
    apiKey.includes("demo") ||
    apiKey.includes("your-") ||
    apiKey.includes("placeholder")
  ) {
    config.errors.push("Google Maps API key appears to be a placeholder");
    return config;
  }

  // Validate key format (Google API keys typically start with AIza)
  if (!apiKey.startsWith("AIza")) {
    config.warnings.push(
      "Google Maps API key format may be incorrect (usually starts with 'AIza')",
    );
  }

  // Validate key length (Google API keys are typically 39 characters)
  if (apiKey.length < 30) {
    config.errors.push(
      "Google Maps API key appears to be truncated or invalid",
    );
    return config;
  }

  config.isConfigured = true;
  config.apiKey = apiKey;

  return config;
}

/**
 * Test Google Maps API availability
 */
export async function testMapsConnection(): Promise<{
  success: boolean;
  message: string;
  availableServices: string[];
}> {
  try {
    const config = validateMapsConfig();
    const availableServices: string[] = [];

    if (!config.isConfigured) {
      return {
        success: false,
        message: config.errors.join(", "),
        availableServices: [],
      };
    }

    // Test Geocoding API
    try {
      const geocodingResponse = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=Cape+Town&key=${config.apiKey}`,
      );

      if (geocodingResponse.ok) {
        const data = await geocodingResponse.json();
        if (data.status === "OK") {
          availableServices.push("Geocoding API");
        } else {
          return {
            success: false,
            message: `Google Maps API error: ${data.error_message || data.status}`,
            availableServices,
          };
        }
      }
    } catch (error) {
      return {
        success: false,
        message: "Failed to connect to Google Maps API",
        availableServices,
      };
    }

    // Test Places API (basic check)
    try {
      const placesResponse = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=Cape&key=${config.apiKey}`,
      );

      if (placesResponse.ok) {
        const data = await placesResponse.json();
        if (data.status === "OK") {
          availableServices.push("Places API");
        }
      }
    } catch (error) {
      // Places API might not be enabled, but don't fail completely
      console.warn("Places API test failed:", error);
    }

    return {
      success: true,
      message: `Google Maps connected successfully. Available: ${availableServices.join(", ")}`,
      availableServices,
    };
  } catch (error) {
    return {
      success: false,
      message: `Connection test failed: ${error}`,
      availableServices: [],
    };
  }
}

/**
 * Load Google Maps JavaScript API
 */
export function loadGoogleMapsScript(): Promise<boolean> {
  return new Promise((resolve) => {
    // Check if already loaded
    if (window.google && window.google.maps) {
      resolve(true);
      return;
    }

    const config = validateMapsConfig();
    if (!config.isConfigured) {
      console.warn("Google Maps API key not configured");
      resolve(false);
      return;
    }

    // Create script element
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${config.apiKey}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      // Google Maps JavaScript API loaded successfully
      resolve(true);
    };

    script.onerror = () => {
      console.error("❌ Failed to load Google Maps JavaScript API");
      resolve(false);
    };

    document.head.appendChild(script);
  });
}

/**
 * Get Google Maps setup instructions
 */
export function getMapsSetupInstructions(): string {
  return `
🗺️ GOOGLE MAPS API SETUP INSTRUCTIONS

1. Create Google Cloud Project:
   - Visit: https://console.cloud.google.com/
   - Create new project or select existing

2. Enable Required APIs:
   - Go to "APIs & Services" > "Library"
   - Enable these APIs:
     ✅ Maps JavaScript API
     ✅ Places API
     ✅ Geocoding API

3. Create API Key:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the generated key

4. Restrict API Key (Recommended):
   - Click on your API key to edit
   - Add HTTP referrers (websites):
     - http://localhost:*
     - https://yourdomain.com/*
   - Restrict to specific APIs (step 2 above)

5. Add to .env file:
   VITE_GOOGLE_MAPS_API_KEY=AIzaYourKeyHere

💰 Pricing Notes:
- Google Maps offers $200 free credit monthly
- Address autocomplete: ~$17 per 1000 requests
- Monitor usage in Google Cloud Console

🔒 Security:
- Always restrict your API keys
- Monitor usage regularly
- Never commit keys to version control
  `;
}

/**
 * Create fallback address autocomplete
 */
export function createFallbackAutocomplete(inputElement: HTMLInputElement) {
  // Simple fallback that doesn't require Google Maps
  const commonSACities = [
    "Cape Town",
    "Johannesburg",
    "Durban",
    "Pretoria",
    "Port Elizabeth",
    "Bloemfontein",
    "East London",
    "Pietermaritzburg",
    "Kimberley",
    "Polokwane",
  ];

  let _currentFocus = -1;

  inputElement.addEventListener("input", function (e) {
    const value = (e.target as HTMLInputElement).value;
    if (!value) return;

    // Remove any existing autocomplete lists
    closeAllLists();

    // Create autocomplete list
    const autocompleteList = document.createElement("div");
    autocompleteList.setAttribute("id", this.id + "autocomplete-list");
    autocompleteList.setAttribute("class", "autocomplete-items");
    this.parentNode?.appendChild(autocompleteList);

    // Filter cities
    const matchingCities = commonSACities.filter((city) =>
      city.toLowerCase().includes(value.toLowerCase()),
    );

    matchingCities.forEach((city) => {
      const item = document.createElement("div");
      item.innerHTML = city.replace(
        new RegExp(value, "gi"),
        `<strong>${value}</strong>`,
      );
      item.addEventListener("click", function () {
        inputElement.value = city;
        closeAllLists();
      });
      autocompleteList.appendChild(item);
    });
  });

  function closeAllLists() {
    const items = document.getElementsByClassName("autocomplete-items");
    for (let i = 0; i < items.length; i++) {
      items[i].remove();
    }
  }

  // Close on click outside
  document.addEventListener("click", closeAllLists);
}

/**
 * Initialize address autocomplete with fallback
 */
export async function initializeAddressAutocomplete(
  inputElement: HTMLInputElement,
  onPlaceSelected?: (place: any) => void,
) {
  const config = validateMapsConfig();

  if (!config.isConfigured) {
    console.warn("Google Maps not configured, using fallback autocomplete");
    createFallbackAutocomplete(inputElement);
    return false;
  }

  try {
    // Load Google Maps if not already loaded
    const loaded = await loadGoogleMapsScript();

    if (!loaded || !window.google) {
      console.warn("Google Maps failed to load, using fallback");
      createFallbackAutocomplete(inputElement);
      return false;
    }

    // Initialize Places Autocomplete
    const autocomplete = new window.google.maps.places.Autocomplete(
      inputElement,
      {
        types: ["address"],
        componentRestrictions: { country: "za" }, // Restrict to South Africa
      },
    );

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (onPlaceSelected) {
        onPlaceSelected(place);
      }
    });

    // Google Maps autocomplete initialized
    return true;
  } catch (error) {
    console.error("Failed to initialize Google Maps autocomplete:", error);
    createFallbackAutocomplete(inputElement);
    return false;
  }
}

// Extend window interface for TypeScript
declare global {
  interface Window {
    google: any;
  }
}
