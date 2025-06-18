import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, Package, Clock, AlertTriangle, FileText } from "lucide-react";

const ShippingDeliveryPolicy = () => {
  return (
    <Layout>
      <SEO
        title="Shipping & Delivery Policy | ReBooked Solutions"
        description="Complete shipping and delivery policy for ReBooked Solutions - understand delivery timeframes, responsibilities, and procedures."
        keywords="shipping policy, delivery policy, courier services, textbook delivery"
      />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Truck className="h-8 w-8 text-book-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Shipping & Delivery Policy
            </h1>
          </div>
          <p className="text-gray-600">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="space-y-6">
          {/* Shipping Responsibility */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Package className="h-5 w-5" />
                3.1 Shipping Responsibility
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Sellers are solely responsible for dispatching and packaging
                goods sold on the platform. ReBooked Solutions does not handle
                physical goods and does not accept liability for loss, damage,
                or delays during shipping.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">
                  Dispatch Requirements
                </h4>
                <p className="text-blue-700 text-sm mb-2">
                  All orders must be shipped within three (3) business days of
                  payment confirmation. Sellers must use reliable third-party
                  courier services and are encouraged to use traceable methods.
                </p>
                <div className="text-blue-700 text-sm">
                  <strong>Recommended Couriers:</strong>
                  <ul className="list-disc list-inside ml-4 mt-1">
                    <li>Courier Guy</li>
                    <li>Pudo</li>
                    <li>Fastway</li>
                    <li>Paxi</li>
                  </ul>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-800 mb-2">
                      Late Dispatch Consequences
                    </p>
                    <p className="text-red-700 text-sm">
                      Failure to dispatch within the required timeframe may
                      result in forced cancellation and refund.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Timeframes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Clock className="h-5 w-5" />
                3.2 Delivery Timeframes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Delivery timeframes range between 2 and 7 business days after
                dispatch, depending on the courier and regional location.
                ReBooked Solutions does not guarantee any specific delivery
                timeline.
              </p>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">
                  Consumer Protection Act Rights
                </h4>
                <p className="text-green-700 text-sm mb-2">
                  In accordance with CPA Section 19(4), if delivery is not made
                  within the agreed timeframe or within 14 business days, and
                  the delay is not due to the buyer, the buyer may:
                </p>
                <ul className="list-disc list-inside text-green-700 text-sm ml-4">
                  <li>Cancel the transaction and request a full refund</li>
                  <li>Extend the delivery period, at their discretion</li>
                </ul>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-gray-700 text-sm">
                  <strong>Note:</strong> All courier-related disputes (e.g.,
                  misdelivery, delays, damaged packaging) must be resolved
                  directly with the courier unless seller error is proven.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Failed Deliveries */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">
                3.3 Failed Deliveries and Returns
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 mb-3">
                If a parcel is returned due to any of the following reasons, the
                buyer may be liable for any redelivery costs:
              </p>

              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>An incorrect or incomplete delivery address</li>
                <li>Buyer's unavailability</li>
                <li>Failure to collect from pick-up points</li>
              </ul>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm">
                  <strong>Important:</strong> The platform will not issue
                  refunds for failed deliveries unless the seller is at fault.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Timeline Reference */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Quick Reference Guide
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">
                    Dispatch Deadline
                  </h4>
                  <p className="text-blue-700 text-sm">
                    3 business days after payment
                  </p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">
                    Delivery Window
                  </h4>
                  <p className="text-green-700 text-sm">
                    2-7 business days after dispatch
                  </p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-800 mb-2">
                    Maximum Timeframe
                  </h4>
                  <p className="text-purple-700 text-sm">
                    14 business days total
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ShippingDeliveryPolicy;
