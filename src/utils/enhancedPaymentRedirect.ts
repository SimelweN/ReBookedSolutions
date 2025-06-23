import { TransactionService } from "@/services/transactionService";
import { toast } from "sonner";

/**
 * Enhanced payment redirect utilities with Paystack integration
 */
export class EnhancedPaymentRedirect {
  /**
   * Initialize payment for a single book
   */
  static async initiateBuyNow({
    bookId,
    buyerId,
    buyerEmail,
    sellerId,
    bookPrice,
    bookTitle,
    deliveryFee = 0,
  }: {
    bookId: string;
    buyerId: string;
    buyerEmail: string;
    sellerId: string;
    bookPrice: number;
    bookTitle: string;
    deliveryFee?: number;
  }): Promise<void> {
    // Pre-check seller setup to avoid errors
    console.log("🔍 Pre-checking seller payment setup...");

    try {
      const { BankingDetailsService } = await import(
        "@/services/bankingDetailsService"
      );
      const sellerBankingDetails =
        await BankingDetailsService.getBankingDetails(sellerId);

      if (
        !sellerBankingDetails ||
        !sellerBankingDetails.paystack_subaccount_code
      ) {
        console.log(
          "❌ Seller payment setup incomplete, using fallback immediately",
        );
        toast.warning("Using alternative payment method for this seller...");
        this.fallbackToExistingPayment(bookId);
        return;
      }

      console.log(
        "✅ Seller has complete payment setup, proceeding with Paystack",
      );
    } catch (preCheckError) {
      console.log("⚠️ Pre-check failed, using fallback:", preCheckError);
      toast.warning("Using alternative payment method...");
      this.fallbackToExistingPayment(bookId);
      return;
    }
    // Since we pre-checked, this should work, but still wrap in try-catch
    try {
      toast.loading("Initializing secure payment...");

      const { payment_url } = await TransactionService.initializeBookPayment({
        bookId,
        buyerId,
        buyerEmail,
        sellerId,
        bookPrice,
        deliveryFee,
        bookTitle,
      });

      toast.dismiss();
      toast.success("Redirecting to secure payment...");

      // Redirect to Paystack payment page
      window.location.href = payment_url;
    } catch (error) {
      // This should rarely happen since we pre-checked, but handle it anyway
      toast.dismiss();
      console.error("Unexpected payment error after pre-check:", error);
      toast.warning("Payment method unavailable. Using alternative...");
      this.fallbackToExistingPayment(bookId);
    }
  }

  /**
   * Initialize payment for cart items
   */
  static async initiateCartCheckout({
    cartItems,
    buyerId,
    buyerEmail,
  }: {
    cartItems: Array<{
      id: string;
      seller_id: string;
      price: number;
      title: string;
    }>;
    buyerId: string;
    buyerEmail: string;
  }): Promise<void> {
    try {
      toast.loading("Processing cart checkout...");

      // For now, process each item separately
      // In the future, you might want to group by seller for batch processing
      const paymentPromises = cartItems.map((item) =>
        TransactionService.initializeBookPayment({
          bookId: item.id,
          buyerId,
          buyerEmail,
          sellerId: item.seller_id,
          bookPrice: item.price,
          bookTitle: item.title,
          deliveryFee: 0, // Calculate delivery fee as needed
        }),
      );

      const results = await Promise.all(paymentPromises);

      toast.dismiss();

      // For multiple items, you might want to create a summary page
      // For now, redirect to the first payment
      if (results.length > 0) {
        toast.success("Redirecting to payment...");
        window.location.href = results[0].payment_url;
      }
    } catch (error) {
      toast.dismiss();
      console.error("Cart checkout failed:", error);

      // Handle specific seller setup errors
      if (error instanceof Error) {
        if (
          error.message === "SELLER_NO_BANKING_DETAILS" ||
          error.message === "SELLER_NO_SUBACCOUNT"
        ) {
          toast.warning(
            "Some sellers haven't completed payment setup. Redirecting to alternative checkout...",
          );
          this.fallbackToExistingCartCheckout(cartItems);
          return;
        }
      }

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to process cart checkout";
      toast.error(errorMessage);

      // Fallback to existing cart checkout
      this.fallbackToExistingCartCheckout(cartItems);
    }
  }

  /**
   * Fallback to existing payment system
   */
  private static fallbackToExistingPayment(bookId: string): void {
    try {
      const fallbackUrl = `https://payments.rebookedsolutions.co.za/checkout?bookId=${bookId}`;
      console.log("Redirecting to fallback payment URL:", fallbackUrl);

      // Add a small delay to ensure the toast message is visible
      setTimeout(() => {
        window.location.href = fallbackUrl;
      }, 1000);
    } catch (error) {
      console.error("Error redirecting to fallback payment:", error);
      // If fallback fails, navigate to local checkout as last resort
      setTimeout(() => {
        window.location.href = `/checkout/${bookId}`;
      }, 1000);
    }
  }

  /**
   * Fallback to existing cart checkout
   */
  private static fallbackToExistingCartCheckout(
    cartItems: Array<{ id: string }>,
  ): void {
    try {
      const cartIds = cartItems.map((item) => item.id).join(",");
      const fallbackUrl = `https://payments.rebookedsolutions.co.za/checkout?cart=${cartIds}`;
      console.log("Redirecting to fallback cart checkout URL:", fallbackUrl);

      // Add a small delay to ensure the toast message is visible
      setTimeout(() => {
        window.location.href = fallbackUrl;
      }, 1000);
    } catch (error) {
      console.error("Error redirecting to fallback cart checkout:", error);
      // If fallback fails, navigate to local checkout as last resort
      setTimeout(() => {
        window.location.href = `/checkout/cart`;
      }, 1000);
    }
  }

  /**
   * Handle payment callback
   */
  static async handlePaymentCallback(reference: string): Promise<void> {
    try {
      const transaction =
        await TransactionService.handlePaymentCallback(reference);

      // Redirect to success page or profile
      window.location.href = `/profile?transaction=${transaction.id}`;
    } catch (error) {
      console.error("Payment callback handling failed:", error);
      toast.error("Payment processing failed. Please contact support.");

      // Redirect to a failure page or back to the book
      window.location.href = "/profile";
    }
  }
}

export default EnhancedPaymentRedirect;
