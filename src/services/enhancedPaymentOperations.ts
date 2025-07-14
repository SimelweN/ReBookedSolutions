/**
 * Enhanced Payment Operations with Email Integration
 * Extends payment processing with automated email notifications
 */

import { supabase } from "@/integrations/supabase/client";
import EmailService from "./emailService";
import {
  createOrder,
  updateOrderStatus,
  type CreateOrderData,
} from "./orderManagementService";

interface PaymentEmailData {
  orderId: string;
  paymentReference: string;
  buyerId: string;
  sellerId: string;
  bookId: string;
  totalAmount: number;
  bookPrice: number;
  deliveryFee?: number;
}

/**
 * Process payment success with email notifications
 */
export const processPaymentSuccessWithEmails = async (
  paymentData: PaymentEmailData,
): Promise<boolean> => {
  try {
    console.log(
      "📧 Processing payment success emails for order:",
      paymentData.orderId,
    );

    // Handle demo mode
    if (paymentData.orderId.startsWith("demo-")) {
      console.log("📧 Demo mode: Sending mock payment success emails");

      const demoCollectionDeadline = new Date();
      demoCollectionDeadline.setHours(demoCollectionDeadline.getHours() + 48);

      const [buyerEmailSent, sellerEmailSent] = await Promise.all([
        EmailService.sendPaymentConfirmation(
          { name: "Demo Buyer", email: "demo@example.com" },
          { name: "Demo Seller", email: "demo@example.com" },
          {
            title: "Introduction to Psychology",
            author: "Demo Author",
            price: 25000,
            imageUrl: "/placeholder.svg",
          },
          {
            orderId: paymentData.orderId,
            totalAmount: paymentData.totalAmount,
            paymentReference: paymentData.paymentReference,
          },
        ),
        EmailService.sendBookPurchaseAlert(
          { name: "Demo Seller", email: "demo@example.com" },
          { name: "Demo Buyer", email: "demo@example.com" },
          {
            title: "Introduction to Psychology",
            author: "Demo Author",
            price: 25000,
            imageUrl: "/placeholder.svg",
          },
          {
            orderId: paymentData.orderId,
            totalAmount: paymentData.totalAmount,
            collectionDeadline: demoCollectionDeadline.toISOString(),
          },
        ),
      ]);

      return buyerEmailSent && sellerEmailSent;
    }

    // Get all required data for real orders
    const [buyerData, sellerData, bookData] = await Promise.all([
      // Get buyer info
      supabase
        .from("profiles")
        .select("name, email")
        .eq("id", paymentData.buyerId)
        .single(),

      // Get seller info
      supabase
        .from("profiles")
        .select("name, email")
        .eq("id", paymentData.sellerId)
        .single(),

      // Get book info
      supabase
        .from("books")
        .select("title, author, price, imageUrl")
        .eq("id", paymentData.bookId)
        .single(),
    ]);

    if (buyerData.error || sellerData.error || bookData.error) {
      console.error("Failed to get data for payment emails:", {
        buyerError: buyerData.error,
        sellerError: sellerData.error,
        bookError: bookData.error,
      });
      return false;
    }

    const buyer = buyerData.data;
    const seller = sellerData.data;
    const book = bookData.data;

    // Calculate collection deadline (48 hours from now)
    const collectionDeadline = new Date();
    collectionDeadline.setHours(collectionDeadline.getHours() + 48);

    // Send emails to both buyer and seller
    const [buyerEmailSent, sellerEmailSent] = await Promise.all([
      // Payment confirmation to buyer
      EmailService.sendPaymentConfirmation(
        { name: buyer.name || "Buyer", email: buyer.email },
        { name: seller.name || "Seller", email: seller.email },
        {
          title: book.title,
          author: book.author,
          price: book.price,
          imageUrl: book.imageUrl,
        },
        {
          orderId: paymentData.orderId,
          totalAmount: paymentData.totalAmount / 100, // Convert from kobo
          paymentReference: paymentData.paymentReference,
        },
      ),

      // Purchase alert to seller
      EmailService.sendBookPurchaseAlert(
        { name: seller.name || "Seller", email: seller.email },
        { name: buyer.name || "Buyer", email: buyer.email },
        {
          title: book.title,
          author: book.author,
          price: book.price,
          imageUrl: book.imageUrl,
        },
        {
          orderId: paymentData.orderId,
          totalAmount: paymentData.totalAmount / 100,
          collectionDeadline: collectionDeadline.toISOString(),
        },
      ),
    ]);

    if (buyerEmailSent && sellerEmailSent) {
      console.log("✅ Both payment emails sent successfully");
      return true;
    } else {
      console.warn("⚠️ Some payment emails failed to send:", {
        buyerEmailSent,
        sellerEmailSent,
      });
      return false;
    }
  } catch (error) {
    console.error("Error processing payment success emails:", error);
    return false;
  }
};

