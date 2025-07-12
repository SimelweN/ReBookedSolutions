import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Package,
  Truck,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  RefreshCw,
  ExternalLink,
  Phone,
  Mail,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DeliveryTrackerProps {
  orderId: string;
  onStatusUpdate?: (status: string) => void;
}

interface OrderDetails {
  id: string;
  status: string;
  courier_provider: string;
  courier_tracking_number: string;
  courier_service: string;
  pickup_address: any;
  shipping_address: any;
  book_title: string;
  seller_notified_at: string;
  collection_deadline: string;
  delivery_deadline: string;
  metadata: any;
  created_at: string;
  paid_at: string;
  collected_at: string;
  delivered_at: string;
}

const DeliveryTracker: React.FC<DeliveryTrackerProps> = ({
  orderId,
  onStatusUpdate,
}) => {
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadOrderDetails();
  }, [orderId]);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      setOrder(data);
    } catch (error) {
      console.error("Error loading order details:", error);
      toast.error("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const refreshTracking = async () => {
    try {
      setRefreshing(true);

      if (!order?.courier_tracking_number || !order.courier_provider) {
        toast.error("No tracking information available");
        return;
      }

      // Call tracking API to get latest status
      const trackingEndpoint =
        order.courier_provider === "courier-guy"
          ? "/api/courier-guy-track"
          : "/api/fastway-track";

      const response = await fetch(trackingEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tracking_number: order.courier_tracking_number,
        }),
      });

      const result = await response.json();

      if (result.success && result.tracking) {
        // Update order status if tracking shows progression
        const newStatus = mapTrackingStatusToOrderStatus(
          result.tracking.status,
        );
        if (newStatus !== order.status) {
          await updateOrderStatus(newStatus);
          if (onStatusUpdate) {
            onStatusUpdate(newStatus);
          }
        }

        toast.success("Tracking information updated");
      } else {
        toast.error("Failed to refresh tracking information");
      }
    } catch (error) {
      console.error("Error refreshing tracking:", error);
      toast.error("Failed to refresh tracking");
    } finally {
      setRefreshing(false);
    }
  };

  const updateOrderStatus = async (newStatus: string) => {
    try {
      const updateData: any = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      };

      // Add timestamp fields based on status
      if (newStatus === "collected") {
        updateData.collected_at = new Date().toISOString();
      } else if (newStatus === "delivered") {
        updateData.delivered_at = new Date().toISOString();
      } else if (newStatus === "completed") {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("orders")
        .update(updateData)
        .eq("id", orderId);

      if (error) {
        throw new Error(error.message);
      }

      await loadOrderDetails(); // Refresh order data
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    }
  };

  const mapTrackingStatusToOrderStatus = (trackingStatus: string): string => {
    switch (trackingStatus.toLowerCase()) {
      case "collected":
      case "picked_up":
        return "collected";
      case "in_transit":
      case "on_vehicle":
        return "in_transit";
      case "delivered":
      case "completed":
        return "delivered";
      default:
        return "courier_assigned";
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary";
      case "paid":
        return "default";
      case "courier_assigned":
        return "default";
      case "collected":
        return "default";
      case "in_transit":
        return "default";
      case "delivered":
        return "default";
      case "completed":
        return "default";
      case "cancelled":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "paid":
        return <CheckCircle className="h-4 w-4" />;
      case "courier_assigned":
        return <Truck className="h-4 w-4" />;
      case "collected":
        return <Package className="h-4 w-4" />;
      case "in_transit":
        return <Truck className="h-4 w-4" />;
      case "delivered":
        return <CheckCircle className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleString();
  };

  const openTrackingUrl = () => {
    if (!order?.courier_tracking_number || !order.courier_provider) return;

    let trackingUrl = "";
    if (order.courier_provider === "courier-guy") {
      trackingUrl = `https://www.thecourierguy.co.za/track?waybill=${order.courier_tracking_number}`;
    } else if (order.courier_provider === "fastway") {
      trackingUrl = `https://www.fastway.co.za/track-your-parcel?con=${order.courier_tracking_number}`;
    }

    if (trackingUrl) {
      window.open(trackingUrl, "_blank");
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-book-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">
              Loading delivery information...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!order) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Order not found or you don't have permission to view it.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Order Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(order.status)}
              Delivery Status
            </div>
            <Badge variant={getStatusBadgeVariant(order.status)}>
              {order.status.replace("_", " ").toUpperCase()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm text-gray-700">Book</h4>
              <p className="text-sm">{order.book_title}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-gray-700">Order ID</h4>
              <p className="text-sm font-mono">{order.id}</p>
            </div>
            {order.courier_provider && (
              <div>
                <h4 className="font-medium text-sm text-gray-700">Courier</h4>
                <p className="text-sm capitalize">
                  {order.courier_provider.replace("-", " ")}
                </p>
              </div>
            )}
            {order.courier_tracking_number && (
              <div>
                <h4 className="font-medium text-sm text-gray-700">
                  Tracking Number
                </h4>
                <p className="text-sm font-mono">
                  {order.courier_tracking_number}
                </p>
              </div>
            )}
          </div>

          {order.courier_tracking_number && (
            <div className="flex gap-2">
              <Button
                onClick={refreshTracking}
                disabled={refreshing}
                variant="outline"
                size="sm"
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
                />
                Refresh Tracking
              </Button>
              <Button onClick={openTrackingUrl} variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                Track on{" "}
                {order.courier_provider === "courier-guy"
                  ? "Courier Guy"
                  : "Fastway"}
              </Button>
            </div>
          )}

          {order.metadata?.shipping_label_url && (
            <div>
              <Button
                onClick={() =>
                  window.open(order.metadata.shipping_label_url, "_blank")
                }
                variant="outline"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Shipping Label
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delivery Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${order.paid_at ? "bg-green-500" : "bg-gray-300"}`}
              />
              <div className="flex-1">
                <p className="font-medium text-sm">Payment Confirmed</p>
                <p className="text-xs text-gray-600">
                  {formatDateTime(order.paid_at)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  [
                    "courier_assigned",
                    "collected",
                    "in_transit",
                    "delivered",
                    "completed",
                  ].includes(order.status)
                    ? "bg-green-500"
                    : "bg-gray-300"
                }`}
              />
              <div className="flex-1">
                <p className="font-medium text-sm">Courier Assigned</p>
                <p className="text-xs text-gray-600">
                  {order.metadata?.pickup_date
                    ? `Pickup scheduled: ${order.metadata.pickup_date} ${order.metadata.pickup_time_window || ""}`
                    : "Pending"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  [
                    "collected",
                    "in_transit",
                    "delivered",
                    "completed",
                  ].includes(order.status)
                    ? "bg-green-500"
                    : "bg-gray-300"
                }`}
              />
              <div className="flex-1">
                <p className="font-medium text-sm">Collected from Seller</p>
                <p className="text-xs text-gray-600">
                  {formatDateTime(order.collected_at)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  ["in_transit", "delivered", "completed"].includes(
                    order.status,
                  )
                    ? "bg-green-500"
                    : "bg-gray-300"
                }`}
              />
              <div className="flex-1">
                <p className="font-medium text-sm">In Transit</p>
                <p className="text-xs text-gray-600">
                  {order.status === "in_transit"
                    ? "Currently in transit"
                    : ["delivered", "completed"].includes(order.status)
                      ? "Transit completed"
                      : "Pending"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  ["delivered", "completed"].includes(order.status)
                    ? "bg-green-500"
                    : "bg-gray-300"
                }`}
              />
              <div className="flex-1">
                <p className="font-medium text-sm">Delivered</p>
                <p className="text-xs text-gray-600">
                  {formatDateTime(order.delivered_at)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Addresses */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery Addresses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4" />
                Pickup Address
              </h4>
              <div className="text-sm text-gray-600 space-y-1">
                {order.pickup_address ? (
                  <>
                    <p>{order.pickup_address.street_address}</p>
                    <p>
                      {order.pickup_address.suburb}, {order.pickup_address.city}
                    </p>
                    <p>
                      {order.pickup_address.province}{" "}
                      {order.pickup_address.postal_code}
                    </p>
                  </>
                ) : (
                  <p>No pickup address available</p>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-medium flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4" />
                Delivery Address
              </h4>
              <div className="text-sm text-gray-600 space-y-1">
                {order.shipping_address ? (
                  <>
                    <p>{order.shipping_address.street_address}</p>
                    <p>
                      {order.shipping_address.suburb},{" "}
                      {order.shipping_address.city}
                    </p>
                    <p>
                      {order.shipping_address.province}{" "}
                      {order.shipping_address.postal_code}
                    </p>
                  </>
                ) : (
                  <p>No delivery address available</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Support Information */}
      <Card>
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              If you have any issues with your delivery, contact our support
              team:
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                <Mail className="h-4 w-4 mr-2" />
                <a href="mailto:support@rebookedsolutions.co.za">
                  Email Support
                </a>
              </Button>
              <Button variant="outline" size="sm">
                <Phone className="h-4 w-4 mr-2" />
                WhatsApp Support
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeliveryTracker;
