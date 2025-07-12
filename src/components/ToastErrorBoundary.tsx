import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage?: string;
}

class ToastErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Check if this is a toast-related error
    const isToastError =
      error.message.includes("toast") ||
      error.message.includes("sonner") ||
      error.message.includes("setState") ||
      error.stack?.includes("sonner") ||
      error.stack?.includes("toast");

    if (isToastError) {
      console.warn("Toast error caught by boundary:", error.message);
      return {
        hasError: true,
        errorMessage: error.message,
      };
    }

    // If it's not a toast error, don't handle it
    throw error;
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Only log toast-related errors
    if (this.state.hasError) {
      console.warn("Toast Error Boundary caught an error:", {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      });
    }
  }

  render() {
    if (this.state.hasError) {
      // Render children without the problematic toast
      return this.props.children;
    }

    return this.props.children;
  }
}

export default ToastErrorBoundary;
