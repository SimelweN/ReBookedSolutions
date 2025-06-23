export interface BankingDetails {
  id?: string;
  user_id: string;
  recipient_type: string;
  full_name: string;
  bank_account_number: string;
  bank_name: string;
  branch_code: string;
  account_type: "savings" | "current";
  created_at?: string;
  updated_at?: string;
}

export interface BankInfo {
  name: string;
  branchCode: string;
}

export const SOUTH_AFRICAN_BANKS: BankInfo[] = [
  { name: "Absa Bank", branchCode: "632005" },
  { name: "Capitec Bank", branchCode: "470010" },
  { name: "First National Bank (FNB)", branchCode: "250655" },
  { name: "Investec Bank", branchCode: "580105" },
  { name: "Nedbank", branchCode: "198765" },
  { name: "Standard Bank", branchCode: "051001" },
  { name: "African Bank", branchCode: "430000" },
  { name: "Mercantile Bank", branchCode: "450905" },
  { name: "TymeBank", branchCode: "678910" },
  { name: "Bidvest Bank", branchCode: "679000" },
  { name: "Sasfin Bank", branchCode: "683000" },
  { name: "Bank of Athens", branchCode: "410506" },
  { name: "RMB Private Bank", branchCode: "222026" },
  { name: "South African Post Bank (Post Office)", branchCode: "460005" },
  { name: "Hollard Bank", branchCode: "585001" },
  { name: "Discovery Bank", branchCode: "679000" },
  { name: "Standard Chartered Bank", branchCode: "730020" },
  { name: "Barclays Bank", branchCode: "590000" },
];

export interface PasswordVerificationData {
  isVerified: boolean;
  timestamp: number;
}
