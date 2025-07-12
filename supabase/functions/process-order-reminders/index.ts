
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

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting order reminders processing');

    // Get orders that need commit reminders (24 hours before deadline)
    const reminderDeadline = new Date();
    reminderDeadline.setHours(reminderDeadline.getHours() + 24);

    const { data: ordersNeedingReminders, error: reminderError } = await supabase
      .from('orders')
      .select(`
        id,
        seller_id,
        buyer_email,
        commit_deadline,
        books(title, author)
      `)
      .eq('status', 'paid')
      .eq('payment_status', 'paid')
      .lt('commit_deadline', reminderDeadline.toISOString())
      .gt('commit_deadline', new Date().toISOString())
      .is('committed_at', null);

    if (reminderError) {
      throw reminderError;
    }

    let remindersSent = 0;
    let remindersFailed = 0;

    for (const order of ordersNeedingReminders || []) {
      try {
        // Check if reminder was already sent in the last 12 hours
        const { data: existingReminder } = await supabase
          .from('order_notifications')
          .select('id')
          .eq('order_id', order.id)
          .eq('type', 'commit_reminder')
          .gte('sent_at', new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString())
          .single();

        if (existingReminder) {
          continue; // Skip if reminder already sent
        }

        // Send reminder notification
        await supabase.from('order_notifications').insert({
          order_id: order.id,
          user_id: order.seller_id,
          type: 'commit_reminder',
          title: 'Reminder: Order Commitment Required',
          message: `You have less than 24 hours remaining to commit to the order for "${order.books?.title}". Please log in and confirm your commitment.`
        });

        // Send email reminder
        try {
          await supabase.functions.invoke('email-automation', {
            body: {
              to: order.buyer_email,
              subject: 'Order Commitment Reminder',
              template: 'commit_reminder',
              data: {
                bookTitle: order.books?.title,
                orderId: order.id,
                deadline: order.commit_deadline
              }
            }
          });
        } catch (emailError) {
          console.error('Failed to send email reminder:', emailError);
        }

        remindersSent++;
        console.log(`Sent reminder for order ${order.id}`);

      } catch (error) {
        console.error(`Error sending reminder for order ${order.id}:`, error);
        remindersFailed++;
      }
    }

    // Get orders approaching collection deadline (24 hours before)
    const collectionDeadline = new Date();
    collectionDeadline.setDate(collectionDeadline.getDate() + 6); // 6 days after commit (7 days total - 1 day warning)

    const { data: ordersNeedingCollectionReminders, error: collectionError } = await supabase
      .from('orders')
      .select(`
        id,
        buyer_id,
        seller_id,
        buyer_email,
        committed_at,
        books(title, author)
      `)
      .eq('status', 'committed')
      .lt('committed_at', collectionDeadline.toISOString())
      .is('cancelled_at', null);

    if (collectionError) {
      throw collectionError;
    }

    let collectionRemindersSent = 0;
    let collectionRemindersFailed = 0;

    for (const order of ordersNeedingCollectionReminders || []) {
      try {
        // Check if collection reminder was already sent
        const { data: existingCollectionReminder } = await supabase
          .from('order_notifications')
          .select('id')
          .eq('order_id', order.id)
          .eq('type', 'collection_reminder')
          .gte('sent_at', new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString())
          .single();

        if (existingCollectionReminder) {
          continue;
        }

        // Send collection reminder to buyer
        await supabase.from('order_notifications').insert({
          order_id: order.id,
          user_id: order.buyer_id,
          type: 'collection_reminder',
          title: 'Reminder: Book Collection Required',
          message: `Please collect your book "${order.books?.title}" within 24 hours to avoid automatic refund.`
        });

        collectionRemindersSent++;
        console.log(`Sent collection reminder for order ${order.id}`);

      } catch (error) {
        console.error(`Error sending collection reminder for order ${order.id}:`, error);
        collectionRemindersFailed++;
      }
    }

    // Log the processing results
    await supabase.from('audit_logs').insert({
      action: 'order_reminders_processed',
      table_name: 'orders',
      new_values: {
        remindersSent,
        remindersFailed,
        collectionRemindersSent,
        collectionRemindersFailed,
        totalOrdersProcessed: (ordersNeedingReminders?.length || 0) + (ordersNeedingCollectionReminders?.length || 0)
      }
    });

    return new Response(
      JSON.stringify({
        success: true,
        remindersSent,
        remindersFailed,
        collectionRemindersSent,
        collectionRemindersFailed,
        totalProcessed: remindersSent + collectionRemindersSent
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in process-order-reminders:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
