/**
 * Paystack Validation Service
 * Ensures Paystack is properly configured with real API keys and data
 */

import { PAYSTACK_CONFIG } from "@/config/paystack";
import { toast } from "sonner";

export class PaystackValidation {
  /**
   * Validate Paystack configuration before payment processing
   */
  static validateConfiguration(): boolean {
    const publicKey = PAYSTACK_CONFIG.PUBLIC_KEY;

    // Check if public key exists and is not a placeholder
    if (!publicKey) {
      console.error("❌ Paystack public key not configured");
      toast.error("Payment system not configured. Please contact support.");
      return false;
    }

    // Check if using test key in production
    if (PAYSTACK_CONFIG.isProduction && publicKey.startsWith("pk_test_")) {
      console.error("❌ Using test Paystack key in production environment");
      toast.error(
        "Payment system configuration error. Please contact support.",
      );
      return false;
    }

    // Check if using live key in development (optional warning)
    if (PAYSTACK_CONFIG.isDevelopment && publicKey.startsWith("pk_live_")) {
      console.warn("⚠️ Using live Paystack key in development environment");
    }

    // Validate key format
    if (!publicKey.match(/^pk_(test|live)_[a-zA-Z0-9]+$/)) {
      console.error("❌ Invalid Paystack public key format");
      toast.error("Invalid payment configuration. Please contact support.");
      return false;
    }

    return true;
  }

  /**
   * Validate payment amount and data
   */
  static validatePaymentData(data: {
    amount: number;
    email: string;
    cartItems: any[];
    shippingData: any;
    deliveryData: any;
  }): boolean {
    // Validate amount
    if (!data.amount || data.amount <= 0) {
      console.error("❌ Invalid payment amount:", data.amount);
      toast.error("Invalid payment amount");
      return false;
    }

    // Validate minimum amount (Paystack minimum is R1.00)
    if (data.amount < 1) {
      console.error("❌ Payment amount below minimum:", data.amount);
      toast.error("Payment amount too low (minimum R1.00)");
      return false;
    }

    // Validate maximum amount (reasonable limit)
    if (data.amount > 50000) {
      console.error("❌ Payment amount above reasonable limit:", data.amount);
      toast.error(
        "Payment amount too high. Please contact support for large orders.",
      );
      return false;
    }

    // Validate email
    if (!data.email || !data.email.includes("@")) {
      console.error("❌ Invalid email address:", data.email);
      toast.error("Invalid email address");
      return false;
    }

    // Validate cart items
    if (!data.cartItems || data.cartItems.length === 0) {
      console.error("❌ Empty cart items");
      toast.error("No items in cart");
      return false;
    }

    // Validate shipping data
    if (
      !data.shippingData ||
      !data.shippingData.recipient_name ||
      !data.shippingData.city
    ) {
      console.error("❌ Incomplete shipping data");
      toast.error("Shipping information incomplete");
      return false;
    }

    // Validate delivery data
    if (!data.deliveryData || !data.deliveryData.price) {
      console.error("❌ No delivery option selected");
      toast.error("Please select a delivery option");
      return false;
    }

    return true;
  }

