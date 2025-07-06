export interface QuickFix {
  id: string;
  title: string;
  description: string;
  category: "auth" | "cart" | "payment" | "seller" | "system";
  severity: "critical" | "warning" | "info";
  status: "pending" | "running" | "success" | "failed";
  action: () => Promise<void>;
}

export interface QAFixState {
  fixes: QuickFix[];
  isRunning: Set<string>;
}
