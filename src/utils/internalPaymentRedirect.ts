import { toast } from "sonner";

/**
 * Internal payment redirect utilities - always uses internal checkout
 */
export class InternalPaymentRedirect {
  /**
   * Redirect to checkout for a single book
   */
  static redirectToBuyNow(bookId: string): void {
    try {
      toast.success("Proceeding to checkout...");
      setTimeout(() => {
        window.location.href = `/checkout/${bookId}`;
      }, 500);
    } catch (error) {
      console.error("Error redirecting to checkout:", error);
      toast.error("Unable to proceed to checkout. Please try again.");
    }
  }

  /**
   * Redirect to cart checkout
   */
  static redirectToCartCheckout(): void {
    try {
      toast.success("Proceeding to checkout...");
      setTimeout(() => {
        window.location.href = `/checkout/cart`;
      }, 500);
    } catch (error) {
      console.error("Error redirecting to cart checkout:", error);
      toast.error("Unable to proceed to checkout. Please try again.");
    }
  }
}

export default InternalPaymentRedirect;
