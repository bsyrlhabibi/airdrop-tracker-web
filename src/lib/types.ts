export interface User {
  id: string;
  email: string;
  name: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface Airdrop {
  id: string;
  user_id: string;
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
  id: string;
  airdrop_id: string;
  description: string;
  frequency: string;
  completed: boolean;
  last_completed: string | null;
  created_at: string;
  updated_at: string;
}

export interface Wallet {
  id: string;
  user_id: string;
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
