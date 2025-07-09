import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import {
  createRobustFunction,
  createHealthResponse,
  validateRequired,
  executeTransaction,
  sanitizeInput,
  createAuditLog,
  generateIdempotencyKey,
} from "../_shared/utilities.ts";
import { createSuccessResponse, createErrorResponse } from "../_shared/cors.ts";

const FUNCTION_NAME = "create-order";

serve(
  createRobustFunction(FUNCTION_NAME, async (req, supabase) => {
    const body = await req.json();
    console.log(`[${FUNCTION_NAME}] Received request:`, {
      ...body,
      timestamp: new Date().toISOString(),
    });

    // Handle health check
    if (body.action === "health") {
      return createHealthResponse(FUNCTION_NAME);
    }

    // Sanitize input data
    const sanitizedBody = sanitizeInput(body);

    // Validate required fields
    const requiredFields = [
      "bookId",
      "buyerEmail",
      "sellerId",
      "amount",
      "paystackReference",
    ];
    const validation = validateRequired(sanitizedBody, requiredFields);

    if (!validation.isValid) {
      return createErrorResponse(
        `Missing required fields: ${validation.missing.join(", ")}`,
        400,
        { missingFields: validation.missing },
        FUNCTION_NAME,
      );
    }

    const {
      bookId,
      buyerId,
      buyerEmail,
      sellerId,
      amount,
      deliveryOption,
      shippingAddress,
      deliveryData,
      paystackReference,
      paystackSubaccount,
    } = sanitizedBody;

    // Generate idempotency key to prevent duplicate orders
    const idempotencyKey = generateIdempotencyKey({
      paystackReference,
      bookId,
      buyerId,
    });

    try {
      // Check for existing order with same idempotency key
      const { data: existingOrder } = await supabase
        .from("orders")
        .select("*")
        .eq("paystack_reference", paystackReference)
        .eq("book_id", bookId)
        .single();

      if (existingOrder) {
        console.log(
          `[${FUNCTION_NAME}] Order already exists for reference: ${paystackReference}`,
        );
        return createSuccessResponse({
          order: existingOrder,
          message: "Order already exists",
          duplicate: true,
        });
      }

      // Execute atomic transaction
      const result = await executeTransaction(
        supabase,
        async () => {
          // Step 1: Verify book availability and get details
          const { data: book, error: bookError } = await supabase
            .from("books")
            .select("*")
            .eq("id", bookId)
            .single();

          if (bookError || !book) {
            throw new Error(`Book not found: ${bookId}`);
          }

          if (book.sold) {
            throw new Error("Book is no longer available");
          }

          if (book.seller_id !== sellerId) {
            throw new Error("Invalid seller for this book");
          }

          // Step 2: Calculate commit deadline (48 hours from now)
          const commitDeadline = new Date();
          commitDeadline.setHours(commitDeadline.getHours() + 48);

          // Step 3: Create order
          const orderId = crypto.randomUUID();
          const orderData = {
            id: orderId,
            book_id: bookId,
            buyer_id: buyerId,
            buyer_email: buyerEmail,
            seller_id: sellerId,
            amount: parseFloat(amount),
            status: "paid",
            payment_status: "paid",
            delivery_option: deliveryOption || "collection",
            shipping_address: shippingAddress,
            delivery_data: deliveryData,
            paystack_ref: paystackReference,
            paystack_reference: paystackReference,
            paystack_subaccount: paystackSubaccount,
            commit_deadline: commitDeadline.toISOString(),
            paid_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            idempotency_key: idempotencyKey,
          };

          const { data: order, error: orderError } = await supabase
            .from("orders")
            .insert(orderData)
            .select()
            .single();

          if (orderError) {
            throw new Error(`Failed to create order: ${orderError.message}`);
          }

          // Step 4: Mark book as sold
          const { error: updateError } = await supabase
            .from("books")
            .update({
              sold: true,
              sold_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("id", bookId);

          if (updateError) {
            throw new Error(
              `Failed to mark book as sold: ${updateError.message}`,
            );
          }

          // Step 5: Create notification for seller
          const { error: notificationError } = await supabase
            .from("notifications")
            .insert({
              user_id: sellerId,
              type: "order_created",
              title: "New Order Received",
              message: `You have received a new order for "${book.title}". Please commit to sell within 48 hours.`,
              data: {
                order_id: orderId,
                book_title: book.title,
                amount: amount,
                commit_deadline: commitDeadline.toISOString(),
              },
              created_at: new Date().toISOString(),
            });

          if (notificationError) {
            console.warn(
              `[${FUNCTION_NAME}] Failed to create notification:`,
              notificationError,
            );
            // Don't fail the transaction for notification errors
          }

          return { order, book };
        },

        // Rollback operations if transaction fails
        async () => {
          console.log(
            `[${FUNCTION_NAME}] Rolling back order creation for book: ${bookId}`,
          );

          // Remove the order if it was created
          await supabase
            .from("orders")
            .delete()
            .eq("paystack_reference", paystackReference);

          // Ensure book is marked as available
          await supabase.from("books").update({ sold: false }).eq("id", bookId);
        },
      );

      if (!result.success) {
        throw result.error;
      }

      const { order, book } = result.data;

      // Log successful order creation
      await createAuditLog(
        supabase,
        "order_created",
        "orders",
        order.id,
        buyerId,
        undefined,
        {
          book_title: book.title,
          amount: amount,
          seller_id: sellerId,
          paystack_reference: paystackReference,
        },
        FUNCTION_NAME,
      );

      console.log(`[${FUNCTION_NAME}] Order created successfully:`, {
        orderId: order.id,
        bookId: bookId,
        amount: amount,
        commitDeadline: order.commit_deadline,
      });

      return createSuccessResponse({
        order: order,
        book: {
          id: book.id,
          title: book.title,
          author: book.author,
          isbn: book.isbn,
        },
        message: "Order created successfully",
        commitDeadline: order.commit_deadline,
      });
    } catch (error) {
      console.error(`[${FUNCTION_NAME}] Order creation failed:`, error);

      // Log failed attempt
      await createAuditLog(
        supabase,
        "order_creation_failed",
        "orders",
        bookId,
        buyerId,
        undefined,
        {
          error_message: error.message,
          paystack_reference: paystackReference,
          amount: amount,
        },
        FUNCTION_NAME,
      );

      return createErrorResponse(
        error instanceof Error ? error.message : "Failed to create order",
        500,
        { bookId, paystackReference },
        FUNCTION_NAME,
      );
    }
  }),
);
