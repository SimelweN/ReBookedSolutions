export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      api_keys: {
        Row: {
          api_key: string;
          created_at: string | null;
          id: number;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          api_key: string;
          created_at?: string | null;
          id?: never;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          api_key?: string;
          created_at?: string | null;
          id?: never;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      banking_details: {
        Row: {
          id: string;
          user_id: string;
          recipient_type: string;
          full_name: string;
          bank_account_number: string;
          bank_name: string;
          branch_code: string;
          account_type: string;
          paystack_subaccount_code: string | null;
          paystack_subaccount_id: string | null;
          subaccount_status: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          recipient_type: string;
          full_name: string;
          bank_account_number: string;
          bank_name: string;
          branch_code: string;
          account_type: string;
          paystack_subaccount_code?: string | null;
          paystack_subaccount_id?: string | null;
          subaccount_status?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          recipient_type?: string;
          full_name?: string;
          bank_account_number?: string;
          bank_name?: string;
          branch_code?: string;
          account_type?: string;
          paystack_subaccount_code?: string | null;
          paystack_subaccount_id?: string | null;
          subaccount_status?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      banking_subaccounts: {
        Row: {
          id: string;
          business_name: string;
          email: string;
          bank_name: string;
          bank_code: string;
          account_number: string;
          subaccount_code: string | null;
          paystack_response: Json | null;
          status: string | null;
          created_at: string | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          id?: string;
          business_name: string;
          email: string;
          bank_name: string;
          bank_code: string;
          account_number: string;
          subaccount_code?: string | null;
          paystack_response?: Json | null;
          status?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          id?: string;
          business_name?: string;
          email?: string;
          bank_name?: string;
          bank_code?: string;
          account_number?: string;
          subaccount_code?: string | null;
          paystack_response?: Json | null;
          status?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "banking_subaccounts_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      books: {
        Row: {
          author: string;
          availability: string | null;
          back_cover: string | null;
          category: string;
          condition: string;
          created_at: string;
          description: string;
          front_cover: string | null;
          grade: string | null;
          id: string;
          image_url: string;
          inside_pages: string | null;
          price: number;
          province: string | null;
          seller_id: string;
          sold: boolean;
          title: string;
          university: string | null;
          university_year: string | null;
          updated_at: string | null;
        };
        Insert: {
          author: string;
          availability?: string | null;
          back_cover?: string | null;
          category: string;
          condition: string;
          created_at?: string;
          description: string;
          front_cover?: string | null;
          grade?: string | null;
          id?: string;
          image_url: string;
          inside_pages?: string | null;
          price: number;
          province?: string | null;
          seller_id: string;
          sold?: boolean;
          title: string;
          university?: string | null;
          university_year?: string | null;
          updated_at?: string | null;
        };
        Update: {
          author?: string;
          availability?: string | null;
          back_cover?: string | null;
          category?: string;
          condition?: string;
          created_at?: string;
          description?: string;
          front_cover?: string | null;
          grade?: string | null;
          id?: string;
          image_url?: string;
          inside_pages?: string | null;
          price?: number;
          province?: string | null;
          seller_id?: string;
          sold?: boolean;
          title?: string;
          university?: string | null;
          university_year?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "books_seller_id_fkey";
            columns: ["seller_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      broadcasts: {
        Row: {
          active: boolean;
          created_at: string;
          created_by: string | null;
          expires_at: string | null;
          id: string;
          message: string;
          priority: Database["public"]["Enums"]["broadcast_priority"];
          target_audience:
            | Database["public"]["Enums"]["broadcast_target_audience"]
            | null;
          title: string;
          type: Database["public"]["Enums"]["broadcast_type"];
          updated_at: string;
        };
        Insert: {
          active?: boolean;
          created_at?: string;
          created_by?: string | null;
          expires_at?: string | null;
          id?: string;
          message: string;
          priority?: Database["public"]["Enums"]["broadcast_priority"];
          target_audience?:
            | Database["public"]["Enums"]["broadcast_target_audience"]
            | null;
          title: string;
          type?: Database["public"]["Enums"]["broadcast_type"];
          updated_at?: string;
        };
        Update: {
          active?: boolean;
          created_at?: string;
          created_by?: string | null;
          expires_at?: string | null;
          id?: string;
          message?: string;
          priority?: Database["public"]["Enums"]["broadcast_priority"];
          target_audience?:
            | Database["public"]["Enums"]["broadcast_target_audience"]
            | null;
          title?: string;
          type?: Database["public"]["Enums"]["broadcast_type"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "broadcasts_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      contact_messages: {
        Row: {
          created_at: string;
          email: string;
          id: string;
          message: string;
          name: string;
          status: string;
          subject: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          id?: string;
          message: string;
          name: string;
          status?: string;
          subject: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
          message?: string;
          name?: string;
          status?: string;
          subject?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      email_notifications: {
        Row: {
          created_at: string;
          email: string;
          id: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          id?: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          created_at: string;
          id: string;
          message: string;
          read: boolean;
          title: string;
          type: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          message: string;
          read?: boolean;
          title: string;
          type: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          message?: string;
          read?: boolean;
          title?: string;
          type?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          buyer_id: string | null;
          buyer_email: string;
          seller_id: string;
          book_id: string;
          book_title: string;
          book_price: number;
          paystack_ref: string;
          amount: number;
          delivery_fee: number;
          platform_fee: number;
          seller_amount: number;
          status: string;
          courier_provider: string | null;
          courier_service: string | null;
          courier_tracking_number: string | null;
          courier_quote_id: string | null;
          shipping_address: Json;
          pickup_address: Json | null;
          delivery_quote: Json | null;
          collection_deadline: string | null;
          delivery_deadline: string | null;
          payment_held: boolean;
          seller_notified_at: string | null;
          seller_subaccount_code: string | null;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
          paid_at: string | null;
          collected_at: string | null;
          delivered_at: string | null;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          buyer_id?: string | null;
          buyer_email: string;
          seller_id: string;
          book_id: string;
          book_title: string;
          book_price: number;
          paystack_ref: string;
          amount: number;
          delivery_fee?: number;
          platform_fee?: number;
          seller_amount: number;
          status?: string;
          courier_provider?: string | null;
          courier_service?: string | null;
          courier_tracking_number?: string | null;
          courier_quote_id?: string | null;
          shipping_address: Json;
          pickup_address?: Json | null;
          delivery_quote?: Json | null;
          collection_deadline?: string | null;
          delivery_deadline?: string | null;
          payment_held?: boolean;
          seller_notified_at?: string | null;
          seller_subaccount_code?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
          paid_at?: string | null;
          collected_at?: string | null;
          delivered_at?: string | null;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          buyer_id?: string | null;
          buyer_email?: string;
          seller_id?: string;
          book_id?: string;
          book_title?: string;
          book_price?: number;
          paystack_ref?: string;
          amount?: number;
          delivery_fee?: number;
          platform_fee?: number;
          seller_amount?: number;
          status?: string;
          courier_provider?: string | null;
          courier_service?: string | null;
          courier_tracking_number?: string | null;
          courier_quote_id?: string | null;
          shipping_address?: Json;
          pickup_address?: Json | null;
          delivery_quote?: Json | null;
          collection_deadline?: string | null;
          delivery_deadline?: string | null;
          payment_held?: boolean;
          seller_notified_at?: string | null;
          seller_subaccount_code?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
          paid_at?: string | null;
          collected_at?: string | null;
          delivered_at?: string | null;
          completed_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "orders_buyer_id_fkey";
            columns: ["buyer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_seller_id_fkey";
            columns: ["seller_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_book_id_fkey";
            columns: ["book_id"];
            isOneToOne: false;
            referencedRelation: "books";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          addresses_same: boolean | null;
          aps_score: number | null;
          bio: string | null;
          created_at: string;
          email: string | null;
          id: string;
          is_admin: boolean | null;
          name: string | null;
          pickup_address: Json | null;
          profile_picture_url: string | null;
          shipping_address: Json | null;
          status: string | null;
          subaccount_code: string | null;
          suspended_at: string | null;
          suspension_reason: string | null;
          updated_at: string;
        };
        Insert: {
          addresses_same?: boolean | null;
          aps_score?: number | null;
          bio?: string | null;
          created_at?: string;
          email?: string | null;
          id: string;
          is_admin?: boolean | null;
          name?: string | null;
          pickup_address?: Json | null;
          profile_picture_url?: string | null;
          shipping_address?: Json | null;
          status?: string | null;
          subaccount_code?: string | null;
          suspended_at?: string | null;
          suspension_reason?: string | null;
          updated_at?: string;
        };
        Update: {
          addresses_same?: boolean | null;
          aps_score?: number | null;
          bio?: string | null;
          created_at?: string;
          email?: string | null;
          id?: string;
          is_admin?: boolean | null;
          name?: string | null;
          pickup_address?: Json | null;
          profile_picture_url?: string | null;
          shipping_address?: Json | null;
          status?: string | null;
          subaccount_code?: string | null;
          suspended_at?: string | null;
          suspension_reason?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      reports: {
        Row: {
          book_id: string | null;
          book_title: string;
          created_at: string;
          id: string;
          reason: string;
          reported_user_id: string;
          reporter_user_id: string;
          seller_name: string;
          status: string;
          updated_at: string;
        };
        Insert: {
          book_id?: string | null;
          book_title: string;
          created_at?: string;
          id?: string;
          reason: string;
          reported_user_id: string;
          reporter_user_id: string;
          seller_name: string;
          status?: string;
          updated_at?: string;
        };
        Update: {
          book_id?: string | null;
          book_title?: string;
          created_at?: string;
          id?: string;
          reason?: string;
          reported_user_id?: string;
          reporter_user_id?: string;
          seller_name?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reports_book_id_fkey";
            columns: ["book_id"];
            isOneToOne: false;
            referencedRelation: "books";
            referencedColumns: ["id"];
          },
        ];
      };
      transactions: {
        Row: {
          book_id: string;
          book_title: string;
          buyer_id: string;
          commission: number;
          created_at: string;
          id: string;
          price: number;
          seller_id: string;
        };
        Insert: {
          book_id: string;
          book_title: string;
          buyer_id: string;
          commission: number;
          created_at?: string;
          id?: string;
          price: number;
          seller_id: string;
        };
        Update: {
          book_id?: string;
          book_title?: string;
          buyer_id?: string;
          commission?: number;
          created_at?: string;
          id?: string;
          price?: number;
          seller_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "transactions_book_id_fkey";
            columns: ["book_id"];
            isOneToOne: false;
            referencedRelation: "books";
            referencedColumns: ["id"];
          },
        ];
      };
      waitlist: {
        Row: {
          created_at: string;
          email: string;
          id: string;
          notified: boolean;
        };
        Insert: {
          created_at?: string;
          email: string;
          id?: string;
          notified?: boolean;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
          notified?: boolean;
        };
        Relationships: [];
      };
      study_resources: {
        Row: {
          id: string;
          title: string;
          description: string;
          content: string | null;
          resource_type: string;
          university_id: string;
          course_code: string;
          year_level: number;
          semester: string | null;
          tags: string[];
          file_url: string | null;
          file_size: number | null;
          file_type: string | null;
          created_by: string;
          is_verified: boolean;
          download_count: number;
          rating: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          content?: string | null;
          resource_type: string;
          university_id: string;
          course_code: string;
          year_level: number;
          semester?: string | null;
          tags?: string[];
          file_url?: string | null;
          file_size?: number | null;
          file_type?: string | null;
          created_by: string;
          is_verified?: boolean;
          download_count?: number;
          rating?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          content?: string | null;
          resource_type?: string;
          university_id?: string;
          course_code?: string;
          year_level?: number;
          semester?: string | null;
          tags?: string[];
          file_url?: string | null;
          file_size?: number | null;
          file_type?: string | null;
          created_by?: string;
          is_verified?: boolean;
          download_count?: number;
          rating?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "study_resources_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      file_uploads: {
        Row: {
          id: string;
          user_id: string;
          file_name: string;
          file_path: string;
          file_type: string;
          file_size: number;
          public_url: string;
          folder: string;
          metadata: Record<string, any>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          file_name: string;
          file_path: string;
          file_type: string;
          file_size: number;
          public_url: string;
          folder: string;
          metadata?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          file_name?: string;
          file_path?: string;
          file_type?: string;
          file_size?: number;
          public_url?: string;
          folder?: string;
          metadata?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "file_uploads_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      delete_user_profile: {
        Args: { user_id: string };
        Returns: undefined;
      };
      generate_api_key: {
        Args: { user_id: string };
        Returns: string;
      };
      get_user_profile: {
        Args: { user_id: string };
        Returns: {
          id: string;
          name: string;
          email: string;
        }[];
      };
      has_role: {
        Args:
          | { user_id: number; role_name: string }
          | { user_id: string; role_name: string };
        Returns: boolean;
      };
      is_admin: {
        Args: { user_id: string };
        Returns: boolean;
      };
      list_all_profiles: {
        Args: Record<PropertyKey, never>;
        Returns: {
          id: string;
          username: string;
          email: string;
          created_at: string;
        }[];
      };
      update_user_profile: {
        Args: { user_id: string; new_name: string; new_email: string };
        Returns: undefined;
      };
    };
    Enums: {
      broadcast_priority: "low" | "normal" | "medium" | "high" | "urgent";
      broadcast_target_audience: "all" | "users" | "admin";
      broadcast_type: "info" | "warning" | "success" | "error";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      broadcast_priority: ["low", "normal", "medium", "high", "urgent"],
      broadcast_target_audience: ["all", "users", "admin"],
      broadcast_type: ["info", "warning", "success", "error"],
    },
  },
} as const;
