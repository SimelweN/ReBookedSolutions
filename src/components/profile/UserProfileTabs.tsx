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
import AddressManager from "@/components/profile/AddressManager";
import PendingCommitsSection from "@/components/profile/PendingCommitsSection";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { UserProfile, AddressData, Address } from "@/types/address";
import AccountInformation from "@/components/profile/AccountInformation";

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
          className={`w-full bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl shadow-sm ${
            isMobile ? "grid grid-cols-5 gap-1 h-auto p-2" : "flex h-14"
          }`}
        >
          <TabsTrigger
            value="listings"
            className={`${
              isMobile
                ? "h-16 text-xs px-1 flex-col gap-1 rounded-lg"
                : "flex-1 h-12 rounded-lg"
            } flex items-center justify-center data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-book-200 data-[state=active]:text-book-700 transition-all duration-200 hover:bg-white/50`}
          >
            {isMobile ? (
              <>
                <BookOpen className="h-4 w-4 text-book-600" />
                <span className="font-medium">{activeListings.length}</span>
                <span className="text-[10px] opacity-75">Listings</span>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span className="font-medium">
                  Listings ({activeListings.length})
                </span>
              </div>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="activity"
            className={`${
              isMobile
                ? "h-16 text-xs px-1 flex-col gap-1 rounded-lg"
                : "flex-1 h-12 rounded-lg"
            } flex items-center justify-center data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-book-200 data-[state=active]:text-book-700 transition-all duration-200 hover:bg-white/50`}
          >
            {isMobile ? (
              <>
                <Clock className="h-4 w-4 text-book-600" />
                <span className="font-medium">Activity</span>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="font-medium">Activity</span>
              </div>
            )}
          </TabsTrigger>
          {isOwnProfile && (
            <>
              <TabsTrigger
                value="account"
                className={`${
                  isMobile
                    ? "h-16 text-xs px-1 flex-col gap-1 rounded-lg"
                    : "flex-1 h-12 rounded-lg"
                } flex items-center justify-center data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-book-200 data-[state=active]:text-book-700 transition-all duration-200 hover:bg-white/50`}
              >
                {isMobile ? (
                  <>
                    <User className="h-4 w-4 text-book-600" />
                    <span className="font-medium">Account</span>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="font-medium">Account</span>
                  </div>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="addresses"
                className={`${
                  isMobile
                    ? "h-16 text-xs px-1 flex-col gap-1 rounded-lg"
                    : "flex-1 h-12 rounded-lg"
                } flex items-center justify-center data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-book-200 data-[state=active]:text-book-700 transition-all duration-200 hover:bg-white/50`}
              >
                {isMobile ? (
                  <>
                    <MapPin className="h-4 w-4 text-book-600" />
                    <span className="font-medium">Addresses</span>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span className="font-medium">Addresses</span>
                  </div>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="banking"
                className={`${
                  isMobile
                    ? "h-16 text-xs px-1 flex-col gap-1 rounded-lg"
                    : "flex-1 h-12 rounded-lg"
                } flex items-center justify-center data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-book-200 data-[state=active]:text-book-700 transition-all duration-200 hover:bg-white/50`}
              >
                {isMobile ? (
                  <>
                    <CreditCard className="h-4 w-4 text-book-600" />
                    <span className="font-medium">Banking</span>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    <span className="font-medium">Banking</span>
                  </div>
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
                        <div className="flex gap-1 mt-2">
                          {isOwnProfile && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEditBook(book.id);
                                }}
                                className="flex-1"
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteBook(book.id, book.title);
                                }}
                                className="text-red-600 hover:text-red-700"
                                disabled={deletingBooks.has(book.id)}
                              >
                                {deletingBooks.has(book.id) ? (
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600"></div>
                                ) : (
                                  <Trash2 className="h-3 w-3" />
                                )}
                              </Button>
                            </>
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
          {/* Pending Commits Section - Only show for own profile */}
          {isOwnProfile && <PendingCommitsSection />}

          <Card>
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl flex items-center">
                <Clock className="h-6 w-6 mr-2" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">No recent activity</p>
                <p className="text-sm text-gray-500">
                  Activity like purchases, sales, and listings will appear here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {isOwnProfile && (
          <>
            <TabsContent value="account" className="space-y-4">
              {profile && (
                <AccountInformation
                  profile={profile}
                  onProfileUpdate={(updatedProfile) => {
                    // Handle profile update in parent component if needed
                    console.log("Profile updated:", updatedProfile);
                  }}
                />
              )}
            </TabsContent>

            <TabsContent value="addresses" className="space-y-4">
              <AddressManager />
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
