import React, { useContext, useState, useEffect, createContext } from "react";
import { CartItem, CartContextType } from "@/types/cart";
import { Book } from "@/types/book";
import { toast } from "sonner";
import { safeLocalStorage } from "@/utils/safeLocalStorage";
const CartContext = safeCreateContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount with validation
  useEffect(() => {
    try {
      const savedCart = safeLocalStorage.getItem("cart");
      if (savedCart) {
        const parsed = JSON.parse(savedCart);

        // Validate cart structure
        if (Array.isArray(parsed)) {
          // Filter out invalid items
          const validItems = parsed.filter(
            (item) =>
              item &&
              typeof item === "object" &&
              item.id &&
              item.bookId &&
              item.title &&
              typeof item.price === "number" &&
              item.price > 0 &&
              item.sellerId,
          );

          setItems(validItems);

          // If we filtered out items, update localStorage
          if (validItems.length !== parsed.length) {
            safeLocalStorage.setItem("cart", JSON.stringify(validItems));
            console.log(
              `Cleaned ${parsed.length - validItems.length} invalid items from cart`,
            );
          }
        } else {
          console.warn("Invalid cart format in localStorage, clearing cart");
          safeLocalStorage.removeItem("cart");
          setItems([]);
        }
      }
    } catch (error) {
      console.error("Error parsing saved cart:", error);
      safeLocalStorage.removeItem("cart");
      setItems([]);
    }
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    safeLocalStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  const addToCart = (book: Book) => {
    // Comprehensive book validation
    if (!book) {
      toast.error("Book information is missing");
      return;
    }

    if (!book.id) {
      toast.error("Book ID is missing");
      return;
    }

    if (!book.title || book.title.trim() === "") {
      toast.error("Book title is missing");
      return;
    }

    if (!book.price || typeof book.price !== "number" || book.price <= 0) {
      toast.error("Invalid book price");
      return;
    }

    if (!book.seller || !book.seller.id) {
      toast.error("Seller information is missing");
      return;
    }

    // Check if book is available (not sold)
    if (book.sold) {
      toast.error("This book has already been sold");
      return;
    }

    // Check if item already exists
    const existingItem = items.find((item) => item.bookId === book.id);
    if (existingItem) {
      toast.error("This book is already in your cart");
      return;
    }

    const newItem: CartItem = {
      id: `${book.id}-${Date.now()}`,
      bookId: book.id,
      title: book.title,
      author: book.author,
      price: book.price,
      imageUrl: book.imageUrl || book.frontCover || "",
      sellerId: book.seller.id,
      sellerName: book.seller.name || "Unknown Seller",
      quantity: 1,
    };

    setItems((prev) => [...prev, newItem]);
    toast.success("Added to cart");
  };

  const removeFromCart = (bookId: string) => {
    setItems((prev) => prev.filter((item) => item.bookId !== bookId));
    toast.success("Removed from cart");
  };

  const updateQuantity = (bookId: string, quantity: number) => {
    // Quantity is always 1 for books, but keeping for interface compatibility
    if (quantity <= 0) {
      removeFromCart(bookId);
      return;
    }
    // Don't allow quantity changes since each book is unique
  };

  const clearCart = () => {
    setItems([]);
    safeLocalStorage.removeItem("cart");
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + item.price, 0);
  };

  const getTotalItems = () => {
    return items.length; // Each book is quantity 1
  };

  const getSellerTotals = () => {
    const sellerTotals: {
      [sellerId: string]: {
        total: number;
        commission: number;
        sellerReceives: number;
        sellerName: string;
      };
    } = {};

    items.forEach((item) => {
      const itemTotal = item.price;
      const commission = itemTotal * 0.1; // 10% commission
      const sellerReceives = itemTotal - commission;

      if (sellerTotals[item.sellerId]) {
        sellerTotals[item.sellerId].total += itemTotal;
        sellerTotals[item.sellerId].commission += commission;
        sellerTotals[item.sellerId].sellerReceives += sellerReceives;
      } else {
        sellerTotals[item.sellerId] = {
          total: itemTotal,
          commission,
          sellerReceives,
          sellerName: item.sellerName,
        };
      }
    });

    return sellerTotals;
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getTotalItems,
        getSellerTotals,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
