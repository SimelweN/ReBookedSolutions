import { executeFunction } from "./functionExecutor";
import { FunctionResult } from "@/types/functionFallback";

/**
 * AI-Enhanced Payment Service
 * Uses 3-layer fallback for payment operations
 */
export class AIPaymentService {
  async initializePayment(
    email: string,
    amount: number,
    metadata?: Record<string, any>,
  ): Promise<
    FunctionResult<{
      authorization_url: string;
      access_code: string;
      reference: string;
    }>
  > {
    return executeFunction("initialize-paystack-payment", {
      email,
      amount,
      metadata,
      currency: "ZAR",
    });
  }

  async verifyPayment(
    reference: string,
    orderId?: string,
  ): Promise<
    FunctionResult<{
      verified: boolean;
      transaction: any;
      payment: any;
    }>
  > {
    return executeFunction("verify-paystack-payment", {
      reference,
      orderId,
    });
  }

  async createSubAccount(sellerData: {
    business_name: string;
    settlement_bank: string;
    account_number: string;
    percentage_charge: number;
  }): Promise<FunctionResult<any>> {
    return executeFunction("create-paystack-subaccount", sellerData);
  }

  async paySeller(
    sellerId: string,
    amount: number,
    reference: string,
  ): Promise<FunctionResult<any>> {
    return executeFunction("pay-seller", {
      sellerId,
      amount,
      reference,
    });
  }
}

/**
 * AI-Enhanced Email Service
 * Uses 3-layer fallback for email notifications
 */
export class AIEmailService {
  async sendNotification(
    to: string,
    subject: string,
    template?: string,
    data?: Record<string, any>,
    options?: {
      priority?: "high" | "normal" | "low";
      htmlContent?: string;
      textContent?: string;
    },
  ): Promise<
    FunctionResult<{
      messageId: string;
      provider: string;
    }>
  > {
    return executeFunction(
      "send-email-notification",
      {
        to,
        subject,
        template,
        data,
        ...options,
      },
      {
        priority: options?.priority || "normal",
      },
    );
  }

  async sendOrderConfirmation(
    buyerEmail: string,
    orderDetails: {
      orderId: string;
      bookTitle: string;
      price: number;
      sellerName: string;
    },
  ): Promise<FunctionResult<any>> {
    return this.sendNotification(
      buyerEmail,
      `Order Confirmation #${orderDetails.orderId}`,
      "order_confirmation",
      orderDetails,
      { priority: "high" },
    );
  }

  async sendCommitReminder(
    sellerEmail: string,
    orderDetails: {
      orderId: string;
      bookTitle: string;
      price: number;
      deadline: string;
    },
  ): Promise<FunctionResult<any>> {
    return this.sendNotification(
      sellerEmail,
      "Order Commitment Reminder",
      "commit_reminder",
      orderDetails,
      { priority: "high" },
    );
  }
}

/**
 * AI-Enhanced File Upload Service
 * Uses 3-layer fallback for file operations
 */
export class AIFileService {
  async uploadFile(
    file: File,
    options: {
      bucket?: string;
      folder?: string;
      userId: string;
    },
  ): Promise<
    FunctionResult<{
      fileName: string;
      publicUrl: string;
      fileSize: number;
      contentType: string;
    }>
  > {
    // Convert File to base64 for transmission
    const base64Data = await this.fileToBase64(file);

    return executeFunction(
      "file-upload",
      {
        fileData: base64Data,
        fileName: file.name,
        contentType: file.type,
        fileSize: file.size,
        ...options,
      },
      {
        userId: options.userId,
        priority: "normal",
      },
    );
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(",")[1]); // Remove data:type;base64, prefix
      };
      reader.onerror = (error) => reject(error);
    });
  }
}

/**
 * AI-Enhanced Shipping Service
 * Uses 3-layer fallback with cached rates
 */
export class AIShippingService {
  async getDeliveryQuotes(
    pickupAddress: {
      city: string;
      province: string;
      street?: string;
      postal_code?: string;
    },
    deliveryAddress: {
      city: string;
      province: string;
      street?: string;
      postal_code?: string;
    },
    packageDetails?: {
      weight?: number;
      dimensions?: {
        length?: number;
        width?: number;
        height?: number;
      };
      value?: number;
    },
  ): Promise<
    FunctionResult<{
      quotes: Array<{
        provider: string;
        service: string;
        price: number;
        estimated_days: string;
        tracking_included: boolean;
      }>;
      route: {
        from: string;
        to: string;
        distance_estimate: string;
      };
    }>
  > {
    return executeFunction("get-delivery-quotes", {
      pickup_address: pickupAddress,
      delivery_address: deliveryAddress,
      package_details: packageDetails,
    });
  }

  async trackPackage(
    provider: "courier-guy" | "fastway",
    trackingNumber: string,
  ): Promise<FunctionResult<any>> {
    const functionName =
      provider === "courier-guy" ? "courier-guy-track" : "fastway-track";

    return executeFunction(functionName, {
      tracking_number: trackingNumber,
    });
  }

  async createShipment(
    provider: "courier-guy" | "fastway",
    shipmentData: any,
  ): Promise<FunctionResult<any>> {
    const functionName =
      provider === "courier-guy" ? "courier-guy-shipment" : "fastway-shipment";

    return executeFunction(functionName, shipmentData);
  }
}

/**
 * AI-Enhanced Order Management Service
 * Uses 3-layer fallback for order operations
 */
export class AIOrderService {
  async createOrder(orderData: {
    bookId: string;
    buyerId: string;
    sellerId: string;
    price: number;
    shippingAddress: any;
    paymentReference?: string;
  }): Promise<
    FunctionResult<{
      orderId: string;
      status: string;
      expiresAt: string;
    }>
  > {
    return executeFunction("create-order", orderData, {
      userId: orderData.buyerId,
      priority: "high",
    });
  }

