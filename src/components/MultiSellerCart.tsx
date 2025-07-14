import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ShoppingCart,
  Trash2,
  User,
  CreditCard,
  Package,
  AlertTriangle,
  X,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { MultiSellerCartService } from "@/services/multiSellerCartService";
import { SellerCart, MultiSellerCartState } from "@/types/multiSellerCart";
import MultiSellerCartExplainer from "./MultiSellerCartExplainer";

interface MultiSellerCartProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MultiSellerCart: React.FC<MultiSellerCartProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const [cartState, setCartState] = useState<MultiSellerCartState>({
    carts: {},
    totalItems: 0,
    totalValue: 0,
  });
  const [loading, setLoading] = useState(false);
  const [showExplainer, setShowExplainer] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadCartState();
    }
  }, [isOpen]);

  const loadCartState = () => {
    const state = MultiSellerCartService.getCartState();
    setCartState(state);
  };

  const handleRemoveItem = async (bookId: string) => {
    setLoading(true);
    try {
      const result = MultiSellerCartService.removeFromCart(bookId);
      if (result.success) {
        toast.success(result.message);
        loadCartState();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Failed to remove item");
    } finally {
      setLoading(false);
    }
  };

  const handleClearSellerCart = async (sellerId: string) => {
    setLoading(true);
    try {
      const result = MultiSellerCartService.clearSellerCart(sellerId);
      if (result.success) {
        toast.success(result.message);
        loadCartState();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error clearing seller cart:", error);
      toast.error("Failed to clear cart");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckoutSeller = (sellerId: string) => {
    onClose();
    navigate(`/checkout/seller/${sellerId}`);
  };

  const handleViewSeller = (sellerId: string) => {
    onClose();
    navigate(`/seller/${sellerId}`);
  };

  const formatPrice = (price: number) => {
    return `R${price.toFixed(2)}`;
  };

  const sellerCarts = Object.values(cartState.carts);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Shopping Cart</h2>
            <Badge variant="secondary">
              {cartState.totalItems} item{cartState.totalItems !== 1 ? "s" : ""}
            </Badge>
            {sellerCarts.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowExplainer(true)}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                title="Why do I have multiple carts?"
              >
                <Info className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {sellerCarts.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900">
                Your cart is empty
              </h3>
              <p className="text-gray-600 mt-2">
                Add some books to get started!
              </p>
              <Button onClick={onClose} className="mt-4">
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="p-4 space-y-6">
              {sellerCarts.map((cart) => (
                <Card
                  key={cart.sellerId}
                  className="border-l-4 border-l-book-500"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <CardTitle className="text-lg">
                          {cart.sellerName}
                        </CardTitle>
                        <Badge variant="outline">
                          {cart.items.length} book
                          {cart.items.length !== 1 ? "s" : ""}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewSeller(cart.sellerId)}
                        >
                          View Seller
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleClearSellerCart(cart.sellerId)}
                          disabled={loading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-3">
                      {cart.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                        >
                          <img
                            src={item.imageUrl || "/placeholder.svg"}
                            alt={item.title}
                            className="w-12 h-16 object-cover rounded"
                            onError={(e) => {
                              const target = e.currentTarget;
                              if (target.src !== "/placeholder.svg") {
                                target.src = "/placeholder.svg";
                              } else {
                                // If placeholder also fails, hide image and show icon
                                target.style.display = "none";
                                const parent = target.parentElement;
                                if (
                                  parent &&
                                  !parent.querySelector(".img-fallback")
                                ) {
                                  const fallback =
                                    document.createElement("div");
                                  fallback.className =
                                    "img-fallback w-12 h-16 bg-gray-200 rounded flex items-center justify-center";
                                  fallback.innerHTML =
                                    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" class="text-gray-400"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg>';
                                  parent.appendChild(fallback);
                                }
                              }
                            }}
                          />

                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 truncate">
                              {item.title}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {item.author}
                            </p>
                          </div>

                          <div className="text-right">
                            <div className="font-semibold text-book-600">
                              {formatPrice(item.price)}
                            </div>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(item.bookId)}
                            disabled={loading}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <Separator className="my-4" />

                    {/* Cart Summary */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span>{formatPrice(cart.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Platform fee (10%):</span>
                        <span>{formatPrice(cart.platformCommission)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Seller receives:</span>
                        <span>{formatPrice(cart.sellerReceives)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-semibold">
                        <span>You pay:</span>
                        <span className="text-book-600">
                          {formatPrice(cart.subtotal)}
                        </span>
                      </div>
                    </div>

                    {/* Checkout Button */}
                    <div className="mt-4">
                      {!cart.subaccountCode && (
                        <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-3">
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm text-yellow-800">
                            This seller hasn't completed banking setup. You can
                            still add to cart, but checkout may be delayed.
                          </span>
                        </div>
                      )}

                      <Button
                        onClick={() => handleCheckoutSeller(cart.sellerId)}
                        className="w-full"
                        disabled={!cart.subaccountCode}
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Checkout {cart.sellerName}'s Books
                      </Button>

                      <p className="text-xs text-gray-500 mt-2 text-center">
                        + Courier fees will be calculated at checkout
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Multi-seller notice */}
              {sellerCarts.length > 1 && (
                <div className="flex items-center gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <Package className="h-4 w-4 text-blue-600" />
                  <div className="flex-1 text-sm text-blue-800">
                    <strong>Multiple sellers:</strong> Each seller's books will
                    be shipped separately. You'll need to checkout each seller
                    individually to minimize courier costs.
                    <button
                      onClick={() => setShowExplainer(true)}
                      className="ml-2 text-blue-600 hover:text-blue-700 underline font-medium"
                    >
                      Why is this?
                    </button>
                  </div>
                </div>
              )}

              {/* Total Summary */}
              <Card className="bg-gray-50">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-lg">Cart Total</div>
                      <div className="text-sm text-gray-600">
                        {cartState.totalItems} books from {sellerCarts.length}{" "}
                        seller{sellerCarts.length !== 1 ? "s" : ""}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-book-600">
                        {formatPrice(cartState.totalValue)}
                      </div>
                      <div className="text-sm text-gray-600">
                        + courier fees
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Multi-Seller Cart Explainer */}
      <MultiSellerCartExplainer
        isOpen={showExplainer}
        onClose={() => setShowExplainer(false)}
      />
    </div>
  );
};

export default MultiSellerCart;
