import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import ProfileHeader from "@/components/ProfileHeader";
import ShareProfileDialog from "@/components/ShareProfileDialog";
import BookNotSellingDialog from "@/components/BookNotSellingDialog";
import ReportIssueDialog from "@/components/ReportIssueDialog";
import HowItWorksDialog from "@/components/HowItWorksDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  AlertTriangle,
  BookOpen,
  ShoppingCart,
  Settings,
  User,
  Share2,
  HelpCircle,
  MoreHorizontal,
  Heart,
} from "lucide-react";
import ProfileEditDialog from "@/components/ProfileEditDialog";
import UserProfileTabs from "@/components/profile/UserProfileTabs";
import { saveUserAddresses, getUserAddresses } from "@/services/addressService";
import { getUserBooks } from "@/services/book/bookQueries";
import { deleteBook } from "@/services/book/bookMutations";
import { Book } from "@/types/book";
import { BookDeletionService } from "@/services/bookDeletionService";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

const Profile = () => {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isBookNotSellingDialogOpen, setIsBookNotSellingDialogOpen] =
    useState(false);
  const [isReportIssueDialogOpen, setIsReportIssueDialogOpen] = useState(false);
  const [isSellerHowItWorksOpen, setIsSellerHowItWorksOpen] = useState(false);
  const [isBuyerHowItWorksOpen, setIsBuyerHowItWorksOpen] = useState(false);
  const [addressData, setAddressData] = useState<{
    id: string;
    complex: string;
    unit_number: string;
    street_address: string;
    suburb: string;
    city: string;
    province: string;
    postal_code: string;
  } | null>(null);
  const [activeListings, setActiveListings] = useState<Book[]>([]);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [isLoadingListings, setIsLoadingListings] = useState(true);
  const [deletingBooks, setDeletingBooks] = useState<Set<string>>(new Set());

  const loadUserAddresses = useCallback(async () => {
    if (!user?.id) return;

    try {
      const data = await getUserAddresses(user.id);
      setAddressData(data);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("Error loading addresses:", errorMessage);
      toast.error("Failed to load addresses");
    }
  }, [user?.id]);

  const loadActiveListings = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoadingListings(true);
      const books = await getUserBooks(user.id);
      const activeBooks = Array.isArray(books)
        ? books.filter((book) => !book.sold)
        : [];
      setActiveListings(activeBooks);
    } catch (error) {
      console.error("Error loading active listings:", error);
      toast.error("Failed to load active listings");
      setActiveListings([]); // Set empty array on error
    } finally {
      setIsLoadingListings(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      loadUserAddresses();
      loadActiveListings();
    } else {
      // Reset state when no user
      setAddressData(null);
      setActiveListings([]);
      setIsLoadingListings(false);
    }
  }, [user?.id, loadUserAddresses, loadActiveListings]);

  const handleSaveAddresses = async (
    pickup: {
      complex: string;
      unitNumber: string;
      streetAddress: string;
      suburb: string;
      city: string;
      province: string;
      postalCode: string;
    },
    shipping: {
      complex: string;
      unitNumber: string;
      streetAddress: string;
      suburb: string;
      city: string;
      province: string;
      postalCode: string;
    },
    same: boolean,
  ) => {
    if (!user?.id) return;

    setIsLoadingAddress(true);
    try {
      // Check if user had pickup address before
      const hadPickupAddressBefore =
        addressData?.pickup_address &&
        addressData.pickup_address.streetAddress &&
        addressData.pickup_address.city &&
        addressData.pickup_address.province &&
        addressData.pickup_address.postalCode;

      // Save the addresses
      await saveUserAddresses(user.id, pickup, shipping, same);
      await loadUserAddresses();

      // Check if user has pickup address after
      const hasPickupAddressNow =
        pickup.streetAddress &&
        pickup.city &&
        pickup.province &&
        pickup.postalCode;

      // Handle listing status changes based on address changes
      if (!hadPickupAddressBefore && hasPickupAddressNow) {
        // User added pickup address - reactivate listings
        try {
          await BookDeletionService.reactivateUserListings(user.id);
          await loadActiveListings(); // Refresh listings
        } catch (error) {
          console.error("Error reactivating listings:", error);
          // Don't fail the entire operation for this
        }
      } else if (hadPickupAddressBefore && !hasPickupAddressNow) {
        // User removed pickup address - deactivate listings
        try {
          await BookDeletionService.deactivateUserListings(user.id);
          await loadActiveListings(); // Refresh listings
        } catch (error) {
          console.error("Error deactivating listings:", error);
          // Don't fail the entire operation for this
        }
      }

      toast.success("Addresses saved successfully");
    } catch (error) {
      console.error("Error saving addresses:", error);
      toast.error("Failed to save addresses");
      throw error;
    } finally {
      setIsLoadingAddress(false);
    }
  };

  const handleEditBook = (bookId: string) => {
    if (!bookId) {
      toast.error("Book ID is missing");
      return;
    }

    navigate(`/edit-book/${bookId}`);
  };

  const handleDeleteBook = async (bookId: string, bookTitle: string) => {
    if (!bookId) {
      toast.error("Book ID is missing");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to delete "${bookTitle}"? This action cannot be undone.`,
      )
    ) {
      return;
    }

    // Add book to deleting set
    setDeletingBooks((prev) => new Set(prev).add(bookId));

    try {
      await deleteBook(bookId);
      toast.success("Book deleted successfully");
      await loadActiveListings();
    } catch (error: unknown) {
      console.error("Error deleting book:", error);
      const errorMsg =
        error instanceof Error ? error.message : "Failed to delete book";
      toast.error(errorMsg);
    } finally {
      // Remove book from deleting set
      setDeletingBooks((prev) => {
        const newSet = new Set(prev);
        newSet.delete(bookId);
        return newSet;
      });
    }
  };

  const handleShareProfile = () => {
    setIsShareDialogOpen(true);
  };

  const handleBookNotSelling = () => {
    setIsBookNotSellingDialogOpen(true);
  };

  const handleEditProfile = () => {
    setIsEditDialogOpen(true);
  };

  const handleReportIssue = () => {
    setIsReportIssueDialogOpen(true);
  };

  const handleSellerHowItWorks = () => {
    setIsSellerHowItWorksOpen(true);
  };

  const handleBuyerHowItWorks = () => {
    setIsBuyerHowItWorksOpen(true);
  };

  if (!profile || !user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-book-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const userData = {
    id: user.id,
    name: profile.name || "Anonymous User",
    joinDate: new Date().toISOString(),
    isVerified: false,
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Fixed Report Issue Button - Moved to bottom-left for less clutter */}
        <div className="fixed bottom-4 left-4 z-50">
          <Button
            onClick={handleReportIssue}
            variant="outline"
            className="rounded-full w-12 h-12 p-0 shadow-lg bg-white border-gray-300 hover:bg-gray-50"
            title="Report an Issue"
          >
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </Button>
        </div>

        {/* Desktop Layout - Grid */}
        {!isMobile ? (
          <div className="grid grid-cols-12 gap-6">
            {/* Left Sidebar - Profile Info */}
            <div className="col-span-4 space-y-6">
              {/* Simplified Profile Header */}
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-book-100 rounded-full flex items-center justify-center mx-auto">
                      <User className="h-10 w-10 text-book-600" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">
                        {userData.name}
                      </h1>
                      <p className="text-gray-500 text-sm">
                        Joined{" "}
                        {new Date(userData.joinDate).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                          },
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Primary Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={() => navigate("/create-listing")}
                    className="w-full bg-book-600 hover:bg-book-700 text-white"
                    size="lg"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    List a Book
                  </Button>

                  <Button
                    onClick={handleShareProfile}
                    variant="outline"
                    className="w-full border-book-600 text-book-600 hover:bg-book-50"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Profile
                  </Button>
                </CardContent>
              </Card>

              {/* Account Settings Dropdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Account Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <Settings className="h-4 w-4 mr-2" />
                        Manage Account
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end">
                      <DropdownMenuItem onClick={handleEditProfile}>
                        <User className="h-4 w-4 mr-2" />
                        Edit Profile
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => navigate("/notifications")}
                      >
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Notifications
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/activity")}>
                        <Heart className="h-4 w-4 mr-2" />
                        Activity Log
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardContent>
              </Card>

              {/* Help & Support */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Help & Support</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={handleBookNotSelling}
                    variant="outline"
                    className="w-full text-left justify-start"
                  >
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Book not selling?
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full text-sm py-2">
                        <BookOpen className="h-4 w-4 mr-2" />
                        <span className="truncate">How It Works</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end">
                      <DropdownMenuItem onClick={handleSellerHowItWorks}>
                        <BookOpen className="h-4 w-4 mr-2" />
                        How Being A Seller Works
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleBuyerHowItWorks}>
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        How Being A Buyer Works
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardContent>
              </Card>
            </div>

            {/* Right Content - Tabs (Keep as-is) */}
            <div className="col-span-8">
              <UserProfileTabs
                activeListings={activeListings}
                isLoading={isLoadingListings}
                onEditBook={handleEditBook}
                onDeleteBook={handleDeleteBook}
                profile={profile}
                addressData={addressData}
                isOwnProfile={true}
                userId={user.id}
                userName={profile.name || "Anonymous User"}
                onSaveAddresses={handleSaveAddresses}
                isLoadingAddress={isLoadingAddress}
                deletingBooks={deletingBooks}
              />
            </div>
          </div>
        ) : (
          /* Mobile Layout - Preserve existing layout */
          <>
            {/* Profile Header with integrated action buttons */}
            <div className="mb-6">
              <ProfileHeader
                userData={userData}
                isOwnProfile={true}
                onShareProfile={handleShareProfile}
                onEditProfile={handleEditProfile}
                onBookNotSelling={handleBookNotSelling}
              />
            </div>

            {/* Primary Action */}
            <div className="mb-6">
              <Button
                onClick={() => navigate("/create-listing")}
                className="bg-book-600 hover:bg-book-700 text-white w-full"
                size="lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Listing
              </Button>
            </div>

            {/* Consolidated Actions */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <BookOpen className="h-4 w-4 mr-2" />
                        How It Works
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                      <DropdownMenuItem onClick={handleSellerHowItWorks}>
                        <BookOpen className="h-4 w-4 mr-2" />
                        Seller Guide
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleBuyerHowItWorks}>
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Buyer Guide
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <Settings className="h-4 w-4 mr-2" />
                        Account
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                      <DropdownMenuItem onClick={handleEditProfile}>
                        <User className="h-4 w-4 mr-2" />
                        Edit Profile
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => navigate("/notifications")}
                      >
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Notifications
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/activity")}>
                        <Heart className="h-4 w-4 mr-2" />
                        Activity Log
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleBookNotSelling}>
                        <HelpCircle className="h-4 w-4 mr-2" />
                        Book not selling?
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>

            {/* Main Content - Tabs (Keep as-is) */}
            <div className="w-full">
              <UserProfileTabs
                activeListings={activeListings}
                isLoading={isLoadingListings}
                onEditBook={handleEditBook}
                onDeleteBook={handleDeleteBook}
                profile={profile}
                addressData={addressData}
                isOwnProfile={true}
                userId={user.id}
                userName={profile.name || "Anonymous User"}
                onSaveAddresses={handleSaveAddresses}
                isLoadingAddress={isLoadingAddress}
                deletingBooks={deletingBooks}
              />
            </div>
          </>
        )}

        {/* Dialogs */}
        <ProfileEditDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
        />

        <ShareProfileDialog
          isOpen={isShareDialogOpen}
          onClose={() => setIsShareDialogOpen(false)}
          userId={user.id}
          userName={profile.name || "Anonymous User"}
          isOwnProfile={true}
        />

        <BookNotSellingDialog
          isOpen={isBookNotSellingDialogOpen}
          onClose={() => setIsBookNotSellingDialogOpen(false)}
        />

        <ReportIssueDialog
          isOpen={isReportIssueDialogOpen}
          onClose={() => setIsReportIssueDialogOpen(false)}
        />

        <HowItWorksDialog
          isOpen={isSellerHowItWorksOpen}
          onClose={() => setIsSellerHowItWorksOpen(false)}
          type="seller"
        />

        <HowItWorksDialog
          isOpen={isBuyerHowItWorksOpen}
          onClose={() => setIsBuyerHowItWorksOpen(false)}
          type="buyer"
        />
      </div>
    </Layout>
  );
};

export default Profile;
