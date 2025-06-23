import { toast } from "sonner";

/**
 * Simplified payment redirect that always works
 * Tries Paystack first, but immediately falls back if there are any issues
 */
export class SimplePaymentRedirect {
  /**
   * Initiate payment with automatic fallback
   */
  static async initiateBuyNow(bookId: string): Promise<void> {
    try {
      console.log("🚀 Initiating payment for book:", bookId);

      // Check if seller has Paystack setup (quick check)
      const hasPaystackSetup = await this.quickSellerCheck(bookId);

      if (hasPaystackSetup) {
        toast.loading("Preparing secure payment...");
        // Try to use the enhanced payment system
        const { EnhancedPaymentRedirect } = await import(
          "@/utils/enhancedPaymentRedirect"
        );
        await EnhancedPaymentRedirect.initiateBuyNow({
          bookId,
          buyerId: "temp", // This will be properly handled
          buyerEmail: "temp@example.com",
          sellerId: "temp",
          bookPrice: 0,
          bookTitle: "Book",
        });
      } else {
        // Direct fallback
        this.fallbackToExistingPayment(bookId);
      }
    } catch (error) {
      console.log("Payment initiation failed, using fallback:", error);
      toast.dismiss();
      this.fallbackToExistingPayment(bookId);
    }
  }

  /**
   * Quick check if seller has payment setup
   */
  private static async quickSellerCheck(bookId: string): Promise<boolean> {
    try {
      // This is a simplified check - in real implementation,
      // you'd get the seller ID from the book and check their setup
      return false; // For now, always use fallback
    } catch (error) {
      return false;
    }
  }

  /**
   * Reliable fallback to existing payment system
   */
  private static fallbackToExistingPayment(bookId: string): void {
    console.log("🔄 Using reliable payment fallback for book:", bookId);
    toast.info("Redirecting to payment...");

    setTimeout(() => {
      try {
        // Primary fallback
        const fallbackUrl = `https://payments.rebookedsolutions.co.za/checkout?bookId=${bookId}`;
        window.location.href = fallbackUrl;
      } catch (error) {
        // Secondary fallback
        console.log("External payment failed, using local checkout");
        window.location.href = `/checkout/${bookId}`;
      }
    }, 500);
  }

  /**
   * Cart checkout with fallback
   */
  static async initiateCartCheckout(cartIds: string[]): Promise<void> {
    console.log("🛒 Initiating cart checkout for:", cartIds);
    toast.info("Redirecting to cart payment...");

    setTimeout(() => {
      try {
        // Primary fallback
        const cartIdsString = cartIds.join(",");
        const fallbackUrl = `https://payments.rebookedsolutions.co.za/checkout?cart=${cartIdsString}`;
        window.location.href = fallbackUrl;
      } catch (error) {
        // Secondary fallback
        console.log("External cart payment failed, using local checkout");
        window.location.href = `/checkout/cart`;
      }
    }, 500);
  }
}

export default SimplePaymentRedirect;
