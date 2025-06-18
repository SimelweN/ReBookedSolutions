import React, { Component, ReactNode } from "react";
import { AlertTriangle, Wifi, RefreshCw, Settings } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface Props {
  children: ReactNode;
}

interface State {
  hasNetworkError: boolean;
  hasRenderError: boolean;
  isOnline: boolean;
  deploymentIssue: string | null;
  retryCount: number;
}

class DeploymentSafetyWrapper extends Component<Props, State> {
  private retryTimeout?: NodeJS.Timeout;

  constructor(props: Props) {
    super(props);

    this.state = {
      hasNetworkError: false,
      hasRenderError: false,
      isOnline: navigator.onLine,
      deploymentIssue: null,
      retryCount: 0,
    };
  }

  componentDidMount() {
    // Listen for online/offline events
    window.addEventListener("online", this.handleOnline);
    window.addEventListener("offline", this.handleOffline);

    // Check for common deployment issues
    this.checkDeploymentHealth();

    // Monitor for chunk loading failures (common with deployment updates)
    window.addEventListener("error", this.handleGlobalError);
    window.addEventListener(
      "unhandledrejection",
      this.handleUnhandledRejection,
    );
  }

  componentWillUnmount() {
    window.removeEventListener("online", this.handleOnline);
    window.removeEventListener("offline", this.handleOffline);
    window.removeEventListener("error", this.handleGlobalError);
    window.removeEventListener(
      "unhandledrejection",
      this.handleUnhandledRejection,
    );

    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  componentDidCatch(error: Error) {
    console.error("DeploymentSafetyWrapper caught error:", error);
    this.setState({
      hasRenderError: true,
      deploymentIssue: error.message.includes("Loading chunk")
        ? "deployment_update"
        : "render_error",
    });
  }

  private handleOnline = () => {
    this.setState({ isOnline: true });
    if (this.state.hasNetworkError) {
      // Auto-retry when coming back online
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  private handleOffline = () => {
    this.setState({ isOnline: false });
  };

  private handleGlobalError = (event: ErrorEvent) => {
    const { message, filename } = event;

    // Check for common deployment-related errors
    if (
      message.includes("Loading chunk") ||
      message.includes("Unexpected token") ||
      filename?.includes(".js") ||
      message.includes("Failed to fetch")
    ) {
      console.warn("Deployment-related error detected:", message);
      this.setState({
        deploymentIssue: "chunk_loading_error",
        hasNetworkError: true,
      });
    }
  };

  private handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    const reason = event.reason?.toString() || "";

    if (
      reason.includes("Loading chunk") ||
      reason.includes("Failed to fetch") ||
      reason.includes("NetworkError")
    ) {
      console.warn("Network/chunk error detected:", reason);
      this.setState({
        deploymentIssue: "network_error",
        hasNetworkError: true,
      });
    }
  };

  private checkDeploymentHealth = async () => {
    try {
      // Check if assets are accessible
      const response = await fetch("/vite.svg", { method: "HEAD" });
      if (!response.ok) {
        this.setState({ deploymentIssue: "asset_loading_error" });
      }
    } catch (error) {
      console.warn("Asset health check failed:", error);
      this.setState({ deploymentIssue: "health_check_failed" });
    }
  };

  private handleRetry = () => {
    const newRetryCount = this.state.retryCount + 1;

    if (newRetryCount >= 3) {
      // Force hard reload after 3 retries
      window.location.href = window.location.href;
      return;
    }

    this.setState({
      retryCount: newRetryCount,
      hasNetworkError: false,
      hasRenderError: false,
      deploymentIssue: null,
    });

    // Add a small delay before retrying
    this.retryTimeout = setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  private renderErrorState() {
    const { isOnline, deploymentIssue, retryCount } = this.state;

    let title = "Connection Issue";
    let description = "There was a problem loading the application.";
    let icon = <AlertTriangle className="h-8 w-8 text-red-600" />;

    if (!isOnline) {
      title = "No Internet Connection";
      description = "Please check your internet connection and try again.";
      icon = <Wifi className="h-8 w-8 text-gray-400" />;
    } else if (deploymentIssue === "deployment_update") {
      title = "App Update Available";
      description =
        "A new version of the app is available. Please refresh to get the latest version.";
      icon = <RefreshCw className="h-8 w-8 text-blue-600" />;
    } else if (deploymentIssue === "chunk_loading_error") {
      title = "Loading Error";
      description =
        "There was an error loading app resources. This usually happens after an app update.";
      icon = <RefreshCw className="h-8 w-8 text-orange-600" />;
    } else if (deploymentIssue === "asset_loading_error") {
      title = "Deployment Issue";
      description =
        "Some app resources couldn't be loaded. This might be a temporary deployment issue.";
      icon = <Settings className="h-8 w-8 text-red-600" />;
    }

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              {icon}
            </div>
            <CardTitle className="text-xl text-gray-900">{title}</CardTitle>
            <p className="text-gray-600 text-sm">{description}</p>
          </CardHeader>

          <CardContent className="space-y-4">
            {!isOnline && (
              <div className="rounded-md bg-yellow-50 border border-yellow-200 p-3">
                <p className="text-sm text-yellow-800">
                  <Wifi className="inline h-4 w-4 mr-1" />
                  Currently offline. The app will automatically retry when your
                  connection is restored.
                </p>
              </div>
            )}

            {deploymentIssue === "deployment_update" && (
              <div className="rounded-md bg-blue-50 border border-blue-200 p-3">
                <p className="text-sm text-blue-800">
                  <RefreshCw className="inline h-4 w-4 mr-1" />A new version is
                  available with the latest features and improvements.
                </p>
              </div>
            )}

            {deploymentIssue === "chunk_loading_error" && (
              <div className="rounded-md bg-orange-50 border border-orange-200 p-3">
                <p className="text-sm text-orange-800">
                  This error commonly occurs when the app has been updated while
                  you were using it. Refreshing will load the latest version.
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <Button
                onClick={this.handleRetry}
                className="w-full"
                disabled={!isOnline}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                {retryCount >= 2 ? "Force Refresh" : "Retry"}
              </Button>

              {retryCount >= 2 && (
                <Button
                  onClick={() => (window.location.href = "/")}
                  variant="outline"
                  className="w-full"
                >
                  Go to Homepage
                </Button>
              )}
            </div>

            <div className="text-center pt-4 border-t">
              <p className="text-xs text-gray-500">
                ReBooked Solutions
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
    if (
      this.state.hasNetworkError ||
      this.state.hasRenderError ||
      (!this.state.isOnline && this.state.deploymentIssue) ||
      this.state.deploymentIssue
    ) {
      return this.renderErrorState();
    }

    return this.props.children;
  }
}

export default DeploymentSafetyWrapper;
