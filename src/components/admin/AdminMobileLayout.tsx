import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Shield,
  TestTube,
  Users,
  BookOpen,
  Settings,
  ArrowLeft,
  Menu,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AdminMobileLayoutProps {
  title: string;
  children: React.ReactNode;
  showDevDashboard?: boolean;
}

const AdminMobileLayout: React.FC<AdminMobileLayoutProps> = ({
  title,
  children,
  showDevDashboard = true,
}) => {
  const navigate = useNavigate();

  const adminActions = [
    {
      label: "Admin Dashboard",
      icon: Shield,
      action: () => navigate("/admin"),
      current: title === "Admin Dashboard",
    },
    {
      label: "Dev Dashboard",
      icon: TestTube,
      action: () => navigate("/dev-dashboard"),
      current: title === "Development Dashboard",
    },
    {
      label: "User Management",
      icon: Users,
      action: () => navigate("/admin#users"),
      current: false,
    },
    {
      label: "Book Management",
      icon: BookOpen,
      action: () => navigate("/admin#books"),
      current: false,
    },
    {
      label: "Settings",
      icon: Settings,
      action: () => navigate("/admin#settings"),
      current: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b shadow-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              size="sm"
              className="h-9 w-9 p-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold truncate max-w-[200px]">
                {title.includes("Development") ? "Dev Dashboard" : title}
              </h1>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 w-9 p-0">
                <Menu className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Admin Tools</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {adminActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <DropdownMenuItem
                    key={index}
                    onClick={action.action}
                    className={action.current ? "bg-blue-50 text-blue-700" : ""}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {action.label}
                  </DropdownMenuItem>
                );
              })}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      <div className="pb-4">{children}</div>

      {/* Quick Actions Footer for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t p-3 md:hidden">
        <div className="flex items-center justify-between space-x-2">
          <Button
            variant={title.includes("Admin") ? "default" : "outline"}
            onClick={() => navigate("/admin")}
            size="sm"
            className="flex-1 text-xs"
          >
            <Shield className="h-3 w-3 mr-1" />
            Admin
          </Button>
          {showDevDashboard && (
            <Button
              variant={title.includes("Development") ? "default" : "outline"}
              onClick={() => navigate("/dev-dashboard")}
              size="sm"
              className="flex-1 text-xs"
            >
              <TestTube className="h-3 w-3 mr-1" />
              Dev
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            size="sm"
            className="flex-1 text-xs"
          >
            <ArrowLeft className="h-3 w-3 mr-1" />
            Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminMobileLayout;
