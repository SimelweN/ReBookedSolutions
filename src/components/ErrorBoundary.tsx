import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  level?: "app" | "page" | "component";
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  retryCount: number;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    retryCount: 0,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, retryCount: 0 };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { level = "component", onError } = this.props;

    // Use proper error serialization to prevent [object Object] logging
    console.error(`[${level.toUpperCase()} ERROR BOUNDARY] Error:`, {
      message: error.message,
      stack: error.stack,
      name: error.name,
      type: error.constructor.name,
    });

    console.error(`[${level.toUpperCase()} ERROR BOUNDARY] Error Info:`, {
      componentStack: errorInfo.componentStack,
      errorBoundary: `${level}ErrorBoundary`,
      timestamp: new Date().toISOString(),
    });

    // Log to external service in production
    if (process.env.NODE_ENV === "production") {
      this.logErrorToService(error, errorInfo, level);
    }

    this.setState({
      error,
      errorInfo,
      retryCount: this.state.retryCount + 1,
    });

    if (onError) {
      onError(error, errorInfo);
    }
  }

  private logErrorToService(error: Error, errorInfo: ErrorInfo, level: string) {
    // In a real app, you'd send this to your error tracking service
    console.error("Production error logged:", {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      level,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    });
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
    });
  };

  private handleGoHome = () => {
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { level = "component" } = this.props;
      const { error, retryCount } = this.state;

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-xl">
                {level === "app"
                  ? "Application Error"
                  : level === "page"
                    ? "Page Error"
                    : "Something went wrong"}
              </CardTitle>
              <CardDescription>
                {level === "app"
                  ? "The application encountered an unexpected error. Our team has been notified."
                  : "An error occurred while loading this content. Please try refreshing the page."}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              {process.env.NODE_ENV === "development" && error && (
                <details className="text-left">
                  <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                    <Bug className="inline h-4 w-4 mr-1" />
                    Error Details (Development)
                  </summary>
                  <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono">
                    <div className="font-semibold text-red-600 mb-2">
                      {error.message}
                    </div>
                    <pre className="whitespace-pre-wrap text-gray-700">
                      {error.stack}
                    </pre>
                  </div>
                </details>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {retryCount < 3 && (
                  <Button
                    onClick={this.handleRetry}
                    variant="default"
                    className="flex-1 sm:flex-none"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Again
                  </Button>
                )}
                <Button
                  onClick={this.handleGoHome}
                  variant={retryCount >= 3 ? "default" : "outline"}
                  className="flex-1 sm:flex-none"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Go Home
                </Button>
              </div>

              {retryCount >= 3 && (
                <p className="text-sm text-gray-600 mt-4">
                  If this problem persists, please contact support at{" "}
                  <a
                    href="mailto:support@rebookedsolutions.co.za"
                    className="text-blue-600 hover:underline"
                  >
                    support@rebookedsolutions.co.za
                  </a>
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