/**
 * Send courier pickup confirmation emails
 */
export const sendCourierPickupEmails = async (
  orderId: string,
  trackingNumber: string,
  courierService: string,
  estimatedDelivery: string,
): Promise<boolean> => {
  try {
    console.log("📧 Sending courier pickup emails for order:", orderId);

    // Handle demo mode
    if (orderId.startsWith("demo-")) {
      console.log("📧 Demo mode: Sending mock courier pickup emails");

      const emailSent = await EmailService.sendCourierPickupConfirmation(
        {
          name: "Demo Seller",
          email: "demo@example.com",
        },
        {
          name: "Demo Buyer",
          email: "demo@example.com",
        },
        {
          title: "Introduction to Psychology",
          author: "Demo Author",
          price: 25000,
          imageUrl: "/placeholder.svg",
        },
        {
          trackingNumber,
          courierService,
          estimatedDelivery,
        },
      );

      return emailSent;
    }

    // Get order with all related data
    const { data: order, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        book:books(title, author, price, imageUrl),
        buyer:profiles!orders_buyer_id_fkey(name, email),
        seller:profiles!orders_seller_id_fkey(name, email)
      `,
      )
      .eq("id", orderId)
      .single();

    if (error || !order) {
      console.error("Failed to get order data for courier emails:", error);
      return false;
    }

    // Send courier pickup confirmation emails
    const emailSent = await EmailService.sendCourierPickupConfirmation(
      {
        name: order.seller?.name || "Seller",
        email: order.seller?.email || "",
      },
      { name: order.buyer?.name || "Buyer", email: order.buyer?.email || "" },
      {
        title: order.book?.title || "Book",
        author: order.book?.author || "Unknown",
        price: order.book?.price || 0,
        imageUrl: order.book?.imageUrl,
      },
      {
        trackingNumber,
        courierService,
        estimatedDelivery,
      },
    );

    if (emailSent) {
      console.log("✅ Courier pickup emails sent successfully");

      // Update order with tracking info (skip for demo mode)
      if (!orderId.startsWith("demo-")) {
        await updateOrderStatus(orderId, "in_transit", {
          tracking_number: trackingNumber,
          courier_service: courierService,
          estimated_delivery: estimatedDelivery,
          pickup_confirmed_at: new Date().toISOString(),
        });
      }
    }

    return emailSent;
  } catch (error) {
    console.error("Error sending courier pickup emails:", error);
    return false;
  }
};

/**
 * Send delivery complete emails
 */
export const sendDeliveryCompleteEmails = async (
  orderId: string,
): Promise<boolean> => {
  try {
    console.log("📧 Sending delivery complete emails for order:", orderId);

    // Handle demo mode
    if (orderId.startsWith("demo-")) {
      console.log("📧 Demo mode: Sending mock delivery complete emails");

      const emailSent = await EmailService.sendDeliveryConfirmation(
        {
          name: "Demo Seller",
          email: "demo@example.com",
        },
        {
          name: "Demo Buyer",
          email: "demo@example.com",
        },
        {
          title: "Introduction to Psychology",
          author: "Demo Author",
          price: 25000,
          imageUrl: "/placeholder.svg",
        },
      );

      return emailSent;
    }

    // Get order with all related data
    const { data: order, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        book:books(title, author, price, imageUrl),
        buyer:profiles!orders_buyer_id_fkey(name, email),
        seller:profiles!orders_seller_id_fkey(name, email)
      `,
      )
      .eq("id", orderId)
      .single();

    if (error || !order) {
      console.error("Failed to get order data for delivery emails:", error);
      return false;
    }

    // Send delivery complete emails
    const emailSent = await EmailService.sendDeliveryCompleteNotification(
      { name: order.buyer?.name || "Buyer", email: order.buyer?.email || "" },
      {
        name: order.seller?.name || "Seller",
        email: order.seller?.email || "",
      },
      {
        title: order.book?.title || "Book",
        author: order.book?.author || "Unknown",
        price: order.book?.price || 0,
        imageUrl: order.book?.imageUrl,
      },
      {
        orderId: order.id,
        deliveredAt: new Date().toISOString(),
      },
    );

    if (emailSent) {
      console.log("✅ Delivery complete emails sent successfully");

      // Update order status to completed (skip for demo mode)
      if (!orderId.startsWith("demo-")) {
        await updateOrderStatus(orderId, "completed", {
          delivered_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
        });
      }
    }

    return emailSent;
  } catch (error) {
    console.error("Error sending delivery complete emails:", error);
    return false;
  }
};

