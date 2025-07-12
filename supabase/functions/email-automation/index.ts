import { serve } from "@std/http/server";
import { createClient } from "@supabase/supabase-js";
import {
  wrapFunction,
  successResponse,
  errorResponse,
  safeJsonParse,
  withTimeout,
} from "../_shared/response-utils.ts";

const requiredEnvVars = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];
const allowedMethods = ["GET", "POST", "OPTIONS"];

interface EmailAutomationRequest {
  type:
    | "order_confirmation"
    | "commit_reminder"
    | "payment_notification"
    | "welcome"
    | "custom";
  recipients: string[];
  data?: Record<string, any>;
  schedule?: string; // ISO date string for scheduled emails
  template?: string;
  priority?: "high" | "normal" | "low";
}

const handler = async (req: Request): Promise<Response> => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Health check for GET requests
  if (req.method === "GET") {
    const emailProviders = {
      sender: !!Deno.env.get("SENDER_API_KEY"),
      resend: !!Deno.env.get("RESEND_API_KEY"),
      fromEmail: !!Deno.env.get("FROM_EMAIL"),
    };

    return successResponse({
      service: "email-automation",
      timestamp: new Date().toISOString(),
      status: "healthy",
      providers: emailProviders,
      supportedTypes: [
        "order_confirmation",
        "commit_reminder",
        "payment_notification",
        "welcome",
        "custom",
      ],
      features: ["bulk-send", "scheduling", "templates", "priority-queue"],
    });
  }

  // Parse request body
  const { data: requestBody, error: parseError } = await safeJsonParse(req);
  if (parseError) {
    return errorResponse("Invalid JSON body", 400, "INVALID_JSON", {
      error: parseError,
    });
  }

  const {
    type,
    recipients,
    data,
    schedule,
    template,
    priority = "normal",
  }: EmailAutomationRequest = requestBody;

  // Validate required fields
  if (
    !type ||
    !recipients ||
    !Array.isArray(recipients) ||
    recipients.length === 0
  ) {
    return errorResponse(
      "Missing required fields: type and recipients array are required",
      400,
      "REQUIRED_FIELDS_MISSING",
      { required: ["type", "recipients"] },
    );
  }

  // Validate email addresses
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const invalidEmails = recipients.filter((email) => !emailRegex.test(email));

  if (invalidEmails.length > 0) {
    return errorResponse(
      "Invalid email addresses found",
      400,
      "INVALID_EMAIL_ADDRESSES",
      { invalidEmails },
    );
  }

  try {
    // Handle scheduled emails
    if (schedule) {
      const scheduledDate = new Date(schedule);
      if (isNaN(scheduledDate.getTime()) || scheduledDate <= new Date()) {
        return errorResponse(
          "Invalid schedule date. Must be a future ISO date string",
          400,
          "INVALID_SCHEDULE_DATE",
        );
      }

      // Store scheduled email in database
      const scheduledEmail = {
        type,
        recipients,
        data: data || {},
        scheduled_for: scheduledDate.toISOString(),
        template,
        priority,
        status: "scheduled",
        created_at: new Date().toISOString(),
      };

      const { data: savedSchedule, error: scheduleError } = await supabase
        .from("scheduled_emails")
        .insert(scheduledEmail)
        .select()
        .single();

      if (scheduleError) {
        return errorResponse(
          "Failed to schedule email",
          500,
          "SCHEDULE_ERROR",
          { error: scheduleError.message },
        );
      }

      return successResponse(
        {
          scheduled: true,
          scheduleId: savedSchedule.id,
          scheduledFor: scheduledDate.toISOString(),
          recipients: recipients.length,
        },
        "Email scheduled successfully",
      );
    }

    // Process immediate emails
    const results = await processEmails(
      supabase,
      type,
      recipients,
      data,
      template,
      priority,
    );

    return successResponse(
      {
        processed: results.successful.length,
        failed: results.failed.length,
        successful: results.successful,
        failures: results.failed,
        batchId: `batch_${Date.now()}`,
      },
      `Processed ${results.successful.length}/${recipients.length} emails successfully`,
    );
  } catch (error) {
    console.error("Email automation error:", error);
    return errorResponse("Email automation failed", 500, "AUTOMATION_ERROR", {
      error: error.message,
    });
  }
};

