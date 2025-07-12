import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import CheckoutFlow from "@/components/checkout/CheckoutFlow";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { CheckoutBook } from "@/types/checkout";

const Checkout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Get book data from location state (passed from "Buy Now" button)
  const bookData = location.state?.book as CheckoutBook;

  const handleGoBack = () => {
    if (bookData?.id) {
      navigate(`/book/${bookData.id}`);
    } else {
      navigate("/books");
    }
  };

  // Show error if no book data
  if (!bookData) {
    return (
      <Layout>
        <SEO
          title="Invalid Purchase - ReBooked Solutions"
          description="No book selected for purchase"
        />
        <div className="max-w-2xl mx-auto mt-8">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              No book selected for purchase. Please select a book from our
              catalog.
            </AlertDescription>
          </Alert>
          <div className="mt-6 text-center">
            <Button onClick={() => navigate("/books")}>Browse Books</Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO
        title={`Purchase ${bookData.title} - ReBooked Solutions`}
        description={`Complete your purchase of ${bookData.title} by ${bookData.author}`}
        keywords={`buy ${bookData.title}, ${bookData.author}, textbook purchase, student books`}
      />

      {/* Back Button */}
      <div className="max-w-4xl mx-auto px-4 pt-4">
        <Button variant="ghost" onClick={handleGoBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Book
        </Button>
      </div>

      {/* Checkout Flow */}
      <CheckoutFlow book={bookData} />
    </Layout>
  );
};

export default Checkout;
