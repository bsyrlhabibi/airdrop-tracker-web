import type {
  LoginResponse,
  User,
  Airdrop,
  Task,
  Wallet,
  DashboardSummary,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

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
): Promise<LoginResponse> {
  return request<LoginResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, name }),
  });
}

// Airdrops
export async function getAirdrops(): Promise<Airdrop[]> {
  return request<Airdrop[]>("/api/airdrops");
}

export async function getAirdrop(id: string): Promise<Airdrop> {
  return request<Airdrop>(`/api/airdrops/${id}`);
}

export async function createAirdrop(data: {
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
  id: string,
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

export async function deleteAirdrop(id: string): Promise<void> {
  return request<void>(`/api/airdrops/${id}`, { method: "DELETE" });
}

// Tasks
export async function getTasks(airdropId: string): Promise<Task[]> {
  return request<Task[]>(`/api/airdrops/${airdropId}/tasks`);
}

export async function createTask(
  airdropId: string,
  data: { description: string; frequency: string }
): Promise<Task> {
  return request<Task>(`/api/airdrops/${airdropId}/tasks`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function completeTask(taskId: string): Promise<Task> {
  return request<Task>(`/api/tasks/${taskId}/complete`, { method: "PUT" });
}

export async function resetTask(taskId: string): Promise<Task> {
  return request<Task>(`/api/tasks/${taskId}/reset`, { method: "PUT" });
}

export async function deleteTask(taskId: string): Promise<void> {
  return request<void>(`/api/tasks/${taskId}`, { method: "DELETE" });
}

// Wallets
export async function getWallets(): Promise<Wallet[]> {
  return request<Wallet[]>("/api/wallets");
}

export async function createWallet(data: {
  label: string;
  address: string;
  chain: string;
}): Promise<Wallet> {
  return request<Wallet>("/api/wallets", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function deleteWallet(id: string): Promise<void> {
  return request<void>(`/api/wallets/${id}`, { method: "DELETE" });
}

// Dashboard
export async function getDashboard(): Promise<DashboardSummary> {
  return request<DashboardSummary>("/api/dashboard");
}
