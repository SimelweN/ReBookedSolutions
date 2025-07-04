import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useIsMobile } from "@/hooks/use-mobile";
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
  Shield,
  UserX,
  Pause,
  CreditCard,
} from "lucide-react";
import { Book } from "@/types/book";
import ProfileEditDialog from "@/components/ProfileEditDialog";
import UnavailableBookCard from "@/components/UnavailableBookCard";
import ModernBankingSection from "@/components/profile/ModernBankingSection";
import ModernAddressInput from "@/components/ModernAddressInput";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { UserProfile, AddressData, Address } from "@/types/address";

interface AddressSectionProps {
  addressData: AddressData | null;
  onSaveAddresses?: (
    pickup: Address,
    shipping: Address,
    same: boolean,
  ) => Promise<void>;
  isLoadingAddress?: boolean;
}

const AddressSection = ({
  addressData,
  onSaveAddresses,
  isLoadingAddress = false,
}: AddressSectionProps) => {
  const { user } = useAuth();
  const [isEditingPickup, setIsEditingPickup] = useState(false);
  const [isEditingShipping, setIsEditingShipping] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pickupAddress, setPickupAddress] = useState<Address | null>(null);
  const [shippingAddress, setShippingAddress] = useState<Address | null>(null);
  const [sameAsPickup, setSameAsPickup] = useState(false);

  const formatAddress = (address: Address | null | undefined) => {
    if (!address) return "Not provided";
    return `${address.street}, ${address.city}, ${address.province} ${address.postalCode}`;
  };

  const handlePickupSave = async () => {
    if (!pickupAddress || !onSaveAddresses) return;

    setIsSaving(true);
    try {
      const finalShippingAddress = sameAsPickup
        ? pickupAddress
        : shippingAddress || pickupAddress;
      await onSaveAddresses(pickupAddress, finalShippingAddress, sameAsPickup);
      toast.success("Pickup address saved successfully!");
      setIsEditingPickup(false);
    } catch (error) {
      console.error("Error saving pickup address:", error);
      toast.error("Failed to save pickup address");
    } finally {
      setIsSaving(false);
    }
  };

  const handleShippingSave = async () => {
    if (!shippingAddress || !onSaveAddresses || !pickupAddress) return;

    setIsSaving(true);
    try {
      await onSaveAddresses(pickupAddress, shippingAddress, false);
      toast.success("Shipping address saved successfully!");
      setIsEditingShipping(false);
    } catch (error) {
      console.error("Error saving shipping address:", error);
      toast.error("Failed to save shipping address");
    } finally {
      setIsSaving(false);
    }
  };

  // Initialize addresses from addressData
  useEffect(() => {
    try {
      if (addressData?.pickup_address) {
        setPickupAddress(addressData.pickup_address);
      }
      if (addressData?.shipping_address) {
        setShippingAddress(addressData.shipping_address);
      }
    } catch (error) {
      console.error("Error initializing addresses:", error);
    }
  }, [addressData]);

  return (
    <div className="space-y-6">
      {/* Pickup Address Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Pickup Address</h3>
          {!isEditingPickup && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditingPickup(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              {addressData?.pickup_address ? "Edit" : "Add"}
            </Button>
          )}
        </div>

        {isEditingPickup ? (
          <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
            <ModernAddressInput
              onAddressUpdate={setPickupAddress}
              initialAddress={addressData?.pickup_address || undefined}
              title="Pickup Address"
              description="This is where buyers will collect books from you."
            />

            <div className="flex items-center space-x-2">
              <Checkbox
                id="same-as-pickup"
                checked={sameAsPickup}
                onCheckedChange={setSameAsPickup}
              />
              <Label htmlFor="same-as-pickup" className="text-sm">
                Use this address for shipping as well
              </Label>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handlePickupSave}
                disabled={!pickupAddress || isSaving}
                className="bg-book-600 hover:bg-book-700"
              >
                {isSaving ? "Saving..." : "Save Pickup Address"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditingPickup(false);
                  setPickupAddress(addressData?.pickup_address || null);
                }}
                disabled={isSaving}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              {formatAddress(addressData?.pickup_address)}
            </p>
          </div>
        )}
      </div>

      {/* Shipping Address Section */}
      {!sameAsPickup && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Shipping Address</h3>
            {!isEditingShipping && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditingShipping(true)}
              >
                <Edit className="h-4 w-4 mr-2" />
                {addressData?.shipping_address ? "Edit" : "Add"}
              </Button>
            )}
          </div>

          {isEditingShipping ? (
            <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
              <ModernAddressInput
                onAddressUpdate={setShippingAddress}
                initialAddress={addressData?.shipping_address || undefined}
                title="Shipping Address"
                description="Where you want items shipped to when buying books."
              />

              <div className="flex gap-2">
                <Button
                  onClick={handleShippingSave}
                  disabled={!shippingAddress || isSaving}
                  className="bg-book-600 hover:bg-book-700"
                >
                  {isSaving ? "Saving..." : "Save Shipping Address"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditingShipping(false);
                    setShippingAddress(addressData?.shipping_address || null);
                  }}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                {formatAddress(addressData?.shipping_address)}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Quick add button for when no addresses exist */}
      {!addressData?.pickup_address && !isEditingPickup && (
        <div className="text-center py-8">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            No addresses yet
          </h3>
          <p className="text-gray-500 mb-4">
            Add your pickup address to start selling books
          </p>
          <Button
            onClick={() => setIsEditingPickup(true)}
            className="bg-book-600 hover:bg-book-700"
          >
            <MapPin className="h-4 w-4 mr-2" />
            Add Pickup Address
          </Button>
        </div>
      )}
    </div>
  );
};

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
  const isMobile = useIsMobile();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isTemporarilyAway, setIsTemporarilyAway] = useState(false);

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
        <TabsList
          className={`w-full ${isMobile ? "grid grid-cols-5 gap-0.5 h-auto p-1" : "flex"}`}
        >
          <TabsTrigger
            value="listings"
            className={`${isMobile ? "h-14 text-xs px-0.5 flex-col" : "flex-1"} flex items-center justify-center`}
          >
            <span className={isMobile ? "text-center leading-tight" : ""}>
              {isMobile
                ? `📚 ${activeListings.length}`
                : `Active Listings (${activeListings.length})`}
            </span>
            {isMobile && (
              <span className="text-[10px] opacity-75">Listings</span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="activity"
            className={`${isMobile ? "h-14 text-xs px-0.5 flex-col" : "flex-1"} flex items-center justify-center`}
          >
            <span className={isMobile ? "text-center leading-tight" : ""}>
              {isMobile ? "📊" : "Activity"}
            </span>
            {isMobile && (
              <span className="text-[10px] opacity-75">Activity</span>
            )}
          </TabsTrigger>
          {isOwnProfile && (
            <>
              <TabsTrigger
                value="account"
                className={`${isMobile ? "h-14 text-xs px-0.5 flex-col" : "flex-1"} flex items-center justify-center`}
              >
                <span className={isMobile ? "text-center leading-tight" : ""}>
                  {isMobile ? "👤" : "Account"}
                </span>
                {isMobile && (
                  <span className="text-[10px] opacity-75">Account</span>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="addresses"
                className={`${isMobile ? "h-14 text-xs px-0.5 flex-col" : "flex-1"} flex items-center justify-center`}
              >
                <span className={isMobile ? "text-center leading-tight" : ""}>
                  {isMobile ? "📍" : "Addresses"}
                </span>
                {isMobile && (
                  <span className="text-[10px] opacity-75">Address</span>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="banking"
                className={`${isMobile ? "h-14 text-xs px-0.5 flex-col" : "flex-1"} flex items-center justify-center`}
              >
                <span className={isMobile ? "text-center leading-tight" : ""}>
                  {isMobile ? "💳" : "Banking"}
                </span>
                {isMobile && (
                  <span className="text-[10px] opacity-75">Banking</span>
                )}
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
                    const isUnavailable = book.availability === "unavailable";

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
          {/* Commit System Overview */}
          <div
            className={`grid grid-cols-1 ${isMobile ? "gap-4" : "md:grid-cols-2 gap-6"}`}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                  Commit Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-600">
                      {commitData.totalCommits ?? "-"}
                    </div>
                    <div className="text-xs text-gray-500">Total Commits</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {commitData.completedCommits ?? "-"}
                    </div>
                    <div className="text-xs text-gray-500">Completed</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {commitData.activeCommits ?? "-"}
                    </div>
                    <div className="text-xs text-gray-500">Active</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {commitData.reliabilityScore ?? "-"}%
                    </div>
                    <div className="text-xs text-gray-500">Reliability</div>
                  </div>
                </div>
                {commitData.averageResponseTime && (
                  <div className="mt-4 text-center">
                    <Badge variant="secondary" className="text-xs">
                      Avg Response: {commitData.averageResponseTime}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Commits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-orange-600" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {commitData.recentCommits.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                    <h3 className="font-medium text-gray-600 mb-1">
                      No Activity Yet
                    </h3>
                    <p className="text-gray-500 text-sm">
                      Commit activity will appear here when buyers express
                      interest in your books.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {commitData.recentCommits.map((commit) => (
                      <div
                        key={commit.id}
                        className={`p-3 rounded-lg border ${
                          commit.status === "completed"
                            ? "bg-green-50 border-green-200"
                            : commit.status === "active"
                              ? "bg-yellow-50 border-yellow-200"
                              : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
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
                              className={`text-xs ${
                                commit.status === "completed"
                                  ? "bg-green-600"
                                  : commit.status === "active"
                                    ? "bg-yellow-600"
                                    : "bg-gray-600"
                              }`}
                            >
                              {commit.status}
                            </Badge>
                            {commit.responseTime &&
                              commit.responseTime !== "pending" && (
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
              <div
                className={`grid grid-cols-1 ${isMobile ? "gap-3" : "md:grid-cols-3 gap-4"}`}
              >
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
                  <h4 className="font-medium mb-1">Complete Sale</h4>
                  <p className="text-sm text-gray-600">
                    Meet buyer and complete the transaction successfully
                  </p>
                </div>
              </div>

              {/* Commit System Status */}
              <div className="mt-6 bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <div className="flex items-center">
                  <MessageSquare className="h-5 w-5 text-indigo-600 mr-3" />
                  <div>
                    <h4 className="font-medium text-indigo-800">
                      Commit System Status
                    </h4>
                    <p className="text-sm text-indigo-600 mt-1">
                      The commit system is in development. This interface shows
                      the structure that will be populated with real data once
                      the feature is complete.
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
              {/* Account Information */}
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

              {/* Listing Management */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl md:text-2xl flex items-center">
                    <Pause className="h-6 w-6 mr-2" />
                    Listing Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="temporarily-away">Temporarily Away</Label>
                      <p className="text-sm text-gray-600">
                        Pause your listings when you're unavailable. Your books
                        will be hidden from search results.
                      </p>
                    </div>
                    <Switch
                      id="temporarily-away"
                      checked={isTemporarilyAway}
                      onCheckedChange={setIsTemporarilyAway}
                    />
                  </div>
                  {isTemporarilyAway && (
                    <Alert className="bg-yellow-50 border-yellow-200">
                      <Pause className="h-4 w-4 text-yellow-600" />
                      <AlertDescription className="text-yellow-800">
                        Your listings are currently paused and hidden from other
                        users.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Danger Zone */}
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="text-xl md:text-2xl flex items-center text-red-700">
                    <Shield className="h-6 w-6 mr-2" />
                    Danger Zone
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <UserX className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h3 className="font-medium text-red-800">
                          Delete Account
                        </h3>
                        <p className="text-sm text-red-600 mt-1">
                          Permanently delete your account and all associated
                          data. This action cannot be undone.
                        </p>
                        <Button
                          variant="destructive"
                          className="mt-3 bg-red-600 hover:bg-red-700"
                          onClick={() => {
                            // TODO: Implement account deletion
                            alert(
                              "Account deletion feature will be implemented soon.",
                            );
                          }}
                        >
                          <UserX className="h-4 w-4 mr-2" />
                          Delete My Account
                        </Button>
                      </div>
                    </div>
                  </div>
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
                  <AddressSection
                    addressData={addressData}
                    onSaveAddresses={onSaveAddresses}
                    isLoadingAddress={isLoadingAddress}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="banking" className="space-y-4">
              <ModernBankingSection />
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
    </div>
  );
};

export default UserProfileTabs;
