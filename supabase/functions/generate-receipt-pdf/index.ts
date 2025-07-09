import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const receiptId = url.searchParams.get("receipt_id");
    const orderId = url.searchParams.get("order_id");

    if (!receiptId && !orderId) {
      return new Response(
        JSON.stringify({ error: "Receipt ID or Order ID is required" }),
        {
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    let receiptData;

    if (receiptId) {
      // Get receipt by ID
      const { data, error } = await supabaseClient
        .from("receipts")
        .select(
          `
          *,
          order:order_id(
            *,
            buyer:buyer_id(id, email, full_name),
            seller:seller_id(id, email, full_name),
            book:book_id(title, author, price, isbn)
          )
        `,
        )
        .eq("id", receiptId)
        .single();

      if (error || !data) {
        return new Response(JSON.stringify({ error: "Receipt not found" }), {
          status: 404,
          headers: corsHeaders,
        });
      }

      receiptData = data;
    } else {
      // Generate new receipt for order
      const { data: newReceiptId, error: generateError } =
        await supabaseClient.rpc("generate_receipt_for_order", {
          order_id: orderId,
        });

      if (generateError || !newReceiptId) {
        return new Response(
          JSON.stringify({ error: "Failed to generate receipt" }),
          {
            status: 500,
            headers: corsHeaders,
          },
        );
      }

      // Now get the generated receipt
      const { data, error } = await supabaseClient
        .from("receipts")
        .select(
          `
          *,
          order:order_id(
            *,
            buyer:buyer_id(id, email, full_name),
            seller:seller_id(id, email, full_name),
            book:book_id(title, author, price, isbn)
          )
        `,
        )
        .eq("id", newReceiptId)
        .single();

      if (error || !data) {
        return new Response(
          JSON.stringify({ error: "Generated receipt not found" }),
          {
            status: 404,
            headers: corsHeaders,
          },
        );
      }

      receiptData = data;
    }

    // Generate HTML receipt
    const receiptHtml = generateReceiptHtml(receiptData);

    // For now, return HTML. In production, you could use a service like Puppeteer
    // to convert HTML to PDF, or use a PDF generation library
    const format = url.searchParams.get("format") || "html";

    if (format === "pdf") {
      // TODO: Implement actual PDF generation
      return new Response(
        JSON.stringify({
          error: "PDF generation not yet implemented",
          html_url: `${url.origin}${url.pathname}?receipt_id=${receiptData.id}&format=html`,
        }),
        {
          status: 501,
          headers: corsHeaders,
        },
      );
    }

    // Return HTML receipt
    return new Response(receiptHtml, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html",
      },
    });
  } catch (error) {
    console.error("Error generating receipt:", error);

    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        details: error?.message || "Failed to generate receipt",
      }),
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
});

