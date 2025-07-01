import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import PostPaymentOrderSummary from "@/components/order/PostPaymentOrderSummary";
import SEO from "@/components/SEO";

const CheckoutSuccess: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { orderId, paymentReference, totalAmount, items } =
    location.state || {};

  useEffect(() => {
    // Redirect if no payment reference
    if (!paymentReference) {
      navigate("/", { replace: true });
      return;
    }
  }, [paymentReference, navigate]);

  if (!paymentReference) {
    return null;
  }

  // Create order data from the checkout state
  const orderData =
    orderId && items
      ? {
          id: orderId,
          paystack_ref: paymentReference,
          amount: totalAmount * 100, // Convert to cents
          items: items.map((item: any) => ({
            title: item.title,
            author: item.author,
            price: item.price * 100, // Convert to cents
            image_url: item.imageUrl,
            isbn: item.isbn,
            condition: item.condition,
          })),
          created_at: new Date().toISOString(),
          buyer_email: "", // Will be fetched by component
          status: "paid",
        }
      : undefined;

  return (
    <Layout>
      <SEO
        title="Order Confirmed - ReBooked Solutions"
        description="Your order has been confirmed successfully"
      />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <PostPaymentOrderSummary
            paymentReference={paymentReference}
            orderData={orderData}
          />
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutSuccess;
