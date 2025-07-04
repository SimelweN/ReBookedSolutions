import { supabase } from "@/integrations/supabase/client";

export interface NotificationData {
  type: "email" | "sms" | "push" | "in_app";
  priority: "low" | "medium" | "high" | "urgent";
  template: string;
  recipient: {
    user_id?: string;
    email?: string;
    phone?: string;
    name?: string;
  };
  data: Record<string, any>;
  schedule_at?: string;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  subject: string;
  html_content: string;
  sms_content?: string;
  variables: string[];
}

const EMAIL_TEMPLATES: Record<string, NotificationTemplate> = {
  order_confirmation: {
    id: "order_confirmation",
    name: "Order Confirmation",
    subject: "Order Confirmed - {{book_title}}",
    html_content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Order Confirmed!</h1>
        <p>Hi {{buyer_name}},</p>
        <p>Your order for <strong>{{book_title}}</strong> has been confirmed.</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Order Details:</h3>
          <p><strong>Order ID:</strong> {{order_id}}</p>
          <p><strong>Book:</strong> {{book_title}}</p>
          <p><strong>Price:</strong> R{{amount}}</p>
          <p><strong>Seller:</strong> {{seller_name}}</p>
        </div>
        <p>The seller has been notified and will prepare your book for delivery.</p>
        <p>You can track your order status in your <a href="{{app_url}}/my-orders">account dashboard</a>.</p>
        <p>Best regards,<br>ReBooked Solutions Team</p>
      </div>
    `,
    variables: [
      "buyer_name",
      "book_title",
      "order_id",
      "amount",
      "seller_name",
      "app_url",
    ],
  },

  seller_notification: {
    id: "seller_notification",
    name: "New Sale Notification",
    subject: "New Sale - {{book_title}}",
    html_content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #059669;">Congratulations! You Have a Sale!</h1>
        <p>Hi {{seller_name}},</p>
        <p>Great news! Your book <strong>{{book_title}}</strong> has been sold.</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Sale Details:</h3>
          <p><strong>Order ID:</strong> {{order_id}}</p>
          <p><strong>Book:</strong> {{book_title}}</p>
          <p><strong>Sale Price:</strong> R{{amount}}</p>
          <p><strong>Your Earnings:</strong> R{{seller_amount}}</p>
          <p><strong>Buyer:</strong> {{buyer_email}}</p>
        </div>
        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
          <h4 style="margin: 0 0 10px 0;">Next Steps:</h4>
          <ol style="margin: 0; padding-left: 20px;">
            <li>Prepare the book for collection/delivery</li>
            <li>Ensure the book is in the described condition</li>
            <li>Wait for courier pickup or buyer collection</li>
          </ol>
        </div>
        <p>Once the buyer confirms receipt, your payment will be released to your account.</p>
        <p>Manage your sales in your <a href="{{app_url}}/seller-dashboard">seller dashboard</a>.</p>
        <p>Best regards,<br>ReBooked Solutions Team</p>
      </div>
    `,
    variables: [
      "seller_name",
      "book_title",
      "order_id",
      "amount",
      "seller_amount",
      "buyer_email",
      "app_url",
    ],
  },

  delivery_shipped: {
    id: "delivery_shipped",
    name: "Delivery Shipped",
    subject: "Your book is on the way - {{tracking_number}}",
    html_content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Your Book is on the Way!</h1>
        <p>Hi {{buyer_name}},</p>
        <p>Good news! Your book <strong>{{book_title}}</strong> has been shipped.</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Shipping Details:</h3>
          <p><strong>Tracking Number:</strong> {{tracking_number}}</p>
          <p><strong>Courier:</strong> {{courier_name}}</p>
          <p><strong>Estimated Delivery:</strong> {{estimated_delivery}}</p>
        </div>
        <p>You can track your package using the tracking number above on the {{courier_name}} website.</p>
        <p>Once you receive your book, please confirm delivery in your <a href="{{app_url}}/my-orders">order dashboard</a>.</p>
        <p>Best regards,<br>ReBooked Solutions Team</p>
      </div>
    `,
    variables: [
      "buyer_name",
      "book_title",
      "tracking_number",
      "courier_name",
      "estimated_delivery",
      "app_url",
    ],
  },

  payment_released: {
    id: "payment_released",
    name: "Payment Released",
    subject: "Payment Released - R{{amount}}",
    html_content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #059669;">Payment Released!</h1>
        <p>Hi {{seller_name}},</p>
        <p>Great news! Your payment for <strong>{{book_title}}</strong> has been released.</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Payment Details:</h3>
          <p><strong>Amount:</strong> R{{amount}}</p>
          <p><strong>Order ID:</strong> {{order_id}}</p>
          <p><strong>Transfer Reference:</strong> {{transfer_reference}}</p>
        </div>
        <p>The funds should appear in your bank account within 1-2 business days.</p>
        <p>View your earnings history in your <a href="{{app_url}}/seller-dashboard">seller dashboard</a>.</p>
        <p>Best regards,<br>ReBooked Solutions Team</p>
      </div>
    `,
    variables: [
      "seller_name",
      "book_title",
      "amount",
      "order_id",
      "transfer_reference",
      "app_url",
    ],
  },

  dispute_created: {
    id: "dispute_created",
    name: "Dispute Created",
    subject: "Dispute Created for Order {{order_id}}",
    html_content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #dc2626;">Dispute Created</h1>
        <p>Hi {{recipient_name}},</p>
        <p>A dispute has been created for order <strong>{{order_id}}</strong>.</p>
        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <h3>Dispute Details:</h3>
          <p><strong>Type:</strong> {{dispute_type}}</p>
          <p><strong>Description:</strong> {{description}}</p>
          <p><strong>Priority:</strong> {{priority}}</p>
        </div>
        <p>Our team will review the dispute and contact both parties within 24-48 hours.</p>
        <p>View dispute details in your <a href="{{app_url}}/my-orders">account dashboard</a>.</p>
        <p>Best regards,<br>ReBooked Solutions Team</p>
      </div>
    `,
    variables: [
      "recipient_name",
      "order_id",
      "dispute_type",
      "description",
      "priority",
      "app_url",
    ],
  },
};

export class EnhancedNotificationService {
  private static readonly FROM_EMAIL = "noreply@rebookedsolutions.co.za";
  private static readonly FROM_NAME = "ReBooked Solutions";
  private static readonly APP_URL = "https://rebookedsolutions.co.za";

  /**
   * Send notification using template
   */
  static async sendNotification(notification: NotificationData): Promise<{
    success: boolean;
    message: string;
    notification_id?: string;
  }> {
    try {
      console.log(
        "📧 Sending notification:",
        notification.type,
        notification.template,
      );

      // Get template
      const template = EMAIL_TEMPLATES[notification.template];
      if (!template) {
        throw new Error(`Template not found: ${notification.template}`);
      }

      // Process template variables
      const processedContent = this.processTemplate(
        template,
        notification.data,
      );

      // Create notification record
      const { data: notificationRecord, error: createError } = await supabase
        .from("notifications")
        .insert([
          {
            type: notification.type,
            priority: notification.priority,
            template: notification.template,
            recipient_user_id: notification.recipient.user_id,
            recipient_email: notification.recipient.email,
            recipient_phone: notification.recipient.phone,
            subject: processedContent.subject,
            content: processedContent.content,
            status: "pending",
            scheduled_at: notification.schedule_at || new Date().toISOString(),
            metadata: notification.data,
          },
        ])
        .select()
        .single();

      if (createError) {
        console.error("Error creating notification record:", createError);
        // Continue with sending even if DB insert fails
      }

      let result;

      // Send based on type
      switch (notification.type) {
        case "email":
          result = await this.sendEmail({
            to: notification.recipient.email!,
            subject: processedContent.subject,
            html: processedContent.content,
            priority: notification.priority,
          });
          break;

        case "sms":
          result = await this.sendSMS({
            to: notification.recipient.phone!,
            message: processedContent.smsContent || processedContent.subject,
            priority: notification.priority,
          });
          break;

        case "push":
          result = await this.sendPushNotification({
            user_id: notification.recipient.user_id!,
            title: processedContent.subject,
            body: this.extractTextFromHtml(processedContent.content),
            priority: notification.priority,
          });
          break;

        case "in_app":
          result = await this.createInAppNotification({
            user_id: notification.recipient.user_id!,
            title: processedContent.subject,
            content: processedContent.content,
            priority: notification.priority,
          });
          break;

        default:
          throw new Error(
            `Unsupported notification type: ${notification.type}`,
          );
      }

      // Update notification status
      if (notificationRecord) {
        await supabase
          .from("notifications")
          .update({
            status: result.success ? "sent" : "failed",
            sent_at: result.success ? new Date().toISOString() : null,
            error_message: result.success ? null : result.error,
            updated_at: new Date().toISOString(),
          })
          .eq("id", notificationRecord.id);
      }

      return {
        success: result.success,
        message: result.message,
        notification_id: notificationRecord?.id,
      };
    } catch (error) {
      console.error("Error sending notification:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Send email notification
   */
  private static async sendEmail(emailData: {
    to: string;
    subject: string;
    html: string;
    priority: string;
  }): Promise<{ success: boolean; message: string; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke(
        "send-email-notification",
        {
          body: {
            to: emailData.to,
            subject: emailData.subject,
            html: emailData.html,
            from: {
              name: this.FROM_NAME,
              email: this.FROM_EMAIL,
            },
          },
        },
      );

      if (error) {
        throw error;
      }

      return {
        success: data.success,
        message: data.message,
        error: data.error,
      };
    } catch (error) {
      console.error("Error sending email:", error);
      return {
        success: false,
        message: "Email sending failed",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Send SMS notification (placeholder - integrate with SMS provider)
   */
  private static async sendSMS(smsData: {
    to: string;
    message: string;
    priority: string;
  }): Promise<{ success: boolean; message: string; error?: string }> {
    try {
      // TODO: Integrate with SMS provider (e.g., Twilio, Clickatell)
      console.log("📱 SMS would be sent:", smsData);

      return {
        success: true,
        message: "SMS sent successfully (simulated)",
      };
    } catch (error) {
      return {
        success: false,
        message: "SMS sending failed",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Send push notification (placeholder)
   */
  private static async sendPushNotification(pushData: {
    user_id: string;
    title: string;
    body: string;
    priority: string;
  }): Promise<{ success: boolean; message: string; error?: string }> {
    try {
      // TODO: Integrate with push notification service (e.g., Firebase, OneSignal)
      console.log("🔔 Push notification would be sent:", pushData);

      return {
        success: true,
        message: "Push notification sent successfully (simulated)",
      };
    } catch (error) {
      return {
        success: false,
        message: "Push notification sending failed",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Create in-app notification
   */
  private static async createInAppNotification(notificationData: {
    user_id: string;
    title: string;
    content: string;
    priority: string;
  }): Promise<{ success: boolean; message: string; error?: string }> {
    try {
      const { error } = await supabase.from("in_app_notifications").insert([
        {
          user_id: notificationData.user_id,
          title: notificationData.title,
          content: this.extractTextFromHtml(notificationData.content),
          priority: notificationData.priority,
          read: false,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        throw error;
      }

      return {
        success: true,
        message: "In-app notification created successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: "In-app notification creation failed",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Process template with variables
   */
  private static processTemplate(
    template: NotificationTemplate,
    data: Record<string, any>,
  ): { subject: string; content: string; smsContent?: string } {
    // Add default variables
    const templateData = {
      ...data,
      app_url: this.APP_URL,
      current_year: new Date().getFullYear(),
      company_name: "ReBooked Solutions",
    };

    // Replace variables in subject
    let subject = template.subject;
    for (const [key, value] of Object.entries(templateData)) {
      const regex = new RegExp(`{{${key}}}`, "g");
      subject = subject.replace(regex, String(value));
    }

    // Replace variables in HTML content
    let content = template.html_content;
    for (const [key, value] of Object.entries(templateData)) {
      const regex = new RegExp(`{{${key}}}`, "g");
      content = content.replace(regex, String(value));
    }

    // Process SMS content if available
    let smsContent;
    if (template.sms_content) {
      smsContent = template.sms_content;
      for (const [key, value] of Object.entries(templateData)) {
        const regex = new RegExp(`{{${key}}}`, "g");
        smsContent = smsContent.replace(regex, String(value));
      }
    }

    return { subject, content, smsContent };
  }

  /**
   * Extract text content from HTML
   */
  private static extractTextFromHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, "") // Remove HTML tags
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim()
      .substring(0, 200); // Limit length
  }

  /**
   * Send order confirmation notifications
   */
  static async sendOrderConfirmation(orderData: {
    order_id: string;
    buyer_email: string;
    buyer_name: string;
    seller_id: string;
    seller_email: string;
    seller_name: string;
    book_title: string;
    amount: number;
    seller_amount: number;
  }): Promise<void> {
    try {
      // Send buyer confirmation
      await this.sendNotification({
        type: "email",
        priority: "high",
        template: "order_confirmation",
        recipient: {
          email: orderData.buyer_email,
          name: orderData.buyer_name,
        },
        data: {
          buyer_name: orderData.buyer_name,
          book_title: orderData.book_title,
          order_id: orderData.order_id,
          amount: orderData.amount,
          seller_name: orderData.seller_name,
        },
      });

      // Send seller notification
      await this.sendNotification({
        type: "email",
        priority: "high",
        template: "seller_notification",
        recipient: {
          user_id: orderData.seller_id,
          email: orderData.seller_email,
          name: orderData.seller_name,
        },
        data: {
          seller_name: orderData.seller_name,
          book_title: orderData.book_title,
          order_id: orderData.order_id,
          amount: orderData.amount,
          seller_amount: orderData.seller_amount,
          buyer_email: orderData.buyer_email,
        },
      });
    } catch (error) {
      console.error("Error sending order confirmation notifications:", error);
    }
  }

  /**
   * Send delivery notifications
   */
  static async sendDeliveryNotification(deliveryData: {
    buyer_email: string;
    buyer_name: string;
    book_title: string;
    tracking_number: string;
    courier_name: string;
    estimated_delivery: string;
  }): Promise<void> {
    try {
      await this.sendNotification({
        type: "email",
        priority: "medium",
        template: "delivery_shipped",
        recipient: {
          email: deliveryData.buyer_email,
          name: deliveryData.buyer_name,
        },
        data: deliveryData,
      });
    } catch (error) {
      console.error("Error sending delivery notification:", error);
    }
  }

  /**
   * Send payment released notification
   */
  static async sendPaymentReleasedNotification(paymentData: {
    seller_id: string;
    seller_email: string;
    seller_name: string;
    book_title: string;
    amount: number;
    order_id: string;
    transfer_reference: string;
  }): Promise<void> {
    try {
      await this.sendNotification({
        type: "email",
        priority: "high",
        template: "payment_released",
        recipient: {
          user_id: paymentData.seller_id,
          email: paymentData.seller_email,
          name: paymentData.seller_name,
        },
        data: paymentData,
      });
    } catch (error) {
      console.error("Error sending payment released notification:", error);
    }
  }

  /**
   * Send dispute notification
   */
  static async sendDisputeNotification(disputeData: {
    order_id: string;
    dispute_type: string;
    description: string;
    priority: string;
    buyer_email: string;
    buyer_name: string;
    seller_email: string;
    seller_name: string;
  }): Promise<void> {
    try {
      // Notify both buyer and seller
      const recipients = [
        { email: disputeData.buyer_email, name: disputeData.buyer_name },
        { email: disputeData.seller_email, name: disputeData.seller_name },
      ];

      for (const recipient of recipients) {
        await this.sendNotification({
          type: "email",
          priority: "urgent",
          template: "dispute_created",
          recipient,
          data: {
            recipient_name: recipient.name,
            order_id: disputeData.order_id,
            dispute_type: disputeData.dispute_type,
            description: disputeData.description,
            priority: disputeData.priority,
          },
        });
      }
    } catch (error) {
      console.error("Error sending dispute notification:", error);
    }
  }
}
