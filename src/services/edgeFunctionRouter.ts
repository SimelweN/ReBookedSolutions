import { supabase } from "@/integrations/supabase/client";
import { mockEdgeFunctions, invokeFunction } from "./mockEdgeFunctions";
import { toast } from "sonner";

interface RouterConfig {
  enableAutoFallback: boolean;
  enableMockMode: boolean;
  enableStatusTracking: boolean;
  fallbackToastNotifications: boolean;
  maxRetries: number;
  retryDelay: number;
}

interface FunctionStatus {
  endpoint: string;
  lastSuccessTime?: number;
  lastFailureTime?: number;
  consecutiveFailures: number;
  isHealthy: boolean;
  avgResponseTime: number;
  totalCalls: number;
  successRate: number;
}

class EdgeFunctionRouter {
  private config: RouterConfig = {
    enableAutoFallback: true,
    enableMockMode: false,
    enableStatusTracking: true,
    fallbackToastNotifications: true,
    maxRetries: 2,
    retryDelay: 1000,
  };

  private functionStatus: Map<string, FunctionStatus> = new Map();
  private healthCheckInterval: number | null = null;

  constructor() {
    this.loadConfig();
    this.startHealthMonitoring();
  }

  // Configuration management
  private loadConfig(): void {
    try {
      const savedConfig = localStorage.getItem("edge-function-router-config");
      if (savedConfig) {
        this.config = { ...this.config, ...JSON.parse(savedConfig) };
      }
    } catch (error) {
      console.warn("Failed to load router config:", error);
    }
  }

  private saveConfig(): void {
    try {
      localStorage.setItem(
        "edge-function-router-config",
        JSON.stringify(this.config),
      );
    } catch (error) {
      console.warn("Failed to save router config:", error);
    }
  }

  updateConfig(updates: Partial<RouterConfig>): void {
    this.config = { ...this.config, ...updates };
    this.saveConfig();

    if (updates.enableStatusTracking !== undefined) {
      if (updates.enableStatusTracking) {
        this.startHealthMonitoring();
      } else {
        this.stopHealthMonitoring();
      }
    }
  }

  getConfig(): RouterConfig {
    return { ...this.config };
  }

  // Function status tracking
  private updateFunctionStatus(
    endpoint: string,
    success: boolean,
    responseTime: number,
  ): void {
    if (!this.config.enableStatusTracking) return;

    let status = this.functionStatus.get(endpoint) || {
      endpoint,
      consecutiveFailures: 0,
      isHealthy: true,
      avgResponseTime: 0,
      totalCalls: 0,
      successRate: 1,
    };

    status.totalCalls++;

    if (success) {
      status.lastSuccessTime = Date.now();
      status.consecutiveFailures = 0;
      status.isHealthy = true;
    } else {
      status.lastFailureTime = Date.now();
      status.consecutiveFailures++;
      status.isHealthy = status.consecutiveFailures < 3; // Mark unhealthy after 3 consecutive failures
    }

    // Update average response time
    status.avgResponseTime =
      (status.avgResponseTime * (status.totalCalls - 1) + responseTime) /
      status.totalCalls;

    // Update success rate
    const recentCalls = Math.min(status.totalCalls, 10); // Consider last 10 calls
    status.successRate = success
      ? (status.successRate * (recentCalls - 1) + 1) / recentCalls
      : (status.successRate * (recentCalls - 1)) / recentCalls;

    this.functionStatus.set(endpoint, status);
  }

  getFunctionStatus(endpoint: string): FunctionStatus | null {
    return this.functionStatus.get(endpoint) || null;
  }

  getAllFunctionStatuses(): FunctionStatus[] {
    return Array.from(this.functionStatus.values());
  }

  // Health monitoring
  private startHealthMonitoring(): void {
    if (this.healthCheckInterval) return;

    // Check critical functions every 5 minutes
    this.healthCheckInterval = window.setInterval(
      async () => {
        await this.performHealthChecks();
      },
      5 * 60 * 1000,
    );
  }

