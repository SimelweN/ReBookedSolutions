import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Bug,
  Zap,
  Settings,
  Play,
  User,
  ShoppingCart,
  CreditCard,
  Store,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { createQuickFixes } from "./qa/quickFixesData";
import { QuickFix } from "./qa/types";
import { getSeverityColor, getStatusIcon, getCategoryIcon } from "./qa/utils";

const QAQuickFixes: React.FC = () => {
  const { user, isAuthenticated, refreshProfile } = useAuth();
  const { clearCart } = useCart();
  const navigate = useNavigate();
  const [fixes, setFixes] = useState<QuickFix[]>([]);
  const [isRunning, setIsRunning] = useState<Set<string>>(new Set());

  // Generate quick fixes
  const quickFixes = createQuickFixes(
    user,
    isAuthenticated,
    refreshProfile,
    clearCart,
    navigate,
  );

  const runFix = async (fixId: string) => {
    const fix = quickFixes.find((f) => f.id === fixId);
    if (!fix) return;

    setIsRunning((prev) => new Set(prev).add(fixId));
    setFixes((prev) =>
      prev.map((f) => (f.id === fixId ? { ...f, status: "running" } : f)),
    );

    try {
      await fix.action();
      setFixes((prev) =>
        prev.map((f) => (f.id === fixId ? { ...f, status: "success" } : f)),
      );
    } catch (error) {
      setFixes((prev) =>
        prev.map((f) => (f.id === fixId ? { ...f, status: "failed" } : f)),
      );
      toast.error(`Fix failed: ${error.message}`);
    } finally {
      setIsRunning((prev) => {
        const newSet = new Set(prev);
        newSet.delete(fixId);
        return newSet;
      });
    }
  };

  const runAllFixes = async () => {
    for (const fix of quickFixes) {
      if (!isRunning.has(fix.id)) {
        await runFix(fix.id);
        // Small delay between fixes
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
  };

  const getIconComponent = (
    iconName: string,
    className: string = "w-4 h-4",
  ) => {
    const iconMap = {
      "check-circle": CheckCircle,
      "x-circle": XCircle,
      "animate-spin": Loader2,
      play: Play,
      user: User,
      "shopping-cart": ShoppingCart,
      "credit-card": CreditCard,
      store: Store,
      settings: Settings,
      zap: Zap,
    };

    const IconComponent = iconMap[iconName] || Play;
    return <IconComponent className={className} />;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="w-5 h-5" />
            Quick Fixes & System Tests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button
              onClick={runAllFixes}
              disabled={isRunning.size > 0}
              className="flex items-center gap-2"
            >
              {isRunning.size > 0 ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Run All Tests
            </Button>
          </div>

          <div className="grid gap-4">
            {quickFixes.map((fix) => {
              const isCurrentlyRunning = isRunning.has(fix.id);
              const statusIconName = getStatusIcon(
                fix.status,
                isCurrentlyRunning,
              );
              const categoryIconName = getCategoryIcon(fix.category);

              return (
                <div
                  key={fix.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {getIconComponent(categoryIconName)}
                      {getIconComponent(statusIconName)}
                    </div>
                    <div>
                      <h4 className="font-medium">{fix.title}</h4>
                      <p className="text-sm text-gray-600">{fix.description}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge
                          variant="outline"
                          className={getSeverityColor(fix.severity)}
                        >
                          {fix.severity}
                        </Badge>
                        <Badge variant="outline">{fix.category}</Badge>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => runFix(fix.id)}
                    disabled={isCurrentlyRunning}
                    variant={fix.status === "success" ? "outline" : "default"}
                  >
                    {isCurrentlyRunning ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        Running...
                      </>
                    ) : fix.status === "success" ? (
                      "Re-run"
                    ) : (
                      "Run"
                    )}
                  </Button>
                </div>
              );
            })}
          </div>

          <Alert className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Quick Fix Guide:</strong>
              <br />• <strong>Critical issues</strong> will prevent core
              functionality
              <br />• <strong>Warning issues</strong> may cause problems for
              some users
              <br />• <strong>Info tests</strong> provide system verification
              <br />• Run tests after making configuration changes
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default QAQuickFixes;
