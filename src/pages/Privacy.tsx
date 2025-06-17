import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Privacy = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-book-800">
              Privacy Policy
            </CardTitle>
            <p className="text-gray-600">Effective Date: May 25, 2025</p>
          </CardHeader>
          <CardContent className="prose prose-lg max-w-none">
            <p className="text-gray-700 mb-6">
              At Rebooked Solutions, we are committed to protecting your privacy
              and ensuring the security of your personal information. This
              Privacy Policy explains how we collect, use, and safeguard your
              data when you use our textbook marketplace platform.
            </p>

            <h2 className="text-2xl font-semibold text-book-800 mt-8 mb-4">
              Information We Collect
            </h2>

            <h3 className="text-xl font-semibold text-book-700 mt-6 mb-3">
              Personal Information
            </h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Name and contact information (email address)</li>
              <li>Account credentials and authentication data</li>
              <li>Profile information you choose to provide</li>
              <li>Communication preferences</li>
            </ul>

            <h3 className="text-xl font-semibold text-book-700 mt-6 mb-3">
              Book Listing Information
            </h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Book details (title, author, condition, price)</li>
              <li>Photos and descriptions of your textbooks</li>
              <li>Transaction history and sales data</li>
              <li>Communication with buyers and sellers</li>
            </ul>

            <h3 className="text-xl font-semibold text-book-700 mt-6 mb-3">
              Technical Information
            </h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Device information and browser type</li>
              <li>IP address and location data</li>
              <li>Usage patterns and app performance data</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>

            <h2 className="text-2xl font-semibold text-book-800 mt-8 mb-4">
              How We Use Your Information
            </h2>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Facilitate buying and selling of textbooks</li>
              <li>Process transactions and maintain account security</li>
              <li>Provide customer support and respond to inquiries</li>
              <li>
                Send important updates about your account and transactions
              </li>
              <li>Improve our platform and develop new features</li>
              <li>Prevent fraud and ensure platform safety</li>
              <li>Comply with legal obligations</li>
            </ul>

            <h2 className="text-2xl font-semibold text-book-800 mt-8 mb-4">
              Information Sharing
            </h2>
            <p className="mb-4">
              We do not sell, rent, or share your personal information with
              third parties except in the following circumstances:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>
                With other users when necessary for transactions (e.g., contact
                information for book pickup)
              </li>
              <li>With service providers who help us operate the platform</li>
              <li>When required by law or to protect our rights and safety</li>
              <li>In connection with a business transfer or merger</li>
              <li>With your explicit consent</li>
            </ul>

            <h2 className="text-2xl font-semibold text-book-800 mt-8 mb-4">
              Data Security
            </h2>
            <p className="mb-4">
              We implement appropriate technical and organizational measures to
              protect your personal information against unauthorized access,
              alteration, disclosure, or destruction. However, no method of
              transmission over the internet is 100% secure.
            </p>

            <h2 className="text-2xl font-semibold text-book-800 mt-8 mb-4">
              Your Rights
            </h2>
            <p className="mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Access and update your personal information</li>
              <li>Delete your account and associated data</li>
              <li>Opt out of non-essential communications</li>
              <li>Request a copy of your data</li>
              <li>Report privacy concerns to us</li>
            </ul>

            <h2 className="text-2xl font-semibold text-book-800 mt-8 mb-4">
              Cookies and Tracking
            </h2>
            <p className="mb-4">
              We use cookies and similar technologies to enhance your
              experience, remember your preferences, and analyze platform usage.
              You can control cookie settings through your browser preferences.
            </p>

            <h2 className="text-2xl font-semibold text-book-800 mt-8 mb-4">
              Eligibility and Children's Privacy
            </h2>
            <p className="mb-4">
              Rebooked Solutions is intended for users aged 18 and older. If you
              are under 18, you must obtain parental or legal guardian consent
              to use this platform. Rebooked Solutions does not encourage users
              under the age of 18 to sell or trade books.
            </p>
            <p className="mb-4">
              Our platform is not intended for users under 13 years of age. We
              do not knowingly collect personal information from children under
              13.
            </p>

            <h2 className="text-2xl font-semibold text-book-800 mt-8 mb-4">
              Changes to This Policy
            </h2>
            <p className="mb-4">
              We may update this Privacy Policy from time to time. We will
              notify users of significant changes through email or platform
              notifications.
            </p>

            <h2 className="text-2xl font-semibold text-book-800 mt-8 mb-4">
              Contact Us
            </h2>
            <p className="mb-4">
              If you have questions about this Privacy Policy or how we handle
              your data, please contact us at:
            </p>
            <p className="mb-2">
              <strong>Email:</strong>&nbsp;support@rebookedsolutions.co.za
            </p>
            <p className="mb-2">
              <strong>Address:</strong> Rebooked Solutions, Gauteng, South
              Africa
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Privacy;
