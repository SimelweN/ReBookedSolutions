import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, FileText, Users, Clock } from "lucide-react";

const CancellationPolicy = () => {
  return (
    <Layout>
      <SEO
        title="Cancellation Policy | ReBooked Solutions"
        description="Cancellation policy for buyers and sellers on ReBooked Solutions - understand when and how you can cancel orders."
        keywords="cancellation policy, order cancellation, textbook orders, buyer seller rights"
      />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="h-8 w-8 text-book-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Cancellation Policy
            </h1>
          </div>
          <p className="text-gray-600">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="space-y-6">
          {/* Buyer Cancellations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Users className="h-5 w-5" />
                2.1 Buyer Cancellations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Buyers may cancel an order only if it has not yet been marked as
                "Dispatched" by the seller. Once dispatch has occurred, the
                buyer must follow the return and refund procedures.
              </p>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">
                  Pre-Dispatch Cancellations
                </h4>
                <p className="text-green-700 text-sm">
                  Cancellations made before dispatch will be processed with full
                  reimbursement to the original payment method within 5–10
                  business days, excluding delays caused by third-party payment
                  processors. Buyers are responsible for ensuring their payment
                  details are correct.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">
                  Legal Notice
                </h4>
                <p className="text-blue-700 text-sm">
                  In terms of the Electronic Communications and Transactions
                  Act, Section 44 does not apply to digital platforms acting as
                  intermediaries and not selling goods directly. Therefore, no
                  automatic 7-day cooling-off period is enforceable unless
                  otherwise stated.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Seller Cancellations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">
                2.2 Seller Cancellations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Sellers may cancel a transaction only under exceptional
                circumstances, including stock unavailability or listing errors.
                Cancellations must occur within 48 hours of order receipt, and
                the seller must notify the buyer via platform messaging and the
                ReBooked support email.
              </p>

              <div>
                <h4 className="font-semibold mb-2">
                  Consequences of Frequent Cancellations
                </h4>
                <p className="text-gray-700 mb-2">
                  Frequent or unjustified cancellations by sellers may result
                  in:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>Temporary suspension of selling privileges</li>
                  <li>Penalties, including administrative fees</li>
                  <li>
                    Permanent account termination in severe or repeat cases
                  </li>
                </ul>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-800 mb-2">
                      Platform Rights
                    </p>
                    <p className="text-red-700 text-sm">
                      ReBooked Solutions reserves the right to cancel any order
                      at its sole discretion, especially where fraud, abuse, or
                      system manipulation is detected.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline Reference */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Key Timeframes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">
                    Buyer Cancellations
                  </h4>
                  <p className="text-blue-700 text-sm">
                    Before item is marked "Dispatched"
                  </p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">
                    Seller Cancellations
                  </h4>
                  <p className="text-green-700 text-sm">
                    Within 48 hours of order receipt
                  </p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">
                    Refund Processing
                  </h4>
                  <p className="text-yellow-700 text-sm">5-10 business days</p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-800 mb-2">
                    Notification Required
                  </h4>
                  <p className="text-purple-700 text-sm">
                    Via platform messaging + support email
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

export default CancellationPolicy;
