import {
  MultiSellerCartState,
  SellerCart,
  CartItem,
  CartOperation,
  CartOperationResult,
} from "@/types/multiSellerCart";
import { Book } from "@/types/book";

const CART_STORAGE_KEY = "multi_seller_cart";
const PLATFORM_COMMISSION_RATE = 0.1; // 10%

export class MultiSellerCartService {
  /**
   * Load cart state from localStorage
   */
  static loadCartState(): MultiSellerCartState {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Validate structure
        if (parsed.carts && typeof parsed.carts === "object") {
          return {
            carts: parsed.carts,
            totalItems: parsed.totalItems || 0,
            totalValue: parsed.totalValue || 0,
            activeSellerId: parsed.activeSellerId,
          };
        }
      }
    } catch (error) {
      console.error("Error loading cart state:", error);
    }

    return {
      carts: {},
      totalItems: 0,
      totalValue: 0,
    };
  }

  /**
   * Save cart state to localStorage
   */
  static saveCartState(state: MultiSellerCartState): void {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error("Error saving cart state:", error);
    }
  }

  /**
   * Calculate totals for the entire cart system
   */
  static calculateTotals(carts: { [sellerId: string]: SellerCart }): {
    totalItems: number;
    totalValue: number;
  } {
    let totalItems = 0;
    let totalValue = 0;

    Object.values(carts).forEach((cart) => {
      totalItems += cart.items.length;
      totalValue += cart.subtotal;
    });

    return { totalItems, totalValue };
  }

  /**
   * Calculate seller cart totals
   */
  static calculateSellerCart(
    items: CartItem[],
    sellerName: string,
    sellerId: string,
    subaccountCode?: string,
  ): SellerCart {
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const platformCommission = subtotal * PLATFORM_COMMISSION_RATE;
    const sellerReceives = subtotal - platformCommission;

    return {
      sellerId,
      sellerName,
      subaccountCode,
      items,
      subtotal,
      platformCommission,
      sellerReceives,
    };
  }

  /**
   * Add book to cart (multi-seller logic)
   */
  static addToCart(
    book: Book,
    singleSellerMode: boolean = false,
  ): CartOperationResult {
    const state = this.loadCartState();

    // Validate book
    if (!book.id || !book.seller?.id || book.sold) {
      return {
        success: false,
        message: book.sold
          ? "This book has already been sold"
          : "Invalid book data",
      };
    }

    const sellerId = book.seller.id;
    const sellerName = book.seller.name || "Unknown Seller";

    // Check if book already exists in any cart
    for (const cart of Object.values(state.carts)) {
      if (cart.items.some((item) => item.bookId === book.id)) {
        return {
          success: false,
          message: "This book is already in your cart",
        };
      }
    }

    // Single seller mode: clear other carts if adding from different seller
    if (
      singleSellerMode &&
      state.activeSellerId &&
      state.activeSellerId !== sellerId
    ) {
      const currentSellerName =
        state.carts[state.activeSellerId]?.sellerName || "Unknown";
      return {
        success: false,
        message: `You can only buy from one seller per order. You currently have items from ${currentSellerName}. Clear your cart to add items from ${sellerName}.`,
      };
    }

    // Create cart item
    const newItem: CartItem = {
      id: `${book.id}-${Date.now()}`,
      bookId: book.id,
      title: book.title,
      author: book.author,
      price: book.price,
      imageUrl: book.imageUrl || book.frontCover || "",
      quantity: 1,
    };

    // Add to seller's cart
    if (!state.carts[sellerId]) {
      state.carts[sellerId] = this.calculateSellerCart(
        [newItem],
        sellerName,
        sellerId,
        book.subaccountCode,
      );
    } else {
      state.carts[sellerId].items.push(newItem);
      state.carts[sellerId] = this.calculateSellerCart(
        state.carts[sellerId].items,
        sellerName,
        sellerId,
        book.subaccountCode,
      );
    }

    // Update totals
    const totals = this.calculateTotals(state.carts);
    state.totalItems = totals.totalItems;
    state.totalValue = totals.totalValue;
    state.activeSellerId = sellerId;

    this.saveCartState(state);

    return {
      success: true,
      message: `Added "${book.title}" to cart`,
      newCart: state,
    };
  }

  /**
   * Remove item from cart
   */
  static removeFromCart(bookId: string): CartOperationResult {
    const state = this.loadCartState();
    let itemRemoved = false;
    let removedTitle = "";

    // Find and remove the item
    Object.keys(state.carts).forEach((sellerId) => {
      const cart = state.carts[sellerId];
      const itemIndex = cart.items.findIndex((item) => item.bookId === bookId);

      if (itemIndex !== -1) {
        removedTitle = cart.items[itemIndex].title;
        cart.items.splice(itemIndex, 1);
        itemRemoved = true;

        // Recalculate cart or remove if empty
        if (cart.items.length === 0) {
          delete state.carts[sellerId];
          if (state.activeSellerId === sellerId) {
            state.activeSellerId = undefined;
          }
        } else {
          state.carts[sellerId] = this.calculateSellerCart(
            cart.items,
            cart.sellerName,
            sellerId,
            cart.subaccountCode,
          );
        }
      }
    });

    if (!itemRemoved) {
      return {
        success: false,
        message: "Item not found in cart",
      };
    }

    // Update totals
    const totals = this.calculateTotals(state.carts);
    state.totalItems = totals.totalItems;
    state.totalValue = totals.totalValue;

    this.saveCartState(state);

    return {
      success: true,
      message: `Removed "${removedTitle}" from cart`,
      newCart: state,
    };
  }

  /**
   * Clear specific seller's cart
   */
  static clearSellerCart(sellerId: string): CartOperationResult {
    const state = this.loadCartState();

    if (!state.carts[sellerId]) {
      return {
        success: false,
        message: "Seller cart not found",
      };
    }

    const sellerName = state.carts[sellerId].sellerName;
    delete state.carts[sellerId];

    if (state.activeSellerId === sellerId) {
      state.activeSellerId = Object.keys(state.carts)[0]; // Set to first remaining seller
    }

    // Update totals
    const totals = this.calculateTotals(state.carts);
    state.totalItems = totals.totalItems;
    state.totalValue = totals.totalValue;

    this.saveCartState(state);

    return {
      success: true,
      message: `Cleared cart for ${sellerName}`,
      newCart: state,
    };
  }

  /**
   * Clear all carts
   */
  static clearAllCarts(): CartOperationResult {
    const state: MultiSellerCartState = {
      carts: {},
      totalItems: 0,
      totalValue: 0,
      activeSellerId: undefined,
    };

    this.saveCartState(state);

    return {
      success: true,
      message: "Cleared all carts",
      newCart: state,
    };
  }

  /**
   * Get cart for specific seller
   */
  static getSellerCart(sellerId: string): SellerCart | null {
    const state = this.loadCartState();
    return state.carts[sellerId] || null;
  }

  /**
   * Get all seller carts
   */
  static getAllCarts(): SellerCart[] {
    const state = this.loadCartState();
    return Object.values(state.carts);
  }

  /**
   * Get cart state
   */
  static getCartState(): MultiSellerCartState {
    return this.loadCartState();
  }

  /**
   * Check if user can add book from this seller (for single-seller mode)
   */
  static canAddBookFromSeller(
    sellerId: string,
    singleSellerMode: boolean = false,
  ): { canAdd: boolean; message?: string } {
    if (!singleSellerMode) {
      return { canAdd: true };
    }

    const state = this.loadCartState();

    if (!state.activeSellerId || state.activeSellerId === sellerId) {
      return { canAdd: true };
    }

    const currentSellerName =
      state.carts[state.activeSellerId]?.sellerName || "Unknown";
    return {
      canAdd: false,
      message: `You can only buy from one seller per order. You currently have items from ${currentSellerName}.`,
    };
  }

  /**
   * Switch to different seller (clear current cart)
   */
  static switchToSeller(newSellerId: string): CartOperationResult {
    const state = this.loadCartState();

    if (state.activeSellerId && state.carts[state.activeSellerId]) {
      const oldSellerName = state.carts[state.activeSellerId].sellerName;
      delete state.carts[state.activeSellerId];

      // Update totals
      const totals = this.calculateTotals(state.carts);
      state.totalItems = totals.totalItems;
      state.totalValue = totals.totalValue;
      state.activeSellerId = newSellerId;

      this.saveCartState(state);

      return {
        success: true,
        message: `Cleared cart for ${oldSellerName}. You can now add items from the new seller.`,
        newCart: state,
      };
    }

    return {
      success: true,
      message: "Ready to add items from this seller",
      newCart: state,
    };
  }
}
