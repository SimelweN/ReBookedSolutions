// Fallback delivery service when Edge Functions are unavailable
interface FallbackQuote {
  id: string;
  provider: "courier-guy" | "fastway";
  service_name: string;
  price: number;
  estimated_days: string;
  description: string;
}

interface QuoteRequest {
  fromProvince: string;
  toProvince: string;
  weight: number;
  isLocal?: boolean;
}

export class FallbackDeliveryService {
  /**
   * Get delivery quotes using fallback pricing
   * Used when live courier APIs are unavailable
   */
  static getFallbackQuotes(request: QuoteRequest): FallbackQuote[] {
    const { fromProvince, toProvince, weight, isLocal } = request;
    const quotes: FallbackQuote[] = [];

    // Base price calculation
    const basePrice = Math.max(50, weight * 20);

    // Local delivery (same city/province)
    if (isLocal || fromProvince === toProvince) {
      quotes.push({
        id: "local_delivery",
        provider: "courier-guy",
        service_name: "Local Delivery",
        price: Math.min(basePrice, 75),
        estimated_days: "1-2 days",
        description: "Fast local delivery within the same area",
      });
    }

    // Standard nationwide options
    quotes.push({
      id: "courier_guy_standard",
      provider: "courier-guy",
      service_name: "Courier Guy - Standard",
      price: this.calculateCourierGuyPrice(fromProvince, toProvince, weight),
      estimated_days: "3-5 days",
      description: "Reliable nationwide delivery with tracking",
    });

    quotes.push({
      id: "fastway_express",
      provider: "fastway",
      service_name: "Fastway - Express",
      price: this.calculateFastwayPrice(fromProvince, toProvince, weight),
      estimated_days: "2-4 days",
      description: "Fast express delivery with priority handling",
    });

    // Sort by price (cheapest first)
    return quotes.sort((a, b) => a.price - b.price);
  }

  /**
   * Calculate Courier Guy prices based on distance and weight
   */
  private static calculateCourierGuyPrice(
    fromProvince: string,
    toProvince: string,
    weight: number,
  ): number {
    let baseRate = 60;

    // Inter-provincial rates
    if (fromProvince !== toProvince) {
      const majorProvinces = ["Gauteng", "Western Cape", "KwaZulu-Natal"];
      const fromMajor = majorProvinces.includes(fromProvince);
      const toMajor = majorProvinces.includes(toProvince);

      if (fromMajor && toMajor) {
        baseRate = 85; // Major to major
      } else if (fromMajor || toMajor) {
        baseRate = 95; // Major to minor or vice versa
      } else {
        baseRate = 110; // Minor to minor
      }
    }

    // Weight multiplier
    const weightMultiplier = Math.max(1, weight / 2);

    return Math.round(baseRate * weightMultiplier);
  }

  /**
   * Calculate Fastway prices (generally higher but faster)
   */
  private static calculateFastwayPrice(
    fromProvince: string,
    toProvince: string,
    weight: number,
  ): number {
    let baseRate = 75;

    // Inter-provincial rates
    if (fromProvince !== toProvince) {
      const majorProvinces = ["Gauteng", "Western Cape", "KwaZulu-Natal"];
      const fromMajor = majorProvinces.includes(fromProvince);
      const toMajor = majorProvinces.includes(toProvince);

      if (fromMajor && toMajor) {
        baseRate = 99; // Major to major
      } else if (fromMajor || toMajor) {
        baseRate = 115; // Major to minor or vice versa
      } else {
        baseRate = 135; // Minor to minor
      }
    }

    // Weight multiplier
    const weightMultiplier = Math.max(1, weight / 2);

    return Math.round(baseRate * weightMultiplier);
  }

  /**
   * Get special Cape Town local delivery rates
   */
  static getCapeTownLocalRates(weight: number): FallbackQuote[] {
    return [
      {
        id: "cape_town_local",
        provider: "courier-guy",
        service_name: "Cape Town Local Delivery",
        price: 45,
        estimated_days: "1-2 days",
        description: "Same-day or next-day delivery within Cape Town metro",
      },
      {
        id: "cape_town_express",
        provider: "fastway",
        service_name: "Cape Town Express",
        price: 65,
        estimated_days: "Same day",
        description: "Express same-day delivery within Cape Town",
      },
    ];
  }

  /**
   * Check if delivery is considered local
   */
  static isLocalDelivery(
    fromCity: string,
    toCity: string,
    fromProvince: string,
    toProvince: string,
  ): boolean {
    // Same province and major city combinations
    if (fromProvince !== toProvince) return false;

    const capeTownAreas = [
      "Cape Town",
      "Stellenbosch",
      "Paarl",
      "Somerset West",
    ];
    const johannesburgAreas = [
      "Johannesburg",
      "Sandton",
      "Randburg",
      "Roodepoort",
      "Pretoria",
    ];
    const durbanAreas = ["Durban", "Pinetown", "Westville"];

    const isCapeTown = capeTownAreas.some(
      (area) => fromCity.includes(area) && toCity.includes(area),
    );
    const isJohannesburg = johannesburgAreas.some(
      (area) => fromCity.includes(area) && toCity.includes(area),
    );
    const isDurban = durbanAreas.some(
      (area) => fromCity.includes(area) && toCity.includes(area),
    );

    return isCapeTown || isJohannesburg || isDurban;
  }
}

export default FallbackDeliveryService;
