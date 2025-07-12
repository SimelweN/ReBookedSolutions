import { supabase } from "@/integrations/supabase/client";

export interface UserInfo {
  name: string;
  email: string;
  phone?: string;
}

export interface FormData {
  user_name?: string;
  user_email?: string;
  account_name?: string;
  account_email?: string;
  manual_name?: string;
  manual_email?: string;
  recipient_name?: string;
  business_name?: string;
  email?: string;
}

export class UserAutofillService {
  /**
   * Get user info from session and profile for autofill
   */
  static async getUserInfo(): Promise<UserInfo | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return null;

      // Get display name from profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("name, phone")
        .eq("id", user.id)
        .single();

      return {
        name: profile?.name || user.user_metadata?.name || "",
        email: user.email || "",
        phone: profile?.phone || "",
      };
    } catch (error) {
      console.error("Error getting user info for autofill:", error);
      return null;
    }
  }

  /**
   * Autofill form fields with user info
   * Preserves any manually entered values
   */
  static async autofillForm(
    formData: FormData,
    setFieldValue: (field: string, value: string) => void,
    preserveManualEntries: boolean = true,
  ): Promise<void> {
    try {
      const userInfo = await this.getUserInfo();
      if (!userInfo) return;

      // Store account info for reference
      setFieldValue("account_name", userInfo.name);
      setFieldValue("account_email", userInfo.email);

      // Only autofill if fields are empty or not manually overridden
      if (!preserveManualEntries || !formData.manual_name) {
        if (formData.recipient_name !== undefined && !formData.recipient_name) {
          setFieldValue("recipient_name", userInfo.name);
        }
        if (formData.business_name !== undefined && !formData.business_name) {
          setFieldValue("business_name", userInfo.name);
        }
        if (formData.user_name !== undefined && !formData.user_name) {
          setFieldValue("user_name", userInfo.name);
        }
      }

      if (!preserveManualEntries || !formData.manual_email) {
        if (formData.email !== undefined && !formData.email) {
          setFieldValue("email", userInfo.email);
        }
        if (formData.user_email !== undefined && !formData.user_email) {
          setFieldValue("user_email", userInfo.email);
        }
      }
    } catch (error) {
      console.error("Error autofilling form:", error);
    }
  }

  /**
   * Mark fields as manually entered to prevent overwriting
   */
  static markAsManualEntry(
    field: "name" | "email",
    value: string,
    setFieldValue: (field: string, value: string) => void,
  ): void {
    setFieldValue(`manual_${field}`, value);
  }

  /**
   * Save form data with separate account and manual entries
   */
  static separateFormData(formData: FormData): {
    accountData: { name: string; email: string };
    formSpecificData: Partial<FormData>;
  } {
    const accountData = {
      name: formData.account_name || "",
      email: formData.account_email || "",
    };

    const formSpecificData = { ...formData };
    delete formSpecificData.account_name;
    delete formSpecificData.account_email;

    return { accountData, formSpecificData };
  }

  /**
   * Enhanced form validation with manual vs account entry tracking
   */
  static validateFormEntries(formData: FormData): {
    isValid: boolean;
    errors: string[];
    hasManualEntries: boolean;
  } {
    const errors: string[] = [];
    let hasManualEntries = false;

    // Check if user has entered manual values
    if (formData.manual_name || formData.manual_email) {
      hasManualEntries = true;
    }

    // Validate required fields
    const nameField =
      formData.recipient_name ||
      formData.business_name ||
      formData.user_name ||
      "";
    const emailField = formData.email || formData.user_email || "";

    if (!nameField.trim()) {
      errors.push("Name is required");
    }

    if (!emailField.trim()) {
      errors.push("Email is required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField)) {
      errors.push("Valid email is required");
    }

    return {
      isValid: errors.length === 0,
      errors,
      hasManualEntries,
    };
  }

  /**
   * Get autofill status for a form
   */
  static getAutofillStatus(formData: FormData): {
    nameAutofilled: boolean;
    emailAutofilled: boolean;
    nameSource: "account" | "manual" | "empty";
    emailSource: "account" | "manual" | "empty";
  } {
    const nameField =
      formData.recipient_name ||
      formData.business_name ||
      formData.user_name ||
      "";
    const emailField = formData.email || formData.user_email || "";

    const nameSource = formData.manual_name
      ? "manual"
      : nameField === formData.account_name
        ? "account"
        : nameField
          ? "manual"
          : "empty";

    const emailSource = formData.manual_email
      ? "manual"
      : emailField === formData.account_email
        ? "account"
        : emailField
          ? "manual"
          : "empty";

    return {
      nameAutofilled: nameSource === "account",
      emailAutofilled: emailSource === "account",
      nameSource,
      emailSource,
    };
  }
}

export default UserAutofillService;
