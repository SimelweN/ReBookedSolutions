/**
 * Payment callback handling has been moved to the payment subdomain.
 * Users are now redirected to https://payment.rebookedsolutions.co.za
 */

import React from "react";
import { Navigate } from "react-router-dom";

const PaymentCallback: React.FC = () => {
  // Redirect to home if someone tries to access this page directly
  return <Navigate to="/" replace />;
};

export default PaymentCallback;
