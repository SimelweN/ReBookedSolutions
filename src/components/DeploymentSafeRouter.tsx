import React, { Component, ReactNode } from "react";
import { BrowserRouter, HashRouter } from "react-router-dom";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface Props {
  children: ReactNode;
}

interface State {
  hasRoutingError: boolean;
  fallbackToHash: boolean;
  retryCount: number;
}

class DeploymentSafeRouter extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      hasRoutingError: false,
      fallbackToHash: false,
      retryCount: 0,
    };
  }

  componentDidCatch(error: Error) {
    console.error("Router error:", error);

    // Check if it's a routing-related error
    if (
      error.message.includes("router") ||
      error.message.includes("history") ||
      error.message.includes("navigation")
    ) {
      this.setState({
        hasRoutingError: true,
        retryCount: this.state.retryCount + 1,
      });
    }
  }

  private detectDeploymentEnvironment() {
    // Detect if we're on a platform that might have routing issues
    const hostname = window.location.hostname;
    const pathname = window.location.pathname;

    // Common signs of problematic deployment environments
    const isSubdirectory =
      pathname !== "/" && !pathname.startsWith("/index.html");
    const isGitHubPages = hostname.includes("github.io");
    const isNestedDeployment =
      pathname.includes("/app/") || pathname.includes("/dist/");

    return {
      isSubdirectory,
      isGitHubPages,
      isNestedDeployment,
      shouldUseHashRouter: isGitHubPages || isNestedDeployment,
    };
  }

  private handleRetry = () => {
    const { retryCount } = this.state;

    if (retryCount >= 2) {
      // Try hash router as fallback
      this.setState({
        fallbackToHash: true,
        hasRoutingError: false,
      });
    } else {
      this.setState({
        hasRoutingError: false,
        retryCount: retryCount + 1,
      });
    }
  };

  private renderErrorState() {
    const { retryCount } = this.state;
    const deploymentInfo = this.detectDeploymentEnvironment();

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-xl text-gray-900">
              Routing Error
            </CardTitle>
            <p className="text-gray-600 text-sm">
              There was an issue with page navigation. This can happen with
              certain deployment configurations.
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            {deploymentInfo.isGitHubPages && (
              <div className="rounded-md bg-blue-50 border border-blue-200 p-3">
                <p className="text-sm text-blue-800">
                  <strong>GitHub Pages detected:</strong> The app will switch to
                  hash-based routing for better compatibility.
                </p>
              </div>
            )}

            {deploymentInfo.isNestedDeployment && (
              <div className="rounded-md bg-yellow-50 border border-yellow-200 p-3">
                <p className="text-sm text-yellow-800">
                  <strong>Nested deployment detected:</strong> This might
                  require hash-based routing.
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <Button onClick={this.handleRetry} className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                {retryCount >= 2 ? "Try Hash Router" : "Retry"}
              </Button>

              <Button
                onClick={() => (window.location.href = "/")}
                variant="outline"
                className="w-full"
              >
                Go to Homepage
              </Button>
            </div>

            <div className="text-center pt-4 border-t">
              <p className="text-xs text-gray-500">
                Current URL: {window.location.href}
                <br />
                Retry attempt: {retryCount + 1}/3
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  render() {
    if (this.state.hasRoutingError) {
      return this.renderErrorState();
    }

    const deploymentInfo = this.detectDeploymentEnvironment();
    const shouldUseHash =
      this.state.fallbackToHash || deploymentInfo.shouldUseHashRouter;

    // Use HashRouter for problematic deployment environments
    if (shouldUseHash) {
      console.log("Using HashRouter for deployment compatibility");
      return <HashRouter>{this.props.children}</HashRouter>;
    }

    // Use BrowserRouter for normal deployments
    return <BrowserRouter>{this.props.children}</BrowserRouter>;
  }
}

export default DeploymentSafeRouter;
