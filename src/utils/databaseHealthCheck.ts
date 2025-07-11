import { supabase } from "@/integrations/supabase/client";

interface HealthCheckResult {
  isHealthy: boolean;
  responseTime: number;
  error?: string;
  lastChecked: Date;
  fromCache: boolean;
}

class DatabaseHealthCircuitBreaker {
  private static instance: DatabaseHealthCircuitBreaker;
  private lastCheckTime: number = 0;
  private lastResult: HealthCheckResult | null = null;
  private readonly CACHE_DURATION = 30000; // 30 seconds
  private readonly MAX_RETRIES = 3;
  private failureCount = 0;
  private circuitOpen = false;
  private readonly CIRCUIT_TIMEOUT = 300000; // 5 minutes
  private circuitOpenTime = 0;

  static getInstance(): DatabaseHealthCircuitBreaker {
    if (!DatabaseHealthCircuitBreaker.instance) {
      DatabaseHealthCircuitBreaker.instance =
        new DatabaseHealthCircuitBreaker();
    }
    return DatabaseHealthCircuitBreaker.instance;
  }

  async checkDatabaseHealth(): Promise<HealthCheckResult> {
    const now = Date.now();

    // If circuit is open, check if enough time has passed to try again
    if (this.circuitOpen) {
      if (now - this.circuitOpenTime < this.CIRCUIT_TIMEOUT) {
        console.log(
          "🚫 Database health check circuit is open - using cached failure result",
        );
        return {
          isHealthy: false,
          responseTime: 0,
          error: "Circuit breaker open - too many recent failures",
          lastChecked: new Date(this.circuitOpenTime),
          fromCache: true,
        };
      } else {
        // Reset circuit breaker after timeout
        console.log("🔄 Resetting database health check circuit breaker");
        this.circuitOpen = false;
        this.failureCount = 0;
      }
    }

    // Return cached result if within cache duration
    if (this.lastResult && now - this.lastCheckTime < this.CACHE_DURATION) {
      console.log("📋 Using cached database health check result");
      return {
        ...this.lastResult,
        fromCache: true,
      };
    }

    // Perform actual health check
    console.log("🔍 Performing fresh database health check");
    const startTime = Date.now();

    try {
      const { error } = await supabase.from("profiles").select("id").limit(1);
      const responseTime = Date.now() - startTime;

      const result: HealthCheckResult = {
        isHealthy: !error,
        responseTime,
        error: error?.message,
        lastChecked: new Date(),
        fromCache: false,
      };

      // Success - reset failure count
      if (!error) {
        this.failureCount = 0;
        this.circuitOpen = false;
      } else {
        // Failure - increment counter
        this.failureCount++;
        if (this.failureCount >= this.MAX_RETRIES) {
          console.warn(
            `⚠️ Database health check failed ${this.failureCount} times - opening circuit breaker`,
          );
          this.circuitOpen = true;
          this.circuitOpenTime = now;
        }
      }

      // Cache the result
      this.lastResult = result;
      this.lastCheckTime = now;

      return result;
    } catch (error) {
      console.error("❌ Database health check error:", error);

      this.failureCount++;
      if (this.failureCount >= this.MAX_RETRIES) {
        this.circuitOpen = true;
        this.circuitOpenTime = now;
      }

      const result: HealthCheckResult = {
        isHealthy: false,
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : "Unknown error",
        lastChecked: new Date(),
        fromCache: false,
      };

      this.lastResult = result;
      this.lastCheckTime = now;

      return result;
    }
  }

  // Force refresh the next check (useful for manual refresh buttons)
  invalidateCache(): void {
    console.log("🗑️ Invalidating database health check cache");
    this.lastCheckTime = 0;
    this.lastResult = null;
  }

  // Get current status without triggering a new check
  getCachedStatus(): HealthCheckResult | null {
    return this.lastResult;
  }
}

// Lazy initialization to prevent "Cannot access before initialization" errors
export const getDatabaseHealthChecker = () =>
  DatabaseHealthCircuitBreaker.getInstance();

// Convenience function for simple usage
export async function checkDatabaseHealth(): Promise<HealthCheckResult> {
  return databaseHealthChecker.checkDatabaseHealth();
}
