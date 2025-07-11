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
  level?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Log error details for debugging
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      level: this.props.level || "unknown",
      timestamp: new Date().toISOString(),
      url: window.location.href,
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  private handleReload = () => {
    try {
      window.location.reload();
    } catch (error) {
      console.error("Page reload failed:", error);
      // Fallback: try navigation to homepage
      try {
        window.location.href = "/";
      } catch (navError) {
        console.error("Navigation fallback also failed:", navError);
        alert(
          "Unable to reload the page. Please manually refresh your browser.",
        );
      }
    }
  };

  private handleGoHome = () => {
    try {
      // Use window.location as fallback since router might be broken in error state
      window.location.href = "/";
    } catch (error) {
      // Ultimate fallback: try to reload the page
      console.error("Navigation failed:", error);
      try {
        window.location.reload();
      } catch (reloadError) {
        console.error("Reload also failed:", reloadError);
        // Show user message as last resort
        alert(
          "Navigation failed. Please manually refresh the page or go to the homepage.",
        );
      }
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-900">
                Something went wrong
              </CardTitle>
              <CardDescription className="text-gray-600">
                An unexpected error occurred. We apologize for the
                inconvenience.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {this.state.error && import.meta.env.DEV && (
                <details className="text-sm bg-gray-100 p-3 rounded-md">
                  <summary className="cursor-pointer font-medium text-gray-700 mb-2">
                    <Bug className="w-4 h-4 inline mr-1" />
                    Error Details (Dev Mode)
                  </summary>
                  <div className="mt-2 space-y-2">
                    <div>
                      <strong>Message:</strong>
                      <pre className="text-xs text-gray-600 whitespace-pre-wrap break-words mt-1">
                        {this.state.error.message}
                      </pre>
                    </div>
                    {this.state.error.stack && (
                      <div>
                        <strong>Stack:</strong>
                        <pre className="text-xs text-gray-600 whitespace-pre-wrap break-words mt-1 max-h-32 overflow-y-auto">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}
                    {this.state.errorInfo?.componentStack && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="text-xs text-gray-600 whitespace-pre-wrap break-words mt-1 max-h-32 overflow-y-auto">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={this.handleReset}
                  className="flex-1"
                  variant="default"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button
                  onClick={this.handleReload}
                  className="flex-1"
                  variant="outline"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reload Page
                </Button>
                <Button
                  onClick={this.handleGoHome}
                  className="flex-1"
                  variant="outline"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
