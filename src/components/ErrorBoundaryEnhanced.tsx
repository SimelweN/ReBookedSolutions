import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  errorMessage?: string;
  isThirdPartyError?: boolean;
}

class ErrorBoundaryEnhanced extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Check if this is a third-party script error or network issue
    const isThirdPartyError =
      error.stack?.includes("fullstory.com") ||
      error.stack?.includes("fs.js") ||
      error.stack?.includes("chrome-extension://") ||
      error.message.includes("Failed to fetch") ||
      error.message.includes("TypeError: Failed to fetch") ||
      error.message.includes("NetworkError") ||
      error.message.includes("fetch") ||
      error.name === "ChunkLoadError" ||
      (error.name === "TypeError" && error.message.includes("fetch"));

    return {
      hasError: true,
      errorMessage: error.message,
      isThirdPartyError,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    // Handle third-party errors gracefully
    if (this.state.isThirdPartyError) {
      console.warn(
        "Third-party script error detected, attempting to continue...",
      );

      // Auto-recover from third-party errors after a short delay
      setTimeout(() => {
        this.setState({
          hasError: false,
          errorMessage: undefined,
          isThirdPartyError: false,
        });
      }, 1000);
    }

    // Call the error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // For third-party errors, show minimal disruption
      if (this.state.isThirdPartyError) {
        return this.props.children; // Continue rendering as normal
      }

      // For actual app errors, show fallback
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-red-500 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-4">
              We're sorry, but something unexpected happened. Please try
              refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-book-600 hover:bg-book-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundaryEnhanced;
