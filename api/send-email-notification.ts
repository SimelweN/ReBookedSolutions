import { VercelRequest, VercelResponse } from "@vercel/node";
const {
  generateSellerPickupEmailHTML,
  generateSellerPickupEmailText,
} = require("./emailTemplates");

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

    // Get Resend API key
    const resendApiKey = process.env.VITE_RESEND_API_KEY;
    if (!resendApiKey) {
      console.error("VITE_RESEND_API_KEY not configured");
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
