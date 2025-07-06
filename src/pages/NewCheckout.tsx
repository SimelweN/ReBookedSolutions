import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import BookPurchase from "@/components/checkout/BookPurchase";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import SEO from "@/components/SEO";

const NewCheckout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Get book data from navigation state
  const bookData = location.state?.book;

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <Layout>
        <SEO
          title="Login Required - ReBooked Solutions"
          description="Please log in to complete your purchase"
        />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <AlertTriangle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Login Required
              </h2>
              <p className="text-gray-600 mb-6">
                You need to be logged in to purchase books.
              </p>
              <div className="space-y-3">
                <Button
                  onClick={() =>
                    navigate("/login", {
                      state: { redirectTo: location.pathname, book: bookData },
                    })
                  }
                  className="w-full"
                >
                  Log In
                </Button>
                <Button
                  onClick={() =>
                    navigate("/register", {
                      state: { redirectTo: location.pathname, book: bookData },
                    })
                  }
                  variant="outline"
                  className="w-full"
                >
                  Create Account
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Show error if no book data
  if (!bookData) {
    return (
      <Layout>
        <SEO
          title="Invalid Purchase - ReBooked Solutions"
          description="No book selected for purchase"
        />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                No Book Selected
              </h2>
              <p className="text-gray-600 mb-6">
                Please select a book to purchase from our catalog.
              </p>
              <div className="space-y-3">
                <Button onClick={() => navigate("/books")} className="w-full">
                  Browse Books
                </Button>
                <Button
                  onClick={() => navigate(-1)}
                  variant="outline"
                  className="w-full"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go Back
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const handlePurchaseSuccess = (orderData: any) => {
    // Navigate to success page with order data
    navigate("/checkout/success", {
      state: {
        orderData,
        paymentReference: orderData.paystack_ref,
      },
    });
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <Layout>
      <SEO
        title={`Purchase ${bookData.title} - ReBooked Solutions`}
        description={`Complete your purchase of ${bookData.title} by ${bookData.author}`}
      />

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Book Details
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Complete Your Purchase
              </h1>
              <p className="text-gray-600">
                Review your order details and complete payment
              </p>
            </div>

            <BookPurchase
              book={bookData}
              onBack={handleBack}
              onSuccess={handlePurchaseSuccess}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NewCheckout;
