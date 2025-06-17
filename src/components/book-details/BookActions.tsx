
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, CreditCard, Edit, User } from "lucide-react";
import { Book } from "@/types/book";
import { UserProfile } from "@/types/address"; // UserProfile includes id
import { toast } from "sonner";

interface BookActionsProps {
  book: Book;
  user: UserProfile | null;
  onBuyNow: () => void;
  onAddToCart: () => void;
  onEditBook: () => void;
  onShare: () => void; // This prop seems unused in the component
  onViewSellerProfile: () => void; // This prop seems unused in the component
}

const BookActions = ({
  book,
  user,
  onBuyNow,
  onAddToCart,
  onEditBook,
  // onShare, // Prop was unused
  // onViewSellerProfile, // Prop was unused
}: BookActionsProps) => {
  const isOwner = user?.id === book.seller?.id; // seller is an object with id
  const isSold = book.sold;

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
                  navigator.clipboard.writeText(listingsUrl);
                  toast.success("Seller listings link copied to clipboard!"); // Using toast for better UX
                } else {
                  toast.error("Could not find seller information for this book.");
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
