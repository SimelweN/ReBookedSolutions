/**
 * Enhanced Authentication Operations with Email Integration
 * Extends the original auth operations with email notifications
 */

import { supabase } from "@/integrations/supabase/client";
import EmailService from "./emailService";
import { toast } from "sonner";

/**
 * Enhanced user registration with welcome email
 */
export const registerUserWithEmail = async (
  name: string,
  email: string,
  password: string,
) => {
  try {
    // Input validation
    if (!name || name.trim().length < 2) {
      throw new Error("Name must be at least 2 characters long");
    }

    if (!email || !email.includes("@") || email.length < 5) {
      throw new Error("Please enter a valid email address");
    }

    if (!password || password.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }

    // Check password strength
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      throw new Error(
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      );
    }

    // Register user with Supabase
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          name,
        },
        emailRedirectTo: `${window.location.origin}/verify`,
      },
    });

    if (error) {
      console.error("Registration error:", error);
      throw error;
    }

    // Send welcome email (don't block registration if email fails)
    try {
      await EmailService.sendWelcomeEmail({
        name,
        email: email.trim().toLowerCase(),
      });
      console.log("✅ Welcome email sent successfully");
    } catch (emailError) {
      console.warn("⚠️ Failed to send welcome email:", emailError);
      // Don't throw - registration should succeed even if email fails
    }

    console.log("Registration successful for:", email);
    return data;
  } catch (error) {
    console.error("Enhanced registration error:", error);
    throw error;
  }
};

/**
 * Enhanced password reset with email
 */
export const sendPasswordResetWithEmail = async (email: string) => {
  try {
    if (!email || !email.includes("@")) {
      throw new Error("Please enter a valid email address");
    }

    // Send password reset via Supabase
    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      {
        redirectTo: `${window.location.origin}/reset-password`,
      },
    );

    if (error) {
      console.error("Password reset error:", error);
      throw error;
    }

    // Get user info for personalized email
    const { data: profile } = await supabase
      .from("profiles")
      .select("name")
      .eq("email", email.trim().toLowerCase())
      .single();

    const userName = profile?.name || email.split("@")[0] || "User";

    // Send custom password reset email (optional - Supabase also sends one)
    try {
      await EmailService.sendPasswordReset(
        {
          name: userName,
          email: email.trim().toLowerCase(),
        },
        `${window.location.origin}/reset-password`,
      );
      console.log("✅ Custom password reset email sent");
    } catch (emailError) {
      console.warn("⚠️ Failed to send custom reset email:", emailError);
      // Don't throw - Supabase's email should still work
    }

    return { success: true };
  } catch (error) {
    console.error("Enhanced password reset error:", error);
    throw error;
  }
};

/**
 * Enhanced email verification
 */
export const sendEmailVerificationWithCustomEmail = async (email: string) => {
  try {
    // Resend verification via Supabase
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email.trim().toLowerCase(),
      options: {
        emailRedirectTo: `${window.location.origin}/verify`,
      },
    });

    if (error) {
      console.error("Email verification error:", error);
      throw error;
    }

    // Get user info for personalized email
    const { data: profile } = await supabase
      .from("profiles")
      .select("name")
      .eq("email", email.trim().toLowerCase())
      .single();

    const userName = profile?.name || email.split("@")[0] || "User";

    // Send custom verification email
    try {
      await EmailService.sendEmailVerification(
        {
          name: userName,
          email: email.trim().toLowerCase(),
        },
        `${window.location.origin}/verify`,
      );
      console.log("✅ Custom verification email sent");
    } catch (emailError) {
      console.warn("⚠️ Failed to send custom verification email:", emailError);
    }

    return { success: true };
  } catch (error) {
    console.error("Enhanced email verification error:", error);
    throw error;
  }
};

/**
 * Send bank details confirmation email
 */
export const sendBankDetailsConfirmationEmail = async (userId: string) => {
  try {
    // Handle demo mode
    if (userId.startsWith("demo-") || userId === "demo-user") {
      console.log("📧 Demo mode: Sending mock bank details confirmation email");

      const emailSent = await EmailService.sendBankDetailsConfirmation({
        name: "Demo User",
        email: "demo@example.com",
      });

      if (emailSent) {
        console.log("✅ Demo bank details confirmation email sent");
      }

      return emailSent;
    }

    // Get user profile for real users
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("name, email")
      .eq("id", userId)
      .single();

    if (error || !profile) {
      console.error(
        "Failed to get user profile for bank confirmation email:",
        error,
      );
      return false;
    }

    // Send bank details confirmation email
    const emailSent = await EmailService.sendBankDetailsConfirmation({
      name: profile.name || "User",
      email: profile.email,
    });

    if (emailSent) {
      console.log("✅ Bank details confirmation email sent");
      toast.success(
        "Bank details confirmed! You'll receive payment notifications via email.",
      );
    }

    return emailSent;
  } catch (error) {
    console.error("Error sending bank details confirmation email:", error);
    return false;
  }
};
