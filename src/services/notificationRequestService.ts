import { supabase } from "@/integrations/supabase/client";
import { logError, serializeError } from "@/utils/asyncWrapper";

export interface NotificationRequest {
  id?: string;
  user_id: string;
  user_email: string;
  notification_type: "accommodation" | "program" | "general";
  university_id?: string;
  university_name?: string;
  program_id?: string;
  program_name?: string;
  message?: string;
  created_at?: string;
  status?: "pending" | "sent" | "cancelled";
}

type NotificationType = "accommodation" | "program" | "general";

export class NotificationRequestService {
  /**
   * Submit a notification request for accommodation
   */
  static async requestAccommodationNotification(
    userId: string,
    userEmail: string,
    universityId: string,
    universityName: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.from("notification_requests").insert({
        user_id: userId,
        user_email: userEmail,
        notification_type: "accommodation",
        university_id: universityId,
        university_name: universityName,
        message: `User requested notification for accommodation services at ${universityName}`,
        status: "pending",
      });

      if (error) {
        // Handle missing table gracefully
        if (error.message && error.message.includes("does not exist")) {
          console.log("💡 Notification system not yet set up - table missing");
          return {
            success: false,
            error:
              "Notification system is being set up. Please check back later.",
          };
        }

        logError("Error submitting accommodation notification request:", error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error("Error in requestAccommodationNotification:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to submit notification request",
      };
    }
  }

  /**
   * Submit a notification request for program updates
   */
  static async requestProgramNotification(
    userId: string,
    userEmail: string,
    universityId: string,
    universityName: string,
    programId?: string,
    programName?: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.from("notification_requests").insert({
        user_id: userId,
        user_email: userEmail,
        notification_type: "program",
        university_id: universityId,
        university_name: universityName,
        program_id: programId,
        program_name: programName,
        message: `User requested notification for program updates at ${universityName}${programName ? ` for ${programName}` : ""}`,
        status: "pending",
      });

      if (error) {
        // Handle missing table gracefully
        if (error.message && error.message.includes("does not exist")) {
          console.log("💡 Notification system not yet set up - table missing");
          return {
            success: false,
            error:
              "Notification system is being set up. Please check back later.",
          };
        }

        logError("Error submitting program notification request:", error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error("Error in requestProgramNotification:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to submit notification request",
      };
    }
  }

  /**
   * Check if user has existing notification request
   */
  static async hasExistingRequest(
    userId: string,
    type: NotificationType,
    identifier: string,
  ): Promise<{ exists: boolean; error?: string }> {
    try {
      let query = supabase
        .from("notification_requests")
        .select("id")
        .eq("user_id", userId)
        .eq("notification_type", type)
        .eq("status", "pending");

      // Add specific filters based on type
      if (type === "program") {
        query = query.eq("program_id", identifier);
      } else if (type === "accommodation") {
        query = query.eq("university_id", identifier);
      }

      const { data, error } = await query.limit(1);

      if (error) {
        logError("Error checking existing notification request:", error);

        // Handle missing table gracefully
        if (error.message && error.message.includes("does not exist")) {
          console.log("💡 Notification system not yet set up - table missing");
          return {
            exists: false,
            error:
              "Notification system is being set up. Please check back later.",
          };
        }

        return { exists: false, error: error.message };
      }

      return { exists: (data && data.length > 0) || false };
    } catch (error) {
      console.error("Error in hasExistingRequest:", error);
      return {
        exists: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to check existing request",
      };
    }
  }

  /**
   * Get user's notification requests
   */
  static async getUserNotificationRequests(
    userId: string,
  ): Promise<{ requests: NotificationRequest[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from("notification_requests")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(
          "Error fetching user notification requests:",
          error instanceof Error ? error.message : String(error),
        );

        // Handle missing table gracefully
        if (error.message && error.message.includes("does not exist")) {
          console.log("💡 Notification system not yet set up - table missing");
          return {
            requests: [],
            error:
              "Notification system is being set up. Please check back later.",
          };
        }

        return { requests: [], error: error.message };
      }

      return { requests: data || [] };
    } catch (error) {
      console.error("Error in getUserNotificationRequests:", error);
      return {
        requests: [],
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch notification requests",
      };
    }
  }

  /**
   * Cancel a notification request
   */
  static async cancelNotificationRequest(
    requestId: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from("notification_requests")
        .update({ status: "cancelled" })
        .eq("id", requestId);

      if (error) {
        console.error(
          "Error cancelling notification request:",
          error instanceof Error ? error.message : String(error),
        );

        // Handle missing table gracefully
        if (error.message && error.message.includes("does not exist")) {
          console.log("💡 Notification system not yet set up - table missing");
          return {
            success: false,
            error:
              "Notification system is being set up. Please check back later.",
          };
        }

        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error("Error in cancelNotificationRequest:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to cancel notification request",
      };
    }
  }
}
