import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, RotateCcw, X, Truck, Scale, ArrowRight } from "lucide-react";

const Policies = () => {
  const policies = [
    {
      title: "Refund Policy",
      description:
        "Understand the circumstances under which refunds may be issued and your consumer rights under South African law.",
      icon: <FileText className="h-6 w-6" />,
      link: "/refund-policy",
      color: "bg-green-50 border-green-200 text-green-800",
    },
    {
      title: "Cancellation Policy",
      description:
        "Learn when and how buyers and sellers can cancel orders, including timeframes and consequences.",
      icon: <X className="h-6 w-6" />,
      link: "/cancellation-policy",
      color: "bg-red-50 border-red-200 text-red-800",
    },
    {
      title: "Shipping & Delivery Policy",
      description:
        "Complete information about shipping responsibilities, delivery timeframes, and courier procedures.",
      icon: <Truck className="h-6 w-6" />,
      link: "/shipping-delivery-policy",
      color: "bg-blue-50 border-blue-200 text-blue-800",
    },
    {
      title: "Returns & Disputes Policy",
      description:
        "Detailed return procedures and dispute resolution process, including external remedies and limitations.",
      icon: <Scale className="h-6 w-6" />,
      link: "/returns-disputes-policy",
      color: "bg-purple-50 border-purple-200 text-purple-800",
    },
  ];

  return (
    <Layout>
      <SEO
        title="Policies | ReBooked Solutions"
        description="Complete policy documentation for ReBooked Solutions - refunds, cancellations, shipping, returns, and dispute resolution."
        keywords="policies, terms, refunds, cancellations, shipping, returns, disputes, consumer protection"
      />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Our Policies
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive policy documentation to ensure transparent and fair
            transactions on our platform. All policies comply with South African
            consumer protection laws.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {policies.map((policy, index) => (
            <Card
              key={index}
              className="hover:shadow-lg transition-shadow duration-200"
            >
              <CardHeader>
                <div
                  className={`w-12 h-12 rounded-lg ${policy.color} flex items-center justify-center mb-4`}
                >
                  {policy.icon}
                </div>
                <CardTitle className="text-xl">{policy.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{policy.description}</p>
                <Link
                  to={policy.link}
                  className="inline-flex items-center text-book-600 hover:text-book-700 font-medium"
                >
                  Read Full Policy
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Key Information Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Key Information Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-green-600">5</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Report Issues
                </h4>
                <p className="text-sm text-gray-600">
                  Calendar days to report problems after delivery
                </p>
              </div>

              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-blue-600">14</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Maximum Delivery
                </h4>
                <p className="text-sm text-gray-600">
                  Business days for delivery after dispatch
                </p>
              </div>

              <div className="text-center">
                <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-purple-600">7</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Dispute Timeline
                </h4>
                <p className="text-sm text-gray-600">
                  Calendar days to submit formal disputes
                </p>
              </div>

              <div className="text-center">
                <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-orange-600">3</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Dispatch Window
                </h4>
                <p className="text-sm text-gray-600">
                  Business days for sellers to ship orders
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-book-50 border border-book-200 rounded-lg p-6">
              <h4 className="font-semibold text-book-800 mb-4">
                Contact Our Support Team
              </h4>
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
                    <strong>Resolution:</strong> 7-10 business days
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-book-200">
                <p className="text-sm text-book-600">
                  For policy-related questions, please reference the relevant
                  policy section and include your order number if applicable.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Policies;