  private stopHealthMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  private async performHealthChecks(): Promise<void> {
    const criticalFunctions = [
      "initialize-paystack-payment",
      "verify-paystack-payment",
      "create-order",
      "process-book-purchase",
      "email-automation",
    ];

    for (const endpoint of criticalFunctions) {
      try {
        const startTime = Date.now();
        const result = await supabase.functions.invoke(endpoint, {
          body: { action: "health" },
        });
        const responseTime = Date.now() - startTime;

        this.updateFunctionStatus(endpoint, !result.error, responseTime);
      } catch (error) {
        this.updateFunctionStatus(endpoint, false, 0);
      }
    }
  }

  // Smart routing with retries and fallbacks
  async invoke(endpoint: string, options: any = {}): Promise<any> {
    const startTime = Date.now();

    // Check if function is known to be unhealthy
    const status = this.getFunctionStatus(endpoint);
    if (status && !status.isHealthy && this.config.enableAutoFallback) {
      console.log(
        `⚡ Function ${endpoint} is unhealthy, using fallback immediately`,
      );
      return this.useFallback(endpoint, options, "unhealthy_function");
    }

    // Force mock mode if enabled
    if (this.config.enableMockMode) {
      console.log(`🎭 Mock mode enabled, using mock for ${endpoint}`);
      return this.useFallback(endpoint, options, "mock_mode_enabled");
    }

    // Try real function with retries
    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        console.log(
          `🚀 Attempt ${attempt}/${this.config.maxRetries} for ${endpoint}`,
        );

        const result = await supabase.functions.invoke(endpoint, options);
        const responseTime = Date.now() - startTime;

        if (result.error) {
          this.updateFunctionStatus(endpoint, false, responseTime);

          if (attempt === this.config.maxRetries) {
            // Final attempt failed, use fallback
            if (this.config.enableAutoFallback) {
              console.log(
                `❌ All attempts failed for ${endpoint}, using fallback`,
              );
              return this.useFallback(endpoint, options, "all_attempts_failed");
            } else {
              throw new Error(
                `Function ${endpoint} failed after ${this.config.maxRetries} attempts`,
              );
            }
          } else {
            // Wait before retry
            await new Promise((resolve) =>
              setTimeout(resolve, this.config.retryDelay * attempt),
            );
            continue;
          }
        }

        // Success
        this.updateFunctionStatus(endpoint, true, responseTime);
        console.log(`✅ Function ${endpoint} succeeded on attempt ${attempt}`);
        return result;
      } catch (error) {
        const responseTime = Date.now() - startTime;
        this.updateFunctionStatus(endpoint, false, responseTime);

        if (attempt === this.config.maxRetries) {
          // Final attempt failed, use fallback
          if (this.config.enableAutoFallback) {
            console.log(`💥 Function ${endpoint} crashed, using fallback`);
            return this.useFallback(endpoint, options, "function_crashed");
          } else {
            throw error;
          }
        } else {
          // Wait before retry
          await new Promise((resolve) =>
            setTimeout(resolve, this.config.retryDelay * attempt),
          );
        }
      }
    }
  }

  private async useFallback(
    endpoint: string,
    options: any,
    reason: string,
  ): Promise<any> {
    try {
      const result = await mockEdgeFunctions.invokeMockFunction(
        endpoint,
        options,
      );

      if (result.data) {
        result.data._fallback_used = true;
        result.data._fallback_reason = reason;
        result.data._fallback_timestamp = new Date().toISOString();
      }

      // Show toast notification if enabled
      if (this.config.fallbackToastNotifications) {
        toast.warning(`${endpoint} unavailable - using backup system`, {
          description: "Functionality provided by fallback mechanism",
          duration: 3000,
        });
      }

      console.log(`🛡️ Fallback successful for ${endpoint} (reason: ${reason})`);
      return result;
    } catch (fallbackError) {
      console.error(`🚨 Fallback failed for ${endpoint}:`, fallbackError);

      // Return error response
      return {
        error: {
          message: `Both primary function and fallback failed for ${endpoint}`,
          code: "TOTAL_FAILURE",
          primary_error: reason,
          fallback_error: fallbackError.message,
        },
      };
    }
  }

  // Utility methods
  async testAllFunctions(): Promise<
    Record<
      string,
      { success: boolean; responseTime: number; usedFallback: boolean }
    >
  > {
    const results: Record<
      string,
      { success: boolean; responseTime: number; usedFallback: boolean }
    > = {};
    const endpoints = mockEdgeFunctions.getAvailableMocks();

    for (const endpoint of endpoints) {
      const startTime = Date.now();
      try {
        const result = await this.invoke(endpoint, { test: true });
        const responseTime = Date.now() - startTime;

        results[endpoint] = {
          success: !result.error,
          responseTime,
          usedFallback: result.data?._fallback_used || false,
        };
      } catch (error) {
        results[endpoint] = {
          success: false,
          responseTime: Date.now() - startTime,
          usedFallback: false,
        };
      }
    }

    return results;
  }

  getHealthSummary(): {
    totalFunctions: number;
    healthyFunctions: number;
    unhealthyFunctions: number;
    averageResponseTime: number;
    overallSuccessRate: number;
  } {
    const statuses = this.getAllFunctionStatuses();

    if (statuses.length === 0) {
      return {
        totalFunctions: 0,
        healthyFunctions: 0,
        unhealthyFunctions: 0,
        averageResponseTime: 0,
        overallSuccessRate: 0,
      };
    }

    const healthyCount = statuses.filter((s) => s.isHealthy).length;
    const avgResponseTime =
      statuses.reduce((sum, s) => sum + s.avgResponseTime, 0) / statuses.length;
    const overallSuccessRate =
      statuses.reduce((sum, s) => sum + s.successRate, 0) / statuses.length;

    return {
      totalFunctions: statuses.length,
      healthyFunctions: healthyCount,
      unhealthyFunctions: statuses.length - healthyCount,
      averageResponseTime: Math.round(avgResponseTime),
      overallSuccessRate: Math.round(overallSuccessRate * 100) / 100,
    };
  }

  // Reset all function statuses
  resetStatuses(): void {
    this.functionStatus.clear();
    console.log("🔄 All function statuses reset");
  }

  // Enable/disable different modes
  enableMockMode(): void {
    this.updateConfig({ enableMockMode: true });
    mockEdgeFunctions.enableMockMode();
    toast.info(
      "Mock mode enabled - all functions will use simulated responses",
    );
  }

  disableMockMode(): void {
    this.updateConfig({ enableMockMode: false });
    mockEdgeFunctions.disableMockMode();
    toast.info("Mock mode disabled - functions will attempt real connections");
  }

  enableAutoFallback(): void {
    this.updateConfig({ enableAutoFallback: true });
    toast.info(
      "Auto-fallback enabled - failed functions will use backup systems",
    );
  }

  disableAutoFallback(): void {
    this.updateConfig({ enableAutoFallback: false });
    toast.info("Auto-fallback disabled - functions will fail without backup");
  }
}

