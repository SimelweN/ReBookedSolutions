import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye, MapPin, User } from "lucide-react";
import { Book } from "@/types/book";
import ProfileEditDialog from "@/components/ProfileEditDialog";
import AddressEditDialog from "@/components/AddressEditDialog";
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

  return (
    <div className="w-full">
      <Tabs defaultValue="listings" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="listings">Listings</TabsTrigger>
          {isOwnProfile && <TabsTrigger value="account">Account</TabsTrigger>}
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
                                {deletingBooks.has(book.id) ? (
                                  <>
                                    <div className="h-3 w-3 mr-1 animate-spin rounded-full border border-white border-t-transparent" />
                                    Deleting...
                                  </>
                                ) : (
                                  <>
                                    <Trash2 className="h-3 w-3 mr-1" />
                                    Delete
                                  </>
                                )}
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

        {isOwnProfile && (
          <TabsContent value="account" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Name
                    </label>
                    <p className="mt-1">{profile?.name || "Not provided"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Email
                    </label>
                    <p className="mt-1">{profile?.email || "Not provided"}</p>
                  </div>
                </div>
                <Button
                  onClick={() => setIsEditDialogOpen(true)}
                  variant="outline"
                  className="w-full md:w-auto"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Addresses
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Pickup Address
                  </label>
                  <p className="mt-1 text-sm">
                    {formatAddress(addressData?.pickup_address)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Shipping Address
                  </label>
                  <p className="mt-1 text-sm">
                    {addressData?.addresses_same
                      ? "Same as pickup address"
                      : formatAddress(addressData?.shipping_address)}
                  </p>
                </div>
                <Button
                  onClick={() => setIsAddressEditDialogOpen(true)}
                  variant="outline"
                  className="w-full md:w-auto"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Addresses
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      <ProfileEditDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
      />

      {isOwnProfile && onSaveAddresses && (
        <AddressEditDialog
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
