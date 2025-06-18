import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Privacy = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <SEO
        title="Privacy Policy | ReBooked Solutions"
        description="Comprehensive privacy policy for ReBooked Solutions platform, POPIA compliant, covering data collection, usage, storage, and user rights in South Africa."
        keywords="privacy policy, POPIA, data protection, personal information, South Africa, ReBooked Solutions"
      />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
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
            <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
              <Shield className="h-8 w-8" />
              Privacy Policy
            </h1>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
              <p className="text-blue-800 text-sm">
                <strong>Effective Date:</strong> [Insert Date] <br />
                <strong>Platform:</strong> www.rebookedsolutions.co.za <br />
                <strong>Operator:</strong> ReBooked Solutions (Pty) Ltd <br />
                <strong>Contact:</strong> support@rebookedsolutions.co.za <br />
                <strong>Jurisdiction:</strong> Republic of South Africa
              </p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              🔒 Privacy Policy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[800px] pr-4">
              <div className="prose prose-sm max-w-none space-y-6">
                <section>
                  <h2 className="text-xl font-bold text-gray-900 mb-3">
                    1. Introduction
                  </h2>
                  <p className="mb-4">
                    ReBooked Solutions (Pty) Ltd ("ReBooked", "we", "our", or
                    "us") is committed to protecting your privacy. This Privacy
                    Policy outlines how we collect, use, store, share, and
                    protect your personal information in accordance with the
                    Protection of Personal Information Act (POPIA) and
                    applicable South African law.
                  </p>
                  <p>
                    By accessing or using any part of the ReBooked platform,
                    including ReBooked Campus, you consent to the collection and
                    processing of your personal information as outlined in this
                    Policy. If you do not agree, please refrain from using the
                    platform.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-gray-900 mb-3">
                    2. Scope of the Policy
                  </h2>
                  <p>
                    This Privacy Policy applies to all visitors, users, and
                    account holders of ReBooked Solutions. It covers information
                    collected through our main marketplace, ReBooked Campus, our
                    communication tools, analytics systems, and any third-party
                    integrations we use.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-gray-900 mb-3">
                    3. What Information We Collect
                  </h2>
                  <p className="mb-4">
                    We collect personal information that is necessary to provide
                    our services and ensure platform security. This includes,
                    but is not limited to:
                  </p>

                  <div className="space-y-3">
                    <p>
                      <strong>Identification and contact information:</strong>{" "}
                      full name, email address, phone number, and optionally
                      your school or university.
                    </p>

                    <p>
                      <strong>Account credentials:</strong> hashed passwords and
                      login activity.
                    </p>

                    <p>
                      <strong>Listing and transaction data:</strong> books or
                      items listed, viewed, sold, or purchased.
                    </p>

                    <p>
                      <strong>Delivery information:</strong> shipping address,
                      courier tracking data, and delivery preferences.
                    </p>

                    <p>
                      <strong>Payment-related information:</strong> payout
                      details or payment references, collected and processed
                      securely through trusted third-party providers like
                      Paystack.
                    </p>

                    <p>
                      <strong>Educational data:</strong> input used in APS
                      calculators, study tips submitted, bursary tools used, and
                      program searches within ReBooked Campus.
                    </p>

                    <p>
                      <strong>Technical and usage data:</strong> IP address,
                      browser type, device info, time on page, actions
                      performed, and referral source.
                    </p>

                    <p>
                      <strong>Communication data:</strong> messages sent to our
                      support email, helpdesk forms, or via any integrated chat
                      or contact system.
                    </p>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-gray-900 mb-3">
                    4. How We Collect Your Information
                  </h2>
                  <p className="mb-4">
                    We collect personal information directly from you when you
                    create an account, submit forms, list items, browse
                    educational resources, or communicate with us.
                  </p>
                  <p className="mb-4">
                    We also collect certain data automatically through cookies,
                    server logs, analytics tools, and browser-based tracking,
                    which help us improve the platform and detect suspicious
                    activity.
                  </p>
                  <p>
                    Where applicable, we may collect information from
                    third-party services you interact with through our platform,
                    such as payment providers or delivery companies.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-gray-900 mb-3">
                    5. How We Use Your Information
                  </h2>
                  <p className="mb-2">
                    We use your information for the following lawful purposes:
                  </p>
                  <ul className="list-disc pl-6 space-y-1 mb-4">
                    <li>To register and manage your account.</li>
                    <li>
                      To facilitate the listing, browsing, and sale of books and
                      other goods.
                    </li>
                    <li>To enable communication between buyers and sellers.</li>
                    <li>To coordinate with courier services for deliveries.</li>
                    <li>
                      To display and improve ReBooked Campus resources,
                      including APS tools, bursary data, and university
                      programs.
                    </li>
                    <li>
                      To send important notifications, alerts, and updates
                      related to your account, listings, or educational tools.
                    </li>
                    <li>
                      To respond to user queries and provide customer support.
                    </li>
                    <li>
                      To analyse user behaviour and improve platform
                      performance, reliability, and security.
                    </li>
                    <li>
                      To enforce our terms and conditions and protect against
                      fraud, abuse, or policy violations.
                    </li>
                    <li>
                      To comply with South African legal obligations, such as
                      tax, consumer protection, or data protection laws.
                    </li>
                  </ul>
                  <p>
                    We will only use your personal information for the purpose
                    it was collected, unless we reasonably believe another
                    purpose is compatible or we obtain your further consent.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-gray-900 mb-3">
                    6. Sharing of Information
                  </h2>
                  <p className="mb-4">
                    We do not sell, lease, or rent your personal information to
                    any third parties.
                  </p>
                  <p className="mb-2">
                    However, we may share your personal data under strict
                    conditions with:
                  </p>
                  <ul className="list-disc pl-6 space-y-1 mb-4">
                    <li>
                      Third-party service providers who help operate the
                      platform, such as our database host (Supabase), web host
                      (Vercel), or analytics partners.
                    </li>
                    <li>
                      Courier companies for fulfilling delivery instructions and
                      providing tracking updates.
                    </li>
                    <li>
                      Payment processors like Paystack for secure handling of
                      funds, subject to their own privacy and security
                      frameworks.
                    </li>
                    <li>
                      Legal or regulatory authorities if required by law, court
                      order, subpoena, or in the defence of legal claims.
                    </li>
                    <li>
                      Technical advisors or consultants strictly for internal
                      compliance, audits, or security reviews.
                    </li>
                  </ul>
                  <p>
                    All third parties are contractually required to treat your
                    data with confidentiality and to use it only for the
                    intended service delivery purpose.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-gray-900 mb-3">
                    7. Cookies and Tracking
                  </h2>
                  <p className="mb-4">
                    ReBooked Solutions uses cookies and similar technologies to
                    improve user experience, maintain security, and analyse
                    platform usage.
                  </p>
                  <p>
                    These cookies may track session duration, device
                    information, login behaviour, and referral sources. You can
                    disable cookies in your browser settings, but this may limit
                    some functionality on our website.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-gray-900 mb-3">
                    8. Data Security
                  </h2>
                  <p className="mb-4">
                    We implement industry-standard technical and organisational
                    measures to protect your personal data. These include secure
                    password hashing, role-based access control, encrypted
                    storage, audit logging, and real-time threat monitoring.
                  </p>
                  <p>
                    While we make every effort to safeguard your data, no method
                    of digital transmission or storage is completely secure. Use
                    of the platform is at your own risk, and you acknowledge
                    that absolute security cannot be guaranteed.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-gray-900 mb-3">
                    9. Data Retention
                  </h2>
                  <p className="mb-4">
                    We retain personal information only as long as necessary to
                    fulfil the purposes outlined in this Policy or as required
                    by law. When your information is no longer required, it is
                    securely deleted or anonymised.
                  </p>
                  <p>
                    You may request deletion of your data by contacting
                    support@rebookedsolutions.co.za. However, we may retain
                    certain information if required for legal compliance, fraud
                    prevention, dispute resolution, or transaction history.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-gray-900 mb-3">
                    10. User Rights Under POPIA
                  </h2>
                  <p className="mb-2">
                    Under South African data protection law, you have the
                    following rights:
                  </p>
                  <ul className="list-disc pl-6 space-y-1 mb-4">
                    <li>
                      The right to be informed about how your personal data is
                      collected and used.
                    </li>
                    <li>
                      The right to access the personal data we hold about you.
                    </li>
                    <li>
                      The right to request correction or deletion of your
                      personal information.
                    </li>
                    <li>
                      The right to object to processing or withdraw consent
                      where applicable.
                    </li>
                    <li>
                      The right to lodge a complaint with the Information
                      Regulator.
                    </li>
                  </ul>
                  <p>
                    To exercise any of these rights, please contact
                    support@rebookedsolutions.co.za. We may require proof of
                    identity before processing any request.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-gray-900 mb-3">
                    11. Children's Privacy
                  </h2>
                  <p>
                    Our platform is not intended for users under the age of 16
                    without parental or guardian consent. If we learn that we
                    have collected information from a child without proper
                    authorisation, we will take steps to delete it promptly.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-gray-900 mb-3">
                    12. Third-Party Links
                  </h2>
                  <p>
                    Our site may contain links to third-party websites,
                    services, or bursary programs. Once you leave our domain, we
                    are not responsible for the privacy practices, content, or
                    accuracy of those third-party sites. You access them at your
                    own risk.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-gray-900 mb-3">
                    13. International Transfers
                  </h2>
                  <p>
                    Although we are based in South Africa, some of our service
                    providers (e.g., hosting or email services) may process data
                    in foreign jurisdictions. We take reasonable steps to ensure
                    that all data transfers are compliant with South African
                    data protection laws and subject to adequate safeguards.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-gray-900 mb-3">
                    14. Policy Updates
                  </h2>
                  <p>
                    We reserve the right to update this Privacy Policy at any
                    time. Material changes will be announced on the platform.
                    Continued use after such changes implies your acceptance of
                    the revised terms.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-gray-900 mb-3">
                    15. Contact Us
                  </h2>
                  <p className="mb-4">
                    If you have any questions, requests, or concerns regarding
                    your personal information or this Privacy Policy, please
                    contact:
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-700">
                      <strong>ReBooked Solutions (Pty) Ltd</strong>
                      <br />
                      📧 Email: support@rebookedsolutions.co.za
                      <br />
                      📍 Based in the Republic of South Africa
                    </p>
                  </div>
                </section>
              </div>
            </ScrollArea>
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

export default Privacy;
