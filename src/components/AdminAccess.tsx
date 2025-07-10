import { memo, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Shield, TestTube, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface AdminAccessProps {
  isMobile?: boolean;
  onMenuClose?: () => void;
}

const AdminAccess = ({ isMobile = false, onMenuClose }: AdminAccessProps) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();

  // Memoize the visibility logic to prevent unnecessary re-renders
  const shouldShowButton = useMemo(() => {
    return !isLoading && isAuthenticated && isAdmin;
  }, [isLoading, isAuthenticated, isAdmin]);

  // Early return with transition-friendly approach
  if (!shouldShowButton) {
    return null;
  }

  // Mobile view renders as simple links
  if (isMobile) {
    return (
      <>
        <Link
          to="/admin"
          className="flex items-center px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-book-600 rounded-md min-h-[44px]"
          onClick={onMenuClose}
        >
          <Shield className="w-5 h-5 mr-3" />
          Admin Dashboard
        </Link>
        <Link
          to="/dev-dashboard"
          className="flex items-center px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-book-600 rounded-md min-h-[44px]"
          onClick={onMenuClose}
        >
          <TestTube className="w-5 h-5 mr-3" />
          Development Dashboard
        </Link>
      </>
    );
  }

  // Desktop view with dropdown
  return (
    <div className="opacity-100 transition-opacity duration-200">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="flex items-center hover:bg-book-100 min-h-[44px] touch-manipulation transition-all duration-200"
          >
            <Shield className="mr-2 h-4 w-4" />
            <span>Admin</span>
            <ChevronDown className="ml-1 h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={() => navigate("/admin")}>
            <Shield className="mr-2 h-4 w-4" />
            Admin Dashboard
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate("/dev-dashboard")}>
            <TestTube className="mr-2 h-4 w-4" />
            Development Dashboard
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default memo(AdminAccess);
