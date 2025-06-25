import { supabase } from "@/integrations/supabase/client";

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  subject?: string;
  read: boolean;
  created_at: string;
  updated_at: string;
}

export interface MessageInput {
  sender_id: string;
  receiver_id: string;
  content: string;
  subject?: string;
}

// Enhanced message fetching with proper error handling
export const fetchMessages = async (userId: string): Promise<Message[]> => {
  if (!userId) {
    console.warn("fetchMessages called without userId");
    return [];
  }

  try {
    // Check if user is online first
    if (!navigator.onLine) {
      throw new Error(
        "You appear to be offline. Please check your internet connection.",
      );
    }

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase Error fetching messages:", error.message);

      // Handle specific error types
      if (error.code === "PGRST116") {
        throw new Error("Messages not found.");
      } else if (error.code === "42P01") {
        throw new Error(
          "Messages table does not exist. Please contact support.",
        );
      } else if (error.message.includes("permission")) {
        throw new Error("You don't have permission to view messages.");
      } else if (error.message.includes("RLS")) {
        throw new Error("Access restricted. Please log in again.");
      } else {
        throw new Error("Could not load messages. Please try again.");
      }
    }

    return data || [];
  } catch (err) {
    // Handle network errors vs API errors
    if (err instanceof Error) {
      if (
        err.message.includes("Failed to fetch") ||
        err.message.includes("NetworkError")
      ) {
        throw new Error(
          "Network connection failed. Please check your internet and try again.",
        );
      }
      // Re-throw known errors
      throw err;
    }

    // Unknown error
    throw new Error("An unexpected error occurred while loading messages.");
  }
};

// Send a new message
export const sendMessage = async (message: MessageInput): Promise<Message> => {
  if (!navigator.onLine) {
    throw new Error(
      "You appear to be offline. Please check your internet connection.",
    );
  }

  try {
    const { data, error } = await supabase
      .from("messages")
      .insert([message])
      .select()
      .single();

    if (error) {
      console.error("Error sending message:", error.message);

      if (error.message.includes("permission")) {
        throw new Error("You don't have permission to send messages.");
      } else if (error.code === "42P01") {
        throw new Error(
          "Messages system not available. Please contact support.",
        );
      } else {
        throw new Error("Failed to send message. Please try again.");
      }
    }

    return data;
  } catch (err) {
    if (err instanceof Error) {
      if (err.message.includes("Failed to fetch")) {
        throw new Error(
          "Network error. Please check your connection and try again.",
        );
      }
      throw err;
    }
    throw new Error("Failed to send message due to an unexpected error.");
  }
};

// Mark message as read
export const markMessageAsRead = async (messageId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from("messages")
      .update({ read: true })
      .eq("id", messageId);

    if (error) {
      console.error("Error marking message as read:", error.message);
      // Don't throw for this operation - it's not critical
    }
  } catch (err) {
    console.error("Failed to mark message as read:", err);
    // Silently fail for this operation
  }
};

// Get unread message count
export const getUnreadMessageCount = async (
  userId: string,
): Promise<number> => {
  if (!userId) return 0;

  try {
    const { count, error } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("receiver_id", userId)
      .eq("read", false);

    if (error) {
      console.error("Error getting unread count:", error.message);
      return 0;
    }

    return count || 0;
  } catch (err) {
    console.error("Failed to get unread message count:", err);
    return 0;
  }
};
