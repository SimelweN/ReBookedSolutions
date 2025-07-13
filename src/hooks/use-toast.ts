import { toast as sonnerToast } from "sonner";

interface ToastOptions {
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  cancel?: {
    label: string;
    onClick?: () => void;
  };
  duration?: number;
  position?:
    | "top-left"
    | "top-center"
    | "top-right"
    | "bottom-left"
    | "bottom-center"
    | "bottom-right";
}

export const useToast = () => {
  const toast = {
    success: (message: string, options?: ToastOptions) => {
      return sonnerToast.success(message, {
        description: options?.description,
        action: options?.action,
        cancel: options?.cancel,
        duration: options?.duration,
        position: options?.position,
      });
    },

    error: (message: string, options?: ToastOptions) => {
      return sonnerToast.error(message, {
        description: options?.description,
        action: options?.action,
        cancel: options?.cancel,
        duration: options?.duration,
        position: options?.position,
      });
    },

    info: (message: string, options?: ToastOptions) => {
      return sonnerToast.info(message, {
        description: options?.description,
        action: options?.action,
        cancel: options?.cancel,
        duration: options?.duration,
        position: options?.position,
      });
    },

    warning: (message: string, options?: ToastOptions) => {
      return sonnerToast.warning(message, {
        description: options?.description,
        action: options?.action,
        cancel: options?.cancel,
        duration: options?.duration,
        position: options?.position,
      });
    },

    loading: (message: string, options?: ToastOptions) => {
      return sonnerToast.loading(message, {
        description: options?.description,
        duration: options?.duration,
        position: options?.position,
      });
    },

    promise: <T>(
      promise: Promise<T>,
      {
        loading,
        success,
        error,
      }: {
        loading: string;
        success: (data: T) => string;
        error: (error: any) => string;
      },
    ) => {
      return sonnerToast.promise(promise, {
        loading,
        success,
        error,
      });
    },

    custom: (component: React.ReactNode, options?: ToastOptions) => {
      return sonnerToast.custom(component, {
        duration: options?.duration,
        position: options?.position,
      });
    },

    dismiss: (toastId?: string | number) => {
      return sonnerToast.dismiss(toastId);
    },
  };

  return { toast };
};

// Export the direct toast function for backward compatibility
export const toast = {
  success: (message: string, options?: ToastOptions) =>
    sonnerToast.success(message, options),
  error: (message: string, options?: ToastOptions) =>
    sonnerToast.error(message, options),
  info: (message: string, options?: ToastOptions) =>
    sonnerToast.info(message, options),
  warning: (message: string, options?: ToastOptions) =>
    sonnerToast.warning(message, options),
  loading: (message: string, options?: ToastOptions) =>
    sonnerToast.loading(message, options),
  dismiss: sonnerToast.dismiss,
  promise: sonnerToast.promise,
  custom: sonnerToast.custom,
};
