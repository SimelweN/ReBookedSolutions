import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, FileText, Mail, Clock } from "lucide-react";

const RefundPolicy = () => {
  return (
    <Layout>
      <SEO
        title="Refund Policy | ReBooked Solutions"
        description="Complete refund policy for ReBooked Solutions - understand your rights and obligations when purchasing used textbooks online."
        keywords="refund policy, consumer protection, textbook returns, South Africa"
      />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="h-8 w-8 text-book-600" />
            <h1 className="text-3xl font-bold text-gray-900">Refund Policy</h1>
          </div>
          <p className="text-gray-600">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="space-y-6">
          {/* Section 1 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">
                1. Scope and Application
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">
                  1.1 Scope and Application
                </h4>
                <p className="text-gray-700">
                  This Refund Policy applies to all users transacting on
                  www.rebookedsolutions.co.za and governs the circumstances
                  under which refunds may be issued. ReBooked Solutions operates
                  as a digital intermediary between independent sellers and
                  buyers and does not own or control the inventory sold on the
                  platform.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">1.2 Statutory Rights</h4>
                <p className="text-gray-700">
                  In terms of Section 20 and 56 of the Consumer Protection Act,
                  consumers are entitled to return defective goods within six
                  months of delivery if the item is unsafe, fails to perform as
                  intended, or does not meet the description.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">
                  1.3 Platform-Specific Refund Conditions
                </h4>
                <p className="text-gray-700 mb-3">
                  Refunds will be processed only if one of the following
                  conditions is met:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>
                    The item has not been received within 14 business days of
                    dispatch confirmation.
                  </li>
                  <li>
                    The item delivered materially differs from the listing,
                    including:
                    <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                      <li>Incorrect book (wrong edition, title, or author)</li>
                      <li>
                        Undisclosed major defects (e.g. missing pages, mold,
                        water damage)
                      </li>
                    </ul>
                  </li>
                  <li>The item is counterfeit or an illegal reproduction</li>
                  <li>Fraudulent or deceptive conduct by the seller</li>
                </ul>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-800 mb-2">
                      Important Requirements
                    </p>
                    <p className="text-amber-700 text-sm">
                      All refund requests must be supported by photographic
                      evidence and a formal complaint lodged within five (5)
                      calendar days of delivery or the estimated delivery date.
                      Submissions must be made to
                      support@rebookedsolutions.co.za. The buyer must retain
                      proof of delivery, shipping labels, and original packaging
                      where applicable.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2 text-red-700">
                  Refunds are NOT applicable in the following cases:
                </h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>
                    Buyer remorse or change of mind (CPA Section 20 does not
                    apply to second-hand goods unless sold by a business)
                  </li>
                  <li>Wear and tear reasonably expected of pre-owned books</li>
                  <li>Delays by couriers beyond the platform's control</li>
                  <li>Items marked "non-refundable" in the listing</li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm">
                  <strong>Note:</strong> ReBooked Solutions will act as an
                  impartial mediator but makes no guarantee of refund unless the
                  above criteria are objectively met and supported with
                  documentation. Final decisions rest with the platform's
                  resolution team.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>
                  <strong>Email:</strong> support@rebookedsolutions.co.za
                </p>
                <p>
                  <strong>Business Hours:</strong> Monday–Friday, 09:00–17:00
                  (SAST)
                </p>
                <p>
                  <strong>Website:</strong> www.rebookedsolutions.co.za
                </p>
                <p>
                  <strong>Company Registered In:</strong> South Africa
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Quick Reference Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">
                    Report Issues
                  </h4>
                  <p className="text-green-700 text-sm">
                    Within 5 calendar days of delivery
                  </p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">
                    Delivery Timeframe
                  </h4>
                  <p className="text-blue-700 text-sm">
                    14 business days maximum
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

export default RefundPolicy;
