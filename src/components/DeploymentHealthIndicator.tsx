import React from "react";
import { useDeploymentHealth } from "@/hooks/useDeploymentHealth";
import {
  Server,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Link } from "react-router-dom";

interface DeploymentHealthIndicatorProps {
  showLabel?: boolean;
  variant?: "minimal" | "detailed";
  autoCheck?: boolean;
}

const DeploymentHealthIndicator: React.FC<DeploymentHealthIndicatorProps> = ({
  showLabel = false,
  variant = "minimal",
  autoCheck = false,
}) => {
  const { isHealthy, checks, isLoading, error, lastChecked, runHealthCheck } =
    useDeploymentHealth(autoCheck);

  const getStatusIcon = () => {
    if (isLoading) {
      return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
    }
    if (error) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    if (isHealthy) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
  };

  const getStatusColor = () => {
    if (isLoading) return "bg-blue-100 text-blue-800";
    if (error) return "bg-red-100 text-red-800";
    if (isHealthy) return "bg-green-100 text-green-800";
    return "bg-yellow-100 text-yellow-800";
  };

  const getStatusText = () => {
    if (isLoading) return "Checking...";
    if (error) return "Check Failed";
    if (isHealthy) return "Healthy";
    return "Issues Found";
  };

  const errorCount = checks.filter((check) => check.status === "error").length;
  const warningCount = checks.filter(
    (check) => check.status === "warning",
  ).length;

  if (variant === "minimal") {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="p-2">
            <Server className="h-4 w-4 mr-1" />
            {getStatusIcon()}
            {showLabel && <span className="ml-1">{getStatusText()}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Deployment Status</h3>
              <Badge className={getStatusColor()}>{getStatusText()}</Badge>
            </div>

            {lastChecked && (
              <p className="text-xs text-gray-500">
                Last checked: {lastChecked.toLocaleTimeString()}
              </p>
            )}

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                {error}
              </div>
            )}

            {checks.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="text-green-600">
                    ✓ {checks.filter((c) => c.status === "success").length}{" "}
                    passed
                  </span>
                  {warningCount > 0 && (
                    <span className="text-yellow-600 ml-2">
                      ⚠ {warningCount} warnings
                    </span>
                  )}
                  {errorCount > 0 && (
                    <span className="text-red-600 ml-2">
                      ✗ {errorCount} errors
                    </span>
                  )}
                </div>

                {(errorCount > 0 || warningCount > 0) && (
                  <div className="space-y-1">
                    {checks
                      .filter(
                        (check) =>
                          check.status === "error" ||
                          check.status === "warning",
                      )
                      .slice(0, 3)
                      .map((check) => (
                        <div
                          key={check.id}
                          className="text-xs text-gray-600 flex items-center"
                        >
                          {check.status === "error" ? (
                            <XCircle className="h-3 w-3 text-red-500 mr-1" />
                          ) : (
                            <AlertTriangle className="h-3 w-3 text-yellow-500 mr-1" />
                          )}
                          {check.name}: {check.message}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={runHealthCheck}>
                <RefreshCw className="h-3 w-3 mr-1" />
                Refresh
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link to="/deployment-help">View Details</Link>
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  // Detailed variant
  return (
    <div className="bg-white border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Server className="h-5 w-5 text-gray-600" />
          <h3 className="font-semibold">Deployment Health</h3>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor()}>{getStatusText()}</Badge>
          <Button size="sm" variant="outline" onClick={runHealthCheck}>
            <RefreshCw className="h-3 w-3 mr-1" />
            Check
          </Button>
        </div>
      </div>

      {lastChecked && (
        <p className="text-xs text-gray-500">
          Last checked: {lastChecked.toLocaleString()}
        </p>
      )}

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded border">
          <strong>Error:</strong> {error}
        </div>
      )}

      {checks.length > 0 && (
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center p-2 bg-green-50 rounded">
              <div className="text-green-600 font-semibold">
                {checks.filter((c) => c.status === "success").length}
              </div>
              <div className="text-xs text-gray-600">Passed</div>
            </div>
            <div className="text-center p-2 bg-yellow-50 rounded">
              <div className="text-yellow-600 font-semibold">
                {warningCount}
              </div>
              <div className="text-xs text-gray-600">Warnings</div>
            </div>
            <div className="text-center p-2 bg-red-50 rounded">
              <div className="text-red-600 font-semibold">{errorCount}</div>
              <div className="text-xs text-gray-600">Errors</div>
            </div>
          </div>

          {(errorCount > 0 || warningCount > 0) && (
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-gray-700">Issues:</h4>
              {checks
                .filter(
                  (check) =>
                    check.status === "error" || check.status === "warning",
                )
                .map((check) => (
                  <div
                    key={check.id}
                    className="text-sm text-gray-600 flex items-start gap-2 p-2 bg-gray-50 rounded"
                  >
                    {check.status === "error" ? (
                      <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    )}
                    <div>
                      <div className="font-medium">{check.name}</div>
                      <div className="text-xs">{check.message}</div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      <Button variant="outline" className="w-full" asChild>
        <Link to="/deployment-help">
          <Server className="h-4 w-4 mr-2" />
          Full Deployment Diagnostics
        </Link>
      </Button>
    </div>
  );
};

export default DeploymentHealthIndicator;
