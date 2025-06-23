import { BankingDetails, SOUTH_AFRICAN_BANKS } from "@/types/banking";
import { toast } from "sonner";

/**
 * Paystack service for managing subaccounts and split payments
 */
export class PaystackService {
  private static readonly PAYSTACK_SECRET_KEY = import.meta.env
    .VITE_PAYSTACK_SECRET_KEY;
  private static readonly PAYSTACK_PUBLIC_KEY = import.meta.env
    .VITE_PAYSTACK_PUBLIC_KEY;
  private static readonly CALLBACK_URL = `${window.location.origin}/payment-callback`;

  /**
   * Get bank code for Paystack from bank name
   */
  private static getBankCode(bankName: string): string {
    // Map your bank names to Paystack bank codes
    const bankCodeMap: Record<string, string> = {
      "Absa Bank": "632005",
      "Capitec Bank": "470010",
      "First National Bank (FNB)": "250655",
      "Investec Bank": "580105",
      Nedbank: "198765",
      "Standard Bank": "051001",
      "African Bank": "430000",
      "Mercantile Bank": "450905",
      TymeBank: "678910",
      "Bidvest Bank": "679000",
      "Sasfin Bank": "683000",
      "Bank of Athens": "410506",
      "RMB Private Bank": "222026",
      "South African Post Bank (Post Office)": "460005",
      "Hollard Bank": "585001",
      "Discovery Bank": "679000",
      "Standard Chartered Bank": "730020",
      "Barclays Bank": "590000",
    };

    return bankCodeMap[bankName] || "";
  }

  /**
   * Create Paystack subaccount for seller
   */
  static async createSubaccount(
    bankingDetails: BankingDetails,
    userEmail: string,
  ): Promise<{
    subaccount_code: string;
    subaccount_id: string;
  }> {
    try {
      const bankCode = this.getBankCode(bankingDetails.bank_name);
      if (!bankCode) {
        throw new Error(`Unsupported bank: ${bankingDetails.bank_name}`);
      }

      const payload = {
        business_name: bankingDetails.full_name,
        settlement_bank: bankCode,
        account_number: bankingDetails.bank_account_number,
        percentage_charge: 0, // Platform takes commission through split
        primary_contact_email: userEmail,
        primary_contact_name: bankingDetails.full_name,
        primary_contact_phone: "", // Add phone to banking details if needed
        metadata: {
          user_id: bankingDetails.user_id,
          recipient_type: bankingDetails.recipient_type,
          account_type: bankingDetails.account_type,
        },
      };

      const response = await fetch("https://api.paystack.co/subaccount", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.status) {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`,
        );
      }

      return {
        subaccount_code: data.data.subaccount_code,
        subaccount_id: data.data.id,
      };
    } catch (error) {
      console.error("Error creating Paystack subaccount:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create payment account";
      toast.error(`Failed to setup payment account: ${errorMessage}`);
      throw new Error(errorMessage);
    }
  }

  /**
   * Initialize payment with subaccount for split payments
   */
  static async initializePayment({
    buyerEmail,
    bookPrice,
    deliveryFee = 0,
    bookId,
    sellerId,
    sellerSubaccountCode,
    metadata = {},
  }: {
    buyerEmail: string;
    bookPrice: number;
    deliveryFee?: number;
    bookId: string;
    sellerId: string;
    sellerSubaccountCode: string;
    metadata?: Record<string, any>;
  }): Promise<{
    authorization_url: string;
    access_code: string;
    reference: string;
  }> {
    try {
      const totalAmount = Math.round((bookPrice + deliveryFee) * 100); // Convert to kobo
      const bookAmountInKobo = Math.round(bookPrice * 100);
      const deliveryAmountInKobo = Math.round(deliveryFee * 100);

      // Calculate seller's 90% share of book price only
      const sellerShare = 90; // 90% to seller, 10% to platform

      const payload = {
        email: buyerEmail,
        amount: totalAmount,
        currency: "ZAR",
        reference: `book_${bookId}_${Date.now()}`,
        callback_url: this.CALLBACK_URL,
        metadata: {
          bookId,
          sellerId,
          bookPrice: bookPrice,
          deliveryFee: deliveryFee,
          totalAmount: bookPrice + deliveryFee,
          ...metadata,
        },
        // Split payment - 90% of book price to seller, platform keeps 10% + all delivery fees
        split: {
          type: "percentage",
          bearer_type: "subaccount",
          subaccounts: [
            {
              subaccount: sellerSubaccountCode,
              share: sellerShare,
              split_code: undefined, // Optional: use split_code if you have preset splits
            },
          ],
        },
        // Alternative: Use direct subaccount field for simpler splits
        subaccount: sellerSubaccountCode,
        transaction_charge: 0, // Any additional platform fees
      };

      const response = await fetch(
        "https://api.paystack.co/transaction/initialize",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.PAYSTACK_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.status) {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`,
        );
      }

      return {
        authorization_url: data.data.authorization_url,
        access_code: data.data.access_code,
        reference: data.data.reference,
      };
    } catch (error) {
      console.error("Error initializing payment:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to initialize payment";
      toast.error(`Payment initialization failed: ${errorMessage}`);
      throw new Error(errorMessage);
    }
  }

