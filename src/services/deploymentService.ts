import axios from "axios";

export interface DeploymentInfo {
  id: string;
  url: string;
  state: "QUEUED" | "BUILDING" | "READY" | "ERROR" | "CANCELED";
  type: "LAMBDAS";
  createdAt: number;
  buildingAt?: number;
  readyAt?: number;
  target: "production" | "staging";
  source: "git" | "cli" | "import";
  commit?: {
    sha: string;
    message: string;
    author: string;
    timestamp: number;
  };
  build?: {
    env: string[];
  };
}

export interface DeploymentCheck {
  id: string;
  name: string;
  status: "checking" | "success" | "warning" | "error";
  message: string;
  details?: string;
  action?: string;
  actionUrl?: string;
  timestamp: number;
}

export class DeploymentService {
  private static readonly VERCEL_API_BASE = "https://api.vercel.com";
  private static readonly PROJECT_NAME = "rebookedsolutions"; // Adjust based on your project

  /**
   * Check if the current deployment is healthy
   */
  static async checkDeploymentHealth(): Promise<DeploymentCheck[]> {
    const checks: DeploymentCheck[] = [];
    const timestamp = Date.now();

    try {
      // Check if main domain is accessible
      await this.checkDomainAccessibility(checks, timestamp);

      // Check build configuration
      await this.checkBuildConfiguration(checks, timestamp);

      // Check environment variables
      await this.checkEnvironmentVariables(checks, timestamp);

      // Check performance
      await this.checkPerformance(checks, timestamp);
    } catch (error) {
      checks.push({
        id: "health-check-error",
        name: "Health Check Error",
        status: "error",
        message: "Failed to complete health checks",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp,
      });
    }

    return checks;
  }

  private static async checkDomainAccessibility(
    checks: DeploymentCheck[],
    timestamp: number,
  ) {
    const domains = [
      "https://rebookedsolutions.co.za",
      "https://www.rebookedsolutions.co.za",
    ];

    for (const domain of domains) {
      try {
        const startTime = performance.now();
        const response = await fetch(domain, {
          method: "HEAD",
          mode: "no-cors",
          cache: "no-cache",
        });
        const endTime = performance.now();
        const responseTime = Math.round(endTime - startTime);

        checks.push({
          id: `domain-${domain}`,
          name: `Domain Access: ${new URL(domain).hostname}`,
          status: "success",
          message: `Accessible (${responseTime}ms)`,
          details: `Domain is responding correctly`,
          timestamp,
        });
      } catch (error) {
        checks.push({
          id: `domain-${domain}`,
          name: `Domain Access: ${new URL(domain).hostname}`,
          status: "error",
          message: "Domain not accessible",
          details: error instanceof Error ? error.message : "Connection failed",
          action: "Check DNS configuration and Vercel domain settings",
          actionUrl: "https://vercel.com/dashboard",
          timestamp,
        });
      }
    }
  }

  private static async checkBuildConfiguration(
    checks: DeploymentCheck[],
    timestamp: number,
  ) {
    // Check if critical files exist and are properly configured
    const criticalPaths = ["/assets/index.css", "/assets/index.js"];

    let successCount = 0;

    for (const path of criticalPaths) {
      try {
        const response = await fetch(window.location.origin + path, {
          method: "HEAD",
          cache: "no-cache",
        });

        if (response.ok) {
          successCount++;
        }
      } catch (error) {
        // Asset might not exist or be named differently
      }
    }

    if (successCount === criticalPaths.length) {
      checks.push({
        id: "build-assets",
        name: "Build Assets",
        status: "success",
        message: "All critical assets are accessible",
        details: `Found ${successCount}/${criticalPaths.length} critical assets`,
        timestamp,
      });
    } else if (successCount > 0) {
      checks.push({
        id: "build-assets",
        name: "Build Assets",
        status: "warning",
        message: "Some build assets may be missing",
        details: `Found ${successCount}/${criticalPaths.length} critical assets`,
        action: "Check build output and verify asset generation",
        timestamp,
      });
    } else {
      checks.push({
        id: "build-assets",
        name: "Build Assets",
        status: "error",
        message: "Critical build assets not found",
        details: "No expected assets were accessible",
        action: "Rebuild the project and check Vercel deployment logs",
        actionUrl: "https://vercel.com/dashboard",
        timestamp,
      });
    }
  }

  private static async checkEnvironmentVariables(
    checks: DeploymentCheck[],
    timestamp: number,
  ) {
    const requiredVars = [
      "VITE_SUPABASE_URL",
      "VITE_SUPABASE_ANON_KEY",
      "VITE_GOOGLE_MAPS_API_KEY",
      "VITE_PAYSTACK_PUBLIC_KEY",
    ];

    const missingVars = requiredVars.filter(
      (varName) => !import.meta.env[varName],
    );

    if (missingVars.length === 0) {
      checks.push({
        id: "environment-variables",
        name: "Environment Variables",
        status: "success",
        message: "All required environment variables are set",
        details: `Checked ${requiredVars.length} variables`,
        timestamp,
      });
    } else {
      checks.push({
        id: "environment-variables",
        name: "Environment Variables",
        status: "error",
        message: `Missing ${missingVars.length} required environment variables`,
        details: `Missing: ${missingVars.join(", ")}`,
        action: "Set missing environment variables in Vercel project settings",
        actionUrl: "https://vercel.com/dashboard",
        timestamp,
      });
    }
  }

