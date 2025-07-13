import React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const SonnerTestComponent = () => {
  const testSuccess = () => {
    toast.success("Success message test!");
  };

  const testError = () => {
    toast.error("Error message test!");
  };

  const testInfo = () => {
    toast.info("Info message test!");
  };

  const testWarning = () => {
    toast.warning("Warning message test!");
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-semibold">Sonner Toast Test</h2>
      <div className="flex gap-2">
        <Button onClick={testSuccess} variant="default">
          Test Success
        </Button>
        <Button onClick={testError} variant="destructive">
          Test Error
        </Button>
        <Button onClick={testInfo} variant="secondary">
          Test Info
        </Button>
        <Button onClick={testWarning} variant="outline">
          Test Warning
        </Button>
      </div>
    </div>
  );
};

export default SonnerTestComponent;
