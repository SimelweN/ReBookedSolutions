/**
 * Payment dashboard functionality has been integrated into the user profile.
 * Redirect users to their profile page where they can view orders and transactions.
 */

import React from "react";
import { Navigate } from "react-router-dom";

const PaymentDashboard: React.FC = () => {
  // Redirect to user profile where payment/order information is available
  return <Navigate to="/profile" replace />;
};

export default PaymentDashboard;
