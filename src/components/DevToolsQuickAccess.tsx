import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Wrench, Bug, Activity, Settings, X, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const DevToolsQuickAccess: React.FC = () => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  // Only show in development mode
  if (!import.meta.env.DEV) {
    return null;
  }

  const quickActions = [
    {
      icon: Activity,
      label: "QA Dashboard",
      action: () => navigate("/qa"),
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      icon: Bug,
      label: "Console Errors",
      action: () => {
        console.error("Test Error for Development");
        console.warn("Test Warning for Development");
        toast.info("Check browser console for test errors");
      },
      color: "bg-red-600 hover:bg-red-700",
    },
    {
      icon: Settings,
      label: "Clear Data",
      action: () => {
        if (confirm("Clear all localStorage data?")) {
          localStorage.clear();
          sessionStorage.clear();
          toast.success("Local data cleared");
          setTimeout(() => window.location.reload(), 1000);
        }
      },
      color: "bg-yellow-600 hover:bg-yellow-700",
    },
    {
      icon: ExternalLink,
      label: "New Window",
      action: () => {
        window.open("/qa", "_blank");
        toast.info("QA Dashboard opened in new window");
      },
      color: "bg-green-600 hover:bg-green-700",
    },
  ];

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Expanded Actions */}
      {isExpanded && (
        <div className="mb-2 space-y-2">
          {quickActions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <div key={index} className="flex items-center justify-end">
                <div className="bg-black text-white text-xs px-2 py-1 rounded mr-2 opacity-75">
                  {action.label}
                </div>
                <Button
                  onClick={() => {
                    action.action();
                    setIsExpanded(false);
                  }}
                  className={`w-10 h-10 rounded-full ${action.color} text-white shadow-lg`}
                  size="sm"
                >
                  <IconComponent className="w-4 h-4" />
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {/* Main Toggle Button */}
      <Button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-12 h-12 rounded-full shadow-lg transition-all duration-200 ${
          isExpanded
            ? "bg-gray-600 hover:bg-gray-700 text-white"
            : "bg-purple-600 hover:bg-purple-700 text-white"
        }`}
        title="Development Tools"
      >
        {isExpanded ? (
          <X className="w-5 h-5" />
        ) : (
          <Wrench className="w-5 h-5" />
        )}
      </Button>

      {/* Development Mode Indicator */}
      {!isExpanded && (
        <div className="absolute -top-1 -left-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
      )}
    </div>
  );
};

export default DevToolsQuickAccess;
