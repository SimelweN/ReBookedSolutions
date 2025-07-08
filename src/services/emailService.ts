/**
 * Email Service using Sender.net API with Fallback Support
 * Handles all transactional emails for ReBooked Solutions
 *
 * Features automatic fallback to alternative methods when functions fail
 */

import { functionFallback } from "./functionFallbackService";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: {
    name: string;
    email: string;
  };
}

interface BookDetails {
  title: string;
  author: string;
  price: number;
  imageUrl?: string;
}

interface UserDetails {
  name: string;
  email: string;
}

class EmailService {
  private static readonly API_KEY = import.meta.env.VITE_SENDER_API;
  private static readonly API_URL = "https://api.sender.net/api/v1/email/send";
  private static readonly FROM_EMAIL = {
    name: "ReBooked Solutions",
    email: "noreply@rebookedsolutions.co.za",
  };

  // Check if running in production or has API key configured
  private static readonly IS_PRODUCTION = import.meta.env.PROD;
  private static readonly HAS_API_KEY = Boolean(
    this.API_KEY && this.API_KEY.trim() !== "",
  );

  /**
   * Send email using Supabase Edge Function (recommended approach)
   * Falls back to simulation in development if API key not configured
   */
  private static async sendEmail(options: EmailOptions): Promise<boolean> {
    console.log(
      `📧 Attempting to send email to ${options.to}: ${options.subject}`,
    );
    console.log("🔑 API Key configured:", this.HAS_API_KEY);
    console.log(
      "🏗️ Environment:",
      this.IS_PRODUCTION ? "production" : "development",
    );

    if (!this.HAS_API_KEY && !this.IS_PRODUCTION) {
      console.warn(
        "⚠️ VITE_SENDER_API not configured - email sending disabled in development",
      );
      console.log(
        `📧 [DEMO] Would send email to ${options.to}: ${options.subject}`,
      );
      return true; // Return true for demo purposes in development
    }

    if (!this.HAS_API_KEY && this.IS_PRODUCTION) {
      console.error(
        "❌ VITE_SENDER_API not configured - email sending failed in production",
      );
      throw new Error("Email service not configured - missing API key");
    }

    // Try using Supabase Edge Function (recommended approach)
    try {
      console.log("📡 Calling Supabase Edge Function...");
      const { supabase } = await import("@/integrations/supabase/client");

      const payload = {
        to: options.to,
        subject: options.subject,
        html: options.html,
        from: options.from || this.FROM_EMAIL,
      };

      console.log(
        "📦 Edge Function payload:",
        JSON.stringify(payload, null, 2),
      );

      const { data, error } = await supabase.functions.invoke(
        "send-email-notification",
        {
          body: payload,
        },
      );

      console.log("📡 Edge Function response:", { data, error });

      if (!error && data?.success) {
        console.log(
          `✅ Email sent via Edge Function to ${options.to}: ${options.subject}`,
        );
        return true;
      }

      if (error) {
        console.error("❌ Edge Function error:", error);
        throw new Error(
          `Edge Function failed: ${error.message || JSON.stringify(error)}`,
        );
      }

      if (data && !data.success) {
        console.error("❌ Edge Function returned unsuccessful response:", data);
        throw new Error(
          `Email sending failed: ${data.error || data.message || "Unknown error"}`,
        );
      }

      throw new Error("Unexpected edge function response format");
    } catch (edgeFunctionError) {
      console.error("❌ Edge Function failed:", edgeFunctionError);

      // In production, re-throw the error; in development, continue to fallback
      if (this.IS_PRODUCTION) {
        throw edgeFunctionError;
      }

      console.warn("⚠️ Falling back to direct API call (development only)...");
    }

    // Fallback to direct API call (only in development, will likely hit CORS)
    if (!this.IS_PRODUCTION) {
      try {
        console.log("🔄 Attempting direct API call as fallback...");
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch(this.API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.API_KEY}`,
          },
          signal: controller.signal,
          body: JSON.stringify({
            from: {
              email: (options.from || this.FROM_EMAIL).email,
              name: (options.from || this.FROM_EMAIL).name,
            },
            to: [
              {
                email: options.to,
                name: options.to.split("@")[0],
              },
            ],
            subject: options.subject,
            content: [
              {
                type: "text/html",
                value: options.html,
              },
            ],
          }),
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Direct API call failed: ${response.status} ${errorText}`,
          );
        }

        console.log(
          `✅ Email sent via direct API to ${options.to}: ${options.subject}`,
        );
        return true;
      } catch (directApiError) {
        // Handle CORS/network errors gracefully in development
        let errorType = "Network";
        if (
          directApiError instanceof DOMException &&
          directApiError.name === "AbortError"
        ) {
          errorType = "Timeout";
        } else if (directApiError instanceof TypeError) {
          errorType = "CORS/Network";
        }

        console.warn(
          `⚠️ Direct API ${errorType} error - this is expected in browser environments`,
        );
        console.log(
          `📧 [FALLBACK] Simulated email send to ${options.to}: ${options.subject}`,
        );
        return true; // Return success for demo purposes in development
      }
    }

    // If we reach here, all methods failed
    throw new Error("All email sending methods failed");
  }

  /**
   * Generate email templates
   */
  private static getEmailTemplate(content: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f3fef7;
            padding: 20px;
            color: #1f4e3d;
            margin: 0;
          }
          .container {
            max-width: 500px;
            margin: auto;
            background-color: #ffffff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          }
          .btn {
            display: inline-block;
            padding: 12px 20px;
            background-color: #3ab26f;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
            font-weight: bold;
          }
          .link {
            color: #3ab26f;
            text-decoration: none;
          }
          .book-card {
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            background: #f9f9f9;
          }
          .price {
            font-size: 24px;
            font-weight: bold;
            color: #3ab26f;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            color: #666;
            font-size: 14px;
          }
          h2 {
            color: #1f4e3d;
            margin-bottom: 20px;
          }
          h3 {
            color: #1f4e3d;
            margin-top: 25px;
          }
          ul, ol {
            padding-left: 20px;
          }
          li {
            margin: 8px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          ${content}
          <div class="footer">
            <p>© 2024 ReBooked Solutions. All rights reserved.</p>
            <p>
              <a href="https://rebookedsolutions.co.za" class="link">Visit our website</a> |
              <a href="mailto:support@rebookedsolutions.co.za" class="link">Contact Support</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * ✅ Welcome Email (Account Created)
   */
  static async sendWelcomeEmail(user: UserDetails): Promise<boolean> {
    const content = `
      <h2>Welcome to ReBooked Solutions! 🎉</h2>
      <p>Hi <strong>${user.name}</strong>,</p>
      <p>Thank you for joining ReBooked Solutions, South Africa's trusted platform for buying and selling textbooks!</p>

      <h3>What you can do now:</h3>
      <ul>
        <li>📖 <strong>Browse books</strong> - Find affordable textbooks from students across the country</li>
        <li>��� <strong>Sell your books</strong> - Turn your old textbooks into cash</li>
        <li>🏫 <strong>Connect with your campus</strong> - Find books specific to your university</li>
        <li>🚚 <strong>Safe delivery</strong> - Secure payment and delivery system</li>
      </ul>

      <p style="text-align: center;">
        <a href="https://rebookedsolutions.co.za/books" class="btn">Start Browsing Books</a>
      </p>

      <p>If you have any questions, feel free to reach out to our support team.</p>
      <p>Happy reading! 📚</p>
    `;

    return this.sendEmail({
      to: user.email,
      subject: "🎉 Welcome to ReBooked Solutions!",
      html: this.getEmailTemplate(content),
    });
  }

  /**
   * ✅ Email Verification
   */
  static async sendEmailVerification(
    user: UserDetails,
    verificationLink: string,
  ): Promise<boolean> {
    const content = `
      <h2>Verify Your Email Address 📧</h2>
      <p>Hi <strong>${user.name}</strong>,</p>
      <p>Thanks for signing up with ReBooked Solutions! Please verify your email address to complete your registration.</p>

      <p style="text-align: center;">
        <a href="${verificationLink}" class="btn">Verify Email Address</a>
      </p>

      <p>If the button doesn't work, copy and paste this link into your browser:</p>
      <p style="word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 4px;">
        ${verificationLink}
      </p>

      <p><strong>This link will expire in 24 hours.</strong></p>
      <p>If you didn't create an account with us, please ignore this email.</p>
    `;

    return this.sendEmail({
      to: user.email,
      subject: "📧 Verify your ReBooked Solutions account",
      html: this.getEmailTemplate(content),
    });
  }

  /**
   * 🔐 Forgot Password Email
   */
  static async sendPasswordReset(
    user: UserDetails,
    resetLink: string,
  ): Promise<boolean> {
    const content = `
      <h2>Reset Your Password 🔐</h2>
      <p>Hi <strong>${user.name}</strong>,</p>
      <p>We received a request to reset your password for your ReBooked Solutions account.</p>

      <p style="text-align: center;">
        <a href="${resetLink}" class="btn">Reset Password</a>
      </p>

      <p>If the button doesn't work, copy and paste this link into your browser:</p>
      <p style="word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 4px;">
        ${resetLink}
      </p>

      <p><strong>This link will expire in 1 hour.</strong></p>
      <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
    `;

    return this.sendEmail({
      to: user.email,
      subject: "🔐 Reset your ReBooked Solutions password",
      html: this.getEmailTemplate(content),
    });
  }

  /**
   * 💳 Payment Confirmation (To Buyer)
   */
  static async sendPaymentConfirmation(
    buyer: UserDetails,
    seller: UserDetails,
    book: BookDetails,
    orderDetails: {
      orderId: string;
      totalAmount: number;
      paymentReference: string;
    },
  ): Promise<boolean> {
    const content = `
      <h2>Payment Successful! 💳✅</h2>
      <p>Hi <strong>${buyer.name}</strong>,</p>
      <p>Your payment has been successfully processed. Thank you for your purchase!</p>

      <div class="book-card">
        <h3>${book.title}</h3>
        <p><strong>Author:</strong> ${book.author}</p>
        <p><strong>Seller:</strong> ${seller.name}</p>
        <p class="price">R${(book.price / 100).toFixed(2)}</p>
      </div>

      <h3>Order Details:</h3>
      <ul>
        <li><strong>Order ID:</strong> ${orderDetails.orderId}</li>
        <li><strong>Payment Reference:</strong> ${orderDetails.paymentReference}</li>
        <li><strong>Total Amount:</strong> R${(orderDetails.totalAmount / 100).toFixed(2)}</li>
        <li><strong>Payment Date:</strong> ${new Date().toLocaleDateString()}</li>
      </ul>

      <h3>What happens next?</h3>
      <p>📦 The seller has been notified and will prepare your book for collection within 48 hours.</p>
      <p>🚚 Once collected by our courier partner, you'll receive tracking information.</p>
      <p>📱 You can track your order status in your account dashboard.</p>

      <p style="text-align: center;">
        <a href="https://rebookedsolutions.co.za/my-orders" class="btn">Track Your Order</a>
      </p>
    `;

    return this.sendEmail({
      to: buyer.email,
      subject: "💳 Payment confirmed - Your book is on the way!",
      html: this.getEmailTemplate(content),
    });
  }

  /**
   * 📘 Book Purchase Alert (To Seller)
   */
  static async sendBookPurchaseAlert(
    seller: UserDetails,
    buyer: UserDetails,
    book: BookDetails,
    orderDetails: {
      orderId: string;
      totalAmount: number;
      collectionDeadline: string;
    },
  ): Promise<boolean> {
    const content = `
      <h2>Great News! Your Book Was Purchased! 🎉</h2>
      <p>Hi <strong>${seller.name}</strong>,</p>
      <p><strong>${buyer.name}</strong> just purchased your book. Congratulations on the sale!</p>

      <div class="book-card">
        <h3>${book.title}</h3>
        <p><strong>Author:</strong> ${book.author}</p>
        <p><strong>Buyer:</strong> ${buyer.name}</p>
        <p class="price">R${(book.price / 100).toFixed(2)}</p>
      </div>

      <h3>⏰ Action Required - Collection Deadline</h3>
      <p><strong>Deadline:</strong> ${new Date(orderDetails.collectionDeadline).toLocaleString()}</p>
      <p>Please prepare your book for courier collection within 48 hours to avoid order cancellation.</p>

      <h3>Next Steps:</h3>
      <ol>
        <li>📦 <strong>Package your book securely</strong></li>
        <li>📱 <strong>Wait for courier contact</strong> - They'll arrange pickup</li>
        <li>🤝 <strong>Hand over to courier</strong> - Get confirmation receipt</li>
        <li>💰 <strong>Get paid</strong> - You'll receive 90% of the sale price</li>
      </ol>

      <p style="text-align: center;">
        <a href="https://rebookedsolutions.co.za/my-orders" class="btn">Manage Your Orders</a>
      </p>

      <p><strong>Earnings:</strong> You'll receive R${((book.price * 0.9) / 100).toFixed(2)} (90% of sale price) once delivery is confirmed.</p>
    `;

    return this.sendEmail({
      to: seller.email,
      subject: "📘 Your book was purchased! Action required",
      html: this.getEmailTemplate(content),
    });
  }

  /**
   * ✅ Bank Details Added Confirmation
   */
  static async sendBankDetailsConfirmation(
    user: UserDetails,
  ): Promise<boolean> {
    const content = `
      <h2>Bank Details Successfully Added! ���✅</h2>
      <p>Hi <strong>${user.name}</strong>,</p>
      <p>Great news! Your bank details have been successfully added to your ReBooked Solutions account.</p>

      <h3>What this means:</h3>
      <ul>
        <li>💰 <strong>Automatic payouts</strong> - You'll receive 90% of each sale directly to your bank account</li>
        <li>🚀 <strong>Faster transactions</strong> - No need to wait for manual processing</li>
        <li>🔒 <strong>Secure payments</strong> - Your banking details are encrypted and protected</li>
        <li>📊 <strong>Payment tracking</strong> - View all your earnings in your dashboard</li>
      </ul>

      <h3>Ready to start selling?</h3>
      <p>Now that your account is set up for payouts, you can start listing your textbooks and earning money!</p>

      <p style="text-align: center;">
        <a href="https://rebookedsolutions.co.za/create-listing" class="btn">List Your First Book</a>
      </p>

      <p><strong>Payout Schedule:</strong> Payments are processed after successful delivery confirmation.</p>
    `;

    return this.sendEmail({
      to: user.email,
      subject: "🏦 Bank details confirmed - Ready to earn!",
      html: this.getEmailTemplate(content),
    });
  }

  /**
   * 🚚 Courier Pickup Confirmed
   */
  static async sendCourierPickupConfirmation(
    seller: UserDetails,
    buyer: UserDetails,
    book: BookDetails,
    trackingInfo: {
      trackingNumber: string;
      courierService: string;
      estimatedDelivery: string;
    },
  ): Promise<boolean> {
    // Email to seller
    const sellerContent = `
      <h2>Courier Pickup Confirmed! 🚚✅</h2>
      <p>Hi <strong>${seller.name}</strong>,</p>
      <p>Great news! The courier has successfully picked up your book and it's now on its way to the buyer.</p>

      <div class="book-card">
        <h3>${book.title}</h3>
        <p><strong>Buyer:</strong> ${buyer.name}</p>
        <p><strong>Tracking Number:</strong> ${trackingInfo.trackingNumber}</p>
        <p><strong>Courier Service:</strong> ${trackingInfo.courierService}</p>
        <p><strong>Estimated Delivery:</strong> ${trackingInfo.estimatedDelivery}</p>
      </div>

      <h3>What happens next?</h3>
      <p>📦 Your book is now in transit to the buyer</p>
      <p>💰 You'll receive payment once delivery is confirmed</p>
      <p>⭐ The buyer can leave you a review after receiving the book</p>

      <p style="text-align: center;">
        <a href="https://rebookedsolutions.co.za/my-orders" class="btn">Track Order Status</a>
      </p>
    `;

    // Email to buyer
    const buyerContent = `
      <h2>Your Book is On The Way! 🚚📦</h2>
      <p>Hi <strong>${buyer.name}</strong>,</p>
      <p>Excellent news! Your book has been picked up by our courier and is now on its way to you!</p>

      <div class="book-card">
        <h3>${book.title}</h3>
        <p><strong>Author:</strong> ${book.author}</p>
        <p><strong>Seller:</strong> ${seller.name}</p>
        <p><strong>Tracking Number:</strong> ${trackingInfo.trackingNumber}</p>
        <p><strong>Courier Service:</strong> ${trackingInfo.courierService}</p>
        <p><strong>Estimated Delivery:</strong> ${trackingInfo.estimatedDelivery}</p>
      </div>

      <p style="text-align: center;">
        <a href="https://rebookedsolutions.co.za/my-orders" class="btn">Track Your Delivery</a>
      </p>

      <p>📱 You'll receive another email once your book has been delivered.</p>
      <p>❓ If you have any questions about your delivery, please contact our support team.</p>
    `;

    // Send both emails
    const [sellerSent, buyerSent] = await Promise.all([
      this.sendEmail({
        to: seller.email,
        subject: "🚚 Book picked up - Payment coming soon!",
        html: this.getEmailTemplate(sellerContent),
      }),
      this.sendEmail({
        to: buyer.email,
        subject: "�� Your book is on the way!",
        html: this.getEmailTemplate(buyerContent),
      }),
    ]);

    return sellerSent && buyerSent;
  }

  /**
   * 📦 Delivery Complete Notification
   */
  static async sendDeliveryConfirmation(
    seller: UserDetails,
    buyer: UserDetails,
    book: BookDetails,
  ): Promise<boolean> {
    // Email to buyer
    const buyerContent = `
      <h2>Book Delivered Successfully! 📦✅</h2>
      <p>Hi <strong>${buyer.name}</strong>,</p>
      <p>Your book has been successfully delivered! We hope you enjoy your new textbook.</p>

      <div class="book-card">
        <h3>${book.title}</h3>
        <p><strong>Author:</strong> ${book.author}</p>
        <p><strong>Delivered:</strong> ${new Date().toLocaleString()}</p>
      </div>

      <h3>What's next?</h3>
      <p>⭐ <strong>Rate your experience</strong> - Help other students by leaving a review</p>
      <p>📚 <strong>Browse more books</strong> - Find your next textbook</p>
      <p>💰 <strong>Sell your old books</strong> - Turn your books into cash</p>

      <p style="text-align: center;">
        <a href="https://rebookedsolutions.co.za/books" class="btn">Browse More Books</a>
      </p>

      <p>Thank you for choosing ReBooked Solutions!</p>
    `;

    // Email to seller
    const sellerContent = `
      <h2>Payment Processed! 💰✅</h2>
      <p>Hi <strong>${seller.name}</strong>,</p>
      <p>Congratulations! Your book has been successfully delivered and your payment has been processed.</p>

      <div class="book-card">
        <h3>${book.title}</h3>
        <p><strong>Buyer:</strong> ${buyer.name}</p>
        <p><strong>Your Earnings:</strong> <span class="price">R${((book.price * 0.9) / 100).toFixed(2)}</span></p>
        <p><strong>Delivered:</strong> ${new Date().toLocaleString()}</p>
      </div>

      <p>💳 Your payment will appear in your linked bank account within 1-3 business days.</p>

      <p style="text-align: center;">
        <a href="https://rebookedsolutions.co.za/create-listing" class="btn">List Another Book</a>
      </p>

      <p>Keep selling your textbooks and earning money with ReBooked Solutions!</p>
    `;

    // Send both emails
    const [buyerSent, sellerSent] = await Promise.all([
      this.sendEmail({
        to: buyer.email,
        subject: "📦 Book delivered - Enjoy your reading!",
        html: this.getEmailTemplate(buyerContent),
      }),
      this.sendEmail({
        to: seller.email,
        subject: "💰 Payment processed - Great job!",
        html: this.getEmailTemplate(sellerContent),
      }),
    ]);

    return buyerSent && sellerSent;
  }

  /**
   * ⚠️ Order Cancellation Notification
   */
  static async sendOrderCancellation(
    user: UserDetails,
    book: BookDetails,
    reason: string,
    refundAmount?: number,
  ): Promise<boolean> {
    const content = `
      <h2>Order Cancelled ⚠️</h2>
      <p>Hi <strong>${user.name}</strong>,</p>
      <p>We're sorry to inform you that your order has been cancelled.</p>

      <div class="book-card">
        <h3>${book.title}</h3>
        <p><strong>Author:</strong> ${book.author}</p>
        <p><strong>Reason:</strong> ${reason}</p>
        ${refundAmount ? `<p><strong>Refund Amount:</strong> R${(refundAmount / 100).toFixed(2)}</p>` : ""}
      </div>

      ${
        refundAmount
          ? `
        <h3>Refund Information</h3>
        <p>💳 Your refund of R${(refundAmount / 100).toFixed(2)} will be processed within 3-5 business days.</p>
        <p>The refund will appear on the same payment method used for the original purchase.</p>
      `
          : ""
      }

      <p>We apologize for any inconvenience. Please browse our other available books or contact support if you need assistance.</p>

      <p style="text-align: center;">
        <a href="https://rebookedsolutions.co.za/books" class="btn">Browse Other Books</a>
      </p>
    `;

    return this.sendEmail({
      to: user.email,
      subject: "⚠️ Order cancellation notification",
      html: this.getEmailTemplate(content),
    });
  }
}

export default EmailService;
