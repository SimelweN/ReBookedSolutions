import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ArrowRight, Info } from "lucide-react";

const NewCheckout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const bookData = location.state?.book;

  useEffect(() => {
    // Auto-redirect to new checkout if book data exists
    if (bookData) {
      console.log("Redirecting from legacy /purchase to new /checkout");
      navigate("/checkout", {
        state: { book: bookData },
        replace: true,
      });
    }
  }, [bookData, navigate]);

  return (
    <Layout>
      <SEO
        title="Checkout Upgraded - ReBooked Solutions"
        description="Our checkout system has been upgraded for a better experience"
        keywords="checkout, purchase, books, textbooks"
      />
      <div className="max-w-2xl mx-auto mt-8 px-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Our checkout system has been upgraded! You'll be automatically
            redirected to the new checkout experience.
          </AlertDescription>
        </Alert>

        <div className="mt-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Checkout System Upgraded
          </h1>
          <p className="text-gray-600 mb-6">
            We've improved our checkout process to make purchasing books faster
            and more reliable.
          </p>

          <div className="space-y-4">
            <Button
              onClick={() => navigate("/checkout", { state: location.state })}
              className="w-full"
              size="lg"
            >
              Continue to New Checkout
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate("/books")}
              className="w-full"
            >
              Browse Books Instead
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NewCheckout;
