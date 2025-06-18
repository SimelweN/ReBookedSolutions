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
  Shield,
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
              <strong>Jurisdiction:</strong> Republic of South Africa <br />
              <strong>Regulatory Compliance:</strong> Consumer Protection Act
              (Act 68 of 2008), Electronic Communications and Transactions Act
              (Act 25 of 2002), Protection of Personal Information Act (Act 4 of
              2013)
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-7 mb-8">
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
                          7-day complaint window
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
                          Digital intermediary platform
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
                          Trackable courier services
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <ArrowRight className="h-4 w-4 text-blue-600 mt-0.5" />
                        <span className="text-blue-700">
                          Impartial dispute mediation
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
                        <strong>Website:</strong> www.rebookedsolutions.co.za
                      </p>
                      <p className="text-book-700">
                        <strong>Company:</strong> ReBooked Solutions (Pty) Ltd
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
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-amber-800 text-sm">
                    <strong>Platform Nature:</strong> ReBooked Solutions
                    operates as a digital intermediary between independent
                    sellers and buyers and does not own or control the inventory
                    sold on the platform. Users accept that ReBooked Solutions
                    acts only as a venue and not as a contracting party to the
                    sale.
                  </p>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-red-800 mb-2">
                        Platform Limitation of Liability
                      </p>
                      <p className="text-red-700 text-sm mb-2">
                        As per Section 56 of the CPA, remedies for defective
                        goods are enforceable against the seller, not the
                        platform. ReBooked Solutions assumes no liability for:
                      </p>
                      <ul className="list-disc list-inside text-red-700 text-sm space-y-1 ml-4">
                        <li>Goods condition, legality, or delivery</li>
                        <li>Buyer or seller conduct</li>
                        <li>Courier issues</li>
                        <li>Consequential losses or damages</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">
                    Total Liability Limitation
                  </h3>
                  <p className="text-gray-700 mb-3">
                    ReBooked Solutions' total liability in any dispute shall not
                    exceed the commission earned on the disputed transaction.
                    Under no circumstances will the platform be liable for:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>Loss of income or profits</li>
                    <li>Emotional distress</li>
                    <li>Indirect, incidental, or special damages</li>
                  </ul>
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
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <p className="text-blue-800 text-sm">
                    <strong>Effective Date:</strong>{" "}
                    {new Date().toLocaleDateString()} <br />
                    <strong>Platform:</strong> www.rebookedsolutions.co.za{" "}
                    <br />
                    <strong>Operator:</strong> ReBooked Solutions (Pty) Ltd{" "}
                    <br />
                    <strong>
                      Contact:
                    </strong> support@rebookedsolutions.co.za <br />
                    <strong>Jurisdiction:</strong> Republic of South Africa
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
                    ReBooked Solutions (Pty) Ltd ("ReBooked", "we", "our", or
                    "us") is committed to protecting your privacy. This Privacy
                    Policy outlines how we collect, use, store, share, and
                    protect your personal information in accordance with the
                    Protection of Personal Information Act (POPIA) and
                    applicable South African law.
                  </p>
                  <p className="text-gray-700">
                    By accessing or using any part of the ReBooked platform,
                    including ReBooked Campus, you consent to the collection and
                    processing of your personal information as outlined in this
                    Policy. If you do not agree, please refrain from using the
                    platform.
                  </p>
                </div>

                {/* Scope */}
                <div>
                  <h3 className="text-xl font-semibold mb-3">
                    2. Scope of the Policy
                  </h3>
                  <p className="text-gray-700">
                    This Privacy Policy applies to all visitors, users, and
                    account holders of ReBooked Solutions. It covers information
                    collected through our main marketplace, ReBooked Campus, our
                    communication tools, analytics systems, and any third-party
                    integrations we use.
                  </p>
                </div>

                {/* Information Collection */}
                <div>
                  <h3 className="text-xl font-semibold mb-3">
                    3. What Information We Collect
                  </h3>
                  <p className="text-gray-700 mb-3">
                    We collect personal information that is necessary to provide
                    our services and ensure platform security. This includes,
                    but is not limited to:
                  </p>

                  <div className="space-y-4">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-2">
                        Identification and Contact Information
                      </h4>
                      <p className="text-gray-700 text-sm">
                        Full name, email address, phone number, and optionally
                        your school or university.
                      </p>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-2">
                        Account Credentials
                      </h4>
                      <p className="text-gray-700 text-sm">
                        Hashed passwords and login activity.
                      </p>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-2">
                        Transaction Data
                      </h4>
                      <p className="text-gray-700 text-sm">
                        Books or items listed, viewed, sold, or purchased.
                      </p>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-2">
                        Delivery Information
                      </h4>
                      <p className="text-gray-700 text-sm">
                        Shipping address, courier tracking data, and delivery
                        preferences.
                      </p>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-2">
                        Payment Information
                      </h4>
                      <p className="text-gray-700 text-sm">
                        Payout details or payment references, collected and
                        processed securely through trusted third-party providers
                        like Paystack.
                      </p>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-2">
                        Educational Data
                      </h4>
                      <p className="text-gray-700 text-sm">
                        Input used in APS calculators, study tips submitted,
                        bursary tools used, and program searches within ReBooked
                        Campus.
                      </p>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-2">
                        Technical and Usage Data
                      </h4>
                      <p className="text-gray-700 text-sm">
                        IP address, browser type, device info, time on page,
                        actions performed, and referral source.
                      </p>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-2">
                        Communication Data
                      </h4>
                      <p className="text-gray-700 text-sm">
                        Messages sent to our support email, helpdesk forms, or
                        via any integrated chat or contact system.
                      </p>
                    </div>
                  </div>
                </div>

                {/* How We Collect */}
                <div>
                  <h3 className="text-xl font-semibold mb-3">
                    4. How We Collect Your Information
                  </h3>
                  <p className="text-gray-700 mb-3">
                    We collect personal information directly from you when you
                    create an account, submit forms, list items, browse
                    educational resources, or communicate with us.
                  </p>
                  <p className="text-gray-700 mb-3">
                    We also collect certain data automatically through cookies,
                    server logs, analytics tools, and browser-based tracking,
                    which help us improve the platform and detect suspicious
                    activity.
                  </p>
                  <p className="text-gray-700">
                    Where applicable, we may collect information from
                    third-party services you interact with through our platform,
                    such as payment providers or delivery companies.
                  </p>
                </div>

                {/* How We Use Information */}
                <div>
                  <h3 className="text-xl font-semibold mb-3">
                    5. How We Use Your Information
                  </h3>
                  <p className="text-gray-700 mb-3">
                    We use your information for the following lawful purposes:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>To register and manage your account</li>
                    <li>
                      To facilitate the listing, browsing, and sale of books and
                      other goods
                    </li>
                    <li>To enable communication between buyers and sellers</li>
                    <li>To coordinate with courier services for deliveries</li>
                    <li>
                      To display and improve ReBooked Campus resources,
                      including APS tools, bursary data, and university programs
                    </li>
                    <li>
                      To send important notifications, alerts, and updates
                      related to your account, listings, or educational tools
                    </li>
                    <li>
                      To respond to user queries and provide customer support
                    </li>
                    <li>
                      To analyse user behaviour and improve platform
                      performance, reliability, and security
                    </li>
                    <li>
                      To enforce our terms and conditions and protect against
                      fraud, abuse, or policy violations
                    </li>
                    <li>
                      To comply with South African legal obligations, such as
                      tax, consumer protection, or data protection laws
                    </li>
                  </ul>
                  <p className="text-gray-700 mt-3">
                    We will only use your personal information for the purpose
                    it was collected, unless we reasonably believe another
                    purpose is compatible or we obtain your further consent.
                  </p>
                </div>

                {/* Information Sharing */}
                <div>
                  <h3 className="text-xl font-semibold mb-3">
                    6. Sharing of Information
                  </h3>
                  <p className="text-gray-700 mb-3">
                    We do not sell, lease, or rent your personal information to
                    any third parties.
                  </p>
                  <p className="text-gray-700 mb-3">
                    However, we may share your personal data under strict
                    conditions with:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>
                      Third-party service providers who help operate the
                      platform, such as our database host (Supabase), web host
                      (Vercel), or analytics partners
                    </li>
                    <li>
                      Courier companies for fulfilling delivery instructions and
                      providing tracking updates
                    </li>
                    <li>
                      Payment processors like Paystack for secure handling of
                      funds, subject to their own privacy and security
                      frameworks
                    </li>
                    <li>
                      Legal or regulatory authorities if required by law, court
                      order, subpoena, or in the defence of legal claims
                    </li>
                    <li>
                      Technical advisors or consultants strictly for internal
                      compliance, audits, or security reviews
                    </li>
                  </ul>
                  <p className="text-gray-700 mt-3">
                    All third parties are contractually required to treat your
                    data with confidentiality and to use it only for the
                    intended service delivery purpose.
                  </p>
                </div>

                {/* Cookies and Tracking */}
                <div>
                  <h3 className="text-xl font-semibold mb-3">
                    7. Cookies and Tracking
                  </h3>
                  <p className="text-gray-700 mb-3">
                    ReBooked Solutions uses cookies and similar technologies to
                    improve user experience, maintain security, and analyse
                    platform usage.
                  </p>
                  <p className="text-gray-700">
                    These cookies may track session duration, device
                    information, login behaviour, and referral sources. You can
                    disable cookies in your browser settings, but this may limit
                    some functionality on our website.
                  </p>
                </div>

                {/* Data Security */}
                <div>
                  <h3 className="text-xl font-semibold mb-3">
                    8. Data Security
                  </h3>
                  <p className="text-gray-700 mb-3">
                    We implement industry-standard technical and organisational
                    measures to protect your personal data. These include secure
                    password hashing, role-based access control, encrypted
                    storage, audit logging, and real-time threat monitoring.
                  </p>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-amber-800 text-sm">
                      <strong>Important Notice:</strong> While we make every
                      effort to safeguard your data, no method of digital
                      transmission or storage is completely secure. Use of the
                      platform is at your own risk, and you acknowledge that
                      absolute security cannot be guaranteed.
                    </p>
                  </div>
                </div>

                {/* Data Retention */}
                <div>
                  <h3 className="text-xl font-semibold mb-3">
                    9. Data Retention
                  </h3>
                  <p className="text-gray-700 mb-3">
                    We retain personal information only as long as necessary to
                    fulfil the purposes outlined in this Policy or as required
                    by law. When your information is no longer required, it is
                    securely deleted or anonymised.
                  </p>
                  <p className="text-gray-700">
                    You may request deletion of your data by contacting
                    support@rebookedsolutions.co.za. However, we may retain
                    certain information if required for legal compliance, fraud
                    prevention, dispute resolution, or transaction history.
                  </p>
                </div>

                {/* User Rights Under POPIA */}
                <div>
                  <h3 className="text-xl font-semibold mb-3">
                    10. User Rights Under POPIA
                  </h3>
                  <p className="text-gray-700 mb-3">
                    Under South African data protection law, you have the
                    following rights:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <ul className="list-disc list-inside space-y-1 text-green-700 text-sm">
                        <li>
                          The right to be informed about how your personal data
                          is collected and used
                        </li>
                        <li>
                          The right to access the personal data we hold about
                          you
                        </li>
                        <li>
                          The right to request correction or deletion of your
                          personal information
                        </li>
                      </ul>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <ul className="list-disc list-inside space-y-1 text-blue-700 text-sm">
                        <li>
                          The right to object to processing or withdraw consent
                          where applicable
                        </li>
                        <li>
                          The right to lodge a complaint with the Information
                          Regulator
                        </li>
                      </ul>
                    </div>
                  </div>
                  <p className="text-gray-700 mt-3">
                    To exercise any of these rights, please contact
                    support@rebookedsolutions.co.za. We may require proof of
                    identity before processing any request.
                  </p>
                </div>

                {/* Children's Privacy */}
                <div>
                  <h3 className="text-xl font-semibold mb-3">
                    11. Children's Privacy
                  </h3>
                  <p className="text-gray-700">
                    Our platform is not intended for users under the age of 16
                    without parental or guardian consent. If we learn that we
                    have collected information from a child without proper
                    authorisation, we will take steps to delete it promptly.
                  </p>
                </div>

                {/* Third-Party Links */}
                <div>
                  <h3 className="text-xl font-semibold mb-3">
                    12. Third-Party Links
                  </h3>
                  <p className="text-gray-700">
                    Our site may contain links to third-party websites,
                    services, or bursary programs. Once you leave our domain, we
                    are not responsible for the privacy practices, content, or
                    accuracy of those third-party sites. You access them at your
                    own risk.
                  </p>
                </div>

                {/* International Transfers */}
                <div>
                  <h3 className="text-xl font-semibold mb-3">
                    13. International Transfers
                  </h3>
                  <p className="text-gray-700">
                    Although we are based in South Africa, some of our service
                    providers (e.g., hosting or email services) may process data
                    in foreign jurisdictions. We take reasonable steps to ensure
                    that all data transfers are compliant with South African
                    data protection laws and subject to adequate safeguards.
                  </p>
                </div>

                {/* Policy Updates */}
                <div>
                  <h3 className="text-xl font-semibold mb-3">
                    14. Policy Updates
                  </h3>
                  <p className="text-gray-700">
                    We reserve the right to update this Privacy Policy at any
                    time. Material changes will be announced on the platform.
                    Continued use after such changes implies your acceptance of
                    the revised terms.
                  </p>
                </div>

                {/* Contact Information */}
                <div>
                  <h3 className="text-xl font-semibold mb-3">15. Contact Us</h3>
                  <p className="text-gray-700 mb-3">
                    If you have any questions, requests, or concerns regarding
                    your personal information or this Privacy Policy, please
                    contact:
                  </p>
                  <div className="bg-book-50 border border-book-200 rounded-lg p-4">
                    <p className="text-book-700">
                      <strong>ReBooked Solutions (Pty) Ltd</strong>
                      <br />
                      📧 Email: support@rebookedsolutions.co.za
                      <br />
                      📍 Based in the Republic of South Africa
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
                  1. REFUND POLICY
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3">
                    1.1 Scope and Application
                  </h3>
                  <p className="text-gray-700 mb-3">
                    This Refund Policy applies to all users transacting on
                    www.rebookedsolutions.co.za and governs the circumstances
                    under which refunds may be issued. ReBooked Solutions
                    operates as a digital intermediary between independent
                    sellers and buyers and does not own or control the inventory
                    sold on the platform.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">
                    1.2 Statutory Rights
                  </h3>
                  <p className="text-gray-700 mb-3">
                    In terms of Section 20 and 56 of the Consumer Protection
                    Act, consumers are entitled to return defective goods within
                    six months of delivery if the item is unsafe, fails to
                    perform as intended, or does not meet the description.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">
                    1.3 Platform-Specific Refund Conditions
                  </h3>
                  <p className="text-gray-700 mb-3">
                    Refunds will be processed only if one of the following
                    conditions is met:
                  </p>

                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                    <li>
                      The item has not been received within 14 business days of
                      dispatch confirmation.
                    </li>
                    <li>
                      The item delivered materially differs from the listing,
                      including:
                      <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                        <li>
                          Incorrect book (wrong edition, title, or author)
                        </li>
                        <li>
                          Undisclosed major defects (e.g. missing pages, mold,
                          water damage)
                        </li>
                      </ul>
                    </li>
                    <li>The item is counterfeit or an illegal reproduction</li>
                    <li>Fraudulent or deceptive conduct by the seller</li>
                  </ul>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-amber-800 text-sm">
                      <strong>Important Requirements:</strong> All refund
                      requests must be supported by photographic evidence and a
                      formal complaint lodged within five (5) calendar days of
                      delivery or the estimated delivery date. Submissions must
                      be made to support@rebookedsolutions.co.za. The buyer must
                      retain proof of delivery, shipping labels, and original
                      packaging where applicable.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3 text-red-700">
                    Refunds NOT Available For:
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>
                      Buyer remorse or change of mind (CPA Section 20 does not
                      apply to second-hand goods unless sold by a business)
                    </li>
                    <li>
                      Wear and tear reasonably expected of pre-owned books
                    </li>
                    <li>Delays by couriers beyond the platform's control</li>
                    <li>Items marked "non-refundable" in the listing</li>
                  </ul>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                    <p className="text-blue-800 text-sm">
                      ReBooked Solutions will act as an impartial mediator but
                      makes no guarantee of refund unless the above criteria are
                      objectively met and supported with documentation. Final
                      decisions rest with the platform's resolution team.
                    </p>
                  </div>
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
                  2. CANCELLATION POLICY
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3">
                    2.1 Buyer Cancellations
                  </h3>
                  <p className="text-gray-700 mb-3">
                    Buyers may cancel an order only if it has not yet been
                    marked as "Dispatched" by the seller. Once dispatch has
                    occurred, the buyer must follow the return and refund
                    procedures.
                  </p>
                  <p className="text-gray-700 mb-3">
                    Cancellations made before dispatch will be processed with
                    full reimbursement to the original payment method within
                    5–10 business days, excluding delays caused by third-party
                    payment processors. Buyers are responsible for ensuring
                    their payment details are correct.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800 text-sm">
                      <strong>Legal Note:</strong> In terms of the Electronic
                      Communications and Transactions Act, Section 44 does not
                      apply to digital platforms acting as intermediaries and
                      not selling goods directly. Therefore, no automatic 7-day
                      cooling-off period is enforceable unless otherwise stated.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">
                    2.2 Seller Cancellations
                  </h3>
                  <p className="text-gray-700 mb-3">
                    Sellers may cancel a transaction only under exceptional
                    circumstances, including stock unavailability or listing
                    errors. Cancellations must occur within 48 hours of order
                    receipt, and the seller must notify the buyer via platform
                    messaging and the ReBooked support email.
                  </p>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="font-semibold text-red-800 mb-2">
                      Frequent or unjustified cancellations by sellers may
                      result in:
                    </p>
                    <ul className="list-disc list-inside text-red-700 text-sm space-y-1">
                      <li>Temporary suspension of selling privileges</li>
                      <li>Penalties, including administrative fees</li>
                      <li>
                        Permanent account termination in severe or repeat cases
                      </li>
                    </ul>
                  </div>

                  <p className="text-gray-700 mt-3">
                    ReBooked Solutions reserves the right to cancel any order at
                    its sole discretion, especially where fraud, abuse, or
                    system manipulation is detected.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">
                      Buyer Cancellation Window
                    </h4>
                    <p className="text-blue-700 text-sm">
                      Before "Dispatched" status only
                    </p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-2">
                      Seller Cancellation Window
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
                  3. SHIPPING & DELIVERY POLICY
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3">
                    3.1 Shipping Responsibility
                  </h3>
                  <p className="text-gray-700 mb-3">
                    Sellers are solely responsible for dispatching and packaging
                    goods sold on the platform. ReBooked Solutions does not
                    handle physical goods and does not accept liability for
                    loss, damage, or delays during shipping.
                  </p>
                  <p className="text-gray-700 mb-3">
                    All orders must be shipped within three (3) business days of
                    payment confirmation. Sellers must use reliable third-party
                    courier services and are encouraged to use traceable methods
                    (e.g. Courier Guy, Pudo, Fastway, Paxi). Failure to dispatch
                    within the required timeframe may result in forced
                    cancellation and refund.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">
                    3.2 Delivery Timeframes
                  </h3>
                  <p className="text-gray-700 mb-3">
                    Delivery timeframes range between 2 and 7 business days
                    after dispatch, depending on the courier and regional
                    location. ReBooked Solutions does not guarantee any specific
                    delivery timeline.
                  </p>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="font-semibold text-green-800 mb-2">
                      Consumer Protection Rights (CPA Section 19(4)):
                    </p>
                    <p className="text-green-700 text-sm mb-2">
                      If delivery is not made within the agreed timeframe or
                      within 14 business days, and the delay is not due to the
                      buyer, the buyer may:
                    </p>
                    <ul className="list-disc list-inside text-green-700 text-sm ml-4">
                      <li>Cancel the transaction and request a full refund</li>
                      <li>Extend the delivery period, at their discretion</li>
                    </ul>
                  </div>
                  <p className="text-gray-700 mt-3">
                    All courier-related disputes (e.g., misdelivery, delays,
                    damaged packaging) must be resolved directly with the
                    courier unless seller error is proven.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">
                    3.3 Failed Deliveries and Returns
                  </h3>
                  <p className="text-gray-700 mb-3">
                    If a parcel is returned due to:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4 mb-3">
                    <li>An incorrect or incomplete delivery address</li>
                    <li>Buyer's unavailability</li>
                    <li>Failure to collect from pick-up points</li>
                  </ul>
                  <p className="text-gray-700">
                    Then the buyer may be liable for any redelivery costs. The
                    platform will not issue refunds for failed deliveries unless
                    the seller is at fault.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                    <h4 className="font-semibold text-blue-800 mb-2">
                      Dispatch Window
                    </h4>
                    <p className="text-blue-700 text-sm">3 business days</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <h4 className="font-semibold text-green-800 mb-2">
                      Delivery Range
                    </h4>
                    <p className="text-green-700 text-sm">2-7 business days</p>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                    <h4 className="font-semibold text-purple-800 mb-2">
                      Maximum Timeframe
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
                  4. RETURN POLICY & 5. DISPUTE RESOLUTION POLICY
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3">
                    4.1 Return Grounds
                  </h3>
                  <p className="text-gray-700 mb-2">
                    Returns are accepted only in the following cases:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>
                      Incorrect item delivered (e.g., different title, author,
                      or edition)
                    </li>
                    <li>Severe damage not disclosed in the listing</li>
                    <li>Item deemed counterfeit or illegal reproduction</li>
                  </ul>
                  <p className="text-gray-700 mt-3">
                    Returns must be initiated within five (5) calendar days of
                    receipt. Items returned without prior written approval will
                    not be accepted or refunded.
                  </p>
                  <p className="text-gray-700 mt-3">
                    Buyers must retain all original packaging and use a
                    trackable return method. Return shipping costs are borne by
                    the buyer unless the seller is found to be at fault.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">
                    4.2 Return Exclusions
                  </h3>
                  <p className="text-gray-700 mb-2">
                    Returns are not allowed in the following instances:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>Book condition disputes over minor flaws</li>
                    <li>Buyer's personal dissatisfaction after usage</li>
                    <li>Items marked as "non-returnable"</li>
                    <li>
                      Books damaged after delivery due to buyer negligence
                    </li>
                  </ul>
                  <p className="text-gray-700 mt-3">
                    Upon successful return and inspection, ReBooked Solutions
                    will process any applicable refund within 5–10 business
                    days. Refunds will not include original shipping costs
                    unless otherwise specified.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">
                    5.1 Dispute Submission
                  </h3>
                  <p className="text-gray-700 mb-3">
                    Buyers or sellers may raise a formal dispute by submitting
                    an email to support@rebookedsolutions.co.za within seven (7)
                    calendar days of the disputed event.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="font-semibold text-blue-800 mb-2">
                      The complaint must include:
                    </p>
                    <ul className="list-disc list-inside text-blue-700 text-sm space-y-1">
                      <li>Order number</li>
                      <li>Names of both parties</li>
                      <li>Description of the issue</li>
                      <li>
                        All supporting documentation (photos, tracking,
                        communication)
                      </li>
                    </ul>
                  </div>
                  <p className="text-gray-700 mt-3">
                    Failure to provide sufficient evidence may result in
                    dismissal of the dispute without further investigation.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">
                    5.2 Internal Resolution
                  </h3>
                  <p className="text-gray-700 mb-3">
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
                  <h3 className="text-xl font-semibold mb-3">
                    5.3 Platform Limitation of Liability
                  </h3>
                  <p className="text-gray-700 mb-3">
                    As per Section 56 of the CPA, remedies for defective goods
                    are enforceable against the seller, not the platform.
                    ReBooked Solutions is a digital facilitator and assumes no
                    liability for:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>Goods condition, legality, or delivery</li>
                    <li>Buyer or seller conduct</li>
                    <li>Courier issues</li>
                    <li>Consequential losses or damages</li>
                  </ul>
                  <p className="text-gray-700 mt-3">
                    ReBooked Solutions' total liability in any dispute shall not
                    exceed the commission earned on the disputed transaction.
                    Under no circumstances will the platform be liable for:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>Loss of income or profits</li>
                    <li>Emotional distress</li>
                    <li>Indirect, incidental, or special damages</li>
                  </ul>
                  <p className="text-gray-700 mt-3">
                    Users accept that ReBooked Solutions acts only as a venue
                    and not as a contracting party to the sale.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">
                    5.4 External Remedies
                  </h3>
                  <p className="text-gray-700 mb-2">
                    If either party is dissatisfied with the internal resolution
                    outcome, they may escalate to:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>The National Consumer Commission (NCC)</li>
                    <li>The Consumer Goods and Services Ombud (CGSO)</li>
                    <li>Formal legal channels under South African law</li>
                  </ul>
                  <p className="text-gray-700 mt-3">
                    ReBooked Solutions will comply with all lawful requests but
                    will not be responsible for legal expenses incurred by
                    users.
                  </p>
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
              6. CONTACT INFORMATION
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-book-50 border border-book-200 rounded-lg p-6">
              <p className="text-book-700 mb-4">
                All queries, complaints, and policy-related matters must be
                directed to:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-book-700">
                    <strong>Email:</strong> support@rebookedsolutions.co.za
                  </p>
                  <p className="text-book-700">
                    <strong>Business Hours:</strong> Monday–Friday, 09:00–17:00
                    (SAST)
                  </p>
                </div>
                <div>
                  <p className="text-book-700">
                    <strong>Website:</strong> www.rebookedsolutions.co.za
                  </p>
                  <p className="text-book-700">
                    <strong>Company Registered In:</strong> South Africa
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