function generateReceiptHtml(receipt: any): string {
  const order = receipt.order;
  const buyer = order.buyer;
  const seller = order.seller;
  const book = order.book;

  const receiptDate = new Date(receipt.created_at).toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Receipt - ${receipt.receipt_number}</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                background: #f5f5f5;
            }
            
            .receipt {
                background: white;
                padding: 40px;
                border-radius: 12px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            
            .header {
                text-align: center;
                margin-bottom: 40px;
                border-bottom: 3px solid #2563eb;
                padding-bottom: 20px;
            }
            
            .company-name {
                font-size: 32px;
                font-weight: bold;
                color: #2563eb;
                margin-bottom: 8px;
            }
            
            .company-tagline {
                font-size: 16px;
                color: #6b7280;
                margin-bottom: 16px;
            }
            
            .receipt-title {
                font-size: 24px;
                font-weight: bold;
                color: #1f2937;
                margin-top: 16px;
            }
            
            .receipt-number {
                font-size: 18px;
                color: #6b7280;
                margin-top: 8px;
            }
            
            .receipt-date {
                font-size: 16px;
                color: #6b7280;
                margin-top: 4px;
            }
            
            .section {
                margin: 30px 0;
            }
            
            .section-title {
                font-size: 18px;
                font-weight: bold;
                color: #1f2937;
                margin-bottom: 16px;
                border-bottom: 2px solid #e5e7eb;
                padding-bottom: 8px;
            }
            
            .info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 30px;
                margin-bottom: 30px;
            }
            
            .info-card {
                background: #f9fafb;
                padding: 20px;
                border-radius: 8px;
                border-left: 4px solid #2563eb;
            }
            
            .info-label {
                font-weight: bold;
                color: #374151;
                margin-bottom: 8px;
            }
            
            .info-value {
                color: #6b7280;
                line-height: 1.5;
            }
            
            .item-details {
                background: #f9fafb;
                padding: 24px;
                border-radius: 8px;
                margin: 20px 0;
            }
            
            .item-title {
                font-size: 20px;
                font-weight: bold;
                color: #1f2937;
                margin-bottom: 12px;
            }
            
            .item-info {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 16px;
                margin-bottom: 16px;
            }
            
            .amount-breakdown {
                background: white;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                padding: 24px;
                margin: 20px 0;
            }
            
            .amount-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 0;
                border-bottom: 1px solid #f3f4f6;
            }
            
            .amount-row:last-child {
                border-bottom: none;
                border-top: 2px solid #2563eb;
                margin-top: 12px;
                padding-top: 16px;
                font-weight: bold;
                font-size: 18px;
                color: #1f2937;
            }
            
            .amount-label {
                color: #374151;
            }
            
            .amount-value {
                font-weight: 600;
                color: #1f2937;
            }
            
            .footer {
                text-align: center;
                margin-top: 40px;
                padding-top: 20px;
                border-top: 2px solid #e5e7eb;
                color: #6b7280;
                font-size: 14px;
            }
            
            .footer-note {
                margin-bottom: 12px;
            }
            
            .contact-info {
                margin-top: 16px;
            }
            
            @media (max-width: 600px) {
                .info-grid {
                    grid-template-columns: 1fr;
                    gap: 20px;
                }
                
                .item-info {
                    grid-template-columns: 1fr;
                }
                
                .receipt {
                    padding: 20px;
                }
                
                .company-name {
                    font-size: 24px;
                }
            }
            
            @media print {
                body {
                    background: white;
                    padding: 0;
                }
                
                .receipt {
                    box-shadow: none;
                    border-radius: 0;
                }
            }
        </style>
    </head>
    <body>
        <div class="receipt">
            <div class="header">
                <div class="company-name">ReBooked Solutions</div>
                <div class="company-tagline">Your Trusted University Textbook Marketplace</div>
                <div class="receipt-title">Payment Receipt</div>
                <div class="receipt-number">Receipt #${receipt.receipt_number}</div>
                <div class="receipt-date">${receiptDate}</div>
            </div>
            
            <div class="info-grid">
                <div class="info-card">
                    <div class="info-label">Bill To:</div>
                    <div class="info-value">
                        ${buyer.full_name}<br>
                        ${buyer.email}
                    </div>
                </div>
                
                <div class="info-card">
                    <div class="info-label">Sold By:</div>
                    <div class="info-value">
                        ${seller.full_name}<br>
                        ${seller.email}
                    </div>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">Item Details</div>
                <div class="item-details">
                    <div class="item-title">${book.title}</div>
                    <div class="item-info">
                        <div>
                            <div class="info-label">Author:</div>
                            <div class="info-value">${book.author}</div>
                        </div>
                        <div>
                            <div class="info-label">ISBN:</div>
                            <div class="info-value">${book.isbn || "N/A"}</div>
                        </div>
                        <div>
                            <div class="info-label">Condition:</div>
                            <div class="info-value">${order.book_condition || "Good"}</div>
                        </div>
                        <div>
                            <div class="info-label">Order ID:</div>
                            <div class="info-value">${order.id}</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">Payment Summary</div>
                <div class="amount-breakdown">
                    <div class="amount-row">
                        <span class="amount-label">Book Price:</span>
                        <span class="amount-value">R ${book.price.toFixed(2)}</span>
                    </div>
                    <div class="amount-row">
                        <span class="amount-label">Delivery Fee:</span>
                        <span class="amount-value">R ${(receipt.data.delivery_fee || 0).toFixed(2)}</span>
                    </div>
                    <div class="amount-row">
                        <span class="amount-label">Total Amount Paid:</span>
                        <span class="amount-value">R ${receipt.data.amount.toFixed(2)}</span>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">Transaction Information</div>
                <div class="info-grid">
                    <div class="info-card">
                        <div class="info-label">Payment Method:</div>
                        <div class="info-value">Paystack (Card Payment)</div>
                    </div>
                    <div class="info-card">
                        <div class="info-label">Transaction Reference:</div>
                        <div class="info-value">${receipt.data.payment_reference || "N/A"}</div>
                    </div>
                </div>
            </div>
            
            <div class="footer">
                <div class="footer-note">
                    Thank you for using ReBooked Solutions!
                </div>
                <div class="footer-note">
                    This receipt serves as proof of payment for your textbook purchase.
                </div>
                <div class="contact-info">
                    For support, contact us at support@rebooked.co.za
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
}
