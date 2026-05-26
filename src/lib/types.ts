export interface User {
  id: number;
  email: string;
  name: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterResponse {
  message: string;
  user: User;
}

export interface Account {
  id: number;
  user_id: number;
  name: string;
  color: string;
  notes: string;
  created_at: string;
  updated_at: string;
  wallets?: Wallet[];
  account_airdrops?: AccountAirdrop[];
}

export interface AccountStats {
  id: number;
  name: string;
  color: string;
  total_airdrops: number;
  active_airdrops: number;
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  total_wallets: number;
}

export interface Airdrop {
  id: number;
  name: string;
  chain: string;
  category: string;
  priority: "low" | "medium" | "high";
  status: "active" | "completed" | "missed" | "upcoming";
  url: string;
  notes: string;
  deadline: string | null;
  created_at: string;
  updated_at: string;
}

export interface AccountAirdrop {
  id: number;
  account_id: number;
  airdrop_id: number;
  status: string;
  notes: string;
  created_at: string;
  updated_at: string;
  airdrop?: Airdrop;
  tasks?: Task[];
}

export interface TaskTemplate {
  id: number;
  name: string;
  description: string;
  tasks: { description: string; frequency: string }[];
}

export interface Task {
  id: number;
  account_airdrop_id: number;
  description: string;
  frequency: string;
  is_completed: boolean;
  completed_at: string | null;
  next_due: string | null;
  wallet_id: number | null;
  gas_spent: number;
  tx_hash: string;
  created_at: string;
}

export interface Wallet {
  id: number;
  user_id: number;
  account_id: number;
  label: string;
  address: string;
  chain: string;
  created_at: string;
  account?: Account;
}

export interface DashboardSummary {
  total_airdrops: number;
  active_airdrops: number;
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  total_wallets: number;
  total_accounts: number;
  accounts: AccountStats[];
}

export interface ComparisonData {
  accounts: {
    id: number;
    name: string;
    color: string;
    total_airdrops: number;
    completed_airdrops: number;
    total_tasks: number;
    completed_tasks: number;
    completion_pct: number;
  }[];
}
