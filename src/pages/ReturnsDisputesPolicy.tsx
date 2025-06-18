import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  RotateCcw,
  Scale,
  Mail,
  AlertTriangle,
  FileText,
  Phone,
} from "lucide-react";

const ReturnsDisputesPolicy = () => {
  return (
    <Layout>
      <SEO
        title="Returns & Disputes Policy | ReBooked Solutions"
        description="Complete returns and disputes policy for ReBooked Solutions - understand the return process and dispute resolution procedures."
        keywords="returns policy, disputes resolution, consumer protection, textbook returns"
      />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <RotateCcw className="h-8 w-8 text-book-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Returns & Disputes Policy
            </h1>
          </div>
          <p className="text-gray-600">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="space-y-6">
          {/* Return Policy */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <RotateCcw className="h-5 w-5" />
                4. Return Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">4.1 Return Grounds</h4>
                <p className="text-gray-700 mb-2">
                  Returns are accepted only in the following cases:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>
                    Incorrect item delivered (e.g., different title, author, or
                    edition)
                  </li>
                  <li>Severe damage not disclosed in the listing</li>
                  <li>Item deemed counterfeit or illegal reproduction</li>
                </ul>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">
                  Return Process
                </h4>
                <p className="text-green-700 text-sm mb-2">
                  Returns must be initiated within five (5) calendar days of
                  receipt. Items returned without prior written approval will
                  not be accepted or refunded.
                </p>
                <p className="text-green-700 text-sm">
                  Buyers must retain all original packaging and use a trackable
                  return method. Return shipping costs are borne by the buyer
                  unless the seller is found to be at fault.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2 text-red-700">
                  4.2 Return Exclusions
                </h4>
                <p className="text-gray-700 mb-2">
                  Returns are NOT allowed in the following instances:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>Book condition disputes over minor flaws</li>
                  <li>Buyer's personal dissatisfaction after usage</li>
                  <li>Items marked as "non-returnable"</li>
                  <li>Books damaged after delivery due to buyer negligence</li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm">
                  <strong>Refund Processing:</strong> Upon successful return and
                  inspection, ReBooked Solutions will process any applicable
                  refund within 5–10 business days. Refunds will not include
                  original shipping costs unless otherwise specified.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Dispute Resolution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Scale className="h-5 w-5" />
                5. Dispute Resolution Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">5.1 Dispute Submission</h4>
                <p className="text-gray-700 mb-2">
                  Buyers or sellers may raise a formal dispute by submitting an
                  email to support@rebookedsolutions.co.za within seven (7)
                  calendar days of the disputed event.
                </p>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h5 className="font-semibold text-yellow-800 mb-2">
                    Required Information
                  </h5>
                  <p className="text-yellow-700 text-sm mb-2">
                    The complaint must include:
                  </p>
                  <ul className="list-disc list-inside text-yellow-700 text-sm ml-4 space-y-1">
                    <li>Order number</li>
                    <li>Names of both parties</li>
                    <li>Description of the issue</li>
                    <li>
                      All supporting documentation (photos, tracking,
                      communication)
                    </li>
                  </ul>
                  <p className="text-yellow-700 text-sm mt-2">
                    <strong>Note:</strong> Failure to provide sufficient
                    evidence may result in dismissal of the dispute without
                    further investigation.
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">5.2 Internal Resolution</h4>
                <p className="text-gray-700 mb-2">
                  ReBooked Solutions will assess disputes within 7–10 business
                  days and may request further evidence from both parties. The
                  platform's decision will be based on:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>Consumer Protection Act principles of fairness</li>
                  <li>Objective review of evidence</li>
                  <li>Transaction history and user behaviour</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">
                  5.3 Platform Limitation of Liability
                </h4>
                <p className="text-gray-700 mb-2">
                  As per Section 56 of the CPA, remedies for defective goods are
                  enforceable against the seller, not the platform. ReBooked
                  Solutions is a digital facilitator and assumes no liability
                  for:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>Goods condition, legality, or delivery</li>
                  <li>Buyer or seller conduct</li>
                  <li>Courier issues</li>
                  <li>Consequential losses or damages</li>
                </ul>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-3">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-red-800 mb-2">
                        Liability Limitation
                      </p>
                      <p className="text-red-700 text-sm mb-2">
                        ReBooked Solutions' total liability in any dispute shall
                        not exceed the commission earned on the disputed
                        transaction. Under no circumstances will the platform be
                        liable for:
                      </p>
                      <ul className="list-disc list-inside text-red-700 text-sm ml-4 space-y-1">
                        <li>Loss of income or profits</li>
                        <li>Emotional distress</li>
                        <li>Indirect, incidental, or special damages</li>
                      </ul>
                      <p className="text-red-700 text-sm mt-2">
                        Users accept that ReBooked Solutions acts only as a
                        venue and not as a contracting party to the sale.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">5.4 External Remedies</h4>
                <p className="text-gray-700 mb-2">
                  If either party is dissatisfied with the internal resolution
                  outcome, they may escalate to:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>The National Consumer Commission (NCC)</li>
                  <li>The Consumer Goods and Services Ombud (CGSO)</li>
                  <li>Formal legal channels under South African law</li>
                </ul>
                <p className="text-gray-700 mt-2">
                  ReBooked Solutions will comply with all lawful requests but
                  will not be responsible for legal expenses incurred by users.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Mail className="h-5 w-5" />
                6. Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                All queries, complaints, and policy-related matters must be
                directed to:
              </p>
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

          {/* Timeline Reference */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Important Timeframes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 mb-2">
                    Return Initiation
                  </h4>
                  <p className="text-red-700 text-sm">
                    Within 5 calendar days of receipt
                  </p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">
                    Dispute Submission
                  </h4>
                  <p className="text-blue-700 text-sm">
                    Within 7 calendar days of incident
                  </p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">
                    Resolution Timeline
                  </h4>
                  <p className="text-green-700 text-sm">7-10 business days</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ReturnsDisputesPolicy;
