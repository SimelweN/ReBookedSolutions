import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Edit,
  Trash2,
  Eye,
  MapPin,
  User,
  Clock,
  CheckCircle,
  AlertTriangle,
  Star,
  BookOpen,
  MessageSquare,
  Calendar,
} from "lucide-react";
import { Book } from "@/types/book";
import ProfileEditDialog from "@/components/ProfileEditDialog";
import AddressEditDialog from "@/components/AddressEditDialog";
import SimpleAddressEditDialog from "@/components/SimpleAddressEditDialog";
import UnavailableBookCard from "@/components/UnavailableBookCard";
import { UserProfile, AddressData, Address } from "@/types/address";

interface UserProfileTabsProps {
  activeListings: Book[];
  isLoading: boolean;
  onEditBook: (bookId: string) => void;
  onDeleteBook: (bookId: string, bookTitle: string) => void;
  profile: UserProfile | null;
  addressData: AddressData | null;
  isOwnProfile: boolean;
  userId: string;
  userName: string;
  onSaveAddresses?: (
    pickup: Address,
    shipping: Address,
    same: boolean,
  ) => Promise<void>;
  isLoadingAddress?: boolean;
  deletingBooks?: Set<string>;
}

const UserProfileTabs = ({
  activeListings,
  isLoading,
  onEditBook,
  onDeleteBook,
  profile,
  addressData,
  isOwnProfile,
  userId,
  userName,
  onSaveAddresses,
  isLoadingAddress = false,
  deletingBooks = new Set(),
}: UserProfileTabsProps) => {
  const navigate = useNavigate();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddressEditDialogOpen, setIsAddressEditDialogOpen] = useState(false);

  const formatAddress = (address: Address | null | undefined) => {
    if (!address) return "Not provided";
    return `${address.street}, ${address.city}, ${address.province} ${address.postalCode}`;
  };

  // Commit data will be fetched from API when the feature is ready
  const commitData = {
    totalCommits: null,
    activeCommits: null,
    completedCommits: null,
    averageResponseTime: null,
    reliabilityScore: null,
    recentCommits: [],
  };

  return (
    <div className="w-full">
      <Tabs defaultValue="listings" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="listings" className="flex-1">
            Active Listings ({activeListings.length})
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex-1">
            Activity
          </TabsTrigger>
          {isOwnProfile && (
            <>
              <TabsTrigger value="account" className="flex-1">
                Account
              </TabsTrigger>
              <TabsTrigger value="addresses" className="flex-1">
                Addresses
              </TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="listings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl">
                Active Listings ({activeListings.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-book-600 mx-auto"></div>
                  <p className="text-gray-600 mt-4">Loading listings...</p>
                </div>
              ) : activeListings.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">
                    {isOwnProfile
                      ? "You have no active listings."
                      : "This user has no active listings."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {activeListings.map((book) => {
                    const isUnavailable =
                      (book as Book & { status?: string }).status ===
                      "unavailable";

                    if (isUnavailable) {
                      return (
                        <UnavailableBookCard
                          key={book.id}
                          book={book}
                          onEdit={isOwnProfile ? onEditBook : undefined}
                          onDelete={isOwnProfile ? onDeleteBook : undefined}
                          isOwnProfile={isOwnProfile}
                        />
                      );
                    }

                    return (
                      <div
                        key={book.id}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <img
                          src={book.frontCover || book.imageUrl}
                          alt={book.title}
                          className="w-full h-32 object-cover rounded mb-3"
                        />
                        <h4 className="font-semibold text-sm truncate">
                          {book.title}
                        </h4>
                        <p className="text-xs text-gray-600 truncate">
                          by {book.author}
                        </p>
                        <p className="text-sm font-bold text-book-600 mt-2">
                          R{book.price}
                        </p>

                        <div className="mt-3 space-y-2">
                          <Button
                            onClick={() => navigate(`/books/${book.id}`)}
                            variant="outline"
                            size="sm"
                            className="w-full text-xs"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View Book
                          </Button>

                          {isOwnProfile && (
                            <div className="grid grid-cols-2 gap-2">
                              <Button
                                onClick={() => onEditBook(book.id)}
                                variant="outline"
                                size="sm"
                                className="text-xs"
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                              <Button
                                onClick={() =>
                                  onDeleteBook(book.id, book.title)
                                }
                                variant="destructive"
                                size="sm"
                                className="text-xs"
                                disabled={deletingBooks.has(book.id)}
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                {deletingBooks.has(book.id)
                                  ? "Deleting..."
                                  : "Delete"}
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Commit System Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                  Commit System Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">
                    Commit System Coming Soon
                  </h3>
                  <p className="text-gray-500 text-sm">
                    The commit system will track your transaction history once
                    it's fully implemented.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-orange-600" />
                  Recent Commits
                </CardTitle>
              </CardHeader>
              <CardContent>
                {commitData.recentCommits.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">
                      No Commits Yet
                    </h3>
                    <p className="text-gray-500 text-sm">
                      Commits will appear here when buyers express interest in
                      your books.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {commitData.recentCommits.map((commit) => (
                      <div
                        key={commit.id}
                        className={`p-3 rounded-lg border ${
                          commit.status === "completed"
                            ? "bg-green-50 border-green-200"
                            : "bg-yellow-50 border-yellow-200"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm truncate">
                              {commit.bookTitle}
                            </h4>
                            <p className="text-xs text-gray-600">
                              Buyer: {commit.buyerName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(commit.commitDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex flex-col items-end">
                            <Badge
                              variant={
                                commit.status === "completed"
                                  ? "default"
                                  : "secondary"
                              }
                              className={
                                commit.status === "completed"
                                  ? "bg-green-600"
                                  : "bg-yellow-600"
                              }
                            >
                              {commit.status}
                            </Badge>
                            {commit.responseTime !== "pending" && (
                              <span className="text-xs text-gray-500 mt-1">
                                {commit.responseTime}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Commit System Explanation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-indigo-600" />
                How the 48-Hour Commit System Works
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2">
                      1
                    </div>
                    <h4 className="font-medium mb-1">Buyer Commits</h4>
                    <p className="text-sm text-gray-600">
                      Buyer expresses serious interest in your book
                    </p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="w-8 h-8 bg-yellow-600 text-white rounded-full flex items-center justify-center mx-auto mb-2">
                      2
                    </div>
                    <h4 className="font-medium mb-1">48-Hour Window</h4>
                    <p className="text-sm text-gray-600">
                      You have 48 hours to respond and arrange pickup
                    </p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-2">
                      3
                    </div>
                    <h4 className="font-medium mb-1">Transaction</h4>
                    <p className="text-sm text-gray-600">
                      Meet buyer and complete the sale successfully
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {isOwnProfile && (
          <>
            <TabsContent value="account" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl md:text-2xl flex items-center">
                    <User className="h-6 w-6 mr-2" />
                    Account Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p>
                      <strong>Name:</strong> {profile?.name || "Not provided"}
                    </p>
                    <p>
                      <strong>Email:</strong> {profile?.email || "Not provided"}
                    </p>
                    <p>
                      <strong>Student Number:</strong>{" "}
                      {profile?.student_number || "Not provided"}
                    </p>
                    <p>
                      <strong>University:</strong>{" "}
                      {profile?.university || "Not provided"}
                    </p>
                    <p>
                      <strong>Study Year:</strong>{" "}
                      {profile?.study_year || "Not provided"}
                    </p>
                  </div>
                  <Button
                    onClick={() => setIsEditDialogOpen(true)}
                    className="w-full md:w-auto"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="addresses" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl md:text-2xl flex items-center">
                    <MapPin className="h-6 w-6 mr-2" />
                    Addresses
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">Pickup Address</h3>
                      <p className="text-sm text-gray-600">
                        {formatAddress(addressData?.pickup_address)}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">
                        Shipping Address
                      </h3>
                      <p className="text-sm text-gray-600">
                        {formatAddress(addressData?.shipping_address)}
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={() => setIsAddressEditDialogOpen(true)}
                    className="w-full md:w-auto"
                    disabled={isLoadingAddress}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    {isLoadingAddress ? "Loading..." : "Edit Addresses"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </>
        )}
      </Tabs>

      {/* Dialogs */}
      {profile && (
        <ProfileEditDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          currentProfile={profile}
        />
      )}

      {addressData && onSaveAddresses && (
        <SimpleAddressEditDialog
          isOpen={isAddressEditDialogOpen}
          onClose={() => setIsAddressEditDialogOpen(false)}
          addressData={addressData}
          onSave={onSaveAddresses}
          isLoading={isLoadingAddress}
        />
      )}
    </div>
  );
};

export default UserProfileTabs;
