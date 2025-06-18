import { useState } from "react";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Scale,
  RotateCcw,
  X,
  Truck,
  AlertTriangle,
  Mail,
  Clock,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

const Policies = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const policyStats = [
    {
      label: "Report Issues",
      value: "5 days",
      color: "bg-green-100 text-green-800",
    },
    {
      label: "Max Delivery",
      value: "14 days",
      color: "bg-blue-100 text-blue-800",
    },
    {
      label: "Dispute Window",
      value: "7 days",
      color: "bg-purple-100 text-purple-800",
    },
    {
      label: "Service Fee",
      value: "10%",
      color: "bg-orange-100 text-orange-800",
    },
  ];

  return (
    <Layout>
      <SEO
        title="Policies & Terms | ReBooked Solutions"
        description="Complete policy documentation for ReBooked Solutions - terms, refunds, cancellations, shipping, returns, and dispute resolution."
        keywords="policies, terms, refunds, cancellations, shipping, returns, disputes, consumer protection"
      />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Policies & Terms
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive policy documentation to ensure transparent and fair
            transactions. All policies comply with South African consumer
            protection laws.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 mb-8">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">
              Overview
            </TabsTrigger>
            <TabsTrigger value="terms" className="text-xs sm:text-sm">
              Terms & Conditions
            </TabsTrigger>
            <TabsTrigger value="refunds" className="text-xs sm:text-sm">
              Refunds
            </TabsTrigger>
            <TabsTrigger value="cancellations" className="text-xs sm:text-sm">
              Cancellations
            </TabsTrigger>
            <TabsTrigger value="shipping" className="text-xs sm:text-sm">
              Shipping
            </TabsTrigger>
            <TabsTrigger value="returns" className="text-xs sm:text-sm">
              Returns & Disputes
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <FileText className="h-6 w-6" />
                  Policy Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {policyStats.map((stat, index) => (
                    <div key={index} className="text-center">
                      <div
                        className={`rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3 ${stat.color}`}
                      >
                        <span className="text-lg font-bold">{stat.value}</span>
                      </div>
                      <h4 className="font-semibold text-gray-900 text-sm">
                        {stat.label}
                      </h4>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border-green-200 bg-green-50">
                    <CardHeader>
                      <CardTitle className="text-lg text-green-800">
                        Your Rights
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <span className="text-green-700">
                          Consumer Protection Act coverage
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <span className="text-green-700">
                          14-day delivery guarantee
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <span className="text-green-700">
                          Dispute resolution process
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <span className="text-green-700">
                          90% seller payout protection
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-blue-200 bg-blue-50">
                    <CardHeader>
                      <CardTitle className="text-lg text-blue-800">
                        Platform Features
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <ArrowRight className="h-4 w-4 text-blue-600 mt-0.5" />
                        <span className="text-blue-700">
                          Automated delivery system
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <ArrowRight className="h-4 w-4 text-blue-600 mt-0.5" />
                        <span className="text-blue-700">
                          Secure payment processing
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <ArrowRight className="h-4 w-4 text-blue-600 mt-0.5" />
                        <span className="text-blue-700">
                          No direct user contact required
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <ArrowRight className="h-4 w-4 text-blue-600 mt-0.5" />
                        <span className="text-blue-700">
                          University resources & APS tools
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="bg-book-50 border border-book-200 rounded-lg p-6">
                  <h3 className="font-semibold text-book-800 mb-4">
                    Quick Contact
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-book-700">
                        <strong>Email:</strong> support@rebookedsolutions.co.za
                      </p>
                      <p className="text-book-700">
                        <strong>Hours:</strong> Monday–Friday, 09:00–17:00
                        (SAST)
                      </p>
                    </div>
                    <div>
                      <p className="text-book-700">
                        <strong>Response Time:</strong> Within 24 hours
                      </p>
                      <p className="text-book-700">
                        <strong>Resolution:</strong> 7-10 business days
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Terms & Conditions Tab */}
          <TabsContent value="terms" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Scale className="h-6 w-6" />
                  Terms & Conditions
                </CardTitle>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <p className="text-blue-800 text-sm">
                    <strong>Effective Date:</strong>{" "}
                    {new Date().toLocaleDateString()} <br />
                    <strong>Platform Operator:</strong> ReBooked Solutions (Pty)
                    Ltd <br />
                    <strong>Governing Laws:</strong> Consumer Protection Act,
                    ECTA, POPIA
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Introduction */}
                <div>
                  <h3 className="text-xl font-semibold mb-3">
                    1. Introduction
                  </h3>
                  <p className="text-gray-700 mb-3">
                    Welcome to ReBooked Solutions. These Terms and Conditions
                    ("Terms") are a legally binding agreement between you and
                    ReBooked Solutions (Pty) Ltd. They govern your access to and
                    use of our platform, services, and content.
                  </p>
                  <p className="text-gray-700">
                    By using the Platform, you confirm that you understand and
                    agree to these Terms, our policies, and our Privacy Policy.
                    You accept all risks associated with using a peer-to-peer
                    resale platform.
                  </p>
                </div>

                {/* Platform Nature */}
                <div>
                  <h3 className="text-xl font-semibold mb-3">
                    2. Platform Nature & Disclaimer
                  </h3>
                  <p className="text-gray-700 mb-3">
                    ReBooked Solutions is an online marketplace and academic
                    resource platform. We do not buy, own, stock, or sell any
                    books or physical goods listed by users. All transactions
                    are conducted directly between buyers and sellers.
                  </p>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                      <div>
                        <p className="font-semibold text-red-800 mb-2">
                          We are not liable for:
                        </p>
                        <ul className="list-disc list-inside text-red-700 text-sm space-y-1">
                          <li>
                            Misleading listings or undisclosed book conditions
                          </li>
                          <li>Counterfeit, plagiarised, or illegal goods</li>
                          <li>Non-performance or breach by any user</li>
                          <li>Courier or delivery delays</li>
                          <li>Failed payments or chargebacks</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* User Responsibilities */}
                <div>
                  <h3 className="text-xl font-semibold mb-3">
                    3. User Responsibilities
                  </h3>
                  <p className="text-gray-700 mb-2">
                    By using the Platform, you warrant that:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>
                      You are 18 years or older, or have consent from a
                      parent/guardian
                    </li>
                    <li>
                      You are not prohibited under South African law from using
                      online marketplaces
                    </li>
                    <li>
                      You are providing accurate and lawful personal and payment
                      information
                    </li>
                    <li>
                      You accept full legal responsibility for all activities
                      under your account
                    </li>
                  </ul>
                </div>

                {/* Fees */}
                <div>
                  <h3 className="text-xl font-semibold mb-3">
                    4. Transactions & Fees
                  </h3>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-800 text-sm">
                      <strong>Service Fee:</strong> ReBooked charges a 10%
                      service fee per successful transaction. This fee is
                      automatically deducted before payouts are made to sellers
                      (sellers receive 90% of the sale price).
                    </p>
                  </div>
                  <p className="text-gray-700 mt-3">
                    All payments are facilitated through trusted third-party
                    payment processors. ReBooked does not store credit card
                    information or process payments internally.
                  </p>
                </div>

                {/* ReBooked Campus */}
                <div>
                  <h3 className="text-xl font-semibold mb-3">
                    5. ReBooked Campus Terms
                  </h3>
                  <p className="text-gray-700 mb-2">
                    ReBooked Campus offers informational academic resources
                    including APS calculation tools, bursary listings,
                    university program data, and application advice.
                  </p>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800 text-sm">
                      <strong>Disclaimer:</strong> All content is provided
                      "as-is" for informational purposes only. We do not
                      guarantee data accuracy or accept liability for decisions
                      made based on this information. Users must verify all
                      information directly with official institutions.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Refunds Tab */}
          <TabsContent value="refunds" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <FileText className="h-6 w-6" />
                  Refund Policy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3">
                    Refund Conditions
                  </h3>
                  <p className="text-gray-700 mb-3">
                    Refunds will be processed only if one of the following
                    conditions is met:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>
                      The item has not been received within 14 business days of
                      dispatch confirmation
                    </li>
                    <li>
                      The item delivered materially differs from the listing
                      (incorrect book, wrong edition, undisclosed major defects)
                    </li>
                    <li>The item is counterfeit or an illegal reproduction</li>
                    <li>Fraudulent or deceptive conduct by the seller</li>
                  </ul>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-amber-800 mb-2">
                        Important Requirements
                      </p>
                      <p className="text-amber-700 text-sm">
                        All refund requests must be supported by photographic
                        evidence and lodged within 5 calendar days of delivery.
                        Submit to support@rebookedsolutions.co.za with proof of
                        delivery and original packaging.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3 text-red-700">
                    Refunds NOT Available For:
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>Buyer remorse or change of mind</li>
                    <li>
                      Wear and tear reasonably expected of pre-owned books
                    </li>
                    <li>Delays by couriers beyond platform control</li>
                    <li>Items marked "non-refundable" in the listing</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cancellations Tab */}
          <TabsContent value="cancellations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <X className="h-6 w-6" />
                  Cancellation Policy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3">
                    Buyer Cancellations
                  </h3>
                  <p className="text-gray-700 mb-3">
                    Buyers may cancel an order only if it has not yet been
                    marked as "Dispatched" by the seller. Once dispatch has
                    occurred, the buyer must follow return and refund
                    procedures.
                  </p>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-800 text-sm">
                      <strong>Pre-Dispatch Cancellations:</strong> Full
                      reimbursement within 5–10 business days to original
                      payment method.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">
                    Seller Cancellations
                  </h3>
                  <p className="text-gray-700 mb-3">
                    Sellers may cancel only under exceptional circumstances
                    (stock unavailability, listing errors) within 48 hours of
                    order receipt.
                  </p>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="font-semibold text-red-800 mb-2">
                      Consequences of Frequent Cancellations:
                    </p>
                    <ul className="list-disc list-inside text-red-700 text-sm space-y-1">
                      <li>Temporary suspension of selling privileges</li>
                      <li>Administrative fees and penalties</li>
                      <li>Permanent account termination for repeat offenses</li>
                    </ul>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">
                      Buyer Window
                    </h4>
                    <p className="text-blue-700 text-sm">
                      Before "Dispatched" status
                    </p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-2">
                      Seller Window
                    </h4>
                    <p className="text-green-700 text-sm">
                      48 hours from order receipt
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Shipping Tab */}
          <TabsContent value="shipping" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Truck className="h-6 w-6" />
                  Shipping & Delivery Policy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3">
                    Shipping Responsibility
                  </h3>
                  <p className="text-gray-700 mb-3">
                    Sellers are solely responsible for dispatching and packaging
                    goods. ReBooked Solutions does not handle physical goods and
                    accepts no liability for loss, damage, or delays during
                    shipping.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="font-semibold text-blue-800 mb-2">
                      Dispatch Requirements:
                    </p>
                    <p className="text-blue-700 text-sm">
                      Orders must be shipped within 3 business days using
                      reliable, traceable courier services (Courier Guy, Pudo,
                      Fastway, Paxi).
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">
                    Delivery Timeframes
                  </h3>
                  <p className="text-gray-700 mb-3">
                    Delivery ranges between 2-7 business days after dispatch,
                    depending on courier and location. Maximum total timeframe
                    is 14 business days.
                  </p>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="font-semibold text-green-800 mb-2">
                      Consumer Protection Rights:
                    </p>
                    <p className="text-green-700 text-sm mb-2">
                      If delivery exceeds 14 business days without buyer fault,
                      you may:
                    </p>
                    <ul className="list-disc list-inside text-green-700 text-sm ml-4">
                      <li>Cancel transaction and request full refund</li>
                      <li>Extend delivery period at your discretion</li>
                    </ul>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                    <h4 className="font-semibold text-blue-800 mb-2">
                      Dispatch
                    </h4>
                    <p className="text-blue-700 text-sm">3 business days</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <h4 className="font-semibold text-green-800 mb-2">
                      Delivery
                    </h4>
                    <p className="text-green-700 text-sm">2-7 business days</p>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                    <h4 className="font-semibold text-purple-800 mb-2">
                      Maximum
                    </h4>
                    <p className="text-purple-700 text-sm">14 business days</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Returns & Disputes Tab */}
          <TabsContent value="returns" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <RotateCcw className="h-6 w-6" />
                  Returns & Disputes Policy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3">Return Grounds</h3>
                  <p className="text-gray-700 mb-2">
                    Returns are accepted only for:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>
                      Incorrect item delivered (different title, author,
                      edition)
                    </li>
                    <li>Severe damage not disclosed in listing</li>
                    <li>Counterfeit or illegal reproduction</li>
                  </ul>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-3">
                    <p className="text-green-800 text-sm">
                      <strong>Process:</strong> Returns must be initiated within
                      5 calendar days of receipt. Prior written approval
                      required. Buyer pays return shipping unless seller at
                      fault.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">
                    Dispute Resolution
                  </h3>
                  <p className="text-gray-700 mb-3">
                    Submit formal disputes to support@rebookedsolutions.co.za
                    within 7 calendar days including order number, party
                    details, issue description, and supporting documentation.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="font-semibold text-blue-800 mb-2">
                      Resolution Process:
                    </p>
                    <ul className="list-disc list-inside text-blue-700 text-sm space-y-1">
                      <li>Assessment within 7-10 business days</li>
                      <li>Based on Consumer Protection Act principles</li>
                      <li>Objective evidence review</li>
                      <li>Transaction history consideration</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">
                    External Remedies
                  </h3>
                  <p className="text-gray-700 mb-2">
                    If unsatisfied with internal resolution:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>National Consumer Commission (NCC)</li>
                    <li>Consumer Goods and Services Ombud (CGSO)</li>
                    <li>Formal legal channels under South African law</li>
                  </ul>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                    <h4 className="font-semibold text-red-800 mb-2">
                      Return Window
                    </h4>
                    <p className="text-red-700 text-sm">5 calendar days</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                    <h4 className="font-semibold text-blue-800 mb-2">
                      Dispute Window
                    </h4>
                    <p className="text-blue-700 text-sm">7 calendar days</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <h4 className="font-semibold text-green-800 mb-2">
                      Resolution Time
                    </h4>
                    <p className="text-green-700 text-sm">7-10 business days</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Contact Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Mail className="h-6 w-6" />
              Contact Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-book-50 border border-book-200 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-book-700">
                    <strong>Email:</strong> support@rebookedsolutions.co.za
                  </p>
                  <p className="text-book-700">
                    <strong>Hours:</strong> Monday–Friday, 09:00–17:00 (SAST)
                  </p>
                </div>
                <div>
                  <p className="text-book-700">
                    <strong>Response Time:</strong> Within 24 hours
                  </p>
                  <p className="text-book-700">
                    <strong>Company:</strong> ReBooked Solutions (Pty) Ltd
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Policies;
