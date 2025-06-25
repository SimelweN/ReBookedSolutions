import * as React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Settings } from "lucide-react";

const QAQuickAccess: React.FC = () => {
  const navigate = useNavigate();

  // Only show in development or for admin users
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        onClick={() => navigate("/qa")}
        className="rounded-full w-12 h-12 bg-purple-600 hover:bg-purple-700 text-white shadow-lg"
        title="QA Dashboard"
      >
        <Settings className="w-5 h-5" />
      </Button>
    </div>
  );
};

export default QAQuickAccess;
