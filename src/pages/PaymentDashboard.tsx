/**
 * Payment dashboard has been moved to the payment subdomain.
 * Users are now redirected to https://payment.rebookedsolutions.co.za
 */

import React from "react";
import { Navigate } from "react-router-dom";

const PaymentDashboard: React.FC = () => {
  // Redirect to payment subdomain if someone tries to access this page directly
  window.location.href = "https://payment.rebookedsolutions.co.za/dashboard";
  return <Navigate to="/" replace />;
};

export default PaymentDashboard;
