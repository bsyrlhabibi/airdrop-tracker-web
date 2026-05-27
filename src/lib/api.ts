import type {
  LoginResponse,
  RegisterResponse,
  User,
  Account,
  Airdrop,
  AirdropTask,
  AccountAirdrop,
  Task,
  Wallet,
  DashboardSummary,
  Category,
} from "./types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://192-241-183-66.nip.io";

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

// Categories
export async function getCategories(): Promise<Category[]> {
  return request<Category[]>("/api/categories");
}

export async function createCategory(data: {
  name: string;
  color?: string;
}): Promise<Category> {
  return request<Category>("/api/categories", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateCategory(
  id: number,
  data: Partial<{ name: string; color: string }>
): Promise<Category> {
  return request<Category>(`/api/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteCategory(id: number): Promise<void> {
  return request<void>(`/api/categories/${id}`, { method: "DELETE" });
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

// Airdrops (global catalog)
export async function getAirdrops(): Promise<Airdrop[]> {
  return request<Airdrop[]>("/api/airdrops");
}

export async function getAirdrop(id: number): Promise<Airdrop> {
  return request<Airdrop>(`/api/airdrops/${id}`);
}

export async function createAirdrop(data: {
  name: string;
  chain: string;
  category: string;
  priority: string;
  url?: string;
  date_start?: string;
  date_end?: string;
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
    date_start: string;
    date_end: string;
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

// Airdrop Tasks (global tasks per airdrop)
export async function getAirdropTasks(airdropId: number): Promise<AirdropTask[]> {
  return request<AirdropTask[]>(`/api/airdrops/${airdropId}/tasks`);
}

export async function createAirdropTask(
  airdropId: number,
  data: { name: string; category_id?: number; status?: string; start_date?: string; end_date?: string }
): Promise<AirdropTask> {
  return request<AirdropTask>(`/api/airdrops/${airdropId}/tasks`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateAirdropTask(
  taskId: number,
  data: Partial<{ name: string; category_id: number; status: string; start_date: string; end_date: string }>
): Promise<AirdropTask> {
  return request<AirdropTask>(`/api/airdrop-tasks/${taskId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteAirdropTask(taskId: number): Promise<void> {
  return request<void>(`/api/airdrop-tasks/${taskId}`, { method: "DELETE" });
}

// Account Airdrops (assign/unassign)
export async function getAccountAirdrops(
  accountId: number
): Promise<AccountAirdrop[]> {
  return request<AccountAirdrop[]>(`/api/accounts/${accountId}/airdrops`);
}

export async function assignAirdrop(
  accountId: number,
  data: { airdrop_id: number; notes?: string }
): Promise<AccountAirdrop> {
  return request<AccountAirdrop>(`/api/accounts/${accountId}/airdrops`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function removeAirdropFromAccount(
  accountId: number,
  accountAirdropId: number
): Promise<void> {
  return request<void>(
    `/api/accounts/${accountId}/airdrops/${accountAirdropId}`,
    { method: "DELETE" }
  );
}

// Tasks (per account-airdrop)
export async function createTask(
  accountAirdropId: number,
  data: { name: string; category_id?: number; status?: string; frequency?: string; date?: string }
): Promise<Task> {
  return request<Task>(`/api/account-airdrops/${accountAirdropId}/tasks`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateTask(
  taskId: number,
  data: Partial<{ name: string; category_id: number; status: string; frequency: string; date: string }>
): Promise<Task> {
  return request<Task>(`/api/tasks/${taskId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteTask(taskId: number): Promise<void> {
  return request<void>(`/api/tasks/${taskId}`, { method: "DELETE" });
}

// Today's tasks (per account)
export async function getDateTasks(accountId: number, date: string): Promise<Task[]> {
  return request<Task[]>(`/api/accounts/${accountId}/tasks/by-date?date=${date}`);
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