  /**
   * Validate seller subaccount configuration
   */
  static validateSellerSubaccounts(
    sellerSubaccounts: Record<string, string>,
    cartItems: any[],
  ): boolean {
    // Filter out invalid/anonymous sellers and ensure we have valid cart items
    const validCartItems = cartItems.filter((item) => {
      // Check if item has valid seller information
      if (!item.sellerId || !item.sellerName) {
        console.warn("⚠️ Cart item missing seller information:", item);
        return false;
      }

      // Filter out anonymous/placeholder sellers
      if (
        item.sellerName === "Anonymous" ||
        item.sellerName === "Anonymous User" ||
        item.sellerName === "Unknown Seller" ||
        item.sellerId === "anonymous" ||
        !item.sellerId.trim()
      ) {
        console.warn("⚠️ Filtering out anonymous seller:", item.sellerName);
        return false;
      }

      return true;
    });

    if (validCartItems.length === 0) {
      console.error("❌ No valid cart items with proper seller information");
      toast.error(
        "Unable to process payment - seller information missing. Please refresh and try again.",
      );
      return false;
    }

    if (validCartItems.length !== cartItems.length) {
      console.warn(
        `⚠️ Filtered ${cartItems.length - validCartItems.length} invalid cart items`,
      );
    }

    const sellersWithoutSubaccounts = validCartItems.filter(
      (item) => !sellerSubaccounts[item.sellerId],
    );

    if (sellersWithoutSubaccounts.length > 0) {
      const sellerNames = sellersWithoutSubaccounts
        .map((item) => item.sellerName || item.sellerId)
        .filter(
          (name) => name && name !== "Anonymous" && name !== "Unknown Seller",
        ) // Additional filter
        .join(", ");

      if (sellerNames) {
        console.error("❌ Sellers without payment setup:", sellerNames);
        toast.error(
          `Payment setup incomplete for sellers: ${sellerNames}. Please contact support.`,
        );
      } else {
        console.error("❌ Payment setup issues detected");
        toast.error(
          "Payment configuration issue detected. Please contact support.",
        );
      }
      return false;
    }

    // Validate subaccount codes format
    for (const [sellerId, subaccountCode] of Object.entries(
      sellerSubaccounts,
    )) {
      if (!subaccountCode || !subaccountCode.match(/^ACCT_[a-zA-Z0-9]+$/)) {
        console.error(
          "❌ Invalid subaccount code for seller:",
          sellerId,
          subaccountCode,
        );
        toast.error("Payment configuration error. Please contact support.");
        return false;
      }
    }

    return true;
  }

  /**
   * Calculate and validate payment splits
   */
  static calculatePaymentSplits(
    cartItems: any[],
    deliveryFee: number,
  ): {
    isValid: boolean;
    splits: Array<{
      sellerId: string;
      amount: number;
      percentage: number;
    }>;
    platformFee: number;
    totalAmount: number;
  } {
    const bookTotal = cartItems.reduce(
      (sum, item) => sum + (item.price || 0),
      0,
    );
    const totalAmount = bookTotal + deliveryFee;

    // Platform takes 10% from each book sale
    const platformFeeRate = 0.1;

    const splits = cartItems.map((item) => {
      const bookPrice = item.price || 0;
      const platformFee = bookPrice * platformFeeRate;
      const sellerAmount = bookPrice - platformFee;

      return {
        sellerId: item.sellerId,
        amount: sellerAmount,
        percentage: (sellerAmount / totalAmount) * 100,
      };
    });

    const totalPlatformFee = cartItems.reduce(
      (sum, item) => sum + (item.price || 0) * platformFeeRate,
      0,
    );

    // Validate splits add up correctly
    const totalSplitAmount = splits.reduce(
      (sum, split) => sum + split.amount,
      0,
    );
    const expectedTotal = bookTotal - totalPlatformFee;

    const isValid = Math.abs(totalSplitAmount - expectedTotal) < 0.01; // Allow 1 cent difference for rounding

    if (!isValid) {
      console.error("❌ Payment split calculation error:", {
        totalSplitAmount,
        expectedTotal,
        difference: totalSplitAmount - expectedTotal,
      });
    }

    return {
      isValid,
      splits,
      platformFee: totalPlatformFee,
      totalAmount,
    };
  }

  /**
   * Log payment attempt for debugging
   */
  static logPaymentAttempt(data: {
    amount: number;
    reference: string;
    email: string;
    cartItems: any[];
    splits: any[];
  }): void {
    console.log("💳 Payment Attempt:", {
      amount: `R${data.amount.toFixed(2)}`,
      reference: data.reference,
      email: data.email,
      itemCount: data.cartItems.length,
      splitCount: data.splits.length,
      timestamp: new Date().toISOString(),
      environment: PAYSTACK_CONFIG.isDevelopment ? "development" : "production",
      publicKeyType: PAYSTACK_CONFIG.PUBLIC_KEY.startsWith("pk_test_")
        ? "test"
        : "live",
    });
  }

  /**
   * Validate webhook signature (for future implementation)
   */
  static validateWebhookSignature(
    payload: string,
    signature: string,
    secret: string,
  ): boolean {
    // This would be implemented when webhooks are fully set up
    // For now, return true as a placeholder
    console.log("Webhook validation placeholder");
    return true;
  }
}

export default PaystackValidation;
