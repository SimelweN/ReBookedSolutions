/**
 * Utility functions for delivery and distance calculations
 */

interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(
  point1: Coordinates,
  point2: Coordinates,
): number {
  const R = 6371; // Earth's radius in kilometers

  const dLat = toRadians(point2.lat - point1.lat);
  const dLng = toRadians(point2.lng - point1.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(point1.lat)) *
      Math.cos(toRadians(point2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calculate delivery price based on distance
 */
export function calculateDeliveryPrice(
  distanceKm: number,
  basePrice: number = 50,
): number {
  // Price tiers based on distance
  if (distanceKm <= 10) {
    return basePrice; // Local delivery
  } else if (distanceKm <= 50) {
    return basePrice + (distanceKm - 10) * 2; // R2 per km after 10km
  } else if (distanceKm <= 200) {
    return basePrice + 80 + (distanceKm - 50) * 1.5; // R1.50 per km after 50km
  } else {
    return basePrice + 305 + (distanceKm - 200) * 1; // R1 per km after 200km
  }
}

/**
 * Get approximate coordinates for a postal code (South Africa)
 * This is a simplified lookup - in production you'd use a proper geocoding service
 */
export function getPostalCodeCoordinates(
  postalCode: string,
): Coordinates | null {
  const code = parseInt(postalCode);

  // Simplified postal code to coordinates mapping for major SA areas
  const postalCodeMap: { [key: string]: Coordinates } = {
    // Western Cape
    "7700": { lat: -33.9249, lng: 18.4241 }, // Cape Town
    "8000": { lat: -33.9249, lng: 18.4241 }, // Cape Town City
    "7800": { lat: -33.9677, lng: 18.4676 }, // Bellville
    "7500": { lat: -33.8353, lng: 18.6488 }, // Stellenbosch

    // Gauteng
    "2000": { lat: -26.2041, lng: 28.0473 }, // Johannesburg
    "0001": { lat: -25.7479, lng: 28.2293 }, // Pretoria
    "1400": { lat: -26.1367, lng: 27.9098 }, // Roodepoort
    "2100": { lat: -26.1367, lng: 28.0835 }, // Randburg

    // KwaZulu-Natal
    "4001": { lat: -29.8587, lng: 31.0218 }, // Durban
    "3200": { lat: -29.6093, lng: 30.3794 }, // Pietermaritzburg

    // Eastern Cape
    "6000": { lat: -33.9608, lng: 25.6022 }, // Port Elizabeth
    "5200": { lat: -32.2968, lng: 26.4194 }, // East London

    // Free State
    "9300": { lat: -29.1217, lng: 26.2041 }, // Bloemfontein

    // Northern Cape
    "8300": { lat: -28.7382, lng: 24.7499 }, // Kimberley

    // North West
    "2745": { lat: -25.8601, lng: 25.6425 }, // Rustenburg

    // Mpumalanga
    "1200": { lat: -25.4753, lng: 30.967 }, // Nelspruit

    // Limpopo
    "0700": { lat: -23.9045, lng: 29.4689 }, // Polokwane
  };

  // Find closest match
  let closest = null;
  let minDiff = Infinity;

  for (const [mappedCode, coords] of Object.entries(postalCodeMap)) {
    const diff = Math.abs(code - parseInt(mappedCode));
    if (diff < minDiff) {
      minDiff = diff;
      closest = coords;
    }
  }

  return closest;
}

/**
 * Estimate delivery time based on distance and courier type
 */
export function estimateDeliveryTime(
  distanceKm: number,
  courierType: "express" | "standard" = "standard",
): string {
  if (courierType === "express") {
    if (distanceKm <= 50) return "1-2";
    if (distanceKm <= 200) return "2-3";
    return "3-4";
  } else {
    if (distanceKm <= 50) return "2-3";
    if (distanceKm <= 200) return "3-5";
    return "5-7";
  }
}

/**
 * Validate postal code format for South Africa
 */
export function isValidSAPostalCode(postalCode: string): boolean {
  // South African postal codes are 4 digits
  return /^\d{4}$/.test(postalCode);
}
