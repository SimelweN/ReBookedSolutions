import { toast as sonnerToast } from "sonner";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  description?: string;
  action?: ToastAction;
  cancel?: ToastAction;
  duration?: number;
  position?:
    | "top-left"
    | "top-center"
    | "top-right"
    | "bottom-left"
    | "bottom-center"
    | "bottom-right";
  important?: boolean;
  dismissible?: boolean;
}

export class ToastService {
  private static defaultDuration = 4000;
  private static importantDuration = 8000;

  static success(message: string, options?: ToastOptions): string | number {
    return sonnerToast.success(message, {
      description: options?.description,
      action: options?.action,
      cancel: options?.cancel,
      duration: options?.important
        ? this.importantDuration
        : options?.duration || this.defaultDuration,
      position: options?.position,
      dismissible: options?.dismissible ?? true,
    });
  }

  static error(message: string, options?: ToastOptions): string | number {
    return sonnerToast.error(message, {
      description: options?.description,
      action: options?.action,
      cancel: options?.cancel,
      duration: options?.important
        ? this.importantDuration
        : options?.duration || this.defaultDuration,
      position: options?.position,
      dismissible: options?.dismissible ?? true,
    });
  }

  static warning(message: string, options?: ToastOptions): string | number {
    return sonnerToast.warning(message, {
      description: options?.description,
      action: options?.action,
      cancel: options?.cancel,
      duration: options?.important
        ? this.importantDuration
        : options?.duration || this.defaultDuration,
      position: options?.position,
      dismissible: options?.dismissible ?? true,
    });
  }

  static info(message: string, options?: ToastOptions): string | number {
    return sonnerToast.info(message, {
      description: options?.description,
      action: options?.action,
      cancel: options?.cancel,
      duration: options?.duration || this.defaultDuration,
      position: options?.position,
      dismissible: options?.dismissible ?? true,
    });
  }

  static loading(
    message: string,
    options?: Omit<ToastOptions, "action" | "cancel">,
  ): string | number {
    return sonnerToast.loading(message, {
      description: options?.description,
      duration: options?.duration || Infinity,
      position: options?.position,
      dismissible: options?.dismissible ?? false,
    });
  }

  static promise<T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    },
    options?: ToastOptions,
  ): string | number {
    return sonnerToast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
      duration: options?.duration,
      position: options?.position,
    });
  }

  static custom(
    component: React.ReactNode,
    options?: ToastOptions,
  ): string | number {
    return sonnerToast.custom(component, {
      duration: options?.duration || this.defaultDuration,
      position: options?.position,
      dismissible: options?.dismissible ?? true,
    });
  }

  static dismiss(toastId?: string | number): void {
    if (toastId) {
      sonnerToast.dismiss(toastId);
    } else {
      sonnerToast.dismiss();
    }
  }

  static dismissAll(): void {
    sonnerToast.dismiss();
  }

  // Specialized methods for common use cases
  static paymentSuccess(amount: number, orderId: string): string | number {
    return this.success("Payment Successful", {
      description: `Payment of R${amount.toFixed(2)} completed for order ${orderId}`,
      action: {
        label: "View Order",
        onClick: () => (window.location.href = `/my-orders`),
      },
      important: true,
    });
  }

  static orderCreated(orderId: string): string | number {
    return this.success("Order Created", {
      description: `Your order ${orderId} has been created successfully`,
      action: {
        label: "Track Order",
        onClick: () => (window.location.href = `/my-orders`),
      },
    });
  }

  static bookingError(error: string): string | number {
    return this.error("Booking Failed", {
      description: error,
      action: {
        label: "Try Again",
        onClick: () => window.location.reload(),
      },
      important: true,
    });
  }

  static networkError(): string | number {
    return this.error("Network Error", {
      description: "Please check your internet connection and try again",
      action: {
        label: "Retry",
        onClick: () => window.location.reload(),
      },
      important: true,
    });
  }

  static saveProgress(message: string = "Changes saved"): string | number {
    return this.success(message, {
      duration: 2000,
    });
  }

  static confirmAction(
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
  ): string | number {
    return this.info(message, {
      action: {
        label: "Confirm",
        onClick: onConfirm,
      },
      cancel: {
        label: "Cancel",
        onClick: onCancel || (() => {}),
      },
      duration: 10000,
      dismissible: true,
    });
  }
}

// Export convenience methods
export const toast = {
  success: ToastService.success.bind(ToastService),
  error: ToastService.error.bind(ToastService),
  warning: ToastService.warning.bind(ToastService),
  info: ToastService.info.bind(ToastService),
  loading: ToastService.loading.bind(ToastService),
  promise: ToastService.promise.bind(ToastService),
  custom: ToastService.custom.bind(ToastService),
  dismiss: ToastService.dismiss.bind(ToastService),
  dismissAll: ToastService.dismissAll.bind(ToastService),

  // Specialized methods
  paymentSuccess: ToastService.paymentSuccess.bind(ToastService),
  orderCreated: ToastService.orderCreated.bind(ToastService),
  bookingError: ToastService.bookingError.bind(ToastService),
  networkError: ToastService.networkError.bind(ToastService),
  saveProgress: ToastService.saveProgress.bind(ToastService),
  confirmAction: ToastService.confirmAction.bind(ToastService),
};
