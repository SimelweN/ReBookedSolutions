import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  BookOpen,
  ShoppingCart,
  Search,
  Filter,
  MapPin,
  Star,
  Building,
  GraduationCap,
  AlertCircle,
  Book,
  ExternalLink,
  School,
} from "lucide-react";
import { ALL_SOUTH_AFRICAN_UNIVERSITIES } from "@/constants/universities";
import { getBooks } from "@/services/book/bookQueries";
import { Book as BookType } from "@/types/book";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const CampusBooksSection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const universities = ALL_SOUTH_AFRICAN_UNIVERSITIES;

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUniversity, setSelectedUniversity] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [books, setBooks] = useState<BookType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load books from the actual marketplace
  const loadBooks = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const filters: any = {};

      if (searchTerm.trim()) {
        filters.search = searchTerm.trim();
      }

      if (selectedUniversity !== "all") {
        filters.university = selectedUniversity;
      }

      if (selectedCategory !== "all") {
        filters.category = selectedCategory;
      }

      // Apply price range filters
      if (priceRange === "under-300") {
        filters.maxPrice = 299;
      } else if (priceRange === "300-500") {
        filters.minPrice = 300;
        filters.maxPrice = 500;
      } else if (priceRange === "over-500") {
        filters.minPrice = 501;
      }

      const booksData = await getBooks(filters);
      setBooks(booksData);
    } catch (error) {
      console.error("Failed to load books:", error);
      setError("Failed to load books. Please try again.");
      toast.error("Failed to load books");
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, selectedUniversity, selectedCategory, priceRange]);

  // Initial load and whenever filters change
  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  // Get unique categories from loaded books
  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(books.map((book) => book.category)),
    ].filter(Boolean);
    return uniqueCategories.sort();
  }, [books]);

  const filteredBooks = useMemo(() => {
    // If we're using server-side filtering, just return the books
    return books;
  }, [books]);

  const getConditionColor = (condition: string) => {
    switch (condition.toLowerCase()) {
      case "new":
        return "bg-green-100 text-green-800 border-green-200";
      case "good":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "better":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "average":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "below average":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const BookCard = ({ book }: { book: BookType }) => {
    const universityInfo = universities.find(
      (uni) => uni.id === book.university,
    );

    return (
      <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-book-500">
        <CardHeader className="pb-3 sm:pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-2">
            <CardTitle className="text-base sm:text-lg font-bold text-book-900 line-clamp-2">
              {book.title}
            </CardTitle>
            <Badge
              className={`${getConditionColor(book.condition)} text-xs whitespace-nowrap`}
            >
              {book.condition}
            </Badge>
          </div>
          <CardDescription className="text-sm text-gray-600 mb-2">
            by {book.author}
          </CardDescription>
          <div className="text-xl sm:text-2xl font-bold text-book-600 mb-2">
            R{book.price.toLocaleString()}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Book Image */}
          {book.imageUrl && (
            <div className="mb-3 relative h-32 sm:h-40 overflow-hidden rounded-lg">
              <img
                src={book.imageUrl}
                alt={book.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=300&fit=crop&auto=format&q=80";
                }}
              />
            </div>
          )}

          {/* University and Location Info */}
          <div className="mb-3 space-y-1">
            {book.university && (
              <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600">
                <Building className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="truncate">
                  {universityInfo?.name || book.university}
                </span>
              </div>
            )}
            {book.grade && (
              <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600">
                <School className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="truncate">Grade {book.grade}</span>
              </div>
            )}
            {book.universityYear && (
              <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600">
                <GraduationCap className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="truncate">Year {book.universityYear}</span>
              </div>
            )}
            {book.province && (
              <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600">
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="truncate">{book.province}</span>
              </div>
            )}
          </div>

          {book.description && (
            <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2">
              {book.description}
            </p>
          )}

          {/* Category Badge */}
          {book.category && (
            <div className="mb-3">
              <Badge
                variant="secondary"
                className="text-xs bg-book-100 text-book-800"
              >
                {book.category}
              </Badge>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-gray-500 mb-3 sm:mb-4">
            <span className="truncate">
              Sold by: {book.seller?.name || "Unknown Seller"}
            </span>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Star className="w-3 h-3 fill-current text-yellow-400" />
              <span>4.5</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              size="sm"
              className="w-full sm:flex-1 bg-book-600 hover:bg-book-700 text-white text-xs sm:text-sm"
              onClick={() => navigate(`/books/${book.id}`)}
            >
              <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              View Details
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto border-book-200 text-book-600 hover:bg-book-50 text-xs sm:text-sm"
              onClick={() => navigate(`/cart?add=${book.id}`)}
            >
              <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 mr-2 sm:mr-0" />
              <span className="sm:hidden">Add to Cart</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (universities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5" />
            <span>Campus Books</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Loading universities data...</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
          Campus Books Marketplace
        </h2>
        <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto">
          Find affordable textbooks from students across South Africa. Connect
          directly with sellers from your university and beyond.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mt-4">
          <Button
            onClick={() => {
              const params = new URLSearchParams();
              if (searchTerm) params.set("search", searchTerm);
              if (selectedUniversity !== "all")
                params.set("university", selectedUniversity);
              if (selectedCategory !== "all")
                params.set("category", selectedCategory);
              const queryString = params.toString();
              navigate("/books" + (queryString ? `?${queryString}` : ""));
            }}
            variant="outline"
            className="border-book-300 text-book-700 hover:bg-book-50"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View Full Marketplace
          </Button>
          <Button
            onClick={() => navigate("/create-listing")}
            className="bg-book-600 hover:bg-book-700 text-white"
          >
            <Book className="w-4 h-4 mr-2" />
            Sell Your Books
          </Button>
        </div>
      </div>

      {/* Filters - Mobile Optimized */}
      <Card className="bg-white border-0 shadow-lg">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
            Find Your Books
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search books or authors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm"
              />
            </div>

            {/* University Filter */}
            <Select
              value={selectedUniversity}
              onValueChange={setSelectedUniversity}
            >
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="All Universities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Universities</SelectItem>
                {universities.slice(0, 15).map((university) => (
                  <SelectItem key={university.id} value={university.id}>
                    {university.abbreviation || university.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Category Filter */}
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Price Range Filter */}
            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="All Prices" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="under-300">Under R300</SelectItem>
                <SelectItem value="300-500">R300 - R500</SelectItem>
                <SelectItem value="over-500">Over R500</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-800">
            {error}{" "}
            <Button
              variant="link"
              className="p-0 h-auto text-red-600 underline"
              onClick={loadBooks}
            >
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-book-600"></div>
          <span className="ml-3 text-gray-600">Loading books...</span>
        </div>
      ) : (
        /* Results */
        <div>
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
              {filteredBooks.length} Books Found
            </h3>
            <Button
              onClick={() => navigate("/create-listing")}
              className="bg-book-600 hover:bg-book-700 text-white text-sm"
            >
              <Book className="w-4 h-4 mr-2" />
              Sell Books
            </Button>
          </div>

          {filteredBooks.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No books found
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm ||
                  selectedUniversity !== "all" ||
                  selectedCategory !== "all" ||
                  priceRange !== "all"
                    ? "Try adjusting your search criteria or browse all available books."
                    : "No books are currently available. Be the first to list your textbooks!"}
                </p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Button
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedUniversity("all");
                      setSelectedCategory("all");
                      setPriceRange("all");
                    }}
                    variant="outline"
                  >
                    Clear Filters
                  </Button>
                  <Button
                    onClick={() => navigate("/books")}
                    className="bg-book-600 hover:bg-book-700"
                  >
                    Browse All Books
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredBooks.slice(0, 9).map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}

          {/* Show more books link if there are more than 9 */}
          {filteredBooks.length > 9 && (
            <div className="text-center mt-6">
              <Button
                onClick={() => {
                  const params = new URLSearchParams();
                  if (searchTerm) params.set("search", searchTerm);
                  if (selectedUniversity !== "all")
                    params.set("university", selectedUniversity);
                  if (selectedCategory !== "all")
                    params.set("category", selectedCategory);
                  const queryString = params.toString();
                  navigate("/books" + (queryString ? `?${queryString}` : ""));
                }}
                variant="outline"
                className="border-book-300 text-book-700 hover:bg-book-50"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View All {filteredBooks.length} Books in Marketplace
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CampusBooksSection;
