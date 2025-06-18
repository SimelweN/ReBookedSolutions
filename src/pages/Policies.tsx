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
            Policies & Terms
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive policy documentation to ensure transparent and fair
            transactions. All policies comply with South African consumer
            protection laws.
          </p>
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
