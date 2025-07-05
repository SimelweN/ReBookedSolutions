import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SubaccountDetails {
  business_name: string;
  email: string;
  bank_name: string;
  bank_code: string;
  account_number: string;
}

export interface SubaccountResponse {
  success: boolean;
  message: string;
  subaccount_code?: string;
  data?: any;
  error?: string;
}

export interface UserSubaccountStatus {
  hasSubaccount: boolean;
  subaccountCode?: string;
  businessName?: string;
  bankName?: string;
  accountNumber?: string;
  email?: string;
  canEdit: boolean;
}

/**
 * Enhanced Paystack Subaccount Service
 * Handles subaccount creation, editing, and linking with proper user profile management
 */
export class PaystackSubaccountService {
  /**
   * Check if user has an existing subaccount
   */
  static async getUserSubaccountStatus(
    userId?: string,
  ): Promise<UserSubaccountStatus> {
    try {
      if (!userId) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          return { hasSubaccount: false, canEdit: false };
        }
        userId = user.id;
      }

      // Check banking_subaccounts table for existing subaccount
      const { data: subaccountData, error } = await supabase
        .from("banking_subaccounts")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.warn("Error checking subaccount status:", error);
        return { hasSubaccount: false, canEdit: false };
      }

      if (!subaccountData || !subaccountData.subaccount_code) {
        return { hasSubaccount: false, canEdit: false };
      }

      return {
        hasSubaccount: true,
        subaccountCode: subaccountData.subaccount_code,
        businessName: subaccountData.business_name,
        bankName: subaccountData.bank_name,
        accountNumber: subaccountData.account_number,
        email: subaccountData.email,
        canEdit: true,
      };
    } catch (error) {
      console.error("Error in getUserSubaccountStatus:", error);
      return { hasSubaccount: false, canEdit: false };
    }
  }

  /**
   * Create a new subaccount or update existing one
   */
  static async createOrUpdateSubaccount(
    details: SubaccountDetails,
    isUpdate: boolean = false,
  ): Promise<SubaccountResponse> {
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        throw new Error("Authentication required. Please log in.");
      }

      const userId = session.user.id;

      // Check if user already has a subaccount
      const existingStatus = await this.getUserSubaccountStatus(userId);

      if (existingStatus.hasSubaccount && !isUpdate) {
        // User already has a subaccount, return existing data
        return {
          success: true,
          message: "Subaccount already exists",
          subaccount_code: existingStatus.subaccountCode,
        };
      }

      let functionName: string;
      let requestBody: any;

      if (isUpdate && existingStatus.hasSubaccount) {
        // Update existing subaccount
        functionName = "update-paystack-subaccount";
        requestBody = {
          subaccount_code: existingStatus.subaccountCode,
          business_name: details.business_name.trim(),
          primary_contact_email: details.email.trim(),
          bank_name: details.bank_name,
          bank_code: details.bank_code,
          account_number: details.account_number.replace(/\s/g, ""),
          metadata: { user_id: userId },
        };
      } else {
        // Create new subaccount
        functionName = "create-paystack-subaccount";
        requestBody = {
          business_name: details.business_name.trim(),
          email: details.email.trim(),
          bank_name: details.bank_name,
          bank_code: details.bank_code,
          account_number: details.account_number.replace(/\s/g, ""),
          primary_contact_email: details.email.trim(),
          primary_contact_name: details.business_name.trim(),
          metadata: { user_id: userId },
        };
      }

      console.log(
        `${isUpdate ? "Updating" : "Creating"} subaccount for user:`,
        userId,
      );

      const { data, error } = await supabase.functions.invoke(functionName, {
        body: requestBody,
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error("Supabase function error:", error);
        console.error("Error details:", {
          message: error.message,
          status: error.status,
          statusText: error.statusText,
          context: error.context,
        });

        // Try to get more details from the error
        let errorMessage =
          error.message ||
          `Failed to ${isUpdate ? "update" : "create"} subaccount`;

        if (error.context?.response) {
          try {
            const responseText = await error.context.response.text();
            console.error("Function response body:", responseText);

            // Try to parse JSON error response
            try {
              const errorData = JSON.parse(responseText);
              if (errorData.message) {
                errorMessage = errorData.message;
              } else if (errorData.error) {
                errorMessage = errorData.error;
              }
            } catch (parseError) {
              // Response is not JSON, use as is
              if (responseText) {
                errorMessage = responseText;
              }
            }
          } catch (responseError) {
            console.error("Could not read response body:", responseError);
          }
        }

        throw new Error(errorMessage);
      }

      if (!data || !data.success) {
        throw new Error(
          data?.error ||
            `Failed to ${isUpdate ? "update" : "create"} subaccount`,
        );
      }

      // Update user profile with subaccount code if this is a new creation
      if (!isUpdate && data.subaccount_code) {
        await this.updateUserProfileSubaccount(userId, data.subaccount_code);
      }

      return {
        success: true,
        message: `Subaccount ${isUpdate ? "updated" : "created"} successfully`,
        subaccount_code: data.subaccount_code || existingStatus.subaccountCode,
        data: data,
      };
    } catch (error) {
      console.error(
        `Error in ${isUpdate ? "update" : "create"}Subaccount:`,
        error,
      );
      return {
        success: false,
        message: `Failed to ${isUpdate ? "update" : "create"} subaccount`,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  /**
   * Update user profile with subaccount code
   */
  static async updateUserProfileSubaccount(
    userId: string,
    subaccountCode: string,
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ subaccount_code: subaccountCode })
        .eq("id", userId);

      if (error) {
        console.warn("Failed to update profile subaccount:", error);
        // Don't throw here as the main operation was successful
      }
    } catch (error) {
      console.warn("Error updating profile subaccount:", error);
    }
  }

  /**
   * Get subaccount code for a user (for payment processing)
   */
  static async getUserSubaccountCode(userId: string): Promise<string | null> {
    try {
      // First try banking_subaccounts table
      const { data: subaccountData, error } = await supabase
        .from("banking_subaccounts")
        .select("subaccount_code")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && subaccountData?.subaccount_code) {
        return subaccountData.subaccount_code;
      }

      // Fallback to profile table
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("subaccount_code")
        .eq("id", userId)
        .single();

      if (!profileError && profileData?.subaccount_code) {
        return profileData.subaccount_code;
      }

      return null;
    } catch (error) {
      console.error("Error getting user subaccount code:", error);
      return null;
    }
  }

  /**
   * Link all user's books to their subaccount (called after subaccount creation)
   */
  static async linkBooksToSubaccount(userId: string): Promise<boolean> {
    try {
      const subaccountCode = await this.getUserSubaccountCode(userId);

      if (!subaccountCode) {
        console.warn("No subaccount code found for user:", userId);
        return false;
      }

      // Books are automatically linked through the seller_id relationship
      // We just need to ensure the user has a valid subaccount
      console.log(
        `All books for user ${userId} are now linked to subaccount ${subaccountCode}`,
      );
      return true;
    } catch (error) {
      console.error("Error linking books to subaccount:", error);
      return false;
    }
  }

  /**
   * Validate subaccount before allowing operations
   */
  static async validateSubaccount(userId: string): Promise<{
    isValid: boolean;
    subaccountCode: string | null;
    message: string;
  }> {
    try {
      const subaccountCode = await this.getUserSubaccountCode(userId);

      if (!subaccountCode) {
        return {
          isValid: false,
          subaccountCode: null,
          message:
            "Please set up your banking details before listing books for sale.",
        };
      }

      return {
        isValid: true,
        subaccountCode,
        message: "Subaccount is valid and ready for transactions.",
      };
    } catch (error) {
      return {
        isValid: false,
        subaccountCode: null,
        message: "Error validating subaccount. Please try again.",
      };
    }
  }

  /**
   * Calculate payment split amounts
   */
  static calculatePaymentSplit(
    bookPrice: number,
    deliveryFee: number = 0,
    platformCommission: number = 10,
  ): {
    totalAmount: number;
    sellerAmount: number;
    platformAmount: number;
    deliveryAmount: number;
    sellerPercentage: number;
  } {
    const totalAmount = bookPrice + deliveryFee;
    const platformAmount = Math.round((bookPrice * platformCommission) / 100);
    const sellerAmount = bookPrice - platformAmount;
    const deliveryAmount = deliveryFee;
    const sellerPercentage = Math.round((sellerAmount / totalAmount) * 100);

    return {
      totalAmount,
      sellerAmount,
      platformAmount,
      deliveryAmount,
      sellerPercentage,
    };
  }

  /**
   * Prepare payment initialization data with split configuration
   */
  static async preparePaymentData(
    sellerId: string,
    bookId: string,
    bookPrice: number,
    deliveryFee: number = 0,
    buyerEmail: string,
  ): Promise<{
    success: boolean;
    paymentData?: any;
    error?: string;
  }> {
    try {
      const validation = await this.validateSubaccount(sellerId);

      if (!validation.isValid) {
        return {
          success: false,
          error: validation.message,
        };
      }

      const splitAmounts = this.calculatePaymentSplit(bookPrice, deliveryFee);

      const paymentData = {
        email: buyerEmail,
        amount: Math.round(splitAmounts.totalAmount * 100), // Convert to kobo
        bookId,
        sellerId,
        sellerSubaccountCode: validation.subaccountCode,
        bookPrice,
        deliveryFee,
        splitAmounts,
        metadata: {
          book_id: bookId,
          seller_id: sellerId,
          book_price: bookPrice,
          delivery_fee: deliveryFee,
          platform_commission: splitAmounts.platformAmount,
        },
      };

      return {
        success: true,
        paymentData,
      };
    } catch (error) {
      console.error("Error preparing payment data:", error);
      return {
        success: false,
        error: "Failed to prepare payment data. Please try again.",
      };
    }
  }
}

export default PaystackSubaccountService;
