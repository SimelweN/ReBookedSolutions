import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  Clock,
  Truck,
  Package,
  ArrowRight,
  Download,
  MessageCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const CheckoutSuccess: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { orderId, paymentReference, totalAmount, items } =
    location.state || {};

  useEffect(() => {
    // Redirect if no order data
    if (!orderId || !paymentReference) {
      navigate("/", { replace: true });
      return;
    }

    // Fetch order details
    const fetchOrderDetails = async () => {
      try {
        const { data: order, error } = await supabase
          .from("orders")
          .select(
            `
            *,
            buyer:buyer_id(name, email),
            seller:seller_id(name, email),
            book:book_id(title, author, image_url)
          `,
          )
          .eq("id", orderId)
          .single();

        if (error) {
          console.error("Error fetching order:", error);
        } else {
          setOrderDetails(order);
        }
      } catch (error) {
        console.error("Error fetching order details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, paymentReference, navigate]);

  if (!orderId) {
    return null;
  }

  const timeline = [
    {
      step: 1,
      title: "Payment Confirmed",
      description: "Your payment has been processed successfully",
      icon: CheckCircle,
      completed: true,
      timestamp: orderDetails?.paid_at,
    },
    {
      step: 2,
      title: "Seller Notified",
      description: "Seller has been notified to prepare your book",
      icon: Package,
      completed: true,
      timestamp: orderDetails?.created_at,
    },
    {
      step: 3,
      title: "Awaiting Collection",
      description: "Courier will collect within 48 hours",
      icon: Clock,
      completed: false,
      deadline: orderDetails?.collection_deadline,
    },
    {
      step: 4,
      title: "In Transit",
      description: "Book is on its way to you",
      icon: Truck,
      completed: false,
    },
  ];

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-ZA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
      case "awaiting_collection":
        return "bg-blue-100 text-blue-800";
      case "collected":
      case "in_transit":
        return "bg-yellow-100 text-yellow-800";
      case "delivered":
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Order Confirmed!
            </h1>
            <p className="text-gray-600">
              Thank you for your purchase. Your order has been placed
              successfully.
            </p>
          </div>

          {/* Order Summary */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Order Info */}
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">Order ID</p>
                    <p className="text-gray-600 font-mono text-sm">{orderId}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">Status</p>
                    <Badge
                      className={getStatusColor(orderDetails?.status || "paid")}
                    >
                      {orderDetails?.status?.replace("_", " ").toUpperCase() ||
                        "PAID"}
                    </Badge>
                  </div>
                </div>

                <Separator />

                {/* Items */}
                <div>
                  <h3 className="font-medium mb-3">Items Ordered</h3>
                  <div className="space-y-3">
                    {items?.map((item: any, index: number) => (
                      <div
                        key={index}
                        className="flex gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="w-12 h-16 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                              <Package className="w-4 h-4 text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{item.title}</h4>
                          <p className="text-sm text-gray-600">
                            by {item.author}
                          </p>
                          <p className="text-sm text-gray-500">
                            Sold by {item.sellerName}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            R{item.price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>
                      R
                      {(
                        totalAmount -
                        (orderDetails?.delivery_fee || 0) / 100
                      ).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery</span>
                    <span>
                      R{((orderDetails?.delivery_fee || 0) / 100).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg border-t pt-2">
                    <span>Total</span>
                    <span>R{totalAmount?.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Order Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {timeline.map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          item.completed
                            ? "bg-green-600 text-white"
                            : "bg-gray-300 text-gray-600"
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                      </div>
                      {index < timeline.length - 1 && (
                        <div
                          className={`w-0.5 h-12 mt-2 ${
                            item.completed ? "bg-green-600" : "bg-gray-300"
                          }`}
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3
                        className={`font-medium ${
                          item.completed ? "text-green-800" : "text-gray-600"
                        }`}
                      >
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {item.description}
                      </p>
                      {item.timestamp && (
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDateTime(item.timestamp)}
                        </p>
                      )}
                      {item.deadline && (
                        <p className="text-xs text-orange-600 mt-1">
                          Deadline: {formatDateTime(item.deadline)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Important Information */}
          <Card className="mb-8 bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <h3 className="font-medium text-blue-900 mb-3">
                Important Information
              </h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>
                  • The seller has 48 hours to prepare your book for courier
                  collection
                </li>
                <li>• You'll receive email updates on your order status</li>
                <li>
                  • If the book isn't collected within 48 hours, you'll get an
                  automatic refund
                </li>
                <li>• Expected delivery: 3-7 business days after collection</li>
                <li>• Track your order anytime in your profile</li>
              </ul>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild className="flex-1">
              <Link to="/profile">
                <Download className="w-4 h-4 mr-2" />
                View Order Details
              </Link>
            </Button>

            <Button variant="outline" asChild className="flex-1">
              <Link to="/books">
                Continue Shopping
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>

            <Button variant="outline" asChild className="flex-1">
              <Link to="/contact">
                <MessageCircle className="w-4 h-4 mr-2" />
                Contact Support
              </Link>
            </Button>
          </div>

          {/* Footer Note */}
          <div className="text-center mt-8 p-4 bg-white rounded-lg border">
            <p className="text-sm text-gray-600">
              Need help? Contact us at{" "}
              <a
                href="mailto:support@rebookedsolutions.co.za"
                className="text-blue-600 hover:underline"
              >
                support@rebookedsolutions.co.za
              </a>{" "}
              or call{" "}
              <a
                href="tel:+27123456789"
                className="text-blue-600 hover:underline"
              >
                012 345 6789
              </a>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutSuccess;
