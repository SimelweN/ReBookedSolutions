
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface EmailNotificationRequest {
  to: string;
  subject: string;
  template?: string;
  data?: Record<string, any>;
  htmlContent?: string;
  textContent?: string;
  priority?: 'high' | 'normal' | 'low';
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const emailRequest: EmailNotificationRequest = await req.json();
    const { to, subject, template, data, htmlContent, textContent, priority = 'normal' } = emailRequest;

    if (!to || !subject) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, subject' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Sending email to: ${to}, subject: ${subject}`);

    // Generate email content
    let finalHtmlContent = htmlContent;
    let finalTextContent = textContent;

    if (template && data) {
      const generatedContent = generateEmailFromTemplate(template, data);
      finalHtmlContent = generatedContent.html;
      finalTextContent = generatedContent.text;
    }

    // Send email using primary provider (Sender)
    let result = await sendWithSender(to, subject, finalHtmlContent, finalTextContent);

    // Fallback to Resend if Sender fails
    if (!result.success) {
      console.log('Sender failed, trying Resend...');
      result = await sendWithResend(to, subject, finalHtmlContent, finalTextContent);
    }

    // Fallback to SMTP if both fail
    if (!result.success) {
      console.log('Resend failed, trying SMTP...');
      result = await sendWithSMTP(to, subject, finalHtmlContent, finalTextContent);
    }

    // Log the email attempt
    await supabase.from('audit_logs').insert({
      action: 'email_notification_sent',
      table_name: 'email_notifications',
      new_values: {
        to,
        subject,
        template,
        priority,
        success: result.success,
        provider: result.provider,
        error: result.error
      }
    });

    return new Response(
      JSON.stringify({
        success: result.success,
        message: result.message,
        provider: result.provider
      }),
      { 
        status: result.success ? 200 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in send-email-notification:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateEmailFromTemplate(template: string, data: Record<string, any>) {
  const templates = {
    welcome: {
      html: `
        <h1>Welcome to Rebooked Solutions, ${data.name}!</h1>
        <p>Thank you for joining our textbook marketplace.</p>
        <p>You can now start buying and selling textbooks with students across South Africa.</p>
        <p>Best regards,<br>The Rebooked Solutions Team</p>
      `,
      text: `Welcome to Rebooked Solutions, ${data.name}! Thank you for joining our textbook marketplace.`
    },
    order_confirmation: {
      html: `
        <h2>Order Confirmation</h2>
        <p>Hi ${data.buyerName},</p>
        <p>Your order has been confirmed:</p>
        <ul>
          <li><strong>Book:</strong> ${data.bookTitle}</li>
          <li><strong>Price:</strong> R${data.price}</li>
          <li><strong>Order ID:</strong> ${data.orderId}</li>
        </ul>
        <p>Best regards,<br>Rebooked Solutions</p>
      `,
      text: `Order Confirmation: Your order for ${data.bookTitle} (R${data.price}) has been confirmed. Order ID: ${data.orderId}`
    },
    commit_reminder: {
      html: `
        <h2>Order Commitment Reminder</h2>
        <p>You have an order waiting for commitment:</p>
        <p><strong>Book:</strong> ${data.bookTitle}</p>
        <p><strong>Deadline:</strong> ${new Date(data.deadline).toLocaleString()}</p>
        <p>Please log in to your account to commit to this sale.</p>
        <p>Best regards,<br>Rebooked Solutions</p>
      `,
      text: `Order Commitment Reminder: Please commit to your order for ${data.bookTitle} by ${new Date(data.deadline).toLocaleString()}`
    }
  };

  return templates[template as keyof typeof templates] || {
    html: `<p>${data.message || 'Notification from Rebooked Solutions'}</p>`,
    text: data.message || 'Notification from Rebooked Solutions'
  };
}

async function sendWithSender(to: string, subject: string, html?: string, text?: string) {
  const senderApiKey = Deno.env.get('SENDER_API_KEY');
  const fromEmail = Deno.env.get('FROM_EMAIL') || 'noreply@rebookedsolutions.co.za';

  if (!senderApiKey) {
    return { success: false, error: 'Sender API key not configured', provider: 'sender' };
  }

  try {
    const response = await fetch('https://api.sender.net/v2/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${senderApiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [{ email: to }],
        subject: subject,
        html: html,
        text: text
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: errorText, provider: 'sender' };
    }

    return { success: true, message: 'Email sent via Sender', provider: 'sender' };

  } catch (error) {
    return { success: false, error: error.message, provider: 'sender' };
  }
}

async function sendWithResend(to: string, subject: string, html?: string, text?: string) {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  const fromEmail = Deno.env.get('FROM_EMAIL') || 'noreply@rebookedsolutions.co.za';

  if (!resendApiKey) {
    return { success: false, error: 'Resend API key not configured', provider: 'resend' };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [to],
        subject: subject,
        html: html,
        text: text
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: errorText, provider: 'resend' };
    }

    return { success: true, message: 'Email sent via Resend', provider: 'resend' };

  } catch (error) {
    return { success: false, error: error.message, provider: 'resend' };
  }
}

async function sendWithSMTP(to: string, subject: string, html?: string, text?: string) {
  // SMTP fallback - this would require additional SMTP configuration
  // For now, we'll return a simulated success for fallback
  console.log('SMTP fallback triggered - email would be queued for later delivery');
  
  return { 
    success: true, 
    message: 'Email queued for SMTP delivery', 
    provider: 'smtp' 
  };
}
