import { supabase } from "@/integrations/supabase/client";

/**
 * Comprehensive Backend Service Orchestrator
 * Manages all backend operations and provides unified API
 */

// =============================================
// STUDY RESOURCES SERVICE
// =============================================

export class StudyResourcesService {
  static async searchResources(params: {
    query?: string;
    university?: string;
    course?: string;
    type?: string;
    year?: number;
    limit?: number;
    offset?: number;
  }) {
    try {
      const searchParams = new URLSearchParams();
      searchParams.set("action", "search");
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.set(key, String(value));
        }
      });

      const { data, error } = await supabase.functions.invoke(
        `study-resources-api?${searchParams.toString()}`,
      );

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Study resources search error:", error);
      throw error;
    }
  }

  static async createResource(resource: {
    title: string;
    description: string;
    content: string;
    resource_type: string;
    university_id: string;
    course_code: string;
    year_level: number;
    semester: string;
    tags: string[];
    file_url?: string;
  }) {
    try {
      const { data, error } = await supabase.functions.invoke(
        "study-resources-api",
        {
          body: resource,
        },
      );

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Create study resource error:", error);
      throw error;
    }
  }

  static async getResource(id: string) {
    try {
      const { data, error } = await supabase.functions.invoke(
        "study-resources-api",
        {
          method: "GET",
          body: { action: "get", id },
        },
      );

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Get study resource error:", error);
      throw error;
    }
  }

  static async rateResource(
    resourceId: string,
    rating: number,
    review?: string,
  ) {
    try {
      const { data, error } = await supabase.functions.invoke(
        "study-resources-api",
        {
          method: "POST",
          body: { action: "rate", resourceId, rating, review },
        },
      );

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Rate study resource error:", error);
      throw error;
    }
  }

  static async verifyResource(resourceId: string, verified: boolean) {
    try {
      const { data, error } = await supabase.functions.invoke(
        "study-resources-api",
        {
          method: "POST",
          body: { action: "verify", resourceId, verified },
        },
      );

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Verify study resource error:", error);
      throw error;
    }
  }
}

// =============================================
// REAL-TIME NOTIFICATIONS SERVICE
// =============================================

export class NotificationService {
  private static channel?: any;

  static async initializeRealTime(userId: string) {
    this.channel = supabase
      .channel("notifications")
      .on("broadcast", { event: "new_notification" }, (payload) => {
        if (payload.user_id === userId) {
          this.handleNewNotification(payload);
        }
      })
      .subscribe();
  }

  static async sendNotification(notification: {
    user_id: string;
    type: string;
    title: string;
    message: string;
    data?: any;
    priority?: "low" | "normal" | "high" | "urgent";
    channels?: ("in_app" | "email" | "push")[];
  }) {
    try {
      const { data, error } = await supabase.functions.invoke(
        "realtime-notifications",
        {
          body: { action: "send", ...notification },
        },
      );

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Send notification error:", error);
      throw error;
    }
  }

  static async broadcastNotification(broadcast: {
    target_audience?: "all" | "users" | "admin";
    type: string;
    title: string;
    message: string;
    priority?: "low" | "normal" | "high" | "urgent";
  }) {
    try {
      const { data, error } = await supabase.functions.invoke(
        "realtime-notifications",
        {
          body: { action: "broadcast", ...broadcast },
        },
      );

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Broadcast notification error:", error);
      throw error;
    }
  }

  static async getUserNotifications(userId: string, limit = 50, offset = 0) {
    try {
      const { data, error } = await supabase.functions.invoke(
        "realtime-notifications",
        {
          method: "GET",
          body: { action: "notifications", user_id: userId, limit, offset },
        },
      );

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Get notifications error:", error);
      throw error;
    }
  }

  static async markNotificationsRead(
    notificationIds: string[],
    userId: string,
  ) {
    try {
      const { data, error } = await supabase.functions.invoke(
        "realtime-notifications",
        {
          method: "POST",
          body: { action: "mark-read", notificationIds, userId },
        },
      );

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Mark notifications read error:", error);
      throw error;
    }
  }

  static async getUnreadCount(userId: string) {
    try {
      const { data, error } = await supabase.functions.invoke(
        "realtime-notifications",
        {
          method: "GET",
          body: { action: "unread-count", user_id: userId },
        },
      );

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Get unread count error:", error);
      throw error;
    }
  }

  private static handleNewNotification(notification: any) {
    // Handle real-time notification
    // This can trigger UI updates, show toasts, etc.
    console.log("New notification received:", notification);

    // You can emit custom events here for components to listen to
    const event = new CustomEvent("newNotification", { detail: notification });
    window.dispatchEvent(event);
  }

