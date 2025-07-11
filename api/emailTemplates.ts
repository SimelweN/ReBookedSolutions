/**
 * Email templates for API use - Workers compatible
 * These functions only generate HTML and text strings - no browser dependencies
 */

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
 * Generate HTML email for seller pickup notification
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
            <p>Your book is ready for collection</p>
        </div>
        
        <div class="content">
            <p>Hi ${data.seller_name},</p>
            
            <p>Great news! We've scheduled a pickup for your book:</p>
            
            <div class="pickup-info">
                <h3>📚 ${data.book_title}</h3>
                <p><strong>📅 Pickup Date:</strong> ${data.pickup_date}</p>
                <p><strong>⏰ Pickup Time:</strong> ${data.pickup_time}</p>
                <p><strong>🚚 Courier:</strong> ${data.courier}</p>
            </div>
            
            <div class="instructions">
                <h3>📋 Pickup Instructions</h3>
                <ul>
                    <li>Please ensure the book is securely packaged and ready for collection</li>
                    <li>Have the shipping label printed and attached to the package</li>
                    <li>Be available during the scheduled pickup window</li>
                    <li>Keep your tracking number for reference: <strong>${data.tracking_number}</strong></li>
                </ul>
            </div>
            
            <div class="tracking-box">
                <h3>📦 Shipping Details</h3>
                <p><strong>Tracking Number:</strong> ${data.tracking_number}</p>
                <p><strong>Courier:</strong> ${data.courier}</p>
                <a href="${data.label_url}" class="button">📄 Download Shipping Label</a>
            </div>
            
            <p>If you have any questions or need to reschedule the pickup, please contact our support team immediately.</p>
            
            <p>Thank you for selling with ReBooked!</p>
            
            <p>Best regards,<br>
            The ReBooked Team</p>
        </div>
        
        <div class="footer">
            <p>This is an automated email from ReBooked marketplace.</p>
            <p>If you didn't expect this email, please contact our support team.</p>
        </div>
    </div>
</body>
</html>`;
}

/**
 * Generate plain text email for seller pickup notification
 */
export function generateSellerPickupEmailText(
  data: SellerPickupNotificationData,
): string {
  return `
PICKUP SCHEDULED - ReBooked

Hi ${data.seller_name},

Great news! We've scheduled a pickup for your book:

BOOK: ${data.book_title}
PICKUP DATE: ${data.pickup_date}
PICKUP TIME: ${data.pickup_time}
COURIER: ${data.courier}

PICKUP INSTRUCTIONS:
- Please ensure the book is securely packaged and ready for collection
- Have the shipping label printed and attached to the package
- Be available during the scheduled pickup window
- Keep your tracking number for reference: ${data.tracking_number}

SHIPPING DETAILS:
Tracking Number: ${data.tracking_number}
Courier: ${data.courier}
Download Label: ${data.label_url}

If you have any questions or need to reschedule the pickup, please contact our support team immediately.

Thank you for selling with ReBooked!

Best regards,
The ReBooked Team

---
This is an automated email from ReBooked marketplace.
If you didn't expect this email, please contact our support team.
`;
}
