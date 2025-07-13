import React from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import ToastDemo from "@/components/ToastDemo";

const ToastDemoPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Toast Demo - ReBooked</title>
        <meta
          name="description"
          content="Test the enhanced toast notification system"
        />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Toast Notification System
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Test and explore the enhanced toast notification system with
                rich content, actions, and specialized use cases for the
                ReBooked platform.
              </p>
            </div>

            <ToastDemo />
          </div>
        </main>
      </div>
    </>
  );
};

export default ToastDemoPage;
