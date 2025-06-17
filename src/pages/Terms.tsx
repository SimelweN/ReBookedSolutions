
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Terms = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-book-800">Terms and Conditions</CardTitle>
            <p className="text-gray-600">Last updated: January 2025</p>
          </CardHeader>
          <CardContent className="prose prose-book max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-book-700 mb-4">1. Acceptance of Terms</h2>
              <p className="mb-4">
                By accessing and using Rebooked Solutions ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. This service is provided in <strong>South Africa</strong>, and is subject to South African law.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-book-700 mb-4">2. Use License</h2>
              <p className="mb-4">
                Permission is granted to temporarily use Rebooked Solutions for personal, non-commercial transitory viewing only. This includes:
              </p>
              <ul className="list-disc list-inside mb-4 ml-4">
                <li>Browsing available textbooks</li>
                <li>Creating listings for textbooks you own</li>
                <li>Purchasing textbooks from other users</li>
                <li>Communicating with other users through our platform</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-book-700 mb-4">3. User Accounts</h2>
              <p className="mb-4">
                To access certain features of the Service, you must create an account. You are responsible for:
              </p>
              <ul className="list-disc list-inside mb-4 ml-4">
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Providing accurate and complete information</li>
                <li>Updating your information to keep it current</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-book-700 mb-4">4. Marketplace Rules</h2>
              <h3 className="text-xl font-medium text-book-600 mb-2">For Sellers:</h3>
              <ul className="list-disc list-inside mb-4 ml-4">
                <li>You must own the textbooks you list</li>
                <li>Provide accurate descriptions and photos</li>
                <li>Honor all sales commitments</li>
                <li>Maintain reasonable response times</li>
              </ul>
              
              <h3 className="text-xl font-medium text-book-600 mb-2">For Buyers:</h3>
              <ul className="list-disc list-inside mb-4 ml-4">
                <li>Pay for purchases in a timely manner</li>
                <li>Inspect items upon receipt</li>
                <li>Report any issues within 48 hours</li>
                <li>Treat all users with respect</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-book-700 mb-4">5. Payments and Fees</h2>
              <p className="mb-4">
                Rebooked Solutions charges a 10% commission on all successful sales. This fee covers:
              </p>
              <ul className="list-disc list-inside mb-4 ml-4">
                <li>Platform maintenance and hosting</li>
                <li>Payment processing</li>
                <li>Customer support</li>
                <li>Security and fraud protection</li>
              </ul>
              <p className="mb-4">
                All payments are processed securely through Paystack. We do not store payment information on our servers.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-book-700 mb-4">6. Prohibited Uses</h2>
              <p className="mb-4">You may not use our service:</p>
              <ul className="list-disc list-inside mb-4 ml-4">
                <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
                <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
                <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                <li>To submit false or misleading information</li>
                <li>To upload or transmit viruses or any other type of malicious code</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-book-700 mb-4">7. Shipping and Returns</h2>
              <p className="mb-4">
                Shipping arrangements are made between buyers and sellers. Rebooked Solutions facilitates these transactions but is not responsible for:
              </p>
              <ul className="list-disc list-inside mb-4 ml-4">
                <li>Lost or damaged items during shipping</li>
                <li>Delays in delivery</li>
                <li>Disputes over item condition</li>
              </ul>
              <p className="mb-4">
                Returns are handled on a case-by-case basis. Contact our support team within 48 hours of receiving an item if you have concerns.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-book-700 mb-4">8. Privacy Policy</h2>
              <p className="mb-4">
                Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your information when you use our Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-book-700 mb-4">9. Disclaimers</h2>
              <p className="mb-4">
                The information on this website is provided on an "as is" basis. To the fullest extent permitted by law, Rebooked Solutions:
              </p>
              <ul className="list-disc list-inside mb-4 ml-4">
                <li>Excludes all representations and warranties relating to this website and its contents</li>
                <li>Does not warrant that the website will be constantly available or available at all</li>
                <li>Does not guarantee the accuracy of listings or user-provided information</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-book-700 mb-4">10. Limitations</h2>
              <p className="mb-4">
                In no event shall Rebooked Solutions or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Rebooked Solutions's website.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-book-700 mb-4">11. Governing Law</h2>
              <p className="mb-4">
                These terms and conditions are governed by and construed in accordance with the laws of South Africa, and you irrevocably submit to the exclusive jurisdiction of the courts in that state or location.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-book-700 mb-4">12. Changes to Terms</h2>
              <p className="mb-4">
                Rebooked Solutions reserves the right to revise these terms of service at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-book-700 mb-4">13. Contact Information</h2>
              <p className="mb-4">
                If you have any questions about these Terms and Conditions, please contact us through our support channels.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Terms;
