import React from "react";
import DeploymentTroubleshooting from "@/components/DeploymentTroubleshooting";
import Footer from "@/components/Footer";

const DeploymentHelp: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="py-8">
        <DeploymentTroubleshooting />
      </main>
      <Footer />
    </div>
  );
};

export default DeploymentHelp;
