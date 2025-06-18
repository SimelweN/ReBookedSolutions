import { supabase } from "@/integrations/supabase/client";
import { addNotification } from "@/services/notificationService";
import { toast } from "sonner";

export interface ContactInfo {
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  sellerId: string;
  sellerName: string;
  sellerEmail: string;
  bookTitle: string;
  bookPrice: number;
  saleId: string;
}

export interface ContactMessage {
  id?: string;
  saleId: string;
  fromUserId: string;
  toUserId: string;
  message: string;
  timestamp: string;
  messageType: "initial_contact" | "delivery_arrangement" | "general";
}

/**
 * Service for managing buyer-seller contact after book sales
 */
export class BuyerContactService {
  /**
   * Initiate contact between buyer and seller after sale
   */
  static async initiateContact(contactInfo: ContactInfo): Promise<void> {
    try {
      console.log(
        "[BuyerContactService] Initiating contact for sale:",
        contactInfo.saleId,
      );

      // Send notification to seller about the sale and buyer contact
      await addNotification({
        userId: contactInfo.sellerId,
        title: "📚 Book Sold - Contact Buyer",
        message: `Your book "${contactInfo.bookTitle}" has been sold to ${contactInfo.buyerName}! Contact them to arrange delivery. Buyer email: ${contactInfo.buyerEmail}`,
        type: "success",
        read: false,
      });

      // Send notification to buyer about seller contact
      await addNotification({
        userId: contactInfo.buyerId,
        title: "📖 Book Purchase - Seller Contact",
        message: `Thank you for purchasing "${contactInfo.bookTitle}"! The seller ${contactInfo.sellerName} will contact you at ${contactInfo.buyerEmail} to arrange delivery.`,
        type: "info",
        read: false,
      });

      // Create initial contact record in messages table (if exists)
      await this.saveContactMessage({
        saleId: contactInfo.saleId,
        fromUserId: "system",
        toUserId: contactInfo.sellerId,
        message: `Sale completed: "${contactInfo.bookTitle}" sold to ${contactInfo.buyerName} (${contactInfo.buyerEmail}) for R${contactInfo.bookPrice}. Please contact the buyer to arrange delivery.`,
        timestamp: new Date().toISOString(),
        messageType: "initial_contact",
      });

      console.log("[BuyerContactService] Contact initiated successfully");
    } catch (error) {
      console.error("[BuyerContactService] Error initiating contact:", error);
      throw new Error("Failed to initiate buyer-seller contact");
    }
  }

  /**
   * Send delivery arrangement message
   */
  static async sendDeliveryMessage(
    saleId: string,
    fromUserId: string,
    toUserId: string,
    message: string,
  ): Promise<void> {
    try {
      await this.saveContactMessage({
        saleId,
        fromUserId,
        toUserId,
        message,
        timestamp: new Date().toISOString(),
        messageType: "delivery_arrangement",
      });

      // Send notification about new message
      await addNotification({
        userId: toUserId,
        title: "📬 New Message - Book Delivery",
        message: `You have a new message about book delivery: "${message.substring(0, 50)}..."`,
        type: "info",
        read: false,
      });

      console.log("[BuyerContactService] Delivery message sent");
    } catch (error) {
      console.error(
        "[BuyerContactService] Error sending delivery message:",
        error,
      );
      throw new Error("Failed to send delivery message");
    }
  }

  /**
   * Get contact messages for a sale
   */
  static async getContactMessages(saleId: string): Promise<ContactMessage[]> {
    try {
      // Try to get from messages table if it exists
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .eq("sale_id", saleId)
        .order("timestamp", { ascending: true });

      if (error) {
        console.warn(
          "[BuyerContactService] Contact messages table not found, returning empty array",
        );
        return [];
      }

      return (
        data?.map((msg) => ({
          id: msg.id,
          saleId: msg.sale_id,
          fromUserId: msg.from_user_id,
          toUserId: msg.to_user_id,
          message: msg.message,
          timestamp: msg.timestamp,
          messageType: msg.message_type,
        })) || []
      );
    } catch (error) {
      console.error(
        "[BuyerContactService] Error getting contact messages:",
        error,
      );
      return [];
    }
  }

  /**
   * Save contact message (with graceful failure if table doesn't exist)
   */
  private static async saveContactMessage(
    message: ContactMessage,
  ): Promise<void> {
    try {
      const { error } = await supabase.from("contact_messages").insert([
        {
          sale_id: message.saleId,
          from_user_id: message.fromUserId,
          to_user_id: message.toUserId,
          message: message.message,
          timestamp: message.timestamp,
          message_type: message.messageType,
        },
      ]);

      if (error) {
        console.warn(
          "[BuyerContactService] Could not save to contact_messages table:",
          error.message,
        );
        // Don't throw - contact still works via notifications
      }
    } catch (error) {
      console.warn(
        "[BuyerContactService] Contact messages feature not available:",
        error,
      );
      // Graceful degradation - contact still works via notifications
    }
  }

  /**
   * Generate buyer contact information for display
   */
  static generateContactInstructions(contactInfo: ContactInfo): {
    sellerInstructions: string;
    buyerInstructions: string;
  } {
    return {
      sellerInstructions: `
📚 Congratulations! Your book "${contactInfo.bookTitle}" has been sold for R${contactInfo.bookPrice}!

👤 Buyer Details:
• Name: ${contactInfo.buyerName}
• Email: ${contactInfo.buyerEmail}

📋 Next Steps:
1. Contact the buyer via email to arrange delivery
2. Package the book securely 
3. Arrange pickup/delivery method
4. Confirm delivery completion
5. You'll receive 90% (R${Math.round(contactInfo.bookPrice * 0.9)}) after delivery confirmation

Please contact the buyer within 24 hours to arrange delivery.
      `.trim(),

      buyerInstructions: `
📖 Thank you for purchasing "${contactInfo.bookTitle}" for R${contactInfo.bookPrice}!

📞 Seller Contact:
• Name: ${contactInfo.sellerName}  
• Email: ${contactInfo.sellerEmail}

📋 What Happens Next:
1. The seller will contact you within 24 hours
2. You'll arrange a convenient delivery method together
3. Payment will be processed after delivery confirmation
4. You can track the process in your notifications

If you don't hear from the seller within 24 hours, please contact support.
      `.trim(),
    };
  }
}

export default BuyerContactService;
