// Comprehensive API types to replace 'any' usage throughout the codebase

// Payment/Order types
export interface PaymentOrderData {
  id: string;
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed" | "cancelled";
  items: OrderItem[];
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  title: string;
  author: string;
  price: number;
  quantity: number;
  book_id: string;
}

// Courier API response types
export interface CourierApiResponse {
  success: boolean;
  quotes?: CourierQuoteData[];
  error?: string;
  message?: string;
}

export interface CourierQuoteData {
  courier: string;
  service_name?: string;
  serviceName?: string;
  service_code?: string;
  price?: number;
  cost?: number;
  estimated_days?: number | string;
  estimatedDays?: number;
  delivery_timeframe?: string;
  description?: string;
  service_description?: string;
}

// University/Course types
export interface UniversityApplicationInfo {
  university_id: string;
  requirements: string[];
  closing_date?: string;
  application_fee?: number;
  contact_info?: ContactInfo;
}

export interface ContactInfo {
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
}

// Supabase function response types
export interface SupabaseFunctionResponse<T = any> {
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: string;
  };
}

// Event tracking types
export interface AnalyticsEvent {
  eventName: string;
  parameters?: Record<string, string | number | boolean>;
  user_id?: string;
  timestamp?: string;
}

// Navigation/Routing types
export interface NavigationOptions {
  replace?: boolean;
  state?: Record<string, any>;
}

export interface SafeNavigationTarget {
  to: string | number;
  options?: NavigationOptions;
}

// Form types
export interface FormValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  data?: Record<string, any>;
}

export interface AddressDisplayData {
  street?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  country?: string;
  formatted_address?: string;
}

// University filter types
export interface UniversityFilters {
  province?: string;
  type?: string;
  search?: string;
  sortBy?: "name" | "ranking" | "location";
  sortOrder?: "asc" | "desc";
}

// QA/Testing types
export interface QATestResult {
  id: string;
  name: string;
  status: "pass" | "fail" | "warning" | "pending";
  message: string;
  details?: string;
  timestamp: string;
}

export interface SystemHealthMetric {
  name: string;
  status: "healthy" | "warning" | "error";
  value: string | number;
  description?: string;
  lastChecked: string;
}

// Error types
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: Record<string, any>;
}

export interface ErrorLogEntry {
  id: string;
  message: string;
  stack?: string;
  timestamp: string;
  severity: "error" | "warning" | "info";
  source: string;
  user_id?: string;
}

// Cookie/Consent types
export interface CookieConsentSettings {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

export interface CartItem {
  id: string;
  title: string;
  author: string;
  price: number;
  quantity: number;
  seller_id: string;
  book_id: string;
  image_url?: string;
}

// Service response types
export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  code?: string;
}

// Environment validation types
export interface EnvironmentCheck {
  name: string;
  required: boolean;
  status: "configured" | "missing" | "invalid";
  value?: string;
  description?: string;
}

// Generic API pagination
export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  total_pages: number;
  has_more: boolean;
}

// Generic database record
export interface DatabaseRecord {
  id: string;
  created_at: string;
  updated_at?: string;
}

// Event handler types
export type EventHandler<T = any> = (event: T) => void | Promise<void>;
export type AsyncEventHandler<T = any> = (event: T) => Promise<void>;

// Component prop types that commonly use 'any'
export interface GenericComponentProps {
  className?: string;
  children?: React.ReactNode;
  onClick?: EventHandler<React.MouseEvent>;
  onSubmit?: EventHandler<React.FormEvent>;
  style?: React.CSSProperties;
}

// Dialog/Modal types
export interface DialogProps extends GenericComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

// Form field types
export interface FormFieldProps {
  name: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  value?: string | number;
  onChange?: (value: string | number) => void;
}

// File upload types
export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploaded_at: string;
}

// Notification types
export interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  timestamp: string;
  read: boolean;
  action_url?: string;
}

// Search types
export interface SearchFilters {
  query?: string;
  category?: string;
  price_min?: number;
  price_max?: number;
  condition?: string;
  location?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface SearchResult<T> {
  items: T[];
  total_count: number;
  facets?: Record<string, SearchFacet>;
  suggestions?: string[];
}

export interface SearchFacet {
  name: string;
  values: Array<{
    value: string;
    count: number;
  }>;
}
