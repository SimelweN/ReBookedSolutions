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
 * Send seller pickup notification email
 */
export async function sendSellerPickupNotification(
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

/**
 * Generate HTML email template for seller pickup notification
 */
export function generateSellerPickupEmailHTML(
  data: SellerPickupNotificationData,
): string {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pickup Scheduled - ReBooked</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #65c69f 0%, #44ab83 100%); color: white; padding: 30px 20px; text-align: center; }
        .content { padding: 30px 20px; }
        .pickup-info { background-color: #f0f9f5; border-left: 4px solid #65c69f; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .button { display: inline-block; background-color: #65c69f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 15px 5px; }
        .button:hover { background-color: #44ab83; }
        .instructions { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
        .tracking-box { background-color: #e7f3ff; border: 1px solid #b3d9ff; padding: 15px; border-radius: 6px; margin: 15px 0; }
        ul { padding-left: 20px; }
        li { margin: 8px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📦 Pickup Scheduled!</h1>
            <p>Your book is ready for courier collection</p>
        </div>
        
        <div class="content">
            <p>Hi <strong>${data.seller_name}</strong>,</p>
            
            <p>Great news! We've scheduled a pickup for your book "<strong>${data.book_title}</strong>" with ${data.courier}.</p>
            
            <div class="pickup-info">
                <h3>📅 Pickup Details</h3>
                <p><strong>Date:</strong> ${data.pickup_date}</p>
                <p><strong>Time Window:</strong> ${data.pickup_time}</p>
                <p><strong>Courier:</strong> ${data.courier}</p>
                <p><strong>Tracking Number:</strong> ${data.tracking_number}</p>
            </div>
            
            <div class="tracking-box">
                <p><strong>📱 Track Your Shipment:</strong></p>
                <p>Tracking Number: <code>${data.tracking_number}</code></p>
                <p>You can track your shipment on the ${data.courier} website or app.</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${data.label_url}" class="button" target="_blank">📄 Download Shipping Label</a>
            </div>
            
            <div class="instructions">
                <h3>📋 Preparation Instructions</h3>
                <p><strong>Before pickup time:</strong></p>
                <ul>
                    <li>🖨️ <strong>Print the shipping label</strong> and attach it securely to your package</li>
                    <li>📦 <strong>Package your book safely</strong> - use bubble wrap or padding if needed</li>
                    <li>✅ <strong>Ensure your pickup address is accessible</strong> and someone will be available</li>
                    <li>📱 <strong>Keep your phone nearby</strong> - the courier may call if they can't find you</li>
                    <li>🆔 <strong>Have ID ready</strong> - some couriers may request identification</li>
                </ul>
                
                <p><strong>Packaging Tips:</strong></p>
                <ul>
                    <li>Use a sturdy envelope or small box</li>
                    <li>Wrap the book in bubble wrap or plastic</li>
                    <li>Make sure the shipping label is clearly visible</li>
                    <li>Seal the package properly with tape</li>
                </ul>
            </div>
            
            <div style="background-color: #e7f8f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>💰 Payment Release</h3>
                <p>Your payment will be released to your account after the book is successfully delivered to the buyer. You'll receive a confirmation email when this happens.</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <p><strong>Need help or have questions?</strong></p>
                <a href="mailto:support@rebookedsolutions.co.za" class="button">Contact Support</a>
            </div>
        </div>
        
        <div class="footer">
            <p>This is an automated message from ReBooked Solutions</p>
            <p>🌍 Connecting students with affordable textbooks across South Africa</p>
            <p><a href="https://rebookedsolutions.co.za">rebookedsolutions.co.za</a></p>
        </div>
    </div>
</body>
</html>`;
}

/**
 * Generate plain text version for email clients that don't support HTML
 */
export function generateSellerPickupEmailText(
  data: SellerPickupNotificationData,
): string {
  return `
📦 PICKUP SCHEDULED - REBOOKED

Hi ${data.seller_name},

Great news! We've scheduled a pickup for your book "${data.book_title}" with ${data.courier}.

📅 PICKUP DETAILS:
• Date: ${data.pickup_date}
• Time Window: ${data.pickup_time}
• Courier: ${data.courier}
• Tracking Number: ${data.tracking_number}

📋 PREPARATION CHECKLIST:
Before pickup time:
✅ Print the shipping label: ${data.label_url}
✅ Package your book safely with bubble wrap or padding
✅ Ensure your pickup address is accessible
✅ Keep your phone nearby for courier contact
✅ Have ID ready if requested

📦 PACKAGING TIPS:
• Use a sturdy envelope or small box
• Wrap the book in bubble wrap or plastic
• Attach the shipping label securely and visibly
• Seal the package properly with tape

💰 PAYMENT:
Your payment will be released after successful delivery to the buyer.

📱 TRACKING:
Track your shipment using tracking number: ${data.tracking_number}

Need help? Contact us at support@rebookedsolutions.co.za

---
ReBooked Solutions
Connecting students with affordable textbooks
https://rebookedsolutions.co.za
`;
}