const processEmails = async (
  supabase: any,
  type: string,
  recipients: string[],
  data?: Record<string, any>,
  template?: string,
  priority = "normal",
): Promise<{
  successful: string[];
  failed: Array<{ email: string; error: string }>;
}> => {
  const successful: string[] = [];
  const failed: Array<{ email: string; error: string }> = [];

  // Get email template and subject based on type
  const emailConfig = getEmailConfigByType(type, data);

  // Process emails in batches to avoid overwhelming the email service
  const batchSize = 10;
  const batches = [];

  for (let i = 0; i < recipients.length; i += batchSize) {
    batches.push(recipients.slice(i, i + batchSize));
  }

  for (const batch of batches) {
    const batchPromises = batch.map(async (recipient) => {
      try {
        // Personalize email data for each recipient
        const personalizedData = {
          ...data,
          recipient_email: recipient,
        };

        // Call the send-email-notification function
        const { data: emailResult, error } = await supabase.functions.invoke(
          "send-email-notification",
          {
            body: {
              to: recipient,
              subject: emailConfig.subject,
              template: template || emailConfig.template,
              data: personalizedData,
              priority,
            },
          },
        );

        if (error) {
          throw new Error(error.message || "Email send failed");
        }

        if (emailResult?.success) {
          successful.push(recipient);
        } else {
          throw new Error(emailResult?.error || "Email send returned failure");
        }
      } catch (error) {
        failed.push({
          email: recipient,
          error: error.message,
        });
      }
    });

    // Wait for batch to complete
    await Promise.allSettled(batchPromises);

    // Small delay between batches to be respectful to email providers
    if (batches.indexOf(batch) < batches.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  // Log the automation results
  const automationLog = {
    automation_type: type,
    total_recipients: recipients.length,
    successful_sends: successful.length,
    failed_sends: failed.length,
    template_used: template,
    priority,
    executed_at: new Date().toISOString(),
    failures: failed.length > 0 ? failed : null,
  };

  await supabase
    .from("email_automation_logs")
    .insert(automationLog)
    .catch((logError) =>
      console.warn("Failed to log automation:", logError.message),
    );

  return { successful, failed };
};

const getEmailConfigByType = (type: string, data?: Record<string, any>) => {
  const configs = {
    order_confirmation: {
      subject: `Order Confirmation #${data?.orderId || "N/A"}`,
      template: "order_confirmation",
    },
    commit_reminder: {
      subject: "⏰ Order Commitment Reminder - Action Required",
      template: "commit_reminder",
    },
    payment_notification: {
      subject: "💰 Payment Received - ReBooked Solutions",
      template: "payment_received",
    },
    welcome: {
      subject: "Welcome to ReBooked Solutions! 📚",
      template: "welcome",
    },
    custom: {
      subject: data?.subject || "Notification from ReBooked Solutions",
      template: data?.template || "custom",
    },
  };

  return configs[type as keyof typeof configs] || configs.custom;
};

// Scheduled email processor (would be called by a cron job)
export const processScheduledEmails = async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    // Get emails scheduled to be sent now
    const { data: scheduledEmails, error } = await supabase
      .from("scheduled_emails")
      .select("*")
      .eq("status", "scheduled")
      .lte("scheduled_for", new Date().toISOString())
      .order("priority", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Failed to fetch scheduled emails:", error);
      return;
    }

    if (!scheduledEmails || scheduledEmails.length === 0) {
      console.log("No scheduled emails to process");
      return;
    }

    console.log(`Processing ${scheduledEmails.length} scheduled emails...`);

    for (const email of scheduledEmails) {
      try {
        // Mark as processing
        await supabase
          .from("scheduled_emails")
          .update({ status: "processing" })
          .eq("id", email.id);

        // Process the email
        const results = await processEmails(
          supabase,
          email.type,
          email.recipients,
          email.data,
          email.template,
          email.priority,
        );

        // Update status
        await supabase
          .from("scheduled_emails")
          .update({
            status: "completed",
            processed_at: new Date().toISOString(),
            successful_sends: results.successful.length,
            failed_sends: results.failed.length,
            failures: results.failed.length > 0 ? results.failed : null,
          })
          .eq("id", email.id);

        console.log(
          `Processed scheduled email ${email.id}: ${results.successful.length}/${email.recipients.length} successful`,
        );
      } catch (error) {
        console.error(`Failed to process scheduled email ${email.id}:`, error);

        // Mark as failed
        await supabase
          .from("scheduled_emails")
          .update({
            status: "failed",
            processed_at: new Date().toISOString(),
            error_message: error.message,
          })
          .eq("id", email.id);
      }
    }
  } catch (error) {
    console.error("Error in processScheduledEmails:", error);
  }
};

serve(wrapFunction(handler, requiredEnvVars, allowedMethods));
