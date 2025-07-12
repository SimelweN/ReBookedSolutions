import { VercelRequest, VercelResponse } from "@vercel/node";
// Inline email templates for Workers compatibility
interface SellerPickupNotificationData {
  seller_name: string;
  book_title: string;
  pickup_date: string;
  pickup_time: string;
  courier: string;
  label_url: string;
  tracking_number: string;
}

function generateSellerPickupEmailHTML(
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

function generateSellerPickupEmailText(
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  }

  try {
    const { to, subject, template, variables } = req.body;

    // Validate required fields
    if (!to || !subject || !template || !variables) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: to, subject, template, variables",
      });
    }

    // Get Resend API key - try both possible environment variable names
    const resendApiKey =
      process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY;
    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      return res.status(500).json({
        success: false,
        error: "Email service not configured",
      });
    }

    // Generate email content based on template
    let htmlContent = "";
    let textContent = "";

    switch (template) {
      case "seller-pickup-notification":
        htmlContent = generateSellerPickupEmailHTML(variables);
        textContent = generateSellerPickupEmailText(variables);
        break;

      default:
        // Generic template - just use variables as content
        htmlContent = `<p>${JSON.stringify(variables, null, 2)}</p>`;
        textContent = JSON.stringify(variables, null, 2);
    }

    // Send email using Resend API
    const emailPayload = {
      from: "ReBooked <notifications@rebookedsolutions.co.za>",
      to: [to],
      subject: subject,
      html: htmlContent,
      text: textContent,
    };

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailPayload),
    });

    const resendResult = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error("Resend API error:", resendResult);
      return res.status(500).json({
        success: false,
        error: resendResult.message || "Failed to send email",
      });
    }

    console.log(
      `✅ Email sent successfully to ${to} via Resend:`,
      resendResult.id,
    );

    return res.status(200).json({
      success: true,
      message: "Email sent successfully",
      emailId: resendResult.id,
    });
  } catch (error) {
    console.error("Send email notification error:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
}
