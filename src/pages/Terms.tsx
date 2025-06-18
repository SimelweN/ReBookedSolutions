import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Terms = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <SEO
        title="Terms and Conditions | ReBooked Solutions"
        description="Complete terms and conditions for ReBooked Solutions platform, governing laws, user rights, and legal obligations in South Africa."
        keywords="terms and conditions, legal, consumer protection act, POPIA, ECTA, South Africa"
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
              <FileText className="h-8 w-8" />
              Terms and Conditions
            </h1>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
              <p className="text-blue-800 text-sm">
                <strong>Effective Date:</strong> [Insert Date] <br />
                <strong>Platform Operator:</strong> ReBooked Solutions (Pty) Ltd{" "}
                <br />
                <strong>Email:</strong> support@rebookedsolutions.co.za <br />
                <strong>Jurisdiction:</strong> Republic of South Africa
              </p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              📜 TERMS AND CONDITIONS OF USE
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[800px] pr-4">
              <div className="prose prose-sm max-w-none space-y-6">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-semibold text-amber-800 mb-2">
                    Governing Laws:
                  </h3>
                  <ul className="text-amber-700 space-y-1">
                    <li>• Consumer Protection Act (CPA) No. 68 of 2008</li>
                    <li>
                      • Electronic Communications and Transactions Act (ECTA)
                      No. 25 of 2002
                    </li>
                    <li>
                      • Protection of Personal Information Act (POPIA) No. 4 of
                      2013
                    </li>
                  </ul>
                </div>

                <section>
                  <h2 className="text-xl font-bold text-gray-900 mb-3">
                    1. INTRODUCTION
                  </h2>
                  <p className="mb-4">
                    Welcome to ReBooked Solutions. These Terms and Conditions
                    ("Terms") are a legally binding agreement between you and
                    ReBooked Solutions (Pty) Ltd ("ReBooked", "we", "us", or
                    "our"). They govern your access to and use of our platform,
                    services, and content. If you do not agree to these Terms,
                    you must cease all use of our services immediately.
                  </p>
                  <p>
                    By using the Platform, you confirm that you understand and
                    agree to these Terms, our policies (including but not
                    limited to Refund, Return, Shipping, and Dispute policies),
                    and our Privacy Policy. You accept all risks associated with
                    using a peer-to-peer resale platform and accept that
                    ReBooked Solutions is not a party to any sale of goods
                    between users.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-gray-900 mb-3">
                    2. DEFINITIONS
                  </h2>
                  <div className="space-y-2">
                    <p>
                      <strong>"Platform"</strong> refers to the website
                      www.rebookedsolutions.co.za, including all services,
                      features, and content available therein.
                    </p>
                    <p>
                      <strong>"User"</strong> or <strong>"you"</strong> refers
                      to any individual or entity who accesses or uses the
                      Platform, whether as a buyer, seller, or visitor.
                    </p>
                    <p>
                      <strong>"ReBooked Campus"</strong> refers to the
                      informational and educational segment of the Platform
                      offering academic resources, university data, APS tools,
                      bursary listings, blog posts, and study tips.
                    </p>
                    <p>
                      <strong>"Content"</strong> includes any text, images,
                      documents, posts, data, links, files, or other materials
                      submitted, posted, or displayed by users.
                    </p>
                    <p>
                      <strong>"Third Party"</strong> refers to any entity or
                      service provider that is not owned or directly controlled
                      by ReBooked Solutions.
                    </p>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-gray-900 mb-3">
                    3. PLATFORM NATURE & DISCLAIMER OF RESPONSIBILITY
                  </h2>
                  <p className="mb-4">
                    ReBooked Solutions is an online marketplace and academic
                    resource platform. We do not buy, own, stock, or sell any
                    books or physical goods listed by users. All transactions
                    are conducted directly between buyers and sellers.
                  </p>
                  <p className="mb-4">
                    We provide a digital venue and payment integration only. We
                    make no warranties regarding the suitability, safety,
                    legality, or quality of items listed, nor the credibility of
                    sellers or accuracy of ReBooked Campus information. All
                    users transact at their own risk.
                  </p>
                  <p className="mb-2">We are not liable for:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Misleading listings or undisclosed book conditions</li>
                    <li>Counterfeit, plagiarised, or illegal goods</li>
                    <li>Non-performance or breach by any user</li>
                    <li>Courier or delivery delays</li>
                    <li>Failed payments or chargebacks</li>
                    <li>Errors in educational or institutional data</li>
                  </ul>
                  <p className="mt-4">
                    You acknowledge that ReBooked is not a party to any contract
                    for sale formed between users, nor are we agents of any
                    buyer or seller.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-gray-900 mb-3">
                    4. USER ELIGIBILITY
                  </h2>
                  <p className="mb-2">
                    By using the Platform, you warrant that:
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>
                      You are 18 years or older, or have consent from a
                      parent/guardian.
                    </li>
                    <li>
                      You are not prohibited under South African law from using
                      online marketplaces.
                    </li>
                    <li>
                      You are providing accurate and lawful personal and payment
                      information.
                    </li>
                    <li>
                      You accept full legal responsibility for all activities
                      under your account.
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-gray-900 mb-3">
                    5. USER ACCOUNT RESPONSIBILITIES
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">5.1</h3>
                      <p>
                        Each user is responsible for maintaining the
                        confidentiality and accuracy of their account
                        information. You must not share your password or allow
                        anyone else to access your account.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">5.2</h3>
                      <p>
                        You are liable for all actions performed through your
                        account, including fraud, unauthorised sales, or
                        misrepresentations. ReBooked disclaims all liability for
                        unauthorised access due to user negligence.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">5.3</h3>
                      <p className="mb-2">
                        ReBooked reserves the right to suspend or permanently
                        terminate any user account at any time for:
                      </p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Violating these Terms</li>
                        <li>Posting harmful, misleading, or illegal content</li>
                        <li>
                          Attempting to circumvent platform systems or fees
                        </li>
                        <li>Using the platform to deceive or defraud others</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-gray-900 mb-3">
                    6. TRANSACTIONS, FEES, AND PAYMENTS
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">6.1</h3>
                      <p>
                        All payments are facilitated through trusted third-party
                        payment processors (e.g., Paystack). ReBooked does not
                        store credit card information or process payments
                        internally.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">6.2</h3>
                      <p>
                        ReBooked charges a 10% service fee per successful
                        transaction. This fee is automatically deducted before
                        payouts are made to sellers.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">6.3</h3>
                      <p className="mb-2">We are not liable for:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Failed or delayed payments</li>
                        <li>Withdrawal issues due to incorrect bank details</li>
                        <li>Currency conversion or third-party bank fees</li>
                      </ul>
                      <p className="mt-2">
                        Sellers are solely responsible for compliance with SARS
                        or tax reporting requirements.
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-gray-900 mb-3">
                    7. SHIPPING, DELIVERY, RETURNS, AND REFUNDS
                  </h2>
                  <p className="mb-4">
                    All buyers and sellers agree to abide by ReBooked's:
                  </p>
                  <ul className="list-disc pl-6 space-y-1 mb-4">
                    <li>Refund Policy</li>
                    <li>Return Policy</li>
                    <li>Shipping Policy</li>
                    <li>Cancellation Policy</li>
                    <li>Dispute Resolution Policy</li>
                  </ul>
                  <p className="mb-4">
                    These policies are incorporated by reference and enforceable
                    as part of these Terms.
                  </p>
                  <p className="mb-2">You acknowledge that:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>ReBooked does not ship or handle physical goods.</li>
                    <li>
                      ReBooked is not liable for lost, stolen, delayed, or
                      damaged packages.
                    </li>
                    <li>
                      Return disputes are handled between buyer and seller, with
                      ReBooked only providing a non-binding mediation role.
                    </li>
                    <li>
                      Refunds are not guaranteed unless supported by clear
                      evidence and governed under our published policies.
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-gray-900 mb-3">
                    8. REBOOKED CAMPUS TERMS
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">8.1</h3>
                      <p className="mb-2">
                        ReBooked Campus offers informational academic resources
                        such as:
                      </p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>APS calculation tools</li>
                        <li>Bursary listings</li>
                        <li>University program data</li>
                        <li>Application advice</li>
                        <li>Sponsor or affiliate content</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">8.2</h3>
                      <p className="mb-2">
                        All content in ReBooked Campus is provided "as-is" for
                        informational purposes only. We do not:
                      </p>
                      <ul className="list-disc pl-6 space-y-1">
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
                      <p className="mt-2">
                        Users must verify all information directly with the
                        official institution or funding body. ReBooked accepts
                        no responsibility for missed deadlines, incorrect
                        submissions, or misinterpreted content.
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-gray-900 mb-3">
                    9. USER CONTENT AND CONDUCT
                  </h2>
                  <p className="mb-2">
                    Users must not upload, post, or distribute any content that
                    is:
                  </p>
                  <ul className="list-disc pl-6 space-y-1 mb-4">
                    <li>False, deceptive, or misleading</li>
                    <li>Offensive, defamatory, racist, or abusive</li>
                    <li>Infringing on intellectual property or copyright</li>
                    <li>
                      Illegal or in violation of applicable academic codes
                    </li>
                  </ul>
                  <p>
                    We may remove content and/or suspend users without notice.
                    ReBooked is not liable for third-party or user-generated
                    content hosted on the Platform.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-gray-900 mb-3">
                    10. INTELLECTUAL PROPERTY
                  </h2>
                  <p className="mb-4">
                    All content, tools, design elements, software, and branding
                    related to ReBooked Solutions are the property of ReBooked
                    Solutions (Pty) Ltd unless otherwise stated. This includes,
                    but is not limited to:
                  </p>
                  <ul className="list-disc pl-6 space-y-1 mb-4">
                    <li>The APS Calculator</li>
                    <li>The ReBooked Campus interface</li>
                    <li>Study materials and guides</li>
                    <li>Custom icons, logos, and user interfaces</li>
                  </ul>
                  <p>
                    No part of the Platform may be copied, distributed, sold,
                    modified, reverse-engineered, or reused without express
                    written permission.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-gray-900 mb-3">
                    11. DISCLAIMERS AND LIMITATION OF LIABILITY
                  </h2>
                  <p className="font-semibold mb-4">
                    TO THE MAXIMUM EXTENT PERMITTED UNDER SOUTH AFRICAN LAW:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
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
                  <h2 className="text-xl font-bold text-gray-900 mb-3">
                    12. INDEMNITY
                  </h2>
                  <p className="mb-2">
                    You agree to fully indemnify and hold harmless ReBooked
                    Solutions (Pty) Ltd, its directors, employees, agents, and
                    service providers against any claims, liabilities, damages,
                    losses, fines, legal fees, or costs arising from:
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
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
                  <h2 className="text-xl font-bold text-gray-900 mb-3">
                    13. TERMINATION
                  </h2>
                  <p className="mb-2">
                    ReBooked may, at its sole discretion and without notice:
                  </p>
                  <ul className="list-disc pl-6 space-y-1 mb-4">
                    <li>Suspend or permanently ban your account</li>
                    <li>Remove or block content</li>
                    <li>Deny platform access</li>
                    <li>Pursue civil or criminal action</li>
                  </ul>
                  <p>
                    Termination does not limit our right to recover unpaid fees
                    or enforce indemnity.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-gray-900 mb-3">
                    14. GOVERNING LAW AND JURISDICTION
                  </h2>
                  <p className="mb-2">
                    These Terms are governed by the laws of the Republic of
                    South Africa. You agree that:
                  </p>
                  <ul className="list-disc pl-6 space-y-1 mb-4">
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
                      Jurisdiction lies with the courts of South Africa, and all
                      legal notices must be served to the registered address of
                      ReBooked Solutions (Pty) Ltd.
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-gray-900 mb-3">
                    15. AMENDMENTS
                  </h2>
                  <p>
                    We reserve the right to amend these Terms at any time.
                    Updates will be posted on the Platform, and your continued
                    use after such changes constitutes your acceptance.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-gray-900 mb-3">
                    16. CONTACT INFORMATION
                  </h2>
                  <p className="mb-4">
                    For all support, legal, or general inquiries:
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-700">
                      📧 support@rebookedsolutions.co.za
                      <br />
                      📍 ReBooked Solutions (Pty) Ltd – Registered in South
                      Africa
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

export default Terms;
