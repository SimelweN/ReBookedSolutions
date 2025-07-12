import React, { Component, ErrorInfo, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Wifi, WifiOff, RefreshCw, AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasNetworkError: boolean;
  error?: Error;
  isOnline: boolean;
}

class NetworkErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasNetworkError: false,
      isOnline: navigator.onLine,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Check if it's a network-related error
    const isNetworkError =
      error.message.includes("Failed to fetch") ||
      error.message.includes("Network") ||
      error.message.includes("ERR_NETWORK") ||
      error.message.includes("ERR_INTERNET_DISCONNECTED");

    if (isNetworkError) {
      return { hasNetworkError: true, error };
    }

    return {};
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Only handle network-related errors
    if (this.state.hasNetworkError) {
      console.warn("🌐 Network error caught by boundary:", error, errorInfo);
    }
  }

  componentDidMount() {
    // Listen for online/offline events
    window.addEventListener("online", this.handleOnline);
    window.addEventListener("offline", this.handleOffline);
  }

  componentWillUnmount() {
    window.removeEventListener("online", this.handleOnline);
    window.removeEventListener("offline", this.handleOffline);
  }

  handleOnline = () => {
    this.setState({ isOnline: true });
    // If we were showing a network error, try to recover
    if (this.state.hasNetworkError) {
      setTimeout(() => {
        this.handleRetry();
      }, 1000);
    }
  };

  handleOffline = () => {
    this.setState({ isOnline: false });
  };

  handleRetry = () => {
    this.setState({ hasNetworkError: false, error: undefined });
  };

  render() {
    if (this.state.hasNetworkError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-red-600">
                {this.state.isOnline ? (
                  <Wifi className="w-5 h-5" />
                ) : (
                  <WifiOff className="w-5 h-5" />
                )}
                <span>Network Error</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  {this.state.isOnline
                    ? "There was a problem connecting to our servers."
                    : "You appear to be offline. Please check your internet connection."}
                </AlertDescription>
              </Alert>

              {this.state.error && (
                <div className="bg-gray-100 p-3 rounded-md">
                  <p className="text-sm text-gray-600">
                    <strong>Error:</strong> {this.state.error.message}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Button
                  onClick={this.handleRetry}
                  className="w-full"
                  disabled={!this.state.isOnline}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>

                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="w-full"
                >
                  Reload Page
                </Button>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-500">
                  Status: {this.state.isOnline ? "Online" : "Offline"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default NetworkErrorBoundary;
