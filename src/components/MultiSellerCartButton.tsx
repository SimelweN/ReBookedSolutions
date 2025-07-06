import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";
import { MultiSellerCartService } from "@/services/multiSellerCartService";
import { MultiSellerCartState } from "@/types/multiSellerCart";
import MultiSellerCart from "./MultiSellerCart";

const MultiSellerCartButton: React.FC = () => {
  const [cartState, setCartState] = useState<MultiSellerCartState>({
    carts: {},
    totalItems: 0,
    totalValue: 0,
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    loadCartState();

    // Listen for cart updates
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "multi_seller_cart") {
        loadCartState();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Also listen for custom events
    const handleCartUpdate = () => {
      loadCartState();
    };

    window.addEventListener("cartUpdated", handleCartUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("cartUpdated", handleCartUpdate);
    };
  }, []);

  const loadCartState = () => {
    const state = MultiSellerCartService.getCartState();
    setCartState(state);
  };

  const handleCartClick = () => {
    setIsCartOpen(true);
  };

  const handleCartClose = () => {
    setIsCartOpen(false);
    // Refresh cart state when closing
    loadCartState();
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleCartClick}
        className="relative"
      >
        <ShoppingCart className="h-4 w-4" />
        {cartState.totalItems > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs flex items-center justify-center min-w-[20px]"
          >
            {cartState.totalItems}
          </Badge>
        )}
        <span className="ml-2 hidden sm:inline">
          Cart
          {cartState.totalItems > 0 && (
            <span className="ml-1">(R{cartState.totalValue.toFixed(2)})</span>
          )}
        </span>
      </Button>

      <MultiSellerCart isOpen={isCartOpen} onClose={handleCartClose} />
    </>
  );
};

export default MultiSellerCartButton;
