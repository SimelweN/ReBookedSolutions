/**
 * Enhanced email notification service for ReBooked marketplace
 * Handles all automated email communications including seller notifications
 */

export interface EmailData {
  to: string;
  subject: string;
  template: string;
  variables: Record<string, any>;
}

export interface SellerPickupNotificationData {
  seller_name: string;
  book_title: string;
  pickup_date: string;
  pickup_time: string;
  courier: string;
  label_url: string;
  tracking_number: string;
}

// Re-export email template functions for backward compatibility
export {
  generateSellerPickupEmailHTML,
  generateSellerPickupEmailText,
} from "../../api/emailTemplates";

/**
 * Send email notification using Resend API
 */
export async function sendEmailNotification(
  emailData: EmailData,
): Promise<void> {
  try {
    // Call the send-email-notification edge function
    const response = await fetch("/api/send-email-notification", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailData),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Failed to send email");
    }

    console.log(`✅ Email sent successfully to: ${emailData.to}`);
  } catch (error) {
    console.error("Email notification failed:", error);
    throw error;
  }
}

/**
 * Send notification to seller when pickup is scheduled
 */
export async function notifySellerPickupScheduled(
  sellerEmail: string,
  data: SellerPickupNotificationData,
): Promise<void> {
  const emailData: EmailData = {
    to: sellerEmail,
    subject: `📦 Pickup scheduled for "${data.book_title}" - ${data.courier}`,
    template: "seller-pickup-notification",
    variables: data,
  };

  await sendEmailNotification(emailData);
}