  static cleanup() {
    if (this.channel) {
      supabase.removeChannel(this.channel);
      this.channel = null;
    }
  }
}

// =============================================
// FILE UPLOAD SERVICE
// =============================================

export class FileUploadService {
  static async uploadFile(
    file: File,
    options: {
      type:
        | "images"
        | "documents"
        | "profile_pictures"
        | "book_images"
        | "study_resources";
      folder?: string;
    },
  ) {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", options.type);
      if (options.folder) {
        formData.append("folder", options.folder);
      }

      const { data, error } = await supabase.functions.invoke("file-upload", {
        body: formData,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("File upload error:", error);
      throw error;
    }
  }

  static async uploadMultipleFiles(
    files: File[],
    options: {
      type:
        | "images"
        | "documents"
        | "profile_pictures"
        | "book_images"
        | "study_resources";
      folder?: string;
    },
  ) {
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      formData.append("type", options.type);
      if (options.folder) {
        formData.append("folder", options.folder);
      }

      const { data, error } = await supabase.functions.invoke("file-upload", {
        body: formData,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Multiple file upload error:", error);
      throw error;
    }
  }

  static async deleteFile(filePath: string) {
    try {
      const { data, error } = await supabase.functions.invoke("file-upload", {
        method: "DELETE",
        body: { action: "delete", filePath },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Delete file error:", error);
      throw error;
    }
  }

  static async getSignedUrl(filePath: string, expiresIn = 3600) {
    try {
      const { data, error } = await supabase.functions.invoke("file-upload", {
        method: "GET",
        body: { action: "signed-url", path: filePath, expires: expiresIn },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Get signed URL error:", error);
      throw error;
    }
  }

  static async getUserFiles(folder?: string) {
    try {
      const { data, error } = await supabase.functions.invoke("file-upload", {
        method: "GET",
        body: { action: "user-files", folder },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Get user files error:", error);
      throw error;
    }
  }

  static async processImage(
    filePath: string,
    operations: Array<{
      type: "resize" | "crop" | "optimize";
      width?: number;
      height?: number;
      x?: number;
      y?: number;
      quality?: number;
    }>,
  ) {
    try {
      const { data, error } = await supabase.functions.invoke("file-upload", {
        method: "POST",
        body: { action: "process-image", filePath, operations },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Process image error:", error);
      throw error;
    }
  }
}

// =============================================
// ADVANCED SEARCH SERVICE
// =============================================

export class AdvancedSearchService {
  static async search(filters: {
    query?: string;
    category?: string;
    university?: string;
    condition?: string;
    priceMin?: number;
    priceMax?: number;
    location?: string;
    tags?: string[];
    sort?:
      | "price_asc"
      | "price_desc"
      | "created_desc"
      | "created_asc"
      | "relevance";
    limit?: number;
    offset?: number;
  }) {
    try {
      const { data, error } = await supabase.functions.invoke(
        "advanced-search",
        {
          method: "POST",
          body: { action: "search", ...filters },
        },
      );

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Advanced search error:", error);
      throw error;
    }
  }

  static async getAutocomplete(query: string) {
    try {
      const { data, error } = await supabase.functions.invoke(
        "advanced-search",
        {
          method: "GET",
          body: { action: "autocomplete", q: query },
        },
      );

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Autocomplete error:", error);
      throw error;
    }
  }

  static async getFacets(category?: string) {
    try {
      const { data, error } = await supabase.functions.invoke(
        "advanced-search",
        {
          method: "GET",
          body: { action: "facets", category },
        },
      );

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Get facets error:", error);
      throw error;
    }
  }

  static async getTrendingSearches() {
    try {
      const { data, error } = await supabase.functions.invoke(
        "advanced-search",
        {
          method: "GET",
          body: { action: "trending" },
        },
      );

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Get trending searches error:", error);
      throw error;
    }
  }

  static async getSuggestions(query: string) {
    try {
      const { data, error } = await supabase.functions.invoke(
        "advanced-search",
        {
          method: "POST",
          body: { action: "suggestions", query },
        },
      );

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Get suggestions error:", error);
      throw error;
    }
  }
}

// =============================================
// ANALYTICS SERVICE
// =============================================

export class AnalyticsService {
  static async getDashboardMetrics() {
    try {
      const { data, error } = await supabase.functions.invoke(
        "analytics-reporting",
        {
          method: "GET",
          body: { action: "dashboard" },
        },
      );

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Get dashboard metrics error:", error);
      throw error;
    }
  }

  static async getRevenueAnalytics(period = "30d") {
    try {
      const { data, error } = await supabase.functions.invoke(
        "analytics-reporting",
        {
          method: "GET",
          body: { action: "revenue", period },
        },
      );

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Get revenue analytics error:", error);
      throw error;
    }
  }

  static async getUserAnalytics(period = "30d") {
    try {
      const { data, error } = await supabase.functions.invoke(
        "analytics-reporting",
        {
          method: "GET",
          body: { action: "users", period },
        },
      );

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Get user analytics error:", error);
      throw error;
    }
  }

  static async getBookAnalytics(period = "30d") {
    try {
      const { data, error } = await supabase.functions.invoke(
        "analytics-reporting",
        {
          method: "GET",
          body: { action: "books", period },
        },
      );

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Get book analytics error:", error);
      throw error;
    }
  }

  static async getPerformanceMetrics() {
    try {
      const { data, error } = await supabase.functions.invoke(
        "analytics-reporting",
        {
          method: "GET",
          body: { action: "performance" },
        },
      );

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Get performance metrics error:", error);
      throw error;
    }
  }

  static async exportReport(reportType: string, format = "csv") {
    try {
      const { data, error } = await supabase.functions.invoke(
        "analytics-reporting",
        {
          method: "GET",
          body: { action: "export", type: reportType, format },
        },
      );

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Export report error:", error);
      throw error;
    }
  }

  static async executeCustomQuery(query: {
    metric: string;
    dateRange: { start: string; end: string };
    groupBy?: "day" | "week" | "month";
    filters?: Record<string, any>;
    limit?: number;
  }) {
    try {
      const { data, error } = await supabase.functions.invoke(
        "analytics-reporting",
        {
          method: "POST",
          body: { action: "query", ...query },
        },
      );

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Execute custom query error:", error);
      throw error;
    }
  }
}

// =============================================
// EMAIL AUTOMATION SERVICE
// =============================================

export class EmailAutomationService {
  static async sendEmail(email: {
    to: string;
    subject: string;
    htmlContent: string;
    textContent?: string;
  }) {
    try {
      const { data, error } = await supabase.functions.invoke(
        "email-automation",
        {
          method: "POST",
          body: { action: "send", ...email },
        },
      );

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Send email error:", error);
      throw error;
    }
  }

  static async sendTemplateEmail(templateEmail: {
    templateId: string;
    to: string;
    variables: Record<string, any>;
  }) {
    try {
      const { data, error } = await supabase.functions.invoke(
        "email-automation",
        {
          method: "POST",
          body: { action: "send-template", ...templateEmail },
        },
      );

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Send template email error:", error);
      throw error;
    }
  }

  static async queueEmail(email: {
    to: string;
    subject: string;
    htmlContent?: string;
    templateId?: string;
    variables?: Record<string, any>;
    scheduledFor?: string;
  }) {
    try {
      const { data, error } = await supabase.functions.invoke(
        "email-automation",
        {
          method: "POST",
          body: { action: "queue", ...email },
        },
      );

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Queue email error:", error);
      throw error;
    }
  }

  static async triggerAutomation(automation: {
    trigger: string;
    data: Record<string, any>;
  }) {
    try {
      const { data, error } = await supabase.functions.invoke(
        "email-automation",
        {
          method: "POST",
          body: { action: "trigger-automation", ...automation },
        },
      );

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Trigger automation error:", error);
      throw error;
    }
  }

  static async getEmailTemplates() {
    try {
      const { data, error } = await supabase.functions.invoke(
        "email-automation",
        {
          method: "GET",
          body: { action: "templates" },
        },
      );

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Get email templates error:", error);
      throw error;
    }
  }

  static async getQueueStatus() {
    try {
      const { data, error } = await supabase.functions.invoke(
        "email-automation",
        {
          method: "GET",
          body: { action: "queue-status" },
        },
      );

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Get queue status error:", error);
      throw error;
    }
  }

  static async getEmailAnalytics(period = "30d") {
    try {
      const { data, error } = await supabase.functions.invoke(
        "email-automation",
        {
          method: "GET",
          body: { action: "analytics", period },
        },
      );

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Get email analytics error:", error);
      throw error;
    }
  }
}

// =============================================
// DISPUTE RESOLUTION SERVICE
// =============================================

export class DisputeResolutionService {
  static async createDispute(dispute: {
    order_id: string;
    dispute_type:
      | "item_not_received"
      | "item_damaged"
      | "item_not_as_described"
      | "unauthorized_charge"
      | "refund_not_processed"
      | "other";
    description: string;
    evidence_urls?: string[];
    priority?: "low" | "medium" | "high" | "urgent";
  }) {
    try {
      const { data, error } = await supabase.functions.invoke(
        "dispute-resolution",
        {
          method: "POST",
          body: { action: "create", ...dispute },
        },
      );

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Create dispute error:", error);
      throw error;
    }
  }

  static async resolveDispute(resolution: {
    dispute_id: string;
    resolution_action:
      | "refund_buyer"
      | "pay_seller"
      | "partial_refund"
      | "no_action";
    resolution_amount?: number;
    resolution_notes: string;
    notify_parties?: boolean;
  }) {
    try {
      const { data, error } = await supabase.functions.invoke(
        "dispute-resolution",
        {
          method: "POST",
          body: { action: "resolve", ...resolution },
        },
      );

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Resolve dispute error:", error);
      throw error;
    }
  }

  static async getDisputes(filters: {
    status?: string;
    priority?: string;
    limit?: number;
    offset?: number;
  }) {
    try {
      const { data, error } = await supabase.functions.invoke(
        "dispute-resolution",
        {
          method: "GET",
          body: { action: "list", ...filters },
        },
      );

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Get disputes error:", error);
      throw error;
    }
  }

  static async getDisputeDetails(disputeId: string) {
    try {
      const { data, error } = await supabase.functions.invoke(
        "dispute-resolution",
        {
          method: "GET",
          body: { action: "details", dispute_id: disputeId },
        },
      );

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Get dispute details error:", error);
      throw error;
    }
  }

  static async escalateDispute(disputeId: string, reason: string) {
    try {
      const { data, error } = await supabase.functions.invoke(
        "dispute-resolution",
        {
          method: "POST",
          body: { action: "escalate", disputeId, reason },
        },
      );

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Escalate dispute error:", error);
      throw error;
    }
  }

  static async addEvidence(
    disputeId: string,
    evidenceUrls: string[],
    description: string,
  ) {
    try {
      const { data, error } = await supabase.functions.invoke(
        "dispute-resolution",
        {
          method: "PUT",
          body: {
            action: "add-evidence",
            disputeId,
            evidenceUrls,
            description,
          },
        },
      );

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Add evidence error:", error);
      throw error;
    }
  }

  static async getAdminDashboard() {
    try {
      const { data, error } = await supabase.functions.invoke(
        "dispute-resolution",
        {
          method: "GET",
          body: { action: "admin-dashboard" },
        },
      );

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Get admin dashboard error:", error);
      throw error;
    }
  }

  static async getDisputeAnalytics(period = "30d") {
    try {
      const { data, error } = await supabase.functions.invoke(
        "dispute-resolution",
        {
          method: "GET",
          body: { action: "analytics", period },
        },
      );

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Get dispute analytics error:", error);
      throw error;
    }
  }
}

// =============================================
// UNIFIED BACKEND ORCHESTRATOR
// =============================================

export class BackendOrchestrator {
  // Initialize all services
  static async initialize(userId?: string) {
    try {
      if (userId) {
        await NotificationService.initializeRealTime(userId);
      }

      console.log("Backend services initialized successfully");
    } catch (error) {
      console.error("Backend initialization error:", error);
      throw error;
    }
  }

  // Cleanup all services
  static cleanup() {
    NotificationService.cleanup();
  }

  // Health check for all services
  static async healthCheck() {
    const services = {
      studyResources: false,
      notifications: false,
      fileUpload: false,
      search: false,
      analytics: false,
      email: false,
      disputes: false,
    };

    try {
      // Test each service endpoint
      await Promise.allSettled([
        supabase.functions
          .invoke("study-resources-api", { method: "GET" })
          .then(() => (services.studyResources = true)),
        supabase.functions
          .invoke("realtime-notifications", { method: "GET" })
          .then(() => (services.notifications = true)),
        supabase.functions
          .invoke("file-upload", { method: "GET" })
          .then(() => (services.fileUpload = true)),
        supabase.functions
          .invoke("advanced-search", { method: "GET" })
          .then(() => (services.search = true)),
        supabase.functions
          .invoke("analytics-reporting", { method: "GET" })
          .then(() => (services.analytics = true)),
        supabase.functions
          .invoke("email-automation", { method: "GET" })
          .then(() => (services.email = true)),
        supabase.functions
          .invoke("dispute-resolution", { method: "GET" })
          .then(() => (services.disputes = true)),
      ]);

      return services;
    } catch (error) {
      console.error("Health check error:", error);
      return services;
    }
  }
}

// Export all services
export {
  StudyResourcesService,
  NotificationService,
  FileUploadService,
  AdvancedSearchService,
  AnalyticsService,
  EmailAutomationService,
  DisputeResolutionService,
};
