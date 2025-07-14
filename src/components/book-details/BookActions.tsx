import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ShoppingCart,
  CreditCard,
  Edit,
  User,
  Clock,
  Package,
} from "lucide-react";
import { Book } from "@/types/book";
import { UserProfile } from "@/types/address"; // UserProfile includes id
import { toast } from "sonner";

interface BookActionsProps {
  book: Book;
  user: UserProfile | null;
  onBuyNow: () => void;
  onAddToCart: () => void;
  onEditBook: () => void;
  onCommit?: () => void; // New commit action
  onMarkCollected?: () => void; // New collection confirmation action
  onShare: () => void; // This prop seems unused in the component
  onViewSellerProfile: () => void; // This prop seems unused in the component
  showCommitButton?: boolean; // Flag to show commit button
  showCollectionButton?: boolean; // Flag to show collection confirmation button
}

const BookActions = ({
  book,
  user,
  onBuyNow,
  onAddToCart,
  onEditBook,
  onCommit,
  onMarkCollected,
  showCommitButton = false,
  showCollectionButton = false,
  // onShare, // Prop was unused
  // onViewSellerProfile, // Prop was unused
}: BookActionsProps) => {
  const isOwner = user?.id === book.seller?.id; // seller is an object with id
  const isSold = book.sold;
  const isPendingCommit = book.status === "pending_commit" || showCommitButton;
  const isCommittedAwaitingCollection =
    book.status === "committed" && showCollectionButton;

  return (
    <Card className="sticky top-4">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Price Section */}
          <div className="text-center p-4 bg-book-50 rounded-lg border">
            <div className="text-3xl font-bold text-book-600 mb-2">
              R{book.price?.toLocaleString()}
            </div>
            <p className="text-sm text-gray-600">Final Price</p>
          </div>

          {/* Action Buttons */}
          {isSold ? (
            <div className="text-center p-4 bg-gray-100 rounded-lg">
              <p className="text-gray-600 font-medium">
                This book has been sold
              </p>
            </div>
          ) : isPendingCommit && isOwner && onCommit ? (
            <div className="space-y-3">
              <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                <Clock className="mx-auto h-5 w-5 text-orange-600 mb-2" />
                <p className="text-sm text-orange-800 font-medium">
                  Commit Required
                </p>
                <p className="text-xs text-orange-600">
                  Please confirm this sale within 48 hours
                </p>
              </div>
              <Button
                onClick={onCommit}
                className="w-full bg-book-600 hover:bg-book-700"
                size="lg"
              >
                <Clock className="mr-2 h-4 w-4" />
                Commit Sale
              </Button>
              <Button
                onClick={onEditBook}
                variant="outline"
                className="w-full border-book-600 text-book-600 hover:bg-book-50"
                size="sm"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Book
              </Button>
            </div>
          ) : isCommittedAwaitingCollection && onMarkCollected ? (
            <div className="space-y-3">
              <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                <Package className="mx-auto h-5 w-5 text-blue-600 mb-2" />
                <p className="text-sm text-blue-800 font-medium">
                  Awaiting Collection
                </p>
                <p className="text-xs text-blue-600">
                  {isOwner
                    ? "Mark as collected once buyer picks up the book"
                    : "Arrange pickup with the seller"}
                </p>
              </div>
              {isOwner && (
                <Button
                  onClick={onMarkCollected}
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  <Package className="mr-2 h-4 w-4" />
                  Mark as Collected
                </Button>
              )}
            </div>
          ) : isOwner ? (
            <Button
              onClick={onEditBook}
              className="w-full bg-book-600 hover:bg-book-700"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Book
            </Button>
          ) : (
            <div className="space-y-3">
              <Button
                onClick={onBuyNow}
                className="w-full bg-book-600 hover:bg-book-700"
                size="lg"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Buy Now
              </Button>
              <Button
                onClick={onAddToCart}
                variant="outline"
                className="w-full border-book-600 text-book-600 hover:bg-book-50"
                size="lg"
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>
            </div>
          )}

          {/* Secondary Actions */}
          <div className="pt-3 border-t border-gray-200 space-y-2">
            <Button
              onClick={() => {
                // seller_id on book type might be string | undefined or seller object.
                // Assuming seller object exists from `isOwner` check
                const sellerId = book.seller?.id;
                if (sellerId) {
                  const listingsUrl = `${window.location.origin}/books?seller=${sellerId}`;

                  // Try modern clipboard API first
                  if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard
                      .writeText(listingsUrl)
                      .then(() => {
                        toast.success(
                          "Seller listings link copied to clipboard!",
                        );
                      })
                      .catch(() => {
                        // Fallback: show the URL to user
                        prompt("Copy this link:", listingsUrl);
                        toast.info("Please copy the link manually.");
                      });
                  } else {
                    // Fallback for older browsers
                    const textArea = document.createElement("textarea");
                    textArea.value = listingsUrl;
                    document.body.appendChild(textArea);
                    textArea.select();

                    try {
                      document.execCommand("copy");
                      toast.success(
                        "Seller listings link copied to clipboard!",
                      );
                    } catch (error) {
                      prompt("Copy this link:", listingsUrl);
                      toast.info("Please copy the link manually.");
                    } finally {
                      document.body.removeChild(textArea);
                    }
                  }
                } else {
                  toast.error(
                    "Could not find seller information for this book.",
                  );
                }
              }}
              variant="outline"
              className="w-full"
              size="sm"
            >
              <User className="mr-2 h-4 w-4" />
              Share Listings
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookActions;
