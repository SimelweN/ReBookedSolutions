import { getHealthTracker } from "./healthTracker";
import { getFallbackStorage } from "./fallbackStorage";
import { ServiceLayer, FunctionResult } from "@/types/functionFallback";

interface MonitoringEvent {
  id: string;
  timestamp: number;
  type:
    | "function_call"
    | "fallback_used"
    | "service_health"
    | "cache_hit"
    | "queue_event";
  functionName?: string;
  source?: ServiceLayer;
  success?: boolean;
  duration?: number;
  fallbackUsed?: boolean;
  cached?: boolean;
  error?: string;
  metadata?: any;
}

class AIMonitoringService {
  private events: MonitoringEvent[] = [];
  private readonly MAX_EVENTS = 1000;
  private listeners: Map<string, Array<(event: MonitoringEvent) => void>> =
    new Map();

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (typeof window === "undefined") return;

    // Listen for health events
    window.addEventListener("ai-function-health", (event: any) => {
      this.logEvent({
        type: "service_health",
        metadata: event.detail,
      });
    });
  }

  /**
   * Log a function execution event
   */
  logFunctionExecution(
    functionName: string,
    result: FunctionResult<any>,
    duration?: number,
  ): void {
    const event: MonitoringEvent = {
      id: `func_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      type: "function_call",
      functionName,
      source: result.source,
      success: result.success,
      duration,
      fallbackUsed: result.fallbackUsed,
      cached: result.cached,
      error: result.error,
      metadata: {
        resultTimestamp: result.timestamp,
        hasData: !!result.data,
      },
    };

    this.addEvent(event);
  }

  /**
   * Log a fallback usage event
   */
  logFallbackUsage(
    functionName: string,
    fallbackType: string,
    reason: string,
  ): void {
    const event: MonitoringEvent = {
      id: `fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      type: "fallback_used",
      functionName,
      metadata: {
        fallbackType,
        reason,
      },
    };

    this.addEvent(event);
  }

  /**
   * Log a cache hit event
   */
  logCacheHit(functionName: string, cacheKey: string, ageMs: number): void {
    const event: MonitoringEvent = {
      id: `cache_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      type: "cache_hit",
      functionName,
      cached: true,
      metadata: {
        cacheKey,
        ageMs,
      },
    };

    this.addEvent(event);
  }

  /**
   * Log a queue event
   */
  logQueueEvent(
    type: "enqueue" | "dequeue" | "retry" | "failed",
    functionName: string,
    metadata?: any,
  ): void {
    const event: MonitoringEvent = {
      id: `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      type: "queue_event",
      functionName,
      metadata: {
        queueEventType: type,
        ...metadata,
      },
    };

    this.addEvent(event);
  }

  /**
   * Add an event to the monitoring log
   */
  private addEvent(event: MonitoringEvent): void {
    this.events.push(event);

    // Keep only the latest events
    if (this.events.length > this.MAX_EVENTS) {
      this.events = this.events.slice(-this.MAX_EVENTS);
    }

    // Notify listeners
    this.notifyListeners(event.type, event);

    // Also log to console in development
    if (import.meta.env.DEV) {
      console.log(`🔍 AI Monitor [${event.type}]:`, event);
    }
  }

  /**
   * Generic event logging
   */
  logEvent(eventData: Partial<MonitoringEvent>): void {
    const event: MonitoringEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      type: "function_call",
      ...eventData,
    };

    this.addEvent(event);
  }

  /**
   * Get recent events
   */
  getRecentEvents(limit: number = 100): MonitoringEvent[] {
    return this.events.slice(-limit).reverse();
  }

  /**
   * Get events by type
   */
  getEventsByType(
    type: MonitoringEvent["type"],
    limit: number = 50,
  ): MonitoringEvent[] {
    return this.events
      .filter((event) => event.type === type)
      .slice(-limit)
      .reverse();
  }

  /**
   * Get events for a specific function
   */
  getFunctionEvents(
    functionName: string,
    limit: number = 50,
  ): MonitoringEvent[] {
    return this.events
      .filter((event) => event.functionName === functionName)
      .slice(-limit)
      .reverse();
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): {
    totalCalls: number;
    successRate: number;
    averageResponseTime: number;
    fallbackUsageRate: number;
    cacheHitRate: number;
    topFunctions: Array<{ name: string; calls: number; successRate: number }>;
  } {
    const functionCalls = this.events.filter((e) => e.type === "function_call");
    const totalCalls = functionCalls.length;

    if (totalCalls === 0) {
      return {
        totalCalls: 0,
        successRate: 0,
        averageResponseTime: 0,
        fallbackUsageRate: 0,
        cacheHitRate: 0,
        topFunctions: [],
      };
    }

    const successfulCalls = functionCalls.filter((e) => e.success).length;
    const fallbackCalls = functionCalls.filter((e) => e.fallbackUsed).length;
    const cachedCalls = functionCalls.filter((e) => e.cached).length;

    const responseTimes = functionCalls
      .filter((e) => e.duration)
      .map((e) => e.duration!);

    const averageResponseTime =
      responseTimes.length > 0
        ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
        : 0;

    // Calculate per-function stats
    const functionStats = new Map<
      string,
      { calls: number; successes: number }
    >();

    functionCalls.forEach((event) => {
      if (event.functionName) {
        const stats = functionStats.get(event.functionName) || {
          calls: 0,
          successes: 0,
        };
        stats.calls++;
        if (event.success) stats.successes++;
        functionStats.set(event.functionName, stats);
      }
    });

    const topFunctions = Array.from(functionStats.entries())
      .map(([name, stats]) => ({
        name,
        calls: stats.calls,
        successRate: stats.calls > 0 ? stats.successes / stats.calls : 0,
      }))
      .sort((a, b) => b.calls - a.calls)
      .slice(0, 10);

    return {
      totalCalls,
      successRate: successfulCalls / totalCalls,
      averageResponseTime,
      fallbackUsageRate: fallbackCalls / totalCalls,
      cacheHitRate: cachedCalls / totalCalls,
      topFunctions,
    };
  }

  /**
   * Get system health summary
   */
  async getSystemHealth(): Promise<{
    overall: "healthy" | "degraded" | "critical";
    services: any;
    queueSize: number;
    storageUsage: any;
    recentErrors: MonitoringEvent[];
  }> {
    const healthSummary = getHealthTracker().getHealthSummary();
    const queueSize = await getFallbackStorage().getQueueSize();
    const storageStats = getFallbackStorage().getStorageStats();

    const recentErrors = this.events
      .filter((e) => !e.success && e.type === "function_call")
      .slice(-10)
      .reverse();

    return {
      overall: healthSummary.overall,
      services: healthSummary.services,
      queueSize,
      storageUsage: storageStats,
      recentErrors,
    };
  }

  /**
   * Subscribe to monitoring events
   */
  subscribe(
    eventType: MonitoringEvent["type"] | "all",
    callback: (event: MonitoringEvent) => void,
  ): () => void {
    const key = eventType === "all" ? "*" : eventType;

    if (!this.listeners.has(key)) {
      this.listeners.set(key, []);
    }

    this.listeners.get(key)!.push(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(key);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }

  /**
   * Notify event listeners
   */
  private notifyListeners(
    eventType: MonitoringEvent["type"],
    event: MonitoringEvent,
  ): void {
    // Notify specific type listeners
    const typeListeners = this.listeners.get(eventType) || [];
    typeListeners.forEach((callback) => {
      try {
        callback(event);
      } catch (error) {
        console.error("Error in monitoring listener:", error);
      }
    });

    // Notify 'all' listeners
    const allListeners = this.listeners.get("*") || [];
    allListeners.forEach((callback) => {
      try {
        callback(event);
      } catch (error) {
        console.error("Error in monitoring listener:", error);
      }
    });
  }

  /**
   * Export monitoring data
   */
  exportData(): {
    events: MonitoringEvent[];
    metrics: any;
    timestamp: number;
  } {
    return {
      events: this.events,
      metrics: this.getPerformanceMetrics(),
      timestamp: Date.now(),
    };
  }

  /**
   * Clear monitoring data
   */
  clear(): void {
    this.events = [];
  }

  /**
   * Start real-time monitoring dashboard (for development)
   */
  startRealtimeLogging(): () => void {
    if (!import.meta.env.DEV) return () => {};

    console.log("🔍 AI Function Monitoring started");

    const unsubscribe = this.subscribe("all", (event) => {
      const emoji =
        {
          function_call: event.success ? "✅" : "❌",
          fallback_used: "🔄",
          service_health: "🏥",
          cache_hit: "💾",
          queue_event: "📋",
        }[event.type] || "📊";

      console.log(`${emoji} ${event.type}:`, {
        function: event.functionName,
        success: event.success,
        source: event.source,
        duration: event.duration,
        fallback: event.fallbackUsed,
        cached: event.cached,
      });
    });

    return unsubscribe;
  }
}

// Lazy initialization to prevent "Cannot access before initialization" errors
let aiMonitoringServiceInstance: AIMonitoringService | null = null;

export const getAiMonitoringService = () => {
  if (!aiMonitoringServiceInstance) {
    aiMonitoringServiceInstance = new AIMonitoringService();

    // Start real-time logging in development only once
    if (import.meta.env.DEV) {
      aiMonitoringServiceInstance.startRealtimeLogging();
    }
  }
  return aiMonitoringServiceInstance;
};

export default getAiMonitoringService;
