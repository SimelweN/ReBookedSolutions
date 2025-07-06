import React from "react";
import Layout from "@/components/Layout";
import DeprecatedCheckoutNotice from "@/components/DeprecatedCheckoutNotice";
import SEO from "@/components/SEO";

const Checkout: React.FC = () => {
  return (
    <Layout>
      <SEO
        title="Checkout Updated - ReBooked Solutions"
        description="Our checkout system has been updated for a better experience"
        keywords="checkout, purchase, books, textbooks"
      />
      <DeprecatedCheckoutNotice />
    </Layout>
  );
};

export default Checkout;
