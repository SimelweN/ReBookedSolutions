/**
 * Email Automation Hook
 * Provides easy-to-use functions for triggering automated emails
 */

import { useCallback } from "react";
import EmailService from "@/services/emailService";
import {
  processPaymentSuccessWithEmails,
  sendCourierPickupEmails,
  sendDeliveryCompleteEmails,
} from "@/services/enhancedPaymentOperations";
import { sendBankDetailsConfirmationEmail } from "@/services/enhancedAuthOperations";

export interface EmailTriggers {
  // Authentication emails
  onUserRegistered: (user: { name: string; email: string }) => Promise<void>;
  onPasswordReset: (
    user: { name: string; email: string },
    resetLink: string,
  ) => Promise<void>;
  onEmailVerification: (
    user: { name: string; email: string },
    verificationLink: string,
  ) => Promise<void>;

  // Banking emails
  onBankDetailsAdded: (userId: string) => Promise<void>;

  // Order emails
  onPaymentSuccessful: (paymentData: {
    orderId: string;
    paymentReference: string;
    buyerId: string;
    sellerId: string;
    bookId: string;
    totalAmount: number;
    bookPrice: number;
    deliveryFee?: number;
  }) => Promise<void>;

  onCourierPickup: (
    orderId: string,
    trackingNumber: string,
    courierService: string,
    estimatedDelivery: string,
  ) => Promise<void>;

  onDeliveryComplete: (orderId: string) => Promise<void>;

  onOrderCancelled: (
    orderId: string,
    reason: string,
    refundAmount?: number,
  ) => Promise<void>;
}

export const useEmailAutomation = (): EmailTriggers => {
  const onUserRegistered = useCallback(
    async (user: { name: string; email: string }) => {
      try {
        await EmailService.sendWelcomeEmail(user);
        console.log("✅ Welcome email triggered for:", user.email);
      } catch (error) {
        console.error("❌ Failed to send welcome email:", error);
      }
    },
    [],
  );

  const onPasswordReset = useCallback(
    async (user: { name: string; email: string }, resetLink: string) => {
      try {
        await EmailService.sendPasswordReset(user, resetLink);
        console.log("✅ Password reset email triggered for:", user.email);
      } catch (error) {
        console.error("❌ Failed to send password reset email:", error);
      }
    },
    [],
  );

  const onEmailVerification = useCallback(
    async (user: { name: string; email: string }, verificationLink: string) => {
      try {
        await EmailService.sendEmailVerification(user, verificationLink);
        console.log("✅ Email verification triggered for:", user.email);
      } catch (error) {
        console.error("❌ Failed to send email verification:", error);
      }
    },
    [],
  );

  const onBankDetailsAdded = useCallback(async (userId: string) => {
    try {
      await sendBankDetailsConfirmationEmail(userId);
      console.log(
        "✅ Bank details confirmation email triggered for user:",
        userId,
      );
    } catch (error) {
      console.error("❌ Failed to send bank details confirmation:", error);
    }
  }, []);

  const onPaymentSuccessful = useCallback(
    async (paymentData: {
      orderId: string;
      paymentReference: string;
      buyerId: string;
      sellerId: string;
      bookId: string;
      totalAmount: number;
      bookPrice: number;
      deliveryFee?: number;
    }) => {
      try {
        await processPaymentSuccessWithEmails(paymentData);
        console.log(
          "✅ Payment success emails triggered for order:",
          paymentData.orderId,
        );
      } catch (error) {
        console.error("❌ Failed to send payment success emails:", error);
      }
    },
    [],
  );

  const onCourierPickup = useCallback(
    async (
      orderId: string,
      trackingNumber: string,
      courierService: string,
      estimatedDelivery: string,
    ) => {
      try {
        await sendCourierPickupEmails(
          orderId,
          trackingNumber,
          courierService,
          estimatedDelivery,
        );
        console.log("✅ Courier pickup emails triggered for order:", orderId);
      } catch (error) {
        console.error("❌ Failed to send courier pickup emails:", error);
      }
    },
    [],
  );

  const onDeliveryComplete = useCallback(async (orderId: string) => {
    try {
      await sendDeliveryCompleteEmails(orderId);
      console.log("✅ Delivery complete emails triggered for order:", orderId);
    } catch (error) {
      console.error("❌ Failed to send delivery complete emails:", error);
    }
  }, []);

  const onOrderCancelled = useCallback(
    async (orderId: string, reason: string, refundAmount?: number) => {
      try {
        const { sendOrderCancellationEmail } = await import(
          "@/services/enhancedPaymentOperations"
        );
        await sendOrderCancellationEmail(orderId, reason, refundAmount);
        console.log(
          "✅ Order cancellation email triggered for order:",
          orderId,
        );
      } catch (error) {
        console.error("❌ Failed to send order cancellation email:", error);
      }
    },
    [],
  );

  return {
    onUserRegistered,
    onPasswordReset,
    onEmailVerification,
    onBankDetailsAdded,
    onPaymentSuccessful,
    onCourierPickup,
    onDeliveryComplete,
    onOrderCancelled,
  };
};

/**
 * Standalone email automation functions (for use outside React components)
 */
export const emailAutomation = {
  async triggerWelcomeEmail(user: { name: string; email: string }) {
    try {
      await EmailService.sendWelcomeEmail(user);
      return true;
    } catch (error) {
      console.error("Failed to trigger welcome email:", error);
      return false;
    }
  },

  async triggerPaymentEmails(paymentData: {
    orderId: string;
    paymentReference: string;
    buyerId: string;
    sellerId: string;
    bookId: string;
    totalAmount: number;
    bookPrice: number;
    deliveryFee?: number;
  }) {
    try {
      await processPaymentSuccessWithEmails(paymentData);
      return true;
    } catch (error) {
      console.error("Failed to trigger payment emails:", error);
      return false;
    }
  },

  async triggerBankingEmail(userId: string) {
    try {
      await sendBankDetailsConfirmationEmail(userId);
      return true;
    } catch (error) {
      console.error("Failed to trigger banking email:", error);
      return false;
    }
  },

  async triggerCourierEmails(
    orderId: string,
    trackingNumber: string,
    courierService: string,
    estimatedDelivery: string,
  ) {
    try {
      await sendCourierPickupEmails(
        orderId,
        trackingNumber,
        courierService,
        estimatedDelivery,
      );
      return true;
    } catch (error) {
      console.error("Failed to trigger courier emails:", error);
      return false;
    }
  },

  async triggerDeliveryEmails(orderId: string) {
    try {
      await sendDeliveryCompleteEmails(orderId);
      return true;
    } catch (error) {
      console.error("Failed to trigger delivery emails:", error);
      return false;
    }
  },
};
