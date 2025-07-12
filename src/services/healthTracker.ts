import { HealthStatus, ServiceLayer } from "@/types/functionFallback";

class HealthTracker {
  private healthStatus: Map<ServiceLayer, HealthStatus> = new Map();
  private readonly FAILURE_THRESHOLD = 3;
  private readonly DISABLE_DURATION = 5 * 60 * 1000; // 5 minutes
  private readonly HEALTH_CHECK_INTERVAL = 30 * 1000; // 30 seconds

  constructor() {
    this.initializeHealth();
    this.startHealthMonitoring();
  }

  private initializeHealth(): void {
    const services: ServiceLayer[] = ["supabase", "vercel", "fallback"];

    services.forEach((service) => {
      this.healthStatus.set(service, {
        service,
        healthy: true,
        lastCheck: Date.now(),
        failureCount: 0,
        disabled: false,
      });
    });
  }

  private startHealthMonitoring(): void {
    if (typeof window === "undefined") return;

    setInterval(() => {
      this.checkAndUpdateHealth();
    }, this.HEALTH_CHECK_INTERVAL);
  }

  private checkAndUpdateHealth(): void {
    this.healthStatus.forEach((status, service) => {
      // Re-enable disabled services after timeout
      if (
        status.disabled &&
        status.disabledUntil &&
        Date.now() > status.disabledUntil
      ) {
        this.enableService(service);
      }
    });
  }

  recordSuccess(service: ServiceLayer): void {
    const status = this.healthStatus.get(service);
    if (status) {
      status.healthy = true;
      status.lastCheck = Date.now();
      status.failureCount = Math.max(0, status.failureCount - 1); // Gradually recover

      // Re-enable if it was disabled and failure count is low
      if (status.disabled && status.failureCount === 0) {
        this.enableService(service);
      }
    }
  }

  recordFailure(service: ServiceLayer, error: string): void {
    const status = this.healthStatus.get(service);
    if (status) {
      status.lastCheck = Date.now();
      status.failureCount++;

      // Check if we should disable the service
      if (status.failureCount >= this.FAILURE_THRESHOLD) {
        this.disableService(service);
        status.healthy = false;
      }

      console.warn(
        `Service ${service} failure recorded. Count: ${status.failureCount}`,
        error,
      );
    }
  }

  private disableService(service: ServiceLayer): void {
    const status = this.healthStatus.get(service);
    if (status) {
      status.disabled = true;
      status.healthy = false;
      status.disabledUntil = Date.now() + this.DISABLE_DURATION;

      console.warn(
        `Service ${service} temporarily disabled due to repeated failures`,
      );

      // Emit event for monitoring
      this.emitHealthEvent(service, "disabled");
    }
  }

  private enableService(service: ServiceLayer): void {
    const status = this.healthStatus.get(service);
    if (status) {
      status.disabled = false;
      status.healthy = true;
      status.disabledUntil = undefined;
      status.failureCount = 0;

      console.log(`Service ${service} re-enabled`);

      // Emit event for monitoring
      this.emitHealthEvent(service, "enabled");
    }
  }

  isServiceHealthy(service: ServiceLayer): boolean {
    const status = this.healthStatus.get(service);
    return status ? status.healthy && !status.disabled : false;
  }

  isServiceDisabled(service: ServiceLayer): boolean {
    const status = this.healthStatus.get(service);
    return status ? status.disabled : false;
  }

  getServiceStatus(service: ServiceLayer): HealthStatus | null {
    return this.healthStatus.get(service) || null;
  }

  getAllServiceStatuses(): HealthStatus[] {
    return Array.from(this.healthStatus.values());
  }

  getFailureCount(service: ServiceLayer): number {
    const status = this.healthStatus.get(service);
    return status ? status.failureCount : 0;
  }

  resetServiceHealth(service: ServiceLayer): void {
    const status = this.healthStatus.get(service);
    if (status) {
      status.healthy = true;
      status.failureCount = 0;
      status.disabled = false;
      status.disabledUntil = undefined;
      status.lastCheck = Date.now();

      console.log(`Service ${service} health reset`);
    }
  }

  resetAllHealth(): void {
    this.healthStatus.forEach((_, service) => {
      this.resetServiceHealth(service);
    });
  }

  private emitHealthEvent(
    service: ServiceLayer,
    event: "enabled" | "disabled",
  ): void {
    if (typeof window !== "undefined") {
      const customEvent = new CustomEvent("ai-function-health", {
        detail: { service, event, timestamp: Date.now() },
      });
      window.dispatchEvent(customEvent);
    }
  }

