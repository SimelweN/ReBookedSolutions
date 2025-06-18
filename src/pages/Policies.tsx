import { useState } from "react";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Scale, Shield, Mail } from "lucide-react";

const Policies = () => {
  const [activeTab, setActiveTab] = useState("privacy");

  return (
    <Layout>
      <SEO
        title="Policies & Terms | ReBooked Solutions"
        description="Complete policy documentation for ReBooked Solutions - Privacy Policy and Terms and Conditions."
        keywords="policies, terms, privacy, POPIA, consumer protection, ReBooked Solutions"
      />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ReBooked Solutions – Platform Policies
          </h1>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4 max-w-4xl mx-auto">
            <p className="text-blue-800 text-sm">
              <strong>Effective Date:</strong> 10 June 2025 <br />
              <strong>Platform:</strong> www.rebookedsolutions.co.za <br />
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
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-7 gap-1 mb-8">
            <TabsTrigger value="privacy" className="text-xs sm:text-sm">
              <Shield className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Privacy Policy
            </TabsTrigger>
            <TabsTrigger value="terms" className="text-xs sm:text-sm">
              <Scale className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Terms & Conditions
            </TabsTrigger>
            <TabsTrigger value="refunds" className="text-xs sm:text-sm">
              Refund Policy
            </TabsTrigger>
            <TabsTrigger value="cancellation" className="text-xs sm:text-sm">
              Cancellation Policy
            </TabsTrigger>
            <TabsTrigger value="shipping" className="text-xs sm:text-sm">
              Shipping & Delivery
            </TabsTrigger>
            <TabsTrigger value="returns" className="text-xs sm:text-sm">
              Return Policy
            </TabsTrigger>
            <TabsTrigger value="disputes" className="text-xs sm:text-sm">
              Dispute Resolution
            </TabsTrigger>
          </TabsList>

          {/* Privacy Policy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl flex items-center gap-2">
                  <Shield className="h-8 w-8" />
                  Privacy Policy
                </CardTitle>
                <p className="text-gray-600">
                  Effective Date: 10 June 2025 | Platform:
                  www.rebookedsolutions.co.za | Operator: ReBooked Solutions
                  (Pty) Ltd | Contact: support@rebookedsolutions.co.za |
                  Jurisdiction: Republic of South Africa
                </p>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none space-y-6">
                  <section>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      1. Introduction
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      ReBooked Solutions (Pty) Ltd ("ReBooked", "we", "our", or
                      "us") is committed to protecting your privacy. This
                      Privacy Policy outlines how we collect, use, store, share,
                      and protect your personal information in accordance with
                      the Protection of Personal Information Act (POPIA) and
                      applicable South African law.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      By accessing or using any part of the ReBooked platform,
                      including ReBooked Campus, you consent to the collection
                      and processing of your personal information as outlined in
                      this Policy. If you do not agree, please refrain from
                      using the platform.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      2. Scope of the Policy
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      This Privacy Policy applies to all visitors, users, and
                      account holders of ReBooked Solutions. It covers
                      information collected through our main marketplace,
                      ReBooked Campus, our communication tools, analytics
                      systems, and any third-party integrations we use.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      3. What Information We Collect
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      We collect personal information that is necessary to
                      provide our services and ensure platform security. This
                      includes, but is not limited to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-700">
                      <li>
                        <strong>Identification and contact information:</strong>{" "}
                        full name, email address, phone number, and optionally
                        your school or university.
                      </li>
                      <li>
                        <strong>Account credentials:</strong> hashed passwords
                        and login activity.
                      </li>
                      <li>
                        <strong>Listing and transaction data:</strong> books or
                        items listed, viewed, sold, or purchased.
                      </li>
                      <li>
                        <strong>Delivery information:</strong> shipping address,
                        courier tracking data, and delivery preferences.
                      </li>
                      <li>
                        <strong>Payment-related information:</strong> payout
                        details or payment references, collected and processed
                        securely through trusted third-party providers like
                        Paystack.
                      </li>
                      <li>
                        <strong>Educational data:</strong> input used in APS
                        calculators, study tips submitted, bursary tools used,
                        and program searches within ReBooked Campus.
                      </li>
                      <li>
                        <strong>Technical and usage data:</strong> IP address,
                        browser type, device info, time on page, actions
                        performed, and referral source.
                      </li>
                      <li>
                        <strong>Communication data:</strong> messages sent to
                        our support email, helpdesk forms, or via any integrated
                        chat or contact system.
                      </li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      4. How We Collect Your Information
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      We collect personal information directly from you when you
                      create an account, submit forms, list items, browse
                      educational resources, or communicate with us.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      We also collect certain data automatically through
                      cookies, server logs, analytics tools, and browser-based
                      tracking, which help us improve the platform and detect
                      suspicious activity.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      Where applicable, we may collect information from
                      third-party services you interact with through our
                      platform, such as payment providers or delivery companies.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      5. How We Use Your Information
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      We use your information for the following lawful purposes:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-700">
                      <li>To register and manage your account.</li>
                      <li>
                        To facilitate the listing, browsing, and sale of books
                        and other goods.
                      </li>
                      <li>
                        To enable communication between buyers and sellers.
                      </li>
                      <li>
                        To coordinate with courier services for deliveries.
                      </li>
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
                    <p className="text-gray-700 leading-relaxed">
                      We will only use your personal information for the purpose
                      it was collected, unless we reasonably believe another
                      purpose is compatible or we obtain your further consent.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      6. Sharing of Information
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      We do not sell, lease, or rent your personal information
                      to any third parties. However, we may share your personal
                      data under strict conditions with:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-700">
                      <li>
                        Third-party service providers who help operate the
                        platform, such as our database host (Supabase), web host
                        (Vercel), or analytics partners.
                      </li>
                      <li>
                        Courier companies for fulfilling delivery instructions
                        and providing tracking updates.
                      </li>
                      <li>
                        Payment processors like Paystack for secure handling of
                        funds, subject to their own privacy and security
                        frameworks.
                      </li>
                      <li>
                        Legal or regulatory authorities if required by law,
                        court order, subpoena, or in the defence of legal
                        claims.
                      </li>
                      <li>
                        Technical advisors or consultants strictly for internal
                        compliance, audits, or security reviews.
                      </li>
                    </ul>
                    <p className="text-gray-700 leading-relaxed">
                      All third parties are contractually required to treat your
                      data with confidentiality and to use it only for the
                      intended service delivery purpose.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      7. Cookies and Tracking
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      ReBooked Solutions uses cookies and similar technologies
                      to improve user experience, maintain security, and analyse
                      platform usage.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      These cookies may track session duration, device
                      information, login behaviour, and referral sources. You
                      can disable cookies in your browser settings, but this may
                      limit some functionality on our website.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      8. Data Security
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      We implement industry-standard technical and
                      organisational measures to protect your personal data.
                      These include secure password hashing, role-based access
                      control, encrypted storage, audit logging, and real-time
                      threat monitoring.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      While we make every effort to safeguard your data, no
                      method of digital transmission or storage is completely
                      secure. Use of the platform is at your own risk, and you
                      acknowledge that absolute security cannot be guaranteed.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      9. Data Retention
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      We retain personal information only as long as necessary
                      to fulfil the purposes outlined in this Policy or as
                      required by law. When your information is no longer
                      required, it is securely deleted or anonymised.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      You may request deletion of your data by contacting
                      support@rebookedsolutions.co.za. However, we may retain
                      certain information if required for legal compliance,
                      fraud prevention, dispute resolution, or transaction
                      history.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      10. User Rights Under POPIA
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      Under South African data protection law, you have the
                      following rights:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-700">
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
                    <p className="text-gray-700 leading-relaxed">
                      To exercise any of these rights, please contact
                      support@rebookedsolutions.co.za. We may require proof of
                      identity before processing any request.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      11. Children's Privacy
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      Our platform is not intended for users under the age of 16
                      without parental or guardian consent. If we learn that we
                      have collected information from a child without proper
                      authorisation, we will take steps to delete it promptly.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      12. Third-Party Links
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      Our site may contain links to third-party websites,
                      services, or bursary programs. Once you leave our domain,
                      we are not responsible for the privacy practices, content,
                      or accuracy of those third-party sites. You access them at
                      your own risk.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      13. International Transfers
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      Although we are based in South Africa, some of our service
                      providers (e.g., hosting or email services) may process
                      data in foreign jurisdictions. We take reasonable steps to
                      ensure that all data transfers are compliant with South
                      African data protection laws and subject to adequate
                      safeguards.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      14. Policy Updates
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      We reserve the right to update this Privacy Policy at any
                      time. Material changes will be announced on the platform.
                      Continued use after such changes implies your acceptance
                      of the revised terms.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      15. Contact Us
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      If you have any questions, requests, or concerns regarding
                      your personal information or this Privacy Policy, please
                      contact:
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-3">
                      <p className="text-blue-800">
                        <strong>ReBooked Solutions (Pty) Ltd</strong>
                        <br />
                        ■ Email: support@rebookedsolutions.co.za
                        <br />■ Based in the Republic of South Africa
                      </p>
                    </div>
                  </section>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Terms & Conditions Tab */}
          <TabsContent value="terms" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl flex items-center gap-2">
                  <Scale className="h-8 w-8" />
                  Terms and Conditions of Use
                </CardTitle>
                <p className="text-gray-600">
                  Effective Date: 10 June 2025 | Platform Operator: ReBooked
                  Solutions (Pty) Ltd | Email: support@rebookedsolutions.co.za |
                  Jurisdiction: Republic of South Africa
                </p>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-3">
                  <p className="text-amber-800 text-sm">
                    <strong>Governing Laws:</strong>
                    <br />
                    Consumer Protection Act (CPA) No. 68 of 2008
                    <br />
                    Electronic Communications and Transactions Act (ECTA) No. 25
                    of 2002
                    <br />
                    Protection of Personal Information Act (POPIA) No. 4 of 2013
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none space-y-6">
                  <section>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      1. INTRODUCTION
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      Welcome to ReBooked Solutions. These Terms and Conditions
                      ("Terms") are a legally binding agreement between you and
                      ReBooked Solutions (Pty) Ltd ("ReBooked", "we", "us", or
                      "our"). They govern your access to and use of our
                      platform, services, and content. If you do not agree to
                      these Terms, you must cease all use of our services
                      immediately.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      By using the Platform, you confirm that you understand and
                      agree to these Terms, our policies (including but not
                      limited to Refund, Return, Shipping, and Dispute
                      policies), and our Privacy Policy. You accept all risks
                      associated with using a peer-to-peer resale platform and
                      accept that ReBooked Solutions is not a party to any sale
                      of goods between users.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      2. DEFINITIONS
                    </h3>
                    <ul className="list-disc pl-6 space-y-2 text-gray-700">
                      <li>
                        <strong>"Platform"</strong> refers to the website
                        www.rebookedsolutions.co.za, including all services,
                        features, and content available therein.
                      </li>
                      <li>
                        <strong>"User"</strong> or "you" refers to any
                        individual or entity who accesses or uses the Platform,
                        whether as a buyer, seller, or visitor.
                      </li>
                      <li>
                        <strong>"ReBooked Campus"</strong> refers to the
                        informational and educational segment of the Platform
                        offering academic resources, university data, APS tools,
                        bursary listings, blog posts, and study tips.
                      </li>
                      <li>
                        <strong>"Content"</strong> includes any text, images,
                        documents, posts, data, links, files, or other materials
                        submitted, posted, or displayed by users.
                      </li>
                      <li>
                        <strong>"Third Party"</strong> refers to any entity or
                        service provider that is not owned or directly
                        controlled by ReBooked Solutions.
                      </li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      3. PLATFORM NATURE & DISCLAIMER OF RESPONSIBILITY
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      ReBooked Solutions is an online marketplace and academic
                      resource platform. We do not buy, own, stock, or sell any
                      books or physical goods listed by users. All transactions
                      are conducted directly between buyers and sellers.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      We provide a digital venue and payment integration only.
                      We make no warranties regarding the suitability, safety,
                      legality, or quality of items listed, nor the credibility
                      of sellers or accuracy of ReBooked Campus information. All
                      users transact at their own risk.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      We are not liable for:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-700">
                      <li>
                        Misleading listings or undisclosed book conditions
                      </li>
                      <li>Counterfeit, plagiarised, or illegal goods</li>
                      <li>Non-performance or breach by any user</li>
                      <li>Courier or delivery delays</li>
                      <li>Failed payments or chargebacks</li>
                      <li>Errors in educational or institutional data</li>
                    </ul>
                    <p className="text-gray-700 leading-relaxed">
                      You acknowledge that ReBooked is not a party to any
                      contract for sale formed between users, nor are we agents
                      of any buyer or seller.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      4. USER ELIGIBILITY
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      By using the Platform, you warrant that:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-700">
                      <li>
                        You are 18 years or older, or have consent from a
                        parent/guardian.
                      </li>
                      <li>
                        You are not prohibited under South African law from
                        using online marketplaces.
                      </li>
                      <li>
                        You are providing accurate and lawful personal and
                        payment information.
                      </li>
                      <li>
                        You accept full legal responsibility for all activities
                        under your account.
                      </li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      5. USER ACCOUNT RESPONSIBILITIES
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      <strong>5.1</strong> Each user is responsible for
                      maintaining the confidentiality and accuracy of their
                      account information. You must not share your password or
                      allow anyone else to access your account.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      <strong>5.2</strong> You are liable for all actions
                      performed through your account, including fraud,
                      unauthorised sales, or misrepresentations. ReBooked
                      disclaims all liability for unauthorised access due to
                      user negligence.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      <strong>5.3</strong> ReBooked reserves the right to
                      suspend or permanently terminate any user account at any
                      time for:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-700">
                      <li>Violating these Terms</li>
                      <li>Posting harmful, misleading, or illegal content</li>
                      <li>Attempting to circumvent platform systems or fees</li>
                      <li>Using the platform to deceive or defraud others</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      6. TRANSACTIONS, FEES, AND PAYMENTS
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      <strong>6.1</strong> All payments are facilitated through
                      trusted third-party payment processors (e.g., Paystack).
                      ReBooked does not store credit card information or process
                      payments internally.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      <strong>6.2</strong> ReBooked charges a 10% service fee
                      per successful transaction. This fee is automatically
                      deducted before payouts are made to sellers.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      <strong>6.3</strong> We are not liable for:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-700">
                      <li>Failed or delayed payments</li>
                      <li>Withdrawal issues due to incorrect bank details</li>
                      <li>Currency conversion or third-party bank fees</li>
                    </ul>
                    <p className="text-gray-700 leading-relaxed">
                      Sellers are solely responsible for compliance with SARS or
                      tax reporting requirements.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      7. SHIPPING, DELIVERY, RETURNS, AND REFUNDS
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      All buyers and sellers agree to abide by ReBooked's:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-700">
                      <li>Refund Policy</li>
                      <li>Return Policy</li>
                      <li>Shipping Policy</li>
                      <li>Cancellation Policy</li>
                      <li>Dispute Resolution Policy</li>
                    </ul>
                    <p className="text-gray-700 leading-relaxed">
                      These policies are incorporated by reference and
                      enforceable as part of these Terms.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      You acknowledge that:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-700">
                      <li>ReBooked does not ship or handle physical goods.</li>
                      <li>
                        ReBooked is not liable for lost, stolen, delayed, or
                        damaged packages.
                      </li>
                      <li>
                        Return disputes are handled between buyer and seller,
                        with ReBooked only providing a non-binding mediation
                        role.
                      </li>
                      <li>
                        Refunds are not guaranteed unless supported by clear
                        evidence and governed under our published policies.
                      </li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      8. REBOOKED CAMPUS TERMS
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      <strong>8.1</strong> ReBooked Campus offers informational
                      academic resources such as:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-700">
                      <li>APS calculation tools</li>
                      <li>Bursary listings</li>
                      <li>University program data</li>
                      <li>Application advice</li>
                      <li>Sponsor or affiliate content</li>
                    </ul>
                    <p className="text-gray-700 leading-relaxed">
                      <strong>8.2</strong> All content in ReBooked Campus is
                      provided "as-is" for informational purposes only. We do
                      not:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-700">
                      <li>
                        Guarantee data accuracy (APS scores, deadlines, etc.)
                      </li>
                      <li>
                        Represent any university or financial aid provider
                      </li>
                      <li>Guarantee bursary outcomes or funding</li>
                      <li>
                        Accept liability for decisions made based on this
                        information
                      </li>
                    </ul>
                    <p className="text-gray-700 leading-relaxed">
                      Users must verify all information directly with the
                      official institution or funding body. ReBooked accepts no
                      responsibility for missed deadlines, incorrect
                      submissions, or misinterpreted content.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      9. USER CONTENT AND CONDUCT
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      Users must not upload, post, or distribute any content
                      that is:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-700">
                      <li>False, deceptive, or misleading</li>
                      <li>Offensive, defamatory, racist, or abusive</li>
                      <li>Infringing on intellectual property or copyright</li>
                      <li>
                        Illegal or in violation of applicable academic codes
                      </li>
                    </ul>
                    <p className="text-gray-700 leading-relaxed">
                      We may remove content and/or suspend users without notice.
                      ReBooked is not liable for third-party or user-generated
                      content hosted on the Platform.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      10. INTELLECTUAL PROPERTY
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      All content, tools, design elements, software, and
                      branding related to ReBooked Solutions are the property of
                      ReBooked Solutions (Pty) Ltd unless otherwise stated. This
                      includes, but is not limited to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-700">
                      <li>The APS Calculator</li>
                      <li>The ReBooked Campus interface</li>
                      <li>Study materials and guides</li>
                      <li>Custom icons, logos, and user interfaces</li>
                    </ul>
                    <p className="text-gray-700 leading-relaxed">
                      No part of the Platform may be copied, distributed, sold,
                      modified, reverse-engineered, or reused without express
                      written permission.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      11. DISCLAIMERS AND LIMITATION OF LIABILITY
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      <strong>
                        TO THE MAXIMUM EXTENT PERMITTED UNDER SOUTH AFRICAN LAW:
                      </strong>
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-700">
                      <li>
                        ReBooked Solutions disclaims all warranties, express or
                        implied, including merchantability, title, fitness for
                        purpose, or non-infringement.
                      </li>
                      <li>
                        We are not liable for any losses (direct or indirect),
                        loss of data, opportunity, profit, goodwill, or personal
                        injury caused by use of the Platform.
                      </li>
                      <li>
                        We are not liable for third-party actions, including
                        users, payment providers, couriers, institutions, or
                        advertisers.
                      </li>
                      <li>
                        Use of ReBooked Campus is at your sole risk, and no
                        guarantees are made regarding academic success or
                        institutional acceptance.
                      </li>
                      <li>
                        ReBooked shall never be liable for damages exceeding the
                        total amount of platform fees earned from the specific
                        transaction in dispute.
                      </li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      12. INDEMNITY
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      You agree to fully indemnify and hold harmless ReBooked
                      Solutions (Pty) Ltd, its directors, employees, agents, and
                      service providers against any claims, liabilities,
                      damages, losses, fines, legal fees, or costs arising from:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-700">
                      <li>Your use or misuse of the Platform</li>
                      <li>Your breach of these Terms</li>
                      <li>Your violation of any third-party rights</li>
                      <li>Your inaccurate or fraudulent content</li>
                      <li>
                        Disputes arising from your transactions, listings, or
                        communications
                      </li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      13. TERMINATION
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      ReBooked may, at its sole discretion and without notice:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-700">
                      <li>Suspend or permanently ban your account</li>
                      <li>Remove or block content</li>
                      <li>Deny platform access</li>
                      <li>Pursue civil or criminal action</li>
                    </ul>
                    <p className="text-gray-700 leading-relaxed">
                      Termination does not limit our right to recover unpaid
                      fees or enforce indemnity.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      14. GOVERNING LAW AND JURISDICTION
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      These Terms are governed by the laws of the Republic of
                      South Africa. You agree that:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-700">
                      <li>
                        Any dispute shall first be submitted to ReBooked's
                        internal dispute resolution process.
                      </li>
                      <li>
                        Unresolved matters may be referred to the Consumer Goods
                        and Services Ombud (CGSO) or the National Consumer
                        Commission.
                      </li>
                      <li>
                        Jurisdiction lies with the courts of South Africa, and
                        all legal notices must be served to the registered
                        address of ReBooked Solutions (Pty) Ltd.
                      </li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      15. AMENDMENTS
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      We reserve the right to amend these Terms at any time.
                      Updates will be posted on the Platform, and your continued
                      use after such changes constitutes your acceptance.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      16. CONTACT INFORMATION
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      For all support, legal, or general inquiries:
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-3">
                      <p className="text-blue-800">
                        ■ support@rebookedsolutions.co.za
                        <br />■ ReBooked Solutions (Pty) Ltd – Registered in
                        South Africa
                      </p>
                    </div>
                  </section>
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
