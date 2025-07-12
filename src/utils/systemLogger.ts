/**
 * System Logger Utility
 * Extracted from systemMonitoringService to break circular dependencies
 */

export type LogLevel = "debug" | "info" | "warning" | "error" | "critical";
export type LogSeverity = "low" | "medium" | "high" | "critical";
export type LogType =
  | "assignment-error"
  | "validation-error"
  | "api-error"
  | "performance-warning"
  | "system-error"
  | "general";

export interface LogEntry {
  id: string;
  type: LogType;
  level: LogLevel;
  message: string;
  context?: any;
  timestamp: string;
  resolved?: boolean;
  resolvedAt?: string;
  resolution?: string;
}

class SystemLogger {
  private logs: Map<string, LogEntry> = new Map();
  private maxLogs = 1000;

  /**
   * Log an error or message
   */
  log(type: LogType, level: LogLevel, message: string, context?: any): string {
    const id = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const entry: LogEntry = {
      id,
      type,
      level,
      message,
      context,
      timestamp: new Date().toISOString(),
    };

    this.logs.set(id, entry);

    // Maintain max logs limit
    if (this.logs.size > this.maxLogs) {
      const oldestKey = this.logs.keys().next().value;
      this.logs.delete(oldestKey);
    }

    // Log to console in development
    if (import.meta.env.DEV) {
      const consoleMethod =
        level === "error" || level === "critical"
          ? console.error
          : level === "warning"
            ? console.warn
            : console.log;

      consoleMethod(
        `[${level.toUpperCase()}] ${type}: ${message}`,
        context || "",
      );
    }

    return id;
  }

  /**
   * Get all logs with optional filtering
   */
  getLogs(filters?: {
    type?: LogType;
    level?: LogLevel;
    resolved?: boolean;
    since?: string;
  }): LogEntry[] {
    let entries = Array.from(this.logs.values());

    if (filters) {
      if (filters.type) {
        entries = entries.filter((entry) => entry.type === filters.type);
      }
      if (filters.level) {
        entries = entries.filter((entry) => entry.level === filters.level);
      }
      if (filters.resolved !== undefined) {
        entries = entries.filter(
          (entry) => entry.resolved === filters.resolved,
        );
      }
      if (filters.since) {
        entries = entries.filter((entry) => entry.timestamp >= filters.since!);
      }
    }

    return entries.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  }

  /**
   * Mark a log entry as resolved
   */
  resolve(id: string, resolution: string): boolean {
    const entry = this.logs.get(id);
    if (!entry) return false;

    entry.resolved = true;
    entry.resolvedAt = new Date().toISOString();
    entry.resolution = resolution;

    this.logs.set(id, entry);
    return true;
  }

  /**
   * Clear all logs
   */
  clear(): void {
    this.logs.clear();
  }

  /**
   * Get statistics about logged entries
   */
  getStats(): {
    total: number;
    byLevel: Record<LogLevel, number>;
    byType: Record<LogType, number>;
    resolved: number;
    unresolved: number;
  } {
    const entries = Array.from(this.logs.values());

    const stats = {
      total: entries.length,
      byLevel: {
        debug: 0,
        info: 0,
        warning: 0,
        error: 0,
        critical: 0,
      } as Record<LogLevel, number>,
      byType: {
        "assignment-error": 0,
        "validation-error": 0,
        "api-error": 0,
        "performance-warning": 0,
        "system-error": 0,
        general: 0,
      } as Record<LogType, number>,
      resolved: 0,
      unresolved: 0,
    };

    entries.forEach((entry) => {
      stats.byLevel[entry.level]++;
      stats.byType[entry.type]++;
      if (entry.resolved) {
        stats.resolved++;
      } else {
        stats.unresolved++;
      }
    });

    return stats;
  }
}

// Create singleton instance lazily
let systemLogger: SystemLogger | null = null;
const getSystemLogger = () => {
  if (!systemLogger) {
    systemLogger = new SystemLogger();
  }
  return systemLogger;
};

// Helper function to map severity to log level
const mapSeverityToLevel = (severity: LogSeverity | LogLevel): LogLevel => {
  if (severity === "low") return "info";
  if (severity === "medium") return "warning";
  if (severity === "high") return "error";
  if (severity === "critical") return "critical";
  // If it's already a LogLevel, return as is
  return severity as LogLevel;
};

// Convenience functions for easy import (backward compatible with old interface)
export const logError = (
  type: LogType,
  severityOrLevel: LogSeverity | LogLevel,
  message: string,
  context?: any,
) => {
  const level = mapSeverityToLevel(severityOrLevel);
  return getSystemLogger().log(type, level, message, context);
};

export const logInfo = (type: LogType, message: string, context?: any) =>
  getSystemLogger().log(type, "info", message, context);

export const logWarning = (type: LogType, message: string, context?: any) =>
  getSystemLogger().log(type, "warning", message, context);

export const getSystemLogs = (
  filters?: Parameters<SystemLogger["getLogs"]>[0],
) => getSystemLogger().getLogs(filters);

export const resolveLog = (id: string, resolution: string) =>
  systemLogger.resolve(id, resolution);

export const clearLogs = () => systemLogger.clear();

export const getLogStats = () => systemLogger.getStats();

export { systemLogger };
