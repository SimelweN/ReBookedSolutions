import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/services/toastService";
import { useToast } from "@/hooks/use-toast";
import {
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
  Loader2,
  CreditCard,
  Package,
} from "lucide-react";

const ToastDemo: React.FC = () => {
  const { toast: hookToast } = useToast();

  const handlePromiseToast = () => {
    const promise = new Promise<string>((resolve, reject) => {
      setTimeout(() => {
        Math.random() > 0.5
          ? resolve("Operation completed successfully!")
          : reject(new Error("Operation failed"));
      }, 2000);
    });

    toast.promise(promise, {
      loading: "Processing your request...",
      success: (data) => data,
      error: (error) => `Failed: ${error.message}`,
    });
  };

  const handleCustomToast = () => {
    toast.custom(
      <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg">
        <Package className="w-5 h-5" />
        <div>
          <p className="font-medium">Custom Toast</p>
          <p className="text-sm opacity-90">This is a custom styled toast!</p>
        </div>
      </div>,
      { duration: 5000 },
    );
  };

  const handleConfirmAction = () => {
    toast.confirmAction(
      "Are you sure you want to delete this item?",
      () => toast.success("Item deleted successfully"),
      () => toast.info("Action cancelled"),
    );
  };

  const handlePaymentSuccess = () => {
    toast.paymentSuccess(299.99, "ORD-123456");
  };

  const handleNetworkError = () => {
    toast.networkError();
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CheckCircle2 className="w-6 h-6 text-green-600" />
          <span>Toast Notification System</span>
        </CardTitle>
        <CardDescription>
          Enhanced toast notifications with rich content, actions, and
          specialized use cases
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Toasts */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center space-x-2">
            <Info className="w-5 h-5" />
            <span>Basic Notifications</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              onClick={() =>
                toast.success("Success! Your action was completed.")
              }
              variant="default"
              className="bg-green-600 hover:bg-green-700"
            >
              Success
            </Button>
            <Button
              onClick={() => toast.error("Error! Something went wrong.")}
              variant="destructive"
            >
              Error
            </Button>
            <Button
              onClick={() =>
                toast.warning("Warning! Please review your input.")
              }
              variant="outline"
              className="border-orange-500 text-orange-600 hover:bg-orange-50"
            >
              Warning
            </Button>
            <Button
              onClick={() =>
                toast.info("Info: Here's some helpful information.")
              }
              variant="outline"
              className="border-blue-500 text-blue-600 hover:bg-blue-50"
            >
              Info
            </Button>
          </div>
        </div>

        <Separator />

        {/* Rich Toasts */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Rich Notifications</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button
              onClick={() =>
                toast.success("File uploaded", {
                  description:
                    "Your document has been uploaded successfully and is ready for processing.",
                  action: {
                    label: "View File",
                    onClick: () => toast.info("Opening file viewer..."),
                  },
                })
              }
              variant="outline"
            >
              With Description & Action
            </Button>
            <Button
              onClick={() =>
                toast.error("Upload failed", {
                  description:
                    "The file could not be uploaded due to size restrictions.",
                  action: {
                    label: "Retry",
                    onClick: () => toast.loading("Retrying upload..."),
                  },
                  cancel: {
                    label: "Cancel",
                    onClick: () => toast.info("Upload cancelled"),
                  },
                })
              }
              variant="outline"
            >
              With Action & Cancel
            </Button>
            <Button
              onClick={() =>
                toast.info("System maintenance", {
                  description:
                    "Scheduled maintenance will begin in 10 minutes.",
                  important: true,
                  duration: 10000,
                })
              }
              variant="outline"
            >
              Important (Long Duration)
            </Button>
          </div>
        </div>

        <Separator />

        {/* Advanced Toasts */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Advanced Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <Button
              onClick={() => {
                const loadingId = toast.loading("Processing...");
                setTimeout(() => {
                  toast.dismiss(loadingId);
                  toast.success("Processing complete!");
                }, 3000);
              }}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Loader2 className="w-4 h-4" />
              <span>Loading Toast</span>
            </Button>
            <Button onClick={handlePromiseToast} variant="outline">
              Promise Toast
            </Button>
            <Button onClick={handleCustomToast} variant="outline">
              Custom Component
            </Button>
            <Button onClick={handleConfirmAction} variant="outline">
              Confirm Action
            </Button>
          </div>
        </div>

        <Separator />

        {/* Specialized Toasts */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Specialized Use Cases</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button
              onClick={handlePaymentSuccess}
              variant="outline"
              className="flex items-center space-x-2 border-green-500 text-green-600 hover:bg-green-50"
            >
              <CreditCard className="w-4 h-4" />
              <span>Payment Success</span>
            </Button>
            <Button
              onClick={() => toast.orderCreated("ORD-789012")}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Package className="w-4 h-4" />
              <span>Order Created</span>
            </Button>
            <Button
              onClick={handleNetworkError}
              variant="outline"
              className="border-red-500 text-red-600 hover:bg-red-50"
            >
              Network Error
            </Button>
          </div>
        </div>

        <Separator />

        {/* Toast Controls */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Toast Controls</h3>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => {
                toast.info("This toast can be dismissed manually");
                toast.info("This one too!");
                toast.success("And this one!");
              }}
              variant="outline"
            >
              Create Multiple
            </Button>
            <Button
              onClick={() => toast.dismissAll()}
              variant="outline"
              className="border-gray-500 text-gray-600 hover:bg-gray-50"
            >
              <X className="w-4 h-4 mr-2" />
              Dismiss All
            </Button>
            <Button
              onClick={() => toast.saveProgress("Auto-save complete")}
              variant="outline"
            >
              Quick Save Toast
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ToastDemo;
