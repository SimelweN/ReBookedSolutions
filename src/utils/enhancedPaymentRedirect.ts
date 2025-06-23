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
    try {
      toast.loading("Initializing payment...");

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
      toast.success("Redirecting to payment...");

      // Redirect to Paystack payment page
      window.location.href = payment_url;
    } catch (error) {
      toast.dismiss();
      console.error("Payment initialization failed:", error);

      // Handle specific seller setup errors
      if (error instanceof Error) {
        if (error.message === "SELLER_NO_BANKING_DETAILS") {
          toast.warning(
            "Seller hasn't set up banking details yet. Redirecting to alternative payment...",
          );
          this.fallbackToExistingPayment(bookId);
          return;
        }

        if (error.message === "SELLER_NO_SUBACCOUNT") {
          toast.warning(
            "Seller's payment account is being set up. Redirecting to alternative payment...",
          );
          this.fallbackToExistingPayment(bookId);
          return;
        }
      }

      const errorMessage =
        error instanceof Error ? error.message : "Failed to initialize payment";
      toast.error(errorMessage);

      // Fallback to existing payment system if Paystack fails
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
    const fallbackUrl = `https://payments.rebookedsolutions.co.za/checkout?bookId=${bookId}`;
    window.location.href = fallbackUrl;
  }

  /**
   * Fallback to existing cart checkout
   */
  private static fallbackToExistingCartCheckout(
    cartItems: Array<{ id: string }>,
  ): void {
    const cartIds = cartItems.map((item) => item.id).join(",");
    const fallbackUrl = `https://payments.rebookedsolutions.co.za/checkout?cart=${cartIds}`;
    window.location.href = fallbackUrl;
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