// Lazy initialization to prevent "Cannot access before initialization" errors
let edgeFunctionRouterInstance: EdgeFunctionRouter | null = null;
export const getEdgeFunctionRouter = () => {
  if (!edgeFunctionRouterInstance) {
    edgeFunctionRouterInstance = new EdgeFunctionRouter();
  }
  return edgeFunctionRouterInstance;
};

// Export convenient helper functions
export const invokeEdgeFunction = (endpoint: string, options: any = {}) => {
  return getEdgeFunctionRouter().invoke(endpoint, options);
};

export const getRouterConfig = () => edgeFunctionRouter.getConfig();
export const updateRouterConfig = (config: Partial<RouterConfig>) =>
  edgeFunctionRouter.updateConfig(config);
export const getFunctionStatus = (endpoint: string) =>
  edgeFunctionRouter.getFunctionStatus(endpoint);
export const getHealthSummary = () => edgeFunctionRouter.getHealthSummary();
export const testAllFunctions = () => edgeFunctionRouter.testAllFunctions();
export const resetFunctionStatuses = () => edgeFunctionRouter.resetStatuses();

// Mode controls
export const enableMockMode = () => edgeFunctionRouter.enableMockMode();
export const disableMockMode = () => edgeFunctionRouter.disableMockMode();
export const enableAutoFallback = () => edgeFunctionRouter.enableAutoFallback();
export const disableAutoFallback = () =>
  edgeFunctionRouter.disableAutoFallback();
