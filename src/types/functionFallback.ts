export type FallbackType =
  | "queue"
  | "queue-order"
  | "queue-email"
  | "cached-rates"
  | "store-locally"
  | "deferred"
  | "none";

export type ServiceLayer = "supabase" | "fallback";

export interface FunctionPolicy {
  fallback: boolean;
  fallbackType: FallbackType;
  useOnly?: "Supabase Auth/Client";
  notes?: string;
  timeout?: number;
  retryAttempts?: number;
  cacheEnabled?: boolean;
  cacheTTL?: number;
}

export interface FunctionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  source: ServiceLayer;
  timestamp: number;
  cached?: boolean;
  fallbackUsed?: boolean;
}

export interface FunctionCallContext {
  functionName: string;
  payload: any;
  userId?: string;
  priority?: "high" | "normal" | "low";
  requestId?: string;
}

export interface HealthStatus {
  service: ServiceLayer;
  healthy: boolean;
  lastCheck: number;
  failureCount: number;
  disabled: boolean;
  disabledUntil?: number;
}

export interface QueuedFunction {
  id: string;
  functionName: string;
  payload: any;
  context: FunctionCallContext;
  attempts: number;
  maxAttempts: number;
  nextRetry: number;
  priority: "high" | "normal" | "low";
  created: number;
}

export interface CachedResponse<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  source: ServiceLayer;
}

export interface FallbackStorage {
  // Queue operations
  enqueue(item: QueuedFunction): Promise<void>;
  dequeue(priority?: "high" | "normal" | "low"): Promise<QueuedFunction | null>;
  clearQueue(): Promise<void>;
  getQueueSize(): Promise<number>;

  // Cache operations
  setCache<T>(key: string, data: T, ttl?: number): Promise<void>;
  getCache<T>(key: string): Promise<CachedResponse<T> | null>;
  clearCache(pattern?: string): Promise<void>;

  // Local storage operations
  storeLocally(key: string, data: any): Promise<void>;
  getLocalData(key: string): Promise<any>;
  clearLocalData(key?: string): Promise<void>;
}
