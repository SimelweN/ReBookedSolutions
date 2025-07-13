export interface ConsoleLogEntry {
  id: string;
  type: "log" | "warn" | "error" | "info" | "debug";
  message: string;
  timestamp: Date;
  args: any[];
  stack?: string;
}

export class ConsoleInterceptor {
  private static instance: ConsoleInterceptor;
  private logs: ConsoleLogEntry[] = [];
  private listeners: ((logs: ConsoleLogEntry[]) => void)[] = [];
  private maxLogs = 1000;
  private originalConsole: {
    log: typeof console.log;
    warn: typeof console.warn;
    error: typeof console.error;
    info: typeof console.info;
    debug: typeof console.debug;
  };

  private constructor() {
    this.originalConsole = {
      log: console.log.bind(console),
      warn: console.warn.bind(console),
      error: console.error.bind(console),
      info: console.info.bind(console),
      debug: console.debug.bind(console),
    };
    this.interceptConsole();
  }

  static getInstance(): ConsoleInterceptor {
    if (!ConsoleInterceptor.instance) {
      ConsoleInterceptor.instance = new ConsoleInterceptor();
    }
    return ConsoleInterceptor.instance;
  }

  private interceptConsole() {
    console.log = (...args: any[]) => {
      this.originalConsole.log(...args);
      this.addLog("log", args);
    };

    console.warn = (...args: any[]) => {
      this.originalConsole.warn(...args);
      this.addLog("warn", args);
    };

    console.error = (...args: any[]) => {
      this.originalConsole.error(...args);
      this.addLog("error", args, this.getStackTrace());
    };

    console.info = (...args: any[]) => {
      this.originalConsole.info(...args);
      this.addLog("info", args);
    };

    console.debug = (...args: any[]) => {
      this.originalConsole.debug(...args);
      this.addLog("debug", args);
    };

    // Intercept unhandled errors
    window.addEventListener("error", (event) => {
      this.addLog("error", [event.message], event.error?.stack);
    });

    // Intercept unhandled promise rejections
    window.addEventListener("unhandledrejection", (event) => {
      this.addLog(
        "error",
        [`Unhandled Promise Rejection: ${event.reason}`],
        event.reason?.stack || "No stack trace available",
      );
    });
  }

  private getStackTrace(): string {
    try {
      throw new Error();
    } catch (e: any) {
      return e.stack || "No stack trace available";
    }
  }

  private addLog(type: ConsoleLogEntry["type"], args: any[], stack?: string) {
    const entry: ConsoleLogEntry = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type,
      message: args.map((arg) => this.formatArg(arg)).join(" "),
      timestamp: new Date(),
      args,
      stack: stack || (type === "error" ? this.getStackTrace() : undefined),
    };

    this.logs.unshift(entry);

    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Notify all listeners
    this.listeners.forEach((listener) => listener([...this.logs]));
  }

  private formatArg(arg: any): string {
    if (arg === null) return "null";
    if (arg === undefined) return "undefined";
    if (typeof arg === "string") return arg;
    if (typeof arg === "number" || typeof arg === "boolean") return String(arg);
    if (typeof arg === "object") {
      try {
        return JSON.stringify(arg, null, 2);
      } catch {
        return "[Object (circular reference)]";
      }
    }
    if (typeof arg === "function") return "[Function]";
    return String(arg);
  }

  public getLogs(): ConsoleLogEntry[] {
    return [...this.logs];
  }

  public subscribe(listener: (logs: ConsoleLogEntry[]) => void): () => void {
    this.listeners.push(listener);
    // Immediately call with current logs
    listener([...this.logs]);

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  public clearLogs(): void {
    this.logs = [];
    this.listeners.forEach((listener) => listener([]));
  }

  public downloadLogs(): void {
    const logsText = this.logs
      .map(
        (log) =>
          `[${log.timestamp.toISOString()}] ${log.type.toUpperCase()}: ${log.message}${
            log.stack ? "\n" + log.stack : ""
          }`,
      )
      .join("\n\n");

    const blob = new Blob([logsText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `console-logs-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  public restoreOriginalConsole(): void {
    console.log = this.originalConsole.log;
    console.warn = this.originalConsole.warn;
    console.error = this.originalConsole.error;
    console.info = this.originalConsole.info;
    console.debug = this.originalConsole.debug;
  }

  public setMaxLogs(max: number): void {
    this.maxLogs = max;
    if (this.logs.length > max) {
      this.logs = this.logs.slice(0, max);
      this.listeners.forEach((listener) => listener([...this.logs]));
    }
  }
}

// Auto-initialize when module is loaded
export const consoleInterceptor = ConsoleInterceptor.getInstance();
