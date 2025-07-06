import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SellerProfileService } from "@/services/sellerProfileService";
import { toast } from "sonner";

export const SellerProfileTestComponent = () => {
  const [sellerId, setSellerId] = useState("");
  const [bookId, setBookId] = useState("");
  const [testResults, setTestResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testSellerProfile = async () => {
    if (!sellerId.trim()) {
      toast.error("Please enter a seller ID");
      return;
    }

    setLoading(true);
    try {
      const [profile, isReady, validation] = await Promise.all([
        SellerProfileService.getSellerProfileForDelivery(sellerId),
        SellerProfileService.isSellerReadyForOrders(sellerId),
        SellerProfileService.validateSellerForPurchase(sellerId),
      ]);

      setTestResults({
        profile,
        isReady,
        validation,
      });

      toast.success("Seller profile tests completed");
    } catch (error) {
      console.error("Error testing seller profile:", error);
      toast.error("Error testing seller profile");
    } finally {
      setLoading(false);
    }
  };

  const testBookSellerRelationship = async () => {
    if (!bookId.trim()) {
      toast.error("Please enter a book ID");
      return;
    }

    setLoading(true);
    try {
      const relationship =
        await SellerProfileService.verifyBookSellerRelationship(bookId);

      setTestResults({
        ...testResults,
        bookRelationship: relationship,
      });

      toast.success("Book-seller relationship test completed");
    } catch (error) {
      console.error("Error testing book-seller relationship:", error);
      toast.error("Error testing book-seller relationship");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Enhanced Seller Profile Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Seller ID</label>
          <div className="flex gap-2">
            <Input
              value={sellerId}
              onChange={(e) => setSellerId(e.target.value)}
              placeholder="Enter seller ID to test"
            />
            <Button onClick={testSellerProfile} disabled={loading}>
              Test Seller Profile
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Book ID</label>
          <div className="flex gap-2">
            <Input
              value={bookId}
              onChange={(e) => setBookId(e.target.value)}
              placeholder="Enter book ID to test"
            />
            <Button onClick={testBookSellerRelationship} disabled={loading}>
              Test Book-Seller Relationship
            </Button>
          </div>
        </div>

        {testResults && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-3">Test Results:</h3>
            <pre className="text-xs overflow-auto whitespace-pre-wrap">
              {JSON.stringify(testResults, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SellerProfileTestComponent;
