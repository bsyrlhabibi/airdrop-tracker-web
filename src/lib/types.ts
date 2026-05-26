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

export interface Airdrop {
  id: number;
  user_id: number;
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
  tasks?: Task[];
  completed_tasks?: number;
  total_tasks?: number;
}

export interface Task {
  id: number;
  airdrop_id: number;
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
  label: string;
  address: string;
  chain: string;
  created_at: string;
}

export interface DashboardSummary {
  total_airdrops: number;
  active_airdrops: number;
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  total_wallets: number;
}