  // Get health summary for monitoring
  getHealthSummary(): {
    overall: "healthy" | "degraded" | "critical";
    services: {
      [key in ServiceLayer]: { healthy: boolean; failureCount: number };
    };
    disabledServices: ServiceLayer[];
  } {
    const services = this.getAllServiceStatuses();
    const disabledServices = services
      .filter((s) => s.disabled)
      .map((s) => s.service);

    let healthyCount = 0;
    let totalCount = services.length;

    const serviceStatus: {
      [key in ServiceLayer]: { healthy: boolean; failureCount: number };
    } = {
      supabase: { healthy: false, failureCount: 0 },
      vercel: { healthy: false, failureCount: 0 },
      fallback: { healthy: true, failureCount: 0 }, // Fallback is always healthy
    };

    services.forEach((status) => {
      serviceStatus[status.service] = {
        healthy: status.healthy && !status.disabled,
        failureCount: status.failureCount,
      };

      if (status.healthy && !status.disabled) {
        healthyCount++;
      }
    });

    let overall: "healthy" | "degraded" | "critical";

    if (healthyCount === totalCount) {
      overall = "healthy";
    } else if (healthyCount >= totalCount / 2) {
      overall = "degraded";
    } else {
      overall = "critical";
    }

    return {
      overall,
      services: serviceStatus,
      disabledServices,
    };
  }

  // Manual health check methods
  async performHealthCheck(service: ServiceLayer): Promise<boolean> {
    try {
      let isHealthy = false;

      switch (service) {
        case "supabase":
          isHealthy = await this.checkSupabaseHealth();
          break;
        case "vercel":
          isHealthy = await this.checkVercelHealth();
          break;
        case "fallback":
          isHealthy = true; // Fallback is always considered healthy
          break;
      }

      if (isHealthy) {
        this.recordSuccess(service);
      } else {
        this.recordFailure(service, "Health check failed");
      }

      return isHealthy;
    } catch (error) {
      this.recordFailure(service, `Health check error: ${error}`);
      return false;
    }
  }

  private async checkSupabaseHealth(): Promise<boolean> {
    try {
      // Try to make a simple request to Supabase
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        return false;
      }

      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: "HEAD",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }

  private async checkVercelHealth(): Promise<boolean> {
    try {
      // Try to make a simple request to a Vercel API route
      const response = await fetch("/api/health", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // Performance tracking
  private performanceMetrics: Map<
    ServiceLayer,
    {
      averageResponseTime: number;
      samples: number[];
      lastUpdated: number;
    }
  > = new Map();

  recordPerformance(service: ServiceLayer, responseTime: number): void {
    let metrics = this.performanceMetrics.get(service);

    if (!metrics) {
      metrics = {
        averageResponseTime: responseTime,
        samples: [responseTime],
        lastUpdated: Date.now(),
      };
    } else {
      metrics.samples.push(responseTime);

      // Keep only last 100 samples
      if (metrics.samples.length > 100) {
        metrics.samples = metrics.samples.slice(-100);
      }

      // Calculate new average
      metrics.averageResponseTime =
        metrics.samples.reduce((a, b) => a + b, 0) / metrics.samples.length;
      metrics.lastUpdated = Date.now();
    }

    this.performanceMetrics.set(service, metrics);
  }

  getPerformanceMetrics(service: ServiceLayer): {
    averageResponseTime: number;
    p95ResponseTime: number;
    sampleCount: number;
  } | null {
    const metrics = this.performanceMetrics.get(service);
    if (!metrics || metrics.samples.length === 0) return null;

    const sorted = [...metrics.samples].sort((a, b) => a - b);
    const p95Index = Math.floor(sorted.length * 0.95);

    return {
      averageResponseTime: metrics.averageResponseTime,
      p95ResponseTime: sorted[p95Index] || metrics.averageResponseTime,
      sampleCount: metrics.samples.length,
    };
  }
}

// Singleton instance
// Lazy initialization to prevent "Cannot access before initialization" errors
let healthTrackerInstance: HealthTracker | null = null;
export const getHealthTracker = () => {
  if (!healthTrackerInstance) {
    healthTrackerInstance = new HealthTracker();
  }
  return healthTrackerInstance;
};

// Health check event listeners for monitoring
if (typeof window !== "undefined") {
  window.addEventListener("ai-function-health", (event: any) => {
    console.log("Health event:", event.detail);
  });
}