  /**
   * Verify payment after callback
   */
  static async verifyPayment(reference: string): Promise<any> {
    try {
      const response = await fetch(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${this.PAYSTACK_SECRET_KEY}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok || !data.status) {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`,
        );
      }

      return data.data;
    } catch (error) {
      console.error("Error verifying payment:", error);
      throw new Error("Failed to verify payment");
    }
  }

  /**
   * Transfer funds to seller after commit (for delayed payout model)
   */
  static async transferToSeller({
    amount,
    recipientCode,
    reference,
    reason = "Book sale payout",
  }: {
    amount: number;
    recipientCode: string;
    reference: string;
    reason?: string;
  }): Promise<any> {
    try {
      const amountInKobo = Math.round(amount * 100);

      const payload = {
        source: "balance",
        amount: amountInKobo,
        recipient: recipientCode,
        reference,
        reason,
      };

      const response = await fetch("https://api.paystack.co/transfer", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.status) {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`,
        );
      }

      return data.data;
    } catch (error) {
      console.error("Error transferring to seller:", error);
      throw new Error("Failed to transfer payment to seller");
    }
  }

  /**
   * Create transfer recipient for delayed payout
   */
  static async createTransferRecipient(
    bankingDetails: BankingDetails,
  ): Promise<string> {
    try {
      const bankCode = this.getBankCode(bankingDetails.bank_name);
      if (!bankCode) {
        throw new Error(`Unsupported bank: ${bankingDetails.bank_name}`);
      }

      const payload = {
        type: "nuban",
        name: bankingDetails.full_name,
        account_number: bankingDetails.bank_account_number,
        bank_code: bankCode,
        currency: "ZAR",
      };

      const response = await fetch(
        "https://api.paystack.co/transferrecipient",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.PAYSTACK_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.status) {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`,
        );
      }

      return data.data.recipient_code;
    } catch (error) {
      console.error("Error creating transfer recipient:", error);
      throw new Error("Failed to create transfer recipient");
    }
  }

  /**
   * Refund payment to buyer
   */
  static async refundPayment(transactionReference: string): Promise<any> {
    try {
      const payload = {
        transaction: transactionReference,
      };

      const response = await fetch("https://api.paystack.co/refund", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.status) {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`,
        );
      }

      return data.data;
    } catch (error) {
      console.error("Error processing refund:", error);
      throw new Error("Failed to process refund");
    }
  }

  /**
   * Get payment URL for frontend redirect
   */
  static getPaymentUrl(bookId: string, cartIds?: string[]): string {
    if (cartIds && cartIds.length > 0) {
      return `https://payments.rebookedsolutions.co.za/checkout?cart=${cartIds.join(",")}`;
    }
    return `https://payments.rebookedsolutions.co.za/checkout?bookId=${bookId}`;
  }
}

export default PaystackService;
