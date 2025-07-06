import React from "react";
import { useParams } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";

const SellerMarketplaceTest = () => {
  const { sellerId } = useParams<{ sellerId: string }>();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <h1 className="text-2xl font-bold mb-4">Seller Marketplace Test</h1>
            <p>Seller ID from URL: {sellerId}</p>
            <p>Route is working!</p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default SellerMarketplaceTest;
