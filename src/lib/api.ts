import type {
  LoginResponse,
  RegisterResponse,
  User,
  Account,
  Airdrop,
  Task,
  Wallet,
  DashboardSummary,
} from "./types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://airdrop-tracker-api-v1.fly.dev";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function setToken(token: string) {
  localStorage.setItem("token", token);
}

export function removeToken() {
  localStorage.removeItem("token");
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.text();
    let message = `Request failed (${res.status})`;
    try {
      const json = JSON.parse(body);
      message = json.error || json.message || message;
    } catch {}
    throw new Error(message);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// Auth
export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  return request<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function register(
  email: string,
  password: string,
  name: string
): Promise<RegisterResponse> {
  return request<RegisterResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, name }),
  });
}

// Accounts
export async function getAccounts(): Promise<Account[]> {
  return request<Account[]>("/api/accounts");
}

export async function getAccount(id: number): Promise<Account> {
  return request<Account>(`/api/accounts/${id}`);
}

export async function createAccount(data: {
  name: string;
  color?: string;
  notes?: string;
}): Promise<Account> {
  return request<Account>("/api/accounts", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateAccount(
  id: number,
  data: Partial<{ name: string; color: string; notes: string }>
): Promise<Account> {
  return request<Account>(`/api/accounts/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteAccount(
  id: number,
  force = false
): Promise<void> {
  return request<void>(`/api/accounts/${id}${force ? "?force=true" : ""}`, {
    method: "DELETE",
  });
}

// Airdrops
export async function getAirdrops(accountId?: number): Promise<Airdrop[]> {
  const query = accountId ? `?account_id=${accountId}` : "";
  return request<Airdrop[]>(`/api/airdrops${query}`);
}

export async function getAirdrop(id: number): Promise<Airdrop> {
  return request<Airdrop>(`/api/airdrops/${id}`);
}

export async function createAirdrop(data: {
  account_id: number;
  name: string;
  chain: string;
  category: string;
  priority: string;
  url?: string;
  notes?: string;
}): Promise<Airdrop> {
  return request<Airdrop>("/api/airdrops", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateAirdrop(
  id: number,
  data: Partial<{
    name: string;
    chain: string;
    category: string;
    priority: string;
    status: string;
    url: string;
    notes: string;
    deadline: string;
  }>
): Promise<Airdrop> {
  return request<Airdrop>(`/api/airdrops/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteAirdrop(id: number): Promise<void> {
  return request<void>(`/api/airdrops/${id}`, { method: "DELETE" });
}

// Tasks
export async function getTasks(airdropId: number): Promise<Task[]> {
  return request<Task[]>(`/api/airdrops/${airdropId}/tasks`);
}

export async function createTask(
  airdropId: number,
  data: { description: string; frequency: string; wallet_id?: number }
): Promise<Task> {
  return request<Task>(`/api/airdrops/${airdropId}/tasks`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function completeTask(taskId: number): Promise<Task> {
  return request<Task>(`/api/tasks/${taskId}/complete`, { method: "PUT" });
}

export async function resetTask(taskId: number): Promise<Task> {
  return request<Task>(`/api/tasks/${taskId}/reset`, { method: "PUT" });
}

export async function deleteTask(taskId: number): Promise<void> {
  return request<void>(`/api/tasks/${taskId}`, { method: "DELETE" });
}

// Wallets
export async function getWallets(accountId?: number): Promise<Wallet[]> {
  const query = accountId ? `?account_id=${accountId}` : "";
  return request<Wallet[]>(`/api/wallets${query}`);
}

export async function createWallet(data: {
  account_id: number;
  label: string;
  address: string;
  chain: string;
}): Promise<Wallet> {
  return request<Wallet>("/api/wallets", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function deleteWallet(id: number): Promise<void> {
  return request<void>(`/api/wallets/${id}`, { method: "DELETE" });
}

// Dashboard
export async function getDashboard(): Promise<DashboardSummary> {
  return request<DashboardSummary>("/api/dashboard");
}
