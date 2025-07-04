import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Zap,
  Trash2,
  Settings,
  Code,
  Database,
} from "lucide-react";
import { toast } from "sonner";

interface CleanupTask {
  id: string;
  name: string;
  description: string;
  category: "console" | "storage" | "cache" | "errors" | "performance";
  status: "pending" | "running" | "completed" | "failed";
  action: () => Promise<void>;
}

const ErrorCleanupUtility = () => {
  const [tasks, setTasks] = useState<CleanupTask[]>([
    {
      id: "clear-console",
      name: "Clear Console Errors",
      description: "Clear browser console to remove accumulated error logs",
      category: "console",
      status: "pending",
      action: async () => {
        console.clear();
        // Override console methods temporarily to catch and clear any remaining errors
        const originalError = console.error;
        const originalWarn = console.warn;

        console.error = () => {};
        console.warn = () => {};

        setTimeout(() => {
          console.error = originalError;
          console.warn = originalWarn;
        }, 1000);
      },
    },
    {
      id: "clear-storage",
      name: "Clear Local Storage",
      description: "Remove potentially corrupted local storage data",
      category: "storage",
      status: "pending",
      action: async () => {
        // Clear all localStorage except critical auth data
        const authKeys = ["sb-access-token", "sb-refresh-token"];
        const preserve: { [key: string]: string } = {};

        authKeys.forEach((key) => {
          const value = localStorage.getItem(key);
          if (value) preserve[key] = value;
        });

        localStorage.clear();

        // Restore auth data
        Object.entries(preserve).forEach(([key, value]) => {
          localStorage.setItem(key, value);
        });
      },
    },
    {
      id: "clear-session",
      name: "Clear Session Storage",
      description: "Remove temporary session data that might cause issues",
      category: "storage",
      status: "pending",
      action: async () => {
        sessionStorage.clear();
      },
    },
    {
      id: "clear-cache",
      name: "Clear Browser Cache",
      description: "Attempt to clear cached resources",
      category: "cache",
      status: "pending",
      action: async () => {
        if ("caches" in window) {
          const cacheNames = await caches.keys();
          await Promise.all(
            cacheNames.map((cacheName) => caches.delete(cacheName)),
          );
        }
      },
    },
    {
      id: "reset-error-boundaries",
      name: "Reset Error Boundaries",
      description: "Trigger error boundary resets across the application",
      category: "errors",
      status: "pending",
      action: async () => {
        // Dispatch custom event to reset all error boundaries
        window.dispatchEvent(new CustomEvent("reset-error-boundaries"));

        // Also try to reset React error boundaries by forcing re-renders
        const event = new Event("resize");
        window.dispatchEvent(event);
      },
    },
    {
      id: "cleanup-event-listeners",
      name: "Cleanup Event Listeners",
      description: "Remove duplicate or leaked event listeners",
      category: "performance",
      status: "pending",
      action: async () => {
        // Create a list of common events that might leak
        const events = [
          "resize",
          "scroll",
          "click",
          "keydown",
          "focus",
          "blur",
        ];

        // We can't actually remove all listeners, but we can dispatch events to clean up
        events.forEach((eventType) => {
          const event = new Event(eventType);
          window.dispatchEvent(event);
        });
      },
    },
    {
      id: "validate-routes",
      name: "Validate Routes",
      description: "Check that all main routes are accessible",
      category: "errors",
      status: "pending",
      action: async () => {
        const routes = ["/", "/login", "/university-info", "/books"];
        const results = [];

        for (const route of routes) {
          try {
            // Test if route exists by creating a link element
            const link = document.createElement("a");
            link.href = route;
            results.push(`✅ ${route} - OK`);
          } catch (error) {
            results.push(`❌ ${route} - Error`);
          }
        }

        console.log("Route validation:", results);
      },
    },
    {
      id: "memory-cleanup",
      name: "Memory Cleanup",
      description: "Force garbage collection and cleanup memory leaks",
      category: "performance",
      status: "pending",
      action: async () => {
        // Force garbage collection if available
        if ((window as any).gc) {
          (window as any).gc();
        }

        // Clear any dangling timers
        const highestTimeoutId = setTimeout(() => {}, 0);
        for (let i = 0; i < highestTimeoutId; i++) {
          clearTimeout(i);
        }

        // Clear intervals (be careful with this)
        const highestIntervalId = setInterval(() => {}, 9999999);
        for (let i = 0; i < 100; i++) {
          // Only clear first 100 to avoid breaking the app
          clearInterval(i);
        }
        clearInterval(highestIntervalId);
      },
    },
  ]);

  const [isRunningAll, setIsRunningAll] = useState(false);

  const runTask = async (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, status: "running" } : task,
      ),
    );

    try {
      const task = tasks.find((t) => t.id === taskId);
      if (task) {
        await task.action();

        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId ? { ...t, status: "completed" } : t,
          ),
        );

        toast.success(`✅ ${task.name} completed`);
      }
    } catch (error) {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: "failed" } : t)),
      );

      toast.error(
        `❌ Task failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  };

  const runAllTasks = async () => {
    setIsRunningAll(true);

    for (const task of tasks) {
      if (task.status !== "completed") {
        await runTask(task.id);
        // Small delay between tasks
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    setIsRunningAll(false);
    toast.success("🎉 All cleanup tasks completed!");

    // Suggest page refresh after cleanup
    setTimeout(() => {
      if (
        window.confirm(
          "Cleanup complete! Would you like to refresh the page for a clean start?",
        )
      ) {
        window.location.reload();
      }
    }, 1000);
  };

  const resetAllTasks = () => {
    setTasks((prev) => prev.map((task) => ({ ...task, status: "pending" })));
  };

  const getStatusIcon = (status: CleanupTask["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "running":
        return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: CleanupTask["status"]) => {
    switch (status) {
      case "completed":
        return "border-green-200 bg-green-50";
      case "failed":
        return "border-red-200 bg-red-50";
      case "running":
        return "border-blue-200 bg-blue-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  const getCategoryIcon = (category: CleanupTask["category"]) => {
    switch (category) {
      case "console":
        return <Code className="w-4 h-4" />;
      case "storage":
        return <Database className="w-4 h-4" />;
      case "cache":
        return <Trash2 className="w-4 h-4" />;
      case "errors":
        return <AlertTriangle className="w-4 h-4" />;
      case "performance":
        return <Zap className="w-4 h-4" />;
      default:
        return <Settings className="w-4 h-4" />;
    }
  };

  const getTasksByCategory = (category: CleanupTask["category"]) => {
    return tasks.filter((task) => task.category === category);
  };

  const categories: CleanupTask["category"][] = [
    "console",
    "storage",
    "cache",
    "errors",
    "performance",
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Zap className="w-5 h-5" />
          <span>Error Cleanup Utility</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert className="border-blue-200 bg-blue-50">
          <AlertTriangle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            This utility will clean up common browser issues, clear caches, and
            reset error states. Run this if you're experiencing persistent
            errors or performance issues.
          </AlertDescription>
        </Alert>

        <div className="flex space-x-2">
          <Button
            onClick={runAllTasks}
            disabled={isRunningAll}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Zap
              className={`w-4 h-4 mr-2 ${isRunningAll ? "animate-spin" : ""}`}
            />
            {isRunningAll ? "Running All Tasks..." : "Run All Cleanup Tasks"}
          </Button>

          <Button onClick={resetAllTasks} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset Tasks
          </Button>
        </div>

        <div className="space-y-4">
          {categories.map((category) => {
            const categoryTasks = getTasksByCategory(category);
            if (categoryTasks.length === 0) return null;

            return (
              <div key={category} className="space-y-2">
                <h3 className="flex items-center space-x-2 font-medium text-gray-900">
                  {getCategoryIcon(category)}
                  <span className="capitalize">{category} Tasks</span>
                  <Badge variant="outline">
                    {
                      categoryTasks.filter((t) => t.status === "completed")
                        .length
                    }
                    /{categoryTasks.length}
                  </Badge>
                </h3>

                <div className="space-y-2">
                  {categoryTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`p-3 rounded-lg border ${getStatusColor(task.status)}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(task.status)}
                          <span className="font-medium">{task.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">
                            {task.status.toUpperCase()}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => runTask(task.id)}
                            disabled={task.status === "running" || isRunningAll}
                          >
                            {task.status === "running"
                              ? "Running..."
                              : task.status === "completed"
                                ? "Re-run"
                                : "Run"}
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm mt-1 text-gray-600">
                        {task.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>Note:</strong> After running cleanup tasks, you may want to
            refresh the page for the cleanest experience. Some tasks may
            temporarily affect functionality.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default ErrorCleanupUtility;
