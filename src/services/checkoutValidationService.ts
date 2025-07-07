import { supabase } from "@/integrations/supabase/client";
import { getSimpleUserAddresses } from "./simplifiedAddressService";

export interface SellerValidationResult {
  isValid: boolean;
  hasSubaccount: boolean;
  hasAddress: boolean;
  subaccountCode?: string;
  address?: {
    street: string;
    city: string;
    province: string;
    postal_code: string;
    country: string;
  };
  errors: string[];
}

export interface BuyerValidationResult {
  isValid: boolean;
  hasAddress: boolean;
  address?: {
    street: string;
    city: string;
    province: string;
    postal_code: string;
    country: string;
  };
  errors: string[];
}

export interface CheckoutValidationResult {
  canProceed: boolean;
  seller: SellerValidationResult;
  buyer: BuyerValidationResult;
  errors: string[];
}

/**
 * ❗ DISALLOW listing books if seller has no subaccount or address
 */
export const validateSellerForListing = async (
  sellerId: string,
): Promise<SellerValidationResult> => {
  const errors: string[] = [];

  try {
    console.log("🔍 Validating seller for book listing:", sellerId);

    // 1. Check seller subaccount
    const { data: subaccounts } = await supabase
      .from("banking_subaccounts")
      .select("subaccount_code, status")
      .eq("user_id", sellerId);

    const activeSubaccount = subaccounts?.find(
      (sub) => sub.status === "active" && sub.subaccount_code,
    );
    const anySubaccount = subaccounts?.find((sub) => sub.subaccount_code);

    const hasSubaccount = !!(activeSubaccount || anySubaccount);
    const subaccountCode =
      activeSubaccount?.subaccount_code || anySubaccount?.subaccount_code;

    if (!hasSubaccount) {
      errors.push("You must set up your banking details before listing books");
    }

    // 2. Check seller address
    const addresses = await getSimpleUserAddresses(sellerId);
    const hasAddress = !!(
      addresses.pickup_address?.streetAddress &&
      addresses.pickup_address?.city &&
      addresses.pickup_address?.province &&
      addresses.pickup_address?.postalCode
    );

    let sellerAddress;
    if (hasAddress) {
      sellerAddress = {
        street: addresses.pickup_address!.streetAddress,
        city: addresses.pickup_address!.city,
        province: addresses.pickup_address!.province,
        postal_code: addresses.pickup_address!.postalCode,
        country: "South Africa",
      };
    } else {
      errors.push("You must add your pickup address before listing books");
    }

    const result: SellerValidationResult = {
      isValid: hasSubaccount && hasAddress,
      hasSubaccount,
      hasAddress,
      subaccountCode,
      address: sellerAddress,
      errors,
    };

    console.log("📋 Seller validation result:", result);
    return result;
  } catch (error) {
    console.error("❌ Seller validation error:", error);
    return {
      isValid: false,
      hasSubaccount: false,
      hasAddress: false,
      errors: ["Failed to validate seller information"],
    };
  }
};

/**
 * ❗ DISALLOW checkout if buyer's address is missing
 */
export const validateBuyerForCheckout = async (
  buyerId: string,
): Promise<BuyerValidationResult> => {
  const errors: string[] = [];

  try {
    console.log("🔍 Validating buyer for checkout:", buyerId);

    const addresses = await getSimpleUserAddresses(buyerId);
    const hasAddress = !!(
      addresses.shipping_address?.streetAddress &&
      addresses.shipping_address?.city &&
      addresses.shipping_address?.province &&
      addresses.shipping_address?.postalCode
    );

    let buyerAddress;
    if (hasAddress) {
      buyerAddress = {
        street: addresses.shipping_address!.streetAddress,
        city: addresses.shipping_address!.city,
        province: addresses.shipping_address!.province,
        postal_code: addresses.shipping_address!.postalCode,
        country: "South Africa",
      };
    } else {
      errors.push("You must add your delivery address before checkout");
    }

    const result: BuyerValidationResult = {
      isValid: hasAddress,
      hasAddress,
      address: buyerAddress,
      errors,
    };

    console.log("📋 Buyer validation result:", result);
    return result;
  } catch (error) {
    console.error("❌ Buyer validation error:", error);
    return {
      isValid: false,
      hasAddress: false,
      errors: ["Failed to validate buyer information"],
    };
  }
};

/**
 * 📌 API Equivalent: POST /api/checkout/start
 * Validates both seller and buyer before allowing checkout
 */
export const validateCheckoutStart = async (
  sellerId: string,
  buyerId: string,
): Promise<CheckoutValidationResult> => {
  console.log("🚀 Starting checkout validation for:", { sellerId, buyerId });

  const [sellerValidation, buyerValidation] = await Promise.all([
    validateSellerForListing(sellerId),
    validateBuyerForCheckout(buyerId),
  ]);

  const allErrors = [
    ...sellerValidation.errors.map((err) => `Seller: ${err}`),
    ...buyerValidation.errors.map((err) => `Buyer: ${err}`),
  ];

  const canProceed = sellerValidation.isValid && buyerValidation.isValid;

  const result: CheckoutValidationResult = {
    canProceed,
    seller: sellerValidation,
    buyer: buyerValidation,
    errors: allErrors,
  };

  console.log("✅ Final checkout validation:", result);
  return result;
};

/**
 * 📦 Get complete seller data for checkout
 */
export const getSellerCheckoutData = async (sellerId: string) => {
  const validation = await validateSellerForListing(sellerId);

  if (!validation.isValid) {
    throw new Error(
      `Seller not ready for checkout: ${validation.errors.join(", ")}`,
    );
  }

  return {
    subAccountCode: validation.subaccountCode!,
    address: validation.address!,
  };
};

/**
 * 📦 Get complete buyer data for checkout
 */
export const getBuyerCheckoutData = async (buyerId: string) => {
  const validation = await validateBuyerForCheckout(buyerId);

  if (!validation.isValid) {
    throw new Error(
      `Buyer not ready for checkout: ${validation.errors.join(", ")}`,
    );
  }

  return {
    address: validation.address!,
  };
};
