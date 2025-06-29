import { useState, useEffect, useCallback } from "react";
import {
  DeploymentService,
  DeploymentCheck,
} from "@/services/deploymentService";

export interface DeploymentHealthStatus {
  isHealthy: boolean;
  checks: DeploymentCheck[];
  isLoading: boolean;
  error: string | null;
  lastChecked: Date | null;
}

export const useDeploymentHealth = (
  autoCheck: boolean = false,
  interval: number = 30000,
) => {
  const [status, setStatus] = useState<DeploymentHealthStatus>({
    isHealthy: true,
    checks: [],
    isLoading: false,
    error: null,
    lastChecked: null,
  });

  const runHealthCheck = useCallback(async () => {
    setStatus((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const checks = await DeploymentService.checkDeploymentHealth();
      const hasErrors = checks.some((check) => check.status === "error");

      setStatus({
        isHealthy: !hasErrors,
        checks,
        isLoading: false,
        error: null,
        lastChecked: new Date(),
      });
    } catch (error) {
      setStatus((prev) => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
        lastChecked: new Date(),
      }));
    }
  }, []);

  const generateReport = useCallback(async (): Promise<string> => {
    try {
      return await DeploymentService.generateTroubleshootingReport();
    } catch (error) {
      console.error("Failed to generate report:", error);
      return "Failed to generate troubleshooting report";
    }
  }, []);

  const downloadReport = useCallback(async () => {
    try {
      const report = await generateReport();
      const blob = new Blob([report], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `deployment-report-${new Date().toISOString().split("T")[0]}.md`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download report:", error);
    }
  }, [generateReport]);

  // Auto-check on mount if enabled
  useEffect(() => {
    if (autoCheck) {
      runHealthCheck();
    }
  }, [autoCheck, runHealthCheck]);

  // Set up interval checking if enabled
  useEffect(() => {
    if (autoCheck && interval > 0) {
      const intervalId = setInterval(runHealthCheck, interval);
      return () => clearInterval(intervalId);
    }
  }, [autoCheck, interval, runHealthCheck]);

  return {
    ...status,
    runHealthCheck,
    generateReport,
    downloadReport,
  };
};
