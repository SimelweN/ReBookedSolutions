export const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "critical":
      return "bg-red-100 text-red-800 border-red-200";
    case "warning":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "info":
      return "bg-blue-100 text-blue-800 border-blue-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export const getStatusIcon = (status: string, isRunning: boolean) => {
  if (isRunning) return "animate-spin";

  switch (status) {
    case "success":
      return "check-circle";
    case "failed":
      return "x-circle";
    case "running":
      return "animate-spin";
    default:
      return "play";
  }
};

export const getCategoryIcon = (category: string) => {
  switch (category) {
    case "auth":
      return "user";
    case "cart":
      return "shopping-cart";
    case "payment":
      return "credit-card";
    case "seller":
      return "store";
    case "system":
      return "settings";
    default:
      return "zap";
  }
};