  async commitToSale(
    orderId: string,
    sellerId: string,
    commitment: boolean = true,
  ): Promise<FunctionResult<any>> {
    const functionName = commitment ? "commit-to-sale" : "decline-commit";

    return executeFunction(
      functionName,
      {
        orderId,
        sellerId,
      },
      {
        userId: sellerId,
        priority: "high",
      },
    );
  }

  async markAsCollected(
    orderId: string,
    userId: string,
  ): Promise<FunctionResult<any>> {
    return executeFunction(
      "mark-collected",
      {
        orderId,
        userId,
      },
      {
        userId,
        priority: "normal",
      },
    );
  }

  async processBookPurchase(purchaseData: {
    bookId: string;
    buyerId: string;
    paymentReference: string;
    shippingDetails: any;
  }): Promise<FunctionResult<any>> {
    return executeFunction("process-book-purchase", purchaseData, {
      userId: purchaseData.buyerId,
      priority: "high",
    });
  }

  async processMultiSellerPurchase(purchaseData: {
    cartItems: Array<{
      bookId: string;
      sellerId: string;
      price: number;
    }>;
    buyerId: string;
    paymentReference: string;
    shippingDetails: any;
  }): Promise<FunctionResult<any>> {
    return executeFunction("process-multi-seller-purchase", purchaseData, {
      userId: purchaseData.buyerId,
      priority: "high",
    });
  }
}

/**
 * AI-Enhanced Search Service
 * Uses 3-layer fallback with caching for search results
 */
export class AISearchService {
  async advancedSearch(
    query: string,
    filters?: {
      university?: string;
      subject?: string;
      priceRange?: { min: number; max: number };
      condition?: string;
      location?: string;
    },
  ): Promise<
    FunctionResult<{
      books: any[];
      totalCount: number;
      facets: any;
    }>
  > {
    return executeFunction("advanced-search", {
      query,
      filters,
    });
  }

  async getStudyResources(
    university?: string,
    subject?: string,
  ): Promise<
    FunctionResult<{
      resources: any[];
      categories: string[];
    }>
  > {
    return executeFunction("study-resources-api", {
      university,
      subject,
    });
  }
}

/**
 * AI-Enhanced Analytics Service
 * Uses deferred execution for analytics data
 */
export class AIAnalyticsService {
  async trackEvent(
    eventName: string,
    properties: Record<string, any>,
    userId?: string,
  ): Promise<FunctionResult<any>> {
    return executeFunction(
      "analytics-reporting",
      {
        event: eventName,
        properties,
        timestamp: Date.now(),
      },
      {
        userId,
        priority: "low",
      },
    );
  }

  async trackPageView(
    page: string,
    userId?: string,
    additionalData?: Record<string, any>,
  ): Promise<FunctionResult<any>> {
    return this.trackEvent(
      "page_view",
      {
        page,
        url: window.location.href,
        referrer: document.referrer,
        ...additionalData,
      },
      userId,
    );
  }

  async trackPurchase(
    purchaseData: {
      orderId: string;
      amount: number;
      items: Array<{
        bookId: string;
        price: number;
        sellerId: string;
      }>;
    },
    userId: string,
  ): Promise<FunctionResult<any>> {
    return this.trackEvent("purchase", purchaseData, userId);
  }
}

// Export singleton instances
// Lazy initialization to prevent "Cannot access before initialization" errors
let aiPaymentServiceInstance: AIPaymentService | null = null;
let aiEmailServiceInstance: AIEmailService | null = null;
let aiFileServiceInstance: AIFileService | null = null;
let aiShippingServiceInstance: AIShippingService | null = null;
let aiOrderServiceInstance: AIOrderService | null = null;
let aiSearchServiceInstance: AISearchService | null = null;
let aiAnalyticsServiceInstance: AIAnalyticsService | null = null;

export const getAiPaymentService = () => {
  if (!aiPaymentServiceInstance) {
    aiPaymentServiceInstance = new AIPaymentService();
  }
  return aiPaymentServiceInstance;
};

export const getAiEmailService = () => {
  if (!aiEmailServiceInstance) {
    aiEmailServiceInstance = new AIEmailService();
  }
  return aiEmailServiceInstance;
};

export const getAiFileService = () => {
  if (!aiFileServiceInstance) {
    aiFileServiceInstance = new AIFileService();
  }
  return aiFileServiceInstance;
};

export const getAiShippingService = () => {
  if (!aiShippingServiceInstance) {
    aiShippingServiceInstance = new AIShippingService();
  }
  return aiShippingServiceInstance;
};

export const getAiOrderService = () => {
  if (!aiOrderServiceInstance) {
    aiOrderServiceInstance = new AIOrderService();
  }
  return aiOrderServiceInstance;
};

export const getAiSearchService = () => {
  if (!aiSearchServiceInstance) {
    aiSearchServiceInstance = new AISearchService();
  }
  return aiSearchServiceInstance;
};

export const getAiAnalyticsService = () => {
  if (!aiAnalyticsServiceInstance) {
    aiAnalyticsServiceInstance = new AIAnalyticsService();
  }
  return aiAnalyticsServiceInstance;
};

// Export all services as a single object using getters
export const aiServices = {
  get payment() {
    return getAiPaymentService();
  },
  get email() {
    return getAiEmailService();
  },
  get file() {
    return getAiFileService();
  },
  get shipping() {
    return getAiShippingService();
  },
  get order() {
    return getAiOrderService();
  },
  get search() {
    return getAiSearchService();
  },
  get analytics() {
    return getAiAnalyticsService();
  },
};
