import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  AlertTriangle,
  Activity,
  Database,
  Server,
  Zap,
  BarChart3,
  Settings,
  Trash2,
  Play,
  Pause,
} from "lucide-react";
import { toast } from "sonner";
import { getHealthTracker } from "@/services/healthTracker";
import { getFallbackStorage } from "@/services/fallbackStorage";
import {
  aiFunctionExecutor,
  processQueue,
  getFunctionStats,
  resetExecutor,
} from "@/services/functionExecutor";
import { HealthStatus, ServiceLayer } from "@/types/functionFallback";

const AIFunctionMonitor = () => {
  const [healthStatuses, setHealthStatuses] = useState<HealthStatus[]>([]);
  const [queueSize, setQueueSize] = useState(0);
  const [storageStats, setStorageStats] = useState({
    queueSize: 0,
    cacheSize: 0,
    localDataSize: 0,
    totalSize: 0,
  });
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadData();

    const interval = autoRefresh ? setInterval(loadData, 5000) : null;

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const loadData = async () => {
    try {
      // Get health statuses
      const statuses = getHealthTracker().getAllServiceStatuses();
      setHealthStatuses(statuses);

      // Get queue size
      const size = await getFallbackStorage().getQueueSize();
      setQueueSize(size);

      // Get storage stats
      const stats = getFallbackStorage().getStorageStats();
      setStorageStats(stats);
    } catch (error) {
      console.error("Failed to load monitoring data:", error);
    }
  };

  const handleProcessQueue = async () => {
    setIsProcessingQueue(true);
    try {
      await processQueue();
      toast.success("Queue processed successfully");
      await loadData();
    } catch (error) {
      toast.error("Failed to process queue");
      console.error("Queue processing error:", error);
    } finally {
      setIsProcessingQueue(false);
    }
  };

  const handleClearQueue = async () => {
    try {
      await getFallbackStorage().clearQueue();
      toast.success("Queue cleared");
      await loadData();
    } catch (error) {
      toast.error("Failed to clear queue");
      console.error("Queue clear error:", error);
    }
  };

  const handleClearCache = async () => {
    try {
      await getFallbackStorage().clearCache();
      toast.success("Cache cleared");
      await loadData();
    } catch (error) {
      toast.error("Failed to clear cache");
      console.error("Cache clear error:", error);
    }
  };

  const handleResetService = async (service: ServiceLayer) => {
    try {
      getHealthTracker().resetServiceHealth(service);
      toast.success(`${service} service health reset`);
      await loadData();
    } catch (error) {
      toast.error(`Failed to reset ${service} service`);
      console.error("Service reset error:", error);
    }
  };

  const handleResetAll = async () => {
    try {
      await resetExecutor();
      toast.success("All systems reset");
      await loadData();
    } catch (error) {
      toast.error("Failed to reset systems");
      console.error("System reset error:", error);
    }
  };

  const handleHealthCheck = async (service: ServiceLayer) => {
    try {
      const isHealthy = await getHealthTracker().performHealthCheck(service);
      toast.success(
        `${service} health check: ${isHealthy ? "Healthy" : "Unhealthy"}`,
      );
      await loadData();
    } catch (error) {
      toast.error(`Failed to check ${service} health`);
      console.error("Health check error:", error);
    }
  };

  const getServiceIcon = (service: ServiceLayer) => {
    switch (service) {
      case "supabase":
        return <Database className="h-4 w-4" />;
      case "vercel":
        return <Server className="h-4 w-4" />;
      case "fallback":
        return <Zap className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getHealthBadge = (status: HealthStatus) => {
    if (status.disabled) {
      return <Badge variant="destructive">Disabled</Badge>;
    }
    if (status.healthy) {
      return <Badge variant="default">Healthy</Badge>;
    }
    return <Badge variant="outline">Unhealthy</Badge>;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const healthSummary = getHealthTracker().getHealthSummary();
  const overallHealthColor = {
    healthy: "text-green-500",
    degraded: "text-yellow-500",
    critical: "text-red-500",
  }[healthSummary.overall];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            AI Function System Monitor
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={overallHealthColor}>
              {healthSummary.overall.toUpperCase()}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              {autoRefresh ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {autoRefresh ? "Pause" : "Resume"}
            </Button>
            <Button variant="outline" size="sm" onClick={loadData}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="health" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="health">Service Health</TabsTrigger>
          <TabsTrigger value="queue">Function Queue</TabsTrigger>
          <TabsTrigger value="storage">Storage Stats</TabsTrigger>
          <TabsTrigger value="actions">System Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="health" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {healthStatuses.map((status) => (
              <Card key={status.service}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    {getServiceIcon(status.service)}
                    {status.service.toUpperCase()}
                  </CardTitle>
                  {getHealthBadge(status)}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Failures:</span>
                      <span className="font-mono">{status.failureCount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Last Check:</span>
                      <span className="font-mono">
                        {new Date(status.lastCheck).toLocaleTimeString()}
                      </span>
                    </div>
                    {status.disabledUntil && (
                      <div className="flex justify-between text-sm">
                        <span>Disabled Until:</span>
                        <span className="font-mono text-red-500">
                          {new Date(status.disabledUntil).toLocaleTimeString()}
                        </span>
                      </div>
                    )}
                    <div className="flex gap-2 mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleHealthCheck(status.service)}
                        disabled={status.service === "fallback"}
                      >
                        <Activity className="h-3 w-3" />
                        Check
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResetService(status.service)}
                      >
                        <RefreshCw className="h-3 w-3" />
                        Reset
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="queue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Function Queue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{queueSize}</p>
                    <p className="text-sm text-muted-foreground">
                      Functions in queue
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleProcessQueue}
                      disabled={isProcessingQueue || queueSize === 0}
                      className="flex items-center gap-2"
                    >
                      {isProcessingQueue ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                      Process Queue
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleClearQueue}
                      disabled={queueSize === 0}
                      className="flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Clear Queue
                    </Button>
                  </div>
                </div>

                {queueSize > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Queue Status:</span>
                      <span className="text-orange-500">
                        Pending Processing
                      </span>
                    </div>
                    <Progress
                      value={(queueSize / Math.max(queueSize, 10)) * 100}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="storage" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Storage Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Queue Data:</span>
                      <span className="font-mono">
                        {formatBytes(storageStats.queueSize)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Cache Data:</span>
                      <span className="font-mono">
                        {formatBytes(storageStats.cacheSize)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Local Data:</span>
                      <span className="font-mono">
                        {formatBytes(storageStats.localDataSize)}
                      </span>
                    </div>
                    <hr />
                    <div className="flex justify-between text-sm font-medium">
                      <span>Total:</span>
                      <span className="font-mono">
                        {formatBytes(storageStats.totalSize)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Cache Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Clear cached data to free up storage space and force fresh
                    requests.
                  </p>
                  <Button
                    variant="outline"
                    onClick={handleClearCache}
                    className="w-full flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear All Cache
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                System Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <h4 className="font-medium">Health Management</h4>
                  <Button
                    variant="outline"
                    onClick={() => getHealthTracker().resetAllHealth()}
                    className="w-full flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Reset All Health
                  </Button>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Data Management</h4>
                  <Button
                    variant="outline"
                    onClick={handleResetAll}
                    className="w-full flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Reset All Systems
                  </Button>
                </div>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-800">
                      System Reset Warning
                    </p>
                    <p className="text-yellow-700">
                      Resetting all systems will clear the queue, cache, and
                      reset health statuses. This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIFunctionMonitor;
