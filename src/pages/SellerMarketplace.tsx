import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Star,
  MapPin,
  Calendar,
  BookOpen,
  ShoppingCart,
  Search,
  Filter,
  User,
  Mail,
  Award,
} from "lucide-react";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import { SellerMarketplaceService } from "@/services/sellerMarketplaceService";
import { MultiSellerCartService } from "@/services/multiSellerCartService";
import {
  SellerMarketplace as SellerMarketplaceType,
  SellerBookListing,
} from "@/types/multiSellerCart";
import { Book } from "@/types/book";

const SellerMarketplace = () => {
  const { sellerId } = useParams<{ sellerId: string }>();
  const navigate = useNavigate();

  const [marketplace, setMarketplace] = useState<SellerMarketplaceType | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [conditionFilter, setConditionFilter] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const loadSellerMarketplace = useCallback(async () => {
    if (!sellerId) {
      setError("Seller ID is required");
      setLoading(false);
      return;
    }

    // Basic seller ID validation
    if (sellerId.length < 10) {
      setError("Invalid seller ID");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const filters = {
        search: searchQuery || undefined,
        category:
          categoryFilter && categoryFilter !== "all"
            ? categoryFilter
            : undefined,
        condition:
          conditionFilter && conditionFilter !== "all"
            ? conditionFilter
            : undefined,
        minPrice: minPrice ? parseFloat(minPrice) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      };

      const data = await SellerMarketplaceService.getSellerMarketplace(
        sellerId,
        filters,
      );

      if (!data) {
        setError(
          "This seller's profile is not available or they haven't set up their account yet.",
        );
        return;
      }

      setMarketplace(data);
    } catch (err) {
      setError("Unable to load seller marketplace. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [
    sellerId,
    searchQuery,
    categoryFilter,
    conditionFilter,
    minPrice,
    maxPrice,
  ]);

  useEffect(() => {
    if (sellerId) {
      loadSellerMarketplace();
    } else {
      setLoading(false);
      setError("No seller ID provided");
    }
  }, [sellerId, loadSellerMarketplace]);

  const handleAddToCart = async (book: SellerBookListing) => {
    if (!marketplace?.profile) return;

    setAddingToCart(book.id);

    try {
      // Convert SellerBookListing to Book format
      const bookData: Book = {
        id: book.id,
        title: book.title,
        author: book.author,
        description: book.description,
        price: book.price,
        category: book.category,
        condition: book.condition as any,
        imageUrl: book.imageUrl,
        frontCover: book.frontCover,
        backCover: book.backCover,
        sold: book.availability === "sold",
        availability: book.availability as any,
        createdAt: book.createdAt,
        grade: book.grade,
        universityYear: book.universityYear,
        subaccountCode: marketplace.profile.subaccountCode,
        seller: {
          id: marketplace.profile.id,
          name: marketplace.profile.name,
          email: marketplace.profile.email,
          hasAddress: !!marketplace.profile.pickupAddress,
          hasSubaccount: marketplace.profile.hasValidBanking,
          isReadyForOrders:
            marketplace.profile.hasValidBanking &&
            !!marketplace.profile.pickupAddress,
        },
      };

      const result = MultiSellerCartService.addToCart(bookData, false);

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add book to cart");
    } finally {
      setAddingToCart(null);
    }
  };

  const handleViewBook = (bookId: string) => {
    navigate(`/book/${bookId}`);
  };

  const formatPrice = (price: number) => {
    return `R${price.toFixed(2)}`;
  };

  const getConditionColor = (condition: string) => {
    switch (condition.toLowerCase()) {
      case "new":
        return "bg-green-100 text-green-800";
      case "good":
        return "bg-blue-100 text-blue-800";
      case "better":
        return "bg-indigo-100 text-indigo-800";
      case "average":
        return "bg-yellow-100 text-yellow-800";
      case "below average":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-book-600 mx-auto mb-4"></div>
            <p>Loading seller marketplace for ID: {sellerId}</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !marketplace) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardContent className="text-center py-8">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900">
                Seller Not Found
              </h3>
              <p className="text-gray-600 mt-2">
                {error || "The seller you are looking for does not exist."}
              </p>
              <Button onClick={() => navigate("/books")} className="mt-4">
                Browse All Books
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const { profile, books, totalBooks, availableBooks } = marketplace;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Seller Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <Avatar className="h-20 w-20 mx-auto md:mx-0">
                <AvatarImage src={profile.profileImage} alt={profile.name} />
                <AvatarFallback className="text-2xl">
                  {profile.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold text-gray-900">
                  {profile.name}'s ReBooked Mini
                </h1>
                {profile.bio && (
                  <p className="text-gray-600 mt-2">{profile.bio}</p>
                )}

                <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
                  {profile.university && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      {profile.university}
                    </div>
                  )}

                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-1" />
                    Member since {new Date(profile.memberSince).getFullYear()}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-book-600">
                    {availableBooks}
                  </div>
                  <div className="text-sm text-gray-600">Available Books</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Books
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search books..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Textbook">Textbooks</SelectItem>
                  <SelectItem value="Study Guide">Study Guides</SelectItem>
                  <SelectItem value="Reference">Reference</SelectItem>
                  <SelectItem value="Novel">Novels</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={conditionFilter}
                onValueChange={setConditionFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Conditions</SelectItem>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Good">Good</SelectItem>
                  <SelectItem value="Better">Better</SelectItem>
                  <SelectItem value="Average">Average</SelectItem>
                  <SelectItem value="Below Average">Below Average</SelectItem>
                </SelectContent>
              </Select>

              <Input
                type="number"
                placeholder="Min Price (R)"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />

              <Input
                type="number"
                placeholder="Max Price (R)"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>

            {(searchQuery ||
              (categoryFilter && categoryFilter !== "all") ||
              (conditionFilter && conditionFilter !== "all") ||
              minPrice ||
              maxPrice) && (
              <div className="mt-4 flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setCategoryFilter("all");
                    setConditionFilter("all");
                    setMinPrice("");
                    setMaxPrice("");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Books Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {books.filter((book) => book.availability === "available").length ===
          0 ? (
            <div className="col-span-full text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900">
                No Books Found
              </h3>
              <p className="text-gray-600 mt-2">
                {searchQuery ||
                categoryFilter ||
                conditionFilter ||
                minPrice ||
                maxPrice
                  ? "Try adjusting your filters to see more books."
                  : "This seller has no available books at the moment."}
              </p>
            </div>
          ) : (
            books
              .filter((book) => book.availability === "available")
              .map((book) => (
                <Card
                  key={book.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-[3/4] relative">
                    <img
                      src={book.imageUrl || "/placeholder.svg"}
                      alt={book.title}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => handleViewBook(book.id)}
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg";
                      }}
                    />
                    <div className="absolute top-2 left-2">
                      <Badge className={getConditionColor(book.condition)}>
                        {book.condition}
                      </Badge>
                    </div>
                    {book.grade && (
                      <div className="absolute top-2 right-2">
                        <Badge variant="secondary">{book.grade}</Badge>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-4">
                    <h3
                      className="font-semibold text-gray-900 mb-1 line-clamp-2 cursor-pointer hover:text-book-600"
                      onClick={() => handleViewBook(book.id)}
                    >
                      {book.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">{book.author}</p>
                    <p className="text-sm text-gray-500 mb-2">
                      {book.description}
                    </p>

                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold text-book-600">
                        {formatPrice(book.price)}
                      </span>
                      <div className="text-xs text-gray-500">ReBooked Mini</div>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline">{book.category}</Badge>
                      <div className="text-xs text-gray-500">
                        Seller: {profile.name}
                      </div>
                    </div>

                    <Button
                      onClick={() => handleAddToCart(book)}
                      disabled={
                        addingToCart === book.id ||
                        book.availability !== "available"
                      }
                      className="w-full"
                      size="sm"
                    >
                      {addingToCart === book.id ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Adding...
                        </div>
                      ) : book.availability === "sold" ? (
                        "Sold"
                      ) : (
                        <>
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Add to Cart
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SellerMarketplace;