/**
 * Send order cancellation email
 */
export const sendOrderCancellationEmail = async (
  orderId: string,
  reason: string,
  refundAmount?: number,
): Promise<boolean> => {
  try {
    console.log("📧 Sending order cancellation email for order:", orderId);

    // Get order with user and book data
    const { data: order, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        book:books(title, author, price, imageUrl),
        buyer:profiles!orders_buyer_id_fkey(name, email)
      `,
      )
      .eq("id", orderId)
      .single();

    if (error || !order) {
      console.error("Failed to get order data for cancellation email:", error);
      return false;
    }

    // Send cancellation email to buyer
    const emailSent = await EmailService.sendOrderCancellation(
      { name: order.buyer?.name || "User", email: order.buyer?.email || "" },
      {
        title: order.book?.title || "Book",
        author: order.book?.author || "Unknown",
        price: order.book?.price || 0,
        imageUrl: order.book?.imageUrl,
      },
      reason,
      refundAmount,
    );

    if (emailSent) {
      console.log("✅ Order cancellation email sent successfully");
    }

    return emailSent;
  } catch (error) {
    console.error("Error sending order cancellation email:", error);
    return false;
  }
};

/**
 * Test email functionality (development only)
 */
export const testEmailService = async (): Promise<void> => {
  if (import.meta.env.PROD) {
    console.warn("Email testing is disabled in production");
    return;
  }

  console.log("🧪 Testing email service...");

  try {
    const testUser = {
      name: "Test User",
      email: "test@example.com",
    };

    const testBook = {
      title: "Introduction to Computer Science",
      author: "John Smith",
      price: 250.0,
      imageUrl: "https://example.com/book.jpg",
    };

    // Test welcome email
    await EmailService.sendWelcomeEmail(testUser);
    console.log("✅ Welcome email test completed");

    // Test payment confirmation
    await EmailService.sendPaymentConfirmation(
      testUser,
      { name: "Seller", email: "seller@example.com" },
      testBook,
      {
        orderId: "test-order-123",
        totalAmount: 275.0,
        paymentReference: "test-ref-456",
      },
    );
    console.log("✅ Payment confirmation email test completed");

    console.log("🎉 All email tests completed!");
  } catch (error) {
    console.error("❌ Email testing failed:", error);
  }
};
