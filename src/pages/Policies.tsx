import { useState } from "react";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  FileText,
  Scale,
  Shield,
  Mail,
  Truck,
  RotateCcw,
  Ban,
  AlertTriangle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Policies = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();

  return (
    <Layout>
      <SEO
        title="Platform Policies | ReBooked Solutions"
        description="Complete policy documentation for ReBooked Solutions - refunds, cancellations, shipping, returns, and dispute resolution compliant with South African consumer protection laws."
        keywords="policies, refunds, cancellations, shipping, returns, disputes, consumer protection, South Africa"
      />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              ReBooked Solutions – Platform Policies
            </h1>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-4xl mx-auto">
              <p className="text-blue-800 text-sm">
                <strong>Effective Date:</strong> 10 June 2025
                <br />
                <strong>Platform Operator:</strong> ReBooked Solutions (Pty) Ltd
                <br />
                <strong>Support Contact:</strong>{" "}
                support@rebookedsolutions.co.za
                <br />
                <strong>Jurisdiction:</strong> Republic of South Africa
              </p>
              <div className="mt-3 text-xs text-blue-700">
                <strong>Regulatory Compliance:</strong> Consumer Protection Act
                (Act 68 of 2008), Electronic Communications and Transactions Act
                (Act 25 of 2002), Protection of Personal Information Act (Act 4
                of 2013)
              </div>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-8">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">
              <FileText className="h-4 w-4 mr-1" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="refunds" className="text-xs sm:text-sm">
              <RotateCcw className="h-4 w-4 mr-1" />
              Refunds
            </TabsTrigger>
            <TabsTrigger value="cancellations" className="text-xs sm:text-sm">
              <Ban className="h-4 w-4 mr-1" />
              Cancellations
            </TabsTrigger>
            <TabsTrigger value="shipping" className="text-xs sm:text-sm">
              <Truck className="h-4 w-4 mr-1" />
              Shipping
            </TabsTrigger>
            <TabsTrigger value="returns" className="text-xs sm:text-sm">
              <Mail className="h-4 w-4 mr-1" />
              Returns
            </TabsTrigger>
            <TabsTrigger value="disputes" className="text-xs sm:text-sm">
              <AlertTriangle className="h-4 w-4 mr-1" />
              Disputes
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
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-amber-800 mb-2">
                    📋 Key Policy Highlights
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-amber-700">
                    <div>
                      <p className="font-medium">Refunds:</p>
                      <ul className="text-sm space-y-1">
                        <li>• 14 business days delivery window</li>
                        <li>• 5 days to report issues</li>
                        <li>• Photographic evidence required</li>
                        <li>• CPA Section 20 & 56 compliance</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium">Shipping & Returns:</p>
                      <ul className="text-sm space-y-1">
                        <li>• 3 business days dispatch window</li>
                        <li>• 2-7 days delivery timeframe</li>
                        <li>• 5 days return window</li>
                        <li>• Trackable shipping required</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-semibold text-green-800 mb-2">
                      ✅ Your Rights
                    </h3>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Consumer Protection Act coverage</li>
                      <li>• 14-day delivery guarantee</li>
                      <li>• Right to cancel before dispatch</li>
                      <li>• Full refund for non-delivery</li>
                      <li>• Dispute resolution support</li>
                    </ul>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-800 mb-2">
                      ⚖️ Legal Framework
                    </h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Consumer Protection Act (CPA)</li>
                      <li>• Electronic Communications Act (ECTA)</li>
                      <li>• Protection of Personal Information Act (POPIA)</li>
                      <li>• South African jurisdiction</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Refund Policy Tab */}
          <TabsContent value="refunds" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <RotateCcw className="h-6 w-6" />
                  Refund Policy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  <div className="prose prose-sm max-w-none space-y-6">
                    <section>
                      <h3 className="text-lg font-bold text-gray-900 mb-3">
                        1.1 Scope and Application
                      </h3>
                      <p>
                        This Refund Policy applies to all users transacting on
                        www.rebookedsolutions.co.za and governs the
                        circumstances under which refunds may be issued.
                        ReBooked Solutions operates as a digital intermediary
                        between independent sellers and buyers and does not own
                        or control the inventory sold on the platform.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-bold text-gray-900 mb-3">
                        1.2 Statutory Rights
                      </h3>
                      <p>
                        In terms of Section 20 and 56 of the Consumer Protection
                        Act, consumers are entitled to return defective goods
                        within six months of delivery if the item is unsafe,
                        fails to perform as intended, or does not meet the
                        description.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-bold text-gray-900 mb-3">
                        1.3 Platform-Specific Refund Conditions
                      </h3>
                      <p className="mb-3">
                        Refunds will be processed only if one of the following
                        conditions is met:
                      </p>
                      <ul className="list-disc pl-6 space-y-2 mb-4">
                        <li>
                          The item has not been received within 14 business days
                          of dispatch confirmation.
                        </li>
                        <li>
                          The item delivered materially differs from the
                          listing, including:
                          <ul className="list-disc pl-6 mt-2 space-y-1">
                            <li>
                              Incorrect book (wrong edition, title, or author)
                            </li>
                            <li>
                              Undisclosed major defects (e.g. missing pages,
                              mold, water damage)
                            </li>
                            <li>
                              The item is counterfeit or an illegal reproduction
                            </li>
                            <li>
                              Fraudulent or deceptive conduct by the seller
                            </li>
                          </ul>
                        </li>
                      </ul>

                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                        <p className="text-yellow-800">
                          <strong>Important:</strong> All refund requests must
                          be supported by photographic evidence and a formal
                          complaint lodged within five (5) calendar days of
                          delivery or the estimated delivery date. Submissions
                          must be made to support@rebookedsolutions.co.za. The
                          buyer must retain proof of delivery, shipping labels,
                          and original packaging where applicable.
                        </p>
                      </div>

                      <p className="mb-3">
                        Refunds are strictly not applicable in the following
                        cases:
                      </p>
                      <ul className="list-disc pl-6 space-y-1 mb-4">
                        <li>
                          Buyer remorse or change of mind (CPA Section 20 does
                          not apply to second-hand goods unless sold by a
                          business)
                        </li>
                        <li>
                          Wear and tear reasonably expected of pre-owned books
                        </li>
                        <li>
                          Delays by couriers beyond the platform's control
                        </li>
                        <li>Items marked "non-refundable" in the listing</li>
                      </ul>

                      <p>
                        ReBooked Solutions will act as an impartial mediator but
                        makes no guarantee of refund unless the above criteria
                        are objectively met and supported with documentation.
                        Final decisions rest with the platform's resolution
                        team.
                      </p>
                    </section>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cancellation Policy Tab */}
          <TabsContent value="cancellations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Ban className="h-6 w-6" />
                  Cancellation Policy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  <div className="prose prose-sm max-w-none space-y-6">
                    <section>
                      <h3 className="text-lg font-bold text-gray-900 mb-3">
                        2.1 Buyer Cancellations
                      </h3>
                      <p className="mb-4">
                        Buyers may cancel an order only if it has not yet been
                        marked as "Dispatched" by the seller. Once dispatch has
                        occurred, the buyer must follow the return and refund
                        procedures.
                      </p>
                      <p className="mb-4">
                        Cancellations made before dispatch will be processed
                        with full reimbursement to the original payment method
                        within 5–10 business days, excluding delays caused by
                        third-party payment processors. Buyers are responsible
                        for ensuring their payment details are correct.
                      </p>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-blue-800">
                          <strong>Legal Note:</strong> In terms of the
                          Electronic Communications and Transactions Act,
                          Section 44 does not apply to digital platforms acting
                          as intermediaries and not selling goods directly.
                          Therefore, no automatic 7-day cooling-off period is
                          enforceable unless otherwise stated.
                        </p>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-lg font-bold text-gray-900 mb-3">
                        2.2 Seller Cancellations
                      </h3>
                      <p className="mb-4">
                        Sellers may cancel a transaction only under exceptional
                        circumstances, including stock unavailability or listing
                        errors. Cancellations must occur within 48 hours of
                        order receipt, and the seller must notify the buyer via
                        platform messaging and the ReBooked support email.
                      </p>
                      <p className="mb-2">
                        Frequent or unjustified cancellations by sellers may
                        result in:
                      </p>
                      <ul className="list-disc pl-6 space-y-1 mb-4">
                        <li>Temporary suspension of selling privileges</li>
                        <li>Penalties, including administrative fees</li>
                        <li>
                          Permanent account termination in severe or repeat
                          cases
                        </li>
                      </ul>
                      <p>
                        ReBooked Solutions reserves the right to cancel any
                        order at its sole discretion, especially where fraud,
                        abuse, or system manipulation is detected.
                      </p>
                    </section>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Shipping & Delivery Policy Tab */}
          <TabsContent value="shipping" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Truck className="h-6 w-6" />
                  Shipping & Delivery Policy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  <div className="prose prose-sm max-w-none space-y-6">
                    <section>
                      <h3 className="text-lg font-bold text-gray-900 mb-3">
                        3.1 Shipping Responsibility
                      </h3>
                      <p className="mb-4">
                        Sellers are solely responsible for dispatching and
                        packaging goods sold on the platform. ReBooked Solutions
                        does not handle physical goods and does not accept
                        liability for loss, damage, or delays during shipping.
                      </p>
                      <p className="mb-4">
                        All orders must be shipped within three (3) business
                        days of payment confirmation. Sellers must use reliable
                        third-party courier services and are encouraged to use
                        traceable methods (e.g. Courier Guy, Pudo, Fastway,
                        Paxi). Failure to dispatch within the required timeframe
                        may result in forced cancellation and refund.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-bold text-gray-900 mb-3">
                        3.2 Delivery Timeframes
                      </h3>
                      <p className="mb-4">
                        Delivery timeframes range between 2 and 7 business days
                        after dispatch, depending on the courier and regional
                        location. ReBooked Solutions does not guarantee any
                        specific delivery timeline.
                      </p>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                        <p className="text-green-800">
                          <strong>Consumer Rights:</strong> In accordance with
                          CPA Section 19(4), if delivery is not made within the
                          agreed timeframe or within 14 business days, and the
                          delay is not due to the buyer, the buyer may:
                        </p>
                        <ul className="list-disc pl-6 mt-2 text-green-700">
                          <li>
                            Cancel the transaction and request a full refund
                          </li>
                          <li>
                            Extend the delivery period, at their discretion
                          </li>
                        </ul>
                      </div>
                      <p>
                        All courier-related disputes (e.g., misdelivery, delays,
                        damaged packaging) must be resolved directly with the
                        courier unless seller error is proven.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-bold text-gray-900 mb-3">
                        3.3 Failed Deliveries and Returns
                      </h3>
                      <p className="mb-2">If a parcel is returned due to:</p>
                      <ul className="list-disc pl-6 space-y-1 mb-4">
                        <li>An incorrect or incomplete delivery address</li>
                        <li>Buyer's unavailability</li>
                        <li>Failure to collect from pick-up points</li>
                      </ul>
                      <p>
                        Then the buyer may be liable for any redelivery costs.
                        The platform will not issue refunds for failed
                        deliveries unless the seller is at fault.
                      </p>
                    </section>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Return Policy Tab */}
          <TabsContent value="returns" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Mail className="h-6 w-6" />
                  Return Policy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  <div className="prose prose-sm max-w-none space-y-6">
                    <section>
                      <h3 className="text-lg font-bold text-gray-900 mb-3">
                        4.1 Return Grounds
                      </h3>
                      <p className="mb-2">
                        Returns are accepted only in the following cases:
                      </p>
                      <ul className="list-disc pl-6 space-y-1 mb-4">
                        <li>
                          Incorrect item delivered (e.g., different title,
                          author, or edition)
                        </li>
                        <li>Severe damage not disclosed in the listing</li>
                        <li>Item deemed counterfeit or illegal reproduction</li>
                      </ul>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                        <p className="text-red-800">
                          <strong>Important:</strong> Returns must be initiated
                          within five (5) calendar days of receipt. Items
                          returned without prior written approval will not be
                          accepted or refunded.
                        </p>
                      </div>
                      <p>
                        Buyers must retain all original packaging and use a
                        trackable return method. Return shipping costs are borne
                        by the buyer unless the seller is found to be at fault.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-bold text-gray-900 mb-3">
                        4.2 Return Exclusions
                      </h3>
                      <p className="mb-2">
                        Returns are not allowed in the following instances:
                      </p>
                      <ul className="list-disc pl-6 space-y-1 mb-4">
                        <li>Book condition disputes over minor flaws</li>
                        <li>Buyer's personal dissatisfaction after usage</li>
                        <li>Items marked as "non-returnable"</li>
                        <li>
                          Books damaged after delivery due to buyer negligence
                        </li>
                      </ul>
                      <p>
                        Upon successful return and inspection, ReBooked
                        Solutions will process any applicable refund within 5–10
                        business days. Refunds will not include original
                        shipping costs unless otherwise specified.
                      </p>
                    </section>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dispute Resolution Policy Tab */}
          <TabsContent value="disputes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <AlertTriangle className="h-6 w-6" />
                  Dispute Resolution Policy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  <div className="prose prose-sm max-w-none space-y-6">
                    <section>
                      <h3 className="text-lg font-bold text-gray-900 mb-3">
                        5.1 Dispute Submission
                      </h3>
                      <p className="mb-4">
                        Buyers or sellers may raise a formal dispute by
                        submitting an email to support@rebookedsolutions.co.za
                        within seven (7) calendar days of the disputed event.
                      </p>
                      <p className="mb-2">The complaint must include:</p>
                      <ul className="list-disc pl-6 space-y-1 mb-4">
                        <li>Order number</li>
                        <li>Names of both parties</li>
                        <li>Description of the issue</li>
                        <li>
                          All supporting documentation (photos, tracking,
                          communication)
                        </li>
                      </ul>
                      <p>
                        Failure to provide sufficient evidence may result in
                        dismissal of the dispute without further investigation.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-bold text-gray-900 mb-3">
                        5.2 Internal Resolution
                      </h3>
                      <p className="mb-4">
                        ReBooked Solutions will assess disputes within 7–10
                        business days and may request further evidence from both
                        parties. The platform's decision will be based on:
                      </p>
                      <ul className="list-disc pl-6 space-y-1 mb-4">
                        <li>Consumer Protection Act principles of fairness</li>
                        <li>Objective review of evidence</li>
                        <li>Transaction history and user behaviour</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg font-bold text-gray-900 mb-3">
                        5.3 Platform Limitation of Liability
                      </h3>
                      <p className="mb-4">
                        As per Section 56 of the CPA, remedies for defective
                        goods are enforceable against the seller, not the
                        platform. ReBooked Solutions is a digital facilitator
                        and assumes no liability for:
                      </p>
                      <ul className="list-disc pl-6 space-y-1 mb-4">
                        <li>Goods condition, legality, or delivery</li>
                        <li>Buyer or seller conduct</li>
                        <li>Courier issues</li>
                        <li>Consequential losses or damages</li>
                      </ul>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                        <p className="text-yellow-800">
                          <strong>Liability Limitation:</strong> ReBooked
                          Solutions' total liability in any dispute shall not
                          exceed the commission earned on the disputed
                          transaction. Under no circumstances will the platform
                          be liable for:
                        </p>
                        <ul className="list-disc pl-6 mt-2 text-yellow-700">
                          <li>Loss of income or profits</li>
                          <li>Emotional distress</li>
                          <li>Indirect, incidental, or special damages</li>
                        </ul>
                      </div>
                      <p>
                        Users accept that ReBooked Solutions acts only as a
                        venue and not as a contracting party to the sale.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-bold text-gray-900 mb-3">
                        5.4 External Remedies
                      </h3>
                      <p className="mb-2">
                        If either party is dissatisfied with the internal
                        resolution outcome, they may escalate to:
                      </p>
                      <ul className="list-disc pl-6 space-y-1 mb-4">
                        <li>The National Consumer Commission (NCC)</li>
                        <li>The Consumer Goods and Services Ombud (CGSO)</li>
                        <li>Formal legal channels under South African law</li>
                      </ul>
                      <p>
                        ReBooked Solutions will comply with all lawful requests
                        but will not be responsible for legal expenses incurred
                        by users.
                      </p>
                    </section>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Contact Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Mail className="h-6 w-6" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <p className="text-blue-700 mb-4">
                All queries, complaints, and policy-related matters must be
                directed to:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-blue-700">
                    <strong>Email:</strong> support@rebookedsolutions.co.za
                  </p>
                  <p className="text-blue-700">
                    <strong>Business Hours:</strong> Monday–Friday, 09:00–17:00
                    (SAST)
                  </p>
                </div>
                <div>
                  <p className="text-blue-700">
                    <strong>Website:</strong> www.rebookedsolutions.co.za
                  </p>
                  <p className="text-blue-700">
                    <strong>Company Registered In:</strong> South Africa
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Button onClick={() => navigate("/")} variant="outline">
            Return to Home
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Policies;
