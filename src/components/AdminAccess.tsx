import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const AdminAccess = () => {
  const { profile, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Only show the Admin Access button if user is authenticated and is an admin
  if (!isAuthenticated || !isAdmin) {
    return null; // Don't render anything for non-admin users
  }

  const handleAdminAccess = () => {
    // Direct access to admin page for authenticated admin users
    navigate("/admin");
  };

  return (
    <Button
      onClick={handleAdminAccess}
      variant="outline"
      className="flex items-center hover:bg-book-100 min-h-[44px] touch-manipulation"
    >
      <Shield className="mr-2 h-4 w-4" />
      <span>Admin</span>
    </Button>
  );
};

export default AdminAccess;
