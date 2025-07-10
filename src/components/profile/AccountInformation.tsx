import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Copy, Share2, ExternalLink, Store } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserProfile } from "@/types/address";

interface AccountInformationProps {
  profile: UserProfile;
  onProfileUpdate: (updatedProfile: UserProfile) => void;
}

const AccountInformation = ({
  profile,
  onProfileUpdate,
}: AccountInformationProps) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: profile.name || "",
  });

  // Sync formData with profile changes
  useEffect(() => {
    setFormData({
      name: profile.name || "",
    });
  }, [profile.name]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!user?.id) {
      toast.error("User not authenticated");
      return;
    }

    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .update({
          name: formData.name,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)
        .select()
        .single();

      if (error) throw error;

      // Convert the Supabase response to UserProfile type
      const updatedProfile: UserProfile = {
        ...profile,
        name: data.name,
        updated_at: data.updated_at,
        pickup_address:
          typeof data.pickup_address === "object" &&
          data.pickup_address !== null
            ? (data.pickup_address as {
                street: string;
                city: string;
                postal_code: string;
                province: string;
              })
            : undefined,
        shipping_address:
          typeof data.shipping_address === "object" &&
          data.shipping_address !== null
            ? (data.shipping_address as {
                street: string;
                city: string;
                postal_code: string;
                province: string;
              })
            : undefined,
      };

      onProfileUpdate(updatedProfile);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: profile.name || "",
    });
    setIsEditing(false);
  };

  const miniPageUrl = `${window.location.origin}/seller/${user?.id}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(miniPageUrl);
      toast.success("Link copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const handleShareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.name}'s ReBooked Mini Marketplace`,
          text: `Check out my books on ReBooked!`,
          url: miniPageUrl,
        });
      } catch (error) {
        console.error("Share failed:", error);
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Display Name</Label>
              {isEditing ? (
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter your display name"
                />
              ) : (
                <p className="text-sm text-gray-600 mt-1">
                  {profile.name || "No name set"}
                </p>
              )}
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div>
              <Label>Email Address</Label>
              <p className="text-sm text-gray-600 mt-1">{user?.email}</p>
              <p className="text-xs text-gray-500 mt-1">
                Email cannot be changed from this page for security reasons
              </p>
            </div>

            <div>
              <Label>Account Status</Label>
              <div className="mt-1">
                <Badge
                  variant={
                    profile.status === "active" ? "default" : "destructive"
                  }
                >
                  {profile.status === "active" ? "Active" : "Suspended"}
                </Badge>
              </div>
              {profile.status === "suspended" && profile.suspension_reason && (
                <Alert className="mt-2" variant="destructive">
                  <AlertDescription>
                    Suspension reason: {profile.suspension_reason}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div>
              <Label>Member Since</Label>
              <p className="text-sm text-gray-600 mt-1">
                {new Date(profile.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            {isEditing ? (
              <>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ReBooked Mini Page Sharing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5 text-book-600" />
            Your ReBooked Mini Marketplace
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Share Your Mini Page</Label>
            <p className="text-sm text-gray-600 mt-1 mb-3">
              Your personal marketplace where buyers can see all your books and
              seller information.
            </p>

            <div className="bg-gray-50 rounded-lg p-3 border">
              <div className="flex items-center gap-2 mb-2">
                <ExternalLink className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  Your Mini Page URL:
                </span>
              </div>
              <code className="text-sm text-book-600 break-all">
                {miniPageUrl}
              </code>
            </div>

            <div className="flex gap-2 mt-3">
              <Button
                onClick={handleCopyLink}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                Copy Link
              </Button>
              <Button
                onClick={handleShareLink}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              <Button
                onClick={() => window.open(miniPageUrl, "_blank")}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Preview
              </Button>
            </div>
          </div>

          <Alert className="border-book-200 bg-book-50">
            <Store className="h-4 w-4 text-book-600" />
            <AlertDescription className="text-book-800">
              <div className="space-y-2">
                <div className="font-medium">
                  💡 Share your ReBooked Mini page to:
                </div>
                <ul className="text-sm space-y-1 ml-4">
                  <li>
                    • Share on social media (WhatsApp, Facebook, Instagram)
                  </li>
                  <li>• Add to your university group chats</li>
                  <li>• Include in your email signature</li>
                  <li>• Share with classmates directly</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </>
  );
};

export default AccountInformation;
