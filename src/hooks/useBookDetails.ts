import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { getBookById } from "@/services/book/bookQueries";
import { Book } from "@/types/book";
import { toast } from "sonner";

export const useBookDetails = (bookId: string | undefined) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBook = useCallback(async () => {
    if (!bookId) {
      console.log("🔍 [useBookDetails] No bookId provided, skipping load");
      return;
    }

    console.log("🔄 [useBookDetails] Starting book load for ID:", bookId);
    setIsLoading(true);
    setError(null);

    try {
      console.log("📞 [useBookDetails] Calling getBookById...");
      const bookData = await getBookById(bookId);
      console.log("📊 [useBookDetails] getBookById returned:", bookData);

      if (!bookData) {
        console.log("⚠️ [useBookDetails] No book data returned, setting error");
        setError("Book not found");
        return;
      }

      console.log(
        "✅ [useBookDetails] Book loaded successfully, setting state",
      );
      setBook(bookData);
    } catch (error) {
      console.error("❌ [useBookDetails] Error loading book:", error);
      console.error("❌ [useBookDetails] Error details:", {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        bookId,
      });

      // Handle specific error types
      if (error instanceof Error) {
        if (
          error.message.includes("not found") ||
          error.message.includes("404")
        ) {
          setError("Book not found or has been removed");
        } else if (
          error.message.includes("network") ||
          error.message.includes("fetch")
        ) {
          setError("Network error. Please check your connection and try again");
        } else {
          setError("Failed to load book details. Please try again");
        }
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      console.log(
        "🏁 [useBookDetails] Book load finished, setting loading to false",
      );
      setIsLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    if (bookId) {
      loadBook();
    } else {
      setError("Invalid book ID");
      setIsLoading(false);
    }
  }, [bookId, loadBook]);

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      toast.error("Please log in to purchase books");
      navigate("/login");
      return;
    }

    if (book?.sold) {
      toast.error("This book has already been sold");
      return;
    }

    if (user?.id === book?.seller?.id) {
      toast.error("You cannot buy your own book");
      return;
    }

    if (bookId) {
      navigate(`/checkout/${bookId}`);
    }
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error("Please log in to add books to cart");
      navigate("/login");
      return;
    }

    if (book?.sold) {
      toast.error("This book has already been sold");
      return;
    }

    if (user?.id === book?.seller?.id) {
      toast.error("You cannot add your own book to cart");
      return;
    }

    if (book) {
      addToCart({
        id: book.id,
        bookId: book.id,
        title: book.title,
        author: book.author,
        price: book.price,
        imageUrl: book.frontCover || book.imageUrl,
        sellerId: book.seller?.id || "",
        sellerName: book.seller?.name || "Unknown Seller",
      });
      toast.success("Book added to cart");
    }
  };

  const handleViewSellerProfile = () => {
    if (book?.seller?.id) {
      navigate(`/user/${book.seller.id}`);
    } else {
      toast.error("Seller profile not available");
    }
  };

  const handleEditBook = () => {
    if (!isAuthenticated) {
      toast.error("Please log in to edit books");
      navigate("/login");
      return;
    }

    if (user?.id !== book?.seller?.id) {
      toast.error("You can only edit your own books");
      return;
    }

    if (bookId) {
      navigate(`/edit-book/${bookId}`);
    }
  };

  return {
    book,
    isLoading,
    error,
    user,
    handleBuyNow,
    handleAddToCart,
    handleViewSellerProfile,
    handleEditBook,
    navigate,
    refetch: loadBook,
  };
};
