import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { getBooks } from "@/services/book/bookQueries";
import { Book } from "@/types/book";
import { BookOpen, Search, Star } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadFeaturedBooks();
  }, []);

  const loadFeaturedBooks = async () => {
    try {
      setIsLoading(true);
      console.log("[Index] Loading books...");

      const allBooks = await getBooks();
      console.log("[Index] Received books:", {
        isArray: Array.isArray(allBooks),
        length: allBooks?.length || 0,
        firstFew: allBooks?.slice(0, 2) || [],
      });

      const booksToShow = Array.isArray(allBooks) ? allBooks.slice(0, 4) : [];
      setFeaturedBooks(booksToShow);

      console.log("[Index] Set featured books:", booksToShow.length);
    } catch (error) {
      const errorDetails = {
        message: error instanceof Error ? error.message : String(error),
        name: error instanceof Error ? error.name : "Unknown",
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
      };

      console.error("[Index] Error loading featured books:", errorDetails);

      const userMessage =
        error instanceof Error && error.message.includes("Failed to fetch")
          ? "Unable to load featured books. Please check your internet connection and try refreshing the page."
          : "Failed to load featured books. Please try again later.";

      toast.error(userMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery.trim());
      navigate(`/books?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const categories = [
    { name: "Computer Science", icon: "💻" },
    { name: "Mathematics", icon: "📊" },
    { name: "Biology", icon: "🧬" },
    { name: "Chemistry", icon: "⚗️" },
    { name: "Physics", icon: "🔭" },
    { name: "Economics", icon: "📈" },
  ];

  return (
    <Layout>
      <SEO
        title="ReBooked Solutions - Buy and Sell Used Textbooks"
        description="South Africa's trusted platform for buying and selling used textbooks. Find affordable academic books, sell your old textbooks, and connect with students across the country."
        keywords="textbooks, used books, academic books, sell books, buy books, student books, South Africa"
        url="https://www.rebookedsolutions.co.za/"
      />

      {/* Mobile-Optimized Hero Section */}
      <section className="bg-gradient-to-r from-book-100 to-book-200 py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0 text-center md:text-left">
            <div className="mb-4">
              <span className="inline-block bg-book-600/10 text-book-700 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium italic">
                "Pre-Loved Pages, New Adventures"
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-book-900 mb-4 leading-tight">
              Buy and Sell Textbooks with Ease
            </h1>
            <p className="text-lg sm:text-xl text-book-700 mb-6 sm:mb-8 px-2 sm:px-0">
              Buy affordable secondhand textbooks and give your old ones a new
              home — all handled securely through ReBooked Solutions.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 px-4 sm:px-0">
              <Button
                size="lg"
                className="bg-book-600 hover:bg-book-700 w-full sm:w-auto"
                onClick={() => navigate("/books")}
              >
                Browse Books
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-book-600 text-book-700 hover:bg-book-100 w-full sm:w-auto"
                onClick={() => navigate("/create-listing")}
              >
                Sell Your Books
              </Button>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <img
              src="/placeholder.svg"
              alt="Students studying with textbooks in library"
              width="600"
              height="400"
              className="rounded-lg shadow-xl max-w-full h-auto w-full max-w-sm md:max-w-full"
              loading="eager"
              decoding="sync"
            />
          </div>
        </div>
      </section>

      {/* Mobile-Optimized Search Section */}
      <section className="py-8 sm:py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 text-book-800">
            Find Your Textbooks
          </h2>
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto relative">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-0">
              <input
                type="text"
                placeholder="Search by title, author, or subject..."
                className="w-full p-3 sm:p-4 sm:pr-16 rounded-lg sm:rounded-r-none border border-gray-300 focus:outline-none focus:ring-2 focus:ring-book-500 focus:border-transparent text-base sm:text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                className="bg-book-600 text-white p-3 sm:p-2 rounded-lg sm:rounded-l-none sm:absolute sm:right-2 sm:top-2 hover:bg-book-700 transition duration-200 flex items-center justify-center"
              >
                <Search className="h-5 w-5 sm:h-6 sm:w-6 sm:mr-2" />
                <span className="sm:hidden">Search</span>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Mobile-Optimized Categories Section */}
      <section className="py-8 sm:py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 text-book-800">
            Browse by Category
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={`/books?category=${encodeURIComponent(category.name)}`}
                className="bg-white rounded-lg shadow-md p-4 sm:p-6 text-center hover:shadow-lg transition-shadow duration-200"
              >
                <span className="text-2xl sm:text-4xl mb-2 sm:mb-4 block">
                  {category.icon}
                </span>
                <h3 className="font-semibold text-book-800 text-xs sm:text-base leading-tight">
                  {category.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ReBooked Campus Promotion Section */}
      <section className="py-8 sm:py-12 bg-gradient-to-r from-book-600 to-book-700">
        <div className="container mx-auto px-4">
          <div className="text-center text-white space-y-4 sm:space-y-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-white/20 rounded-full">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold">
                Introducing ReBooked Campus
              </h2>
            </div>

            <p className="text-lg sm:text-xl max-w-2xl mx-auto text-white/90">
              Your complete university guide! Calculate your APS score, explore
              degree programs, find bursaries, and buy textbooks from students
              at your campus.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto text-sm sm:text-base">
              <div className="bg-white/10 rounded-lg p-3 sm:p-4">
                <div className="text-2xl mb-2">🎓</div>
                <div className="font-semibold">APS Calculator</div>
                <div className="text-white/80 text-xs sm:text-sm">
                  Calculate your score
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 sm:p-4">
                <div className="text-2xl mb-2">🏫</div>
                <div className="font-semibold">23+ Universities</div>
                <div className="text-white/80 text-xs sm:text-sm">
                  Explore programs
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 sm:p-4">
                <div className="text-2xl mb-2">💰</div>
                <div className="font-semibold">Find Bursaries</div>
                <div className="text-white/80 text-xs sm:text-sm">
                  Get funding
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 sm:p-4">
                <div className="text-2xl mb-2">📚</div>
                <div className="font-semibold">Campus Books</div>
                <div className="text-white/80 text-xs sm:text-sm">
                  From your university
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
              <Button
                onClick={() => navigate("/university-info")}
                size="lg"
                className="bg-white text-book-600 hover:bg-gray-100 font-semibold"
              >
                Explore ReBooked Campus →
              </Button>
              <Link
                to="/university-info"
                className="text-white/90 hover:text-white text-sm underline"
              >
                Calculate your APS score now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile-Optimized Featured Books Section */}
      <section className="py-8 sm:py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-book-800">
              Featured Textbooks
            </h2>
            <Link
              to="/books"
              className="text-book-600 hover:text-book-800 transition-colors duration-200 text-sm sm:text-base"
            >
              View all →
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-48 sm:h-64">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-t-2 border-b-2 border-book-600"></div>
            </div>
          ) : featuredBooks.length === 0 ? (
            <div className="text-center py-8 sm:py-10">
              <BookOpen className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-book-300 mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold mb-2">
                No books available yet
              </h3>
              <p className="text-gray-500 mb-4 sm:mb-6 text-sm sm:text-base">
                Be the first to list your textbooks!
              </p>
              <Button
                onClick={() => navigate("/create-listing")}
                className="bg-book-600 hover:bg-book-700"
              >
                Sell Your Books
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {featuredBooks.map((book) => (
                <Link
                  key={book.id}
                  to={`/books/${book.id}`}
                  className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-200 book-card-hover"
                  onClick={() =>
                    console.log("Clicking featured book:", book.id)
                  }
                >
                  <div className="relative h-40 sm:h-48 overflow-hidden">
                    <img
                      src={book.imageUrl}
                      alt={book.title}
                      width="400"
                      height="300"
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=300&fit=crop&auto=format&q=80";
                      }}
                    />
                    {book.status === "sold" && (
                      <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
                        SOLD
                      </div>
                    )}
                  </div>
                  <div className="p-3 sm:p-4">
                    <h3 className="font-semibold text-book-800 mb-1 sm:mb-2 text-sm sm:text-base leading-tight line-clamp-2">
                      {book.title}
                    </h3>
                    <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-1">
                      by {book.author}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg sm:text-xl font-bold text-book-600">
                        R{book.price}
                      </span>
                      <div className="flex items-center text-xs sm:text-sm text-gray-500">
                        <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-current text-yellow-400 mr-1" />
                        <span>{book.averageRating?.toFixed(1) || "New"}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Index;