  private static async checkPerformance(
    checks: DeploymentCheck[],
    timestamp: number,
  ) {
    try {
      // Check Core Web Vitals if available
      if ("PerformanceObserver" in window) {
        // Simple performance check
        const navigationEntry = performance.getEntriesByType(
          "navigation",
        )[0] as PerformanceNavigationTiming;

        if (navigationEntry) {
          const loadTime =
            navigationEntry.loadEventEnd - navigationEntry.fetchStart;

          if (loadTime < 3000) {
            checks.push({
              id: "performance",
              name: "Performance",
              status: "success",
              message: `Good load time (${Math.round(loadTime)}ms)`,
              details: "Page loads within acceptable time",
              timestamp,
            });
          } else if (loadTime < 5000) {
            checks.push({
              id: "performance",
              name: "Performance",
              status: "warning",
              message: `Slow load time (${Math.round(loadTime)}ms)`,
              details: "Consider optimizing assets and code splitting",
              action: "Optimize bundle size and implement code splitting",
              timestamp,
            });
          } else {
            checks.push({
              id: "performance",
              name: "Performance",
              status: "error",
              message: `Very slow load time (${Math.round(loadTime)}ms)`,
              details: "Page takes too long to load",
              action: "Urgent performance optimization needed",
              timestamp,
            });
          }
        }
      }
    } catch (error) {
      checks.push({
        id: "performance",
        name: "Performance",
        status: "warning",
        message: "Could not measure performance",
        details: "Performance API not available or failed",
        timestamp,
      });
    }
  }

  /**
   * Get deployment information from Vercel API
   * Note: This requires API token and may not work in production due to CORS
   */
  static async getDeploymentInfo(apiToken?: string): Promise<DeploymentInfo[]> {
    if (!apiToken) {
      throw new Error("Vercel API token is required");
    }

    try {
      const response = await axios.get(
        `${this.VERCEL_API_BASE}/v6/deployments`,
        {
          headers: {
            Authorization: `Bearer ${apiToken}`,
          },
          params: {
            projectId: this.PROJECT_NAME,
            limit: 10,
          },
        },
      );

      return response.data.deployments || [];
    } catch (error) {
      console.error("Failed to fetch deployment info:", error);
      throw error;
    }
  }

  /**
   * Trigger a new deployment (requires API access)
   */
  static async triggerDeployment(
    apiToken: string,
    gitRef?: string,
  ): Promise<any> {
    if (!apiToken) {
      throw new Error("Vercel API token is required");
    }

    try {
      const response = await axios.post(
        `${this.VERCEL_API_BASE}/v13/deployments`,
        {
          name: this.PROJECT_NAME,
          target: "production",
          gitSource: {
            type: "github",
            ref: gitRef || "main",
          },
        },
        {
          headers: {
            Authorization: `Bearer ${apiToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      return response.data;
    } catch (error) {
      console.error("Failed to trigger deployment:", error);
      throw error;
    }
  }

  /**
   * Check if the deployment is in a healthy state
   */
  static async isDeploymentHealthy(): Promise<boolean> {
    try {
      const checks = await this.checkDeploymentHealth();
      const errorChecks = checks.filter((check) => check.status === "error");
      return errorChecks.length === 0;
    } catch (error) {
      console.error("Health check failed:", error);
      return false;
    }
  }

  /**
   * Generate deployment troubleshooting report
   */
  static async generateTroubleshootingReport(): Promise<string> {
    const checks = await this.checkDeploymentHealth();
    const timestamp = new Date().toISOString();

    let report = `# Deployment Troubleshooting Report\n`;
    report += `Generated: ${timestamp}\n\n`;

    const errorChecks = checks.filter((c) => c.status === "error");
    const warningChecks = checks.filter((c) => c.status === "warning");
    const successChecks = checks.filter((c) => c.status === "success");

    report += `## Summary\n`;
    report += `- ✅ ${successChecks.length} checks passed\n`;
    report += `- ⚠️ ${warningChecks.length} warnings\n`;
    report += `- ❌ ${errorChecks.length} errors\n\n`;

    if (errorChecks.length > 0) {
      report += `## Critical Issues\n`;
      errorChecks.forEach((check) => {
        report += `### ${check.name}\n`;
        report += `**Status:** Error\n`;
        report += `**Message:** ${check.message}\n`;
        if (check.details) report += `**Details:** ${check.details}\n`;
        if (check.action) report += `**Action:** ${check.action}\n`;
        if (check.actionUrl) report += `**Reference:** ${check.actionUrl}\n`;
        report += `\n`;
      });
    }

    if (warningChecks.length > 0) {
      report += `## Warnings\n`;
      warningChecks.forEach((check) => {
        report += `### ${check.name}\n`;
        report += `**Status:** Warning\n`;
        report += `**Message:** ${check.message}\n`;
        if (check.details) report += `**Details:** ${check.details}\n`;
        if (check.action) report += `**Recommendation:** ${check.action}\n`;
        report += `\n`;
      });
    }

    report += `## System Information\n`;
    report += `- User Agent: ${navigator.userAgent}\n`;
    report += `- URL: ${window.location.href}\n`;
    report += `- Environment: ${import.meta.env.MODE}\n`;

    return report;
  }
}
