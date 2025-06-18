import { useState } from "react";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Scale, Shield, Mail, Truck, RotateCcw } from "lucide-react";

const Policies = () => {
  const [activeTab, setActiveTab] = useState("overview");

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
            ReBooked Solutions – Platform Policies
          </h1>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4 max-w-4xl mx-auto">
            <p className="text-blue-800 text-sm">
              <strong>Effective Date:</strong> {new Date().toLocaleDateString()}{" "}
              <br />
              <strong>Platform Operator:</strong> ReBooked Solutions (Pty) Ltd{" "}
              <br />
              <strong>
                Support Contact:
              </strong> support@rebookedsolutions.co.za <br />
              <strong>Jurisdiction:</strong> Republic of South Africa
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-8">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">
              Overview
            </TabsTrigger>
            <TabsTrigger value="terms" className="text-xs sm:text-sm">
              Terms & Conditions
            </TabsTrigger>
            <TabsTrigger value="privacy" className="text-xs sm:text-sm">
              Privacy Policy
            </TabsTrigger>
            <TabsTrigger value="refunds" className="text-xs sm:text-sm">
              Refunds
            </TabsTrigger>
            <TabsTrigger value="shipping" className="text-xs sm:text-sm">
              Shipping
            </TabsTrigger>
            <TabsTrigger value="returns" className="text-xs sm:text-sm">
              Returns
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-semibold text-green-800 mb-2">
                      ✅ Your Rights
                    </h3>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Consumer Protection Act coverage</li>
                      <li>• 14-day delivery guarantee</li>
                      <li>• 5-day return window</li>
                      <li>• Full refund protection</li>
                    </ul>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-800 mb-2">
                      📋 Key Policies
                    </h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Service fee: 10%</li>
                      <li>• Max delivery: 14 days</li>
                      <li>• Dispute window: 7 days</li>
                      <li>• Resolution time: 7-10 business days</li>
                    </ul>
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
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <h3>1. Platform Terms</h3>
                  <p>
                    By using ReBooked Solutions, you agree to these terms and
                    conditions. Our platform facilitates the buying and selling
                    of used textbooks between students.
                  </p>

                  <h3>2. User Obligations</h3>
                  <ul>
                    <li>Provide accurate information about textbooks</li>
                    <li>Complete transactions within specified timeframes</li>
                    <li>
                      Respect other users and maintain professional conduct
                    </li>
                  </ul>

                  <h3>3. Service Fees</h3>
                  <p>
                    A 10% service fee applies to all transactions to cover
                    platform maintenance, payment processing, and customer
                    support.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Policy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Shield className="h-6 w-6" />
                  Privacy Policy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <h3>Data Collection</h3>
                  <p>
                    We collect information necessary to provide our textbook
                    marketplace services, including account details, transaction
                    history, and communication records.
                  </p>

                  <h3>Data Usage</h3>
                  <p>
                    Your data is used to facilitate transactions, provide
                    customer support, and improve our platform. We never sell
                    your personal information to third parties.
                  </p>

                  <h3>POPIA Compliance</h3>
                  <p>
                    We are fully compliant with the Protection of Personal
                    Information Act (POPIA) and respect your privacy rights.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Refunds Tab */}
          <TabsContent value="refunds" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <RotateCcw className="h-6 w-6" />
                  Refund Policy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <h3>Refund Conditions</h3>
                  <p>
                    Full refunds are available if textbooks are not delivered
                    within 14 days or if items are significantly different from
                    descriptions.
                  </p>

                  <h3>Processing Time</h3>
                  <p>
                    Refunds are processed within 7-10 business days after
                    approval. Funds are returned to the original payment method.
                  </p>
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
                  Shipping Policy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <h3>Delivery Timeframes</h3>
                  <p>
                    All textbooks must be delivered within 14 days of purchase.
                    Sellers are responsible for arranging appropriate shipping.
                  </p>

                  <h3>Shipping Costs</h3>
                  <p>
                    Shipping costs are clearly displayed at checkout and are
                    typically borne by the buyer unless otherwise specified.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Returns Tab */}
          <TabsContent value="returns" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Mail className="h-6 w-6" />
                  Returns & Disputes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <h3>Return Window</h3>
                  <p>
                    Items can be returned within 5 calendar days of delivery if
                    they don't match the description or are damaged.
                  </p>

                  <h3>Dispute Resolution</h3>
                  <p>
                    Our team mediates disputes fairly and efficiently. Contact
                    support@rebookedsolutions.co.za for assistance.
                  </p>
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
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <p className="text-blue-700 mb-4">
                For all policy-related questions and support:
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
