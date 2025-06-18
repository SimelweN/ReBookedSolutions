import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Terms = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-redirect after 5 seconds
    const timer = setTimeout(() => {
      navigate("/policies");
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold text-book-800">
              Terms and Conditions
            </CardTitle>
            <p className="text-gray-600 text-sm sm:text-base">
              Page moved - redirecting you to our comprehensive policies
            </p>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-8 px-4 sm:px-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-red-700 mb-4">
                ⚠️ IMPORTANT NOTICE
              </h2>
              <p className="mb-4 text-red-800">
                <strong>This page has been moved!</strong> Our complete legal
                documentation is now consolidated into a comprehensive policies
                page that includes all Terms & Conditions, Privacy Policy,
                Refund Policy, Cancellation Policy, Shipping & Delivery Policy,
                and Returns & Disputes Policy.
              </p>
              <p className="mb-4 text-red-700">
                All policies comply with South African consumer protection laws
                (CPA, ECTA, POPIA) and provide detailed coverage of your rights
                and our platform responsibilities.
              </p>
              <a
                href="/policies"
                className="inline-flex items-center bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Go to Complete Policies & Terms →
              </a>
              <p className="text-sm text-red-600 mt-3">
                You will be automatically redirected in 5 seconds...
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-blue-700 mb-4">
                📍 Page Moved
              </h2>
              <p className="mb-4 text-blue-800">
                Our legal documentation has been consolidated into a
                comprehensive policies page for better user experience and legal
                compliance.
              </p>
              <p className="mb-4 text-blue-700">The new page includes:</p>
              <ul className="list-disc list-inside mb-4 ml-4 text-blue-700">
                <li>
                  <strong>Complete Terms & Conditions</strong> - 16
                  comprehensive sections
                </li>
                <li>
                  <strong>Privacy Policy</strong> - POPIA compliant
                </li>
                <li>
                  <strong>Refund Policy</strong> - Consumer Protection Act
                  compliant
                </li>
                <li>
                  <strong>Cancellation Policy</strong> - Buyer and seller
                  guidelines
                </li>
                <li>
                  <strong>Shipping & Delivery Policy</strong> - Courier
                  responsibilities
                </li>
                <li>
                  <strong>Returns & Disputes Policy</strong> - Resolution
                  procedures
                </li>
              </ul>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-green-700 mb-3">
                ✅ What's New:
              </h3>
              <ul className="list-disc list-inside text-green-700 space-y-2">
                <li>
                  Enhanced legal compliance with South African consumer
                  protection laws
                </li>
                <li>
                  Detailed platform liability limitations and user
                  responsibilities
                </li>
                <li>Comprehensive dispute resolution procedures</li>
                <li>Clear intellectual property protections</li>
                <li>Professional tabbed interface for easy navigation</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Terms;
