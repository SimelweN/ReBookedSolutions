import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Terminal,
  Download,
  Trash2,
  Search,
  Filter,
  AlertTriangle,
  Info,
  Bug,
  Zap,
  ChevronDown,
  ChevronRight,
  Copy,
  Settings,
} from "lucide-react";
import { toast } from "sonner";
import {
  consoleInterceptor,
  ConsoleLogEntry,
} from "@/services/consoleInterceptor";

interface RealConsoleProps {
  height?: string;
  className?: string;
}

const RealConsole: React.FC<RealConsoleProps> = ({
  height = "500px",
  className = "",
}) => {
  const [logs, setLogs] = useState<ConsoleLogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<ConsoleLogEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilters, setTypeFilters] = useState<Set<string>>(
    new Set(["log", "warn", "error", "info", "debug"]),
  );
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  const [autoScroll, setAutoScroll] = useState(true);
  const [maxLogs, setMaxLogs] = useState(1000);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = consoleInterceptor.subscribe((newLogs) => {
      setLogs(newLogs);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const filtered = logs.filter((log) => {
      const matchesSearch =
        searchTerm === "" ||
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.type.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilters.has(log.type);
      return matchesSearch && matchesType;
    });
    setFilteredLogs(filtered);
  }, [logs, searchTerm, typeFilters]);

  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [filteredLogs, autoScroll]);

  const toggleTypeFilter = (type: string) => {
    const newFilters = new Set(typeFilters);
    if (newFilters.has(type)) {
      newFilters.delete(type);
    } else {
      newFilters.add(type);
    }
    setTypeFilters(newFilters);
  };

  const toggleLogExpansion = (logId: string) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedLogs(newExpanded);
  };

  const copyLogToClipboard = (log: ConsoleLogEntry) => {
    const logText = `[${log.timestamp.toISOString()}] ${log.type.toUpperCase()}: ${log.message}${
      log.stack ? "\n" + log.stack : ""
    }`;
    navigator.clipboard
      .writeText(logText)
      .then(() => {
        toast.success("Log copied to clipboard");
      })
      .catch(() => {
        toast.error("Failed to copy log");
      });
  };

  const getLogIcon = (type: string) => {
    switch (type) {
      case "error":
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case "warn":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case "info":
        return <Info className="w-4 h-4 text-blue-500" />;
      case "debug":
        return <Bug className="w-4 h-4 text-purple-500" />;
      default:
        return <Terminal className="w-4 h-4 text-gray-500" />;
    }
  };

  const getLogBadgeVariant = (type: string) => {
    switch (type) {
      case "error":
        return "destructive";
      case "warn":
        return "default";
      case "info":
        return "secondary";
      case "debug":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getLogTextColor = (type: string) => {
    switch (type) {
      case "error":
        return "text-red-600 dark:text-red-400";
      case "warn":
        return "text-yellow-600 dark:text-yellow-400";
      case "info":
        return "text-blue-600 dark:text-blue-400";
      case "debug":
        return "text-purple-600 dark:text-purple-400";
      default:
        return "text-gray-700 dark:text-gray-300";
    }
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      fractionalSecondDigits: 3,
    });
  };

  const getLogCounts = () => {
    const counts = logs.reduce(
      (acc, log) => {
        acc[log.type] = (acc[log.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
    return counts;
  };

  const logCounts = getLogCounts();

  return (
    <Card className={`${className} w-full`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Terminal className="w-5 h-5" />
            Real-Time Console
            <Badge variant="outline" className="ml-2">
              {filteredLogs.length} / {logs.length}
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoScroll(!autoScroll)}
              className={autoScroll ? "bg-green-50 border-green-200" : ""}
            >
              <Zap className="w-4 h-4" />
              Auto-scroll
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => consoleInterceptor.downloadLogs()}
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                consoleInterceptor.clearLogs();
                setExpandedLogs(new Set());
                toast.success("Console cleared");
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-1">
            {(["log", "info", "warn", "error", "debug"] as const).map(
              (type) => (
                <Button
                  key={type}
                  variant={typeFilters.has(type) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleTypeFilter(type)}
                  className="h-8 px-2"
                >
                  {getLogIcon(type)}
                  <span className="ml-1 text-xs">
                    {type} ({logCounts[type] || 0})
                  </span>
                </Button>
              ),
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea
          ref={scrollAreaRef}
          style={{ height }}
          className="w-full border-t"
        >
          <div className="p-4 space-y-2 font-mono text-sm">
            {filteredLogs.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                {logs.length === 0
                  ? "No console output yet..."
                  : "No logs match current filters"}
              </div>
            ) : (
              filteredLogs.map((log) => {
                const isExpanded = expandedLogs.has(log.id);
                const hasStack = Boolean(log.stack);

                return (
                  <div
                    key={log.id}
                    className={`p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                      log.type === "error"
                        ? "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800"
                        : log.type === "warn"
                          ? "bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800"
                          : "bg-gray-50 dark:bg-gray-800/50"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-0 h-auto hover:bg-transparent"
                          onClick={() => hasStack && toggleLogExpansion(log.id)}
                          disabled={!hasStack}
                        >
                          {hasStack ? (
                            isExpanded ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )
                          ) : (
                            <div className="w-4 h-4" />
                          )}
                        </Button>

                        {getLogIcon(log.type)}

                        <Badge
                          variant={getLogBadgeVariant(log.type)}
                          className="text-xs"
                        >
                          {log.type}
                        </Badge>

                        <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">
                          {formatTime(log.timestamp)}
                        </span>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1 h-auto hover:bg-gray-200 dark:hover:bg-gray-600"
                        onClick={() => copyLogToClipboard(log)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>

                    <div
                      className={`mt-2 ${getLogTextColor(log.type)} break-words`}
                    >
                      <pre className="whitespace-pre-wrap font-mono text-sm">
                        {log.message}
                      </pre>
                    </div>

                    {hasStack && isExpanded && (
                      <div className="mt-3 p-3 bg-gray-100 dark:bg-gray-800 rounded border">
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                          Stack Trace:
                        </div>
                        <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {log.stack}
                        </pre>
                      </div>
                    )}
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default RealConsole;
