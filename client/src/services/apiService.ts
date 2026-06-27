import type { LocalSaveData } from '@malik/shared';

const API_BASE = '/api';
const AUTH_KEY = 'malik-auth-token';

export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_KEY);
}

export function setAuthToken(token: string | null): void {
  if (token) localStorage.setItem(AUTH_KEY, token);
  else localStorage.removeItem(AUTH_KEY);
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Request failed');
  return data as T;
}

export async function register(email: string, password: string): Promise<{ token: string; email: string }> {
  return apiFetch('/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) });
}

export async function login(email: string, password: string): Promise<{ token: string; email: string }> {
  return apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
}

export async function fetchCloudSave(): Promise<LocalSaveData> {
  const res = await apiFetch<{ save: LocalSaveData }>('/save');
  return res.save;
}

export async function pushCloudSave(save: LocalSaveData): Promise<void> {
  await apiFetch('/save', { method: 'PUT', body: JSON.stringify({ save }) });
}

export async function submitScore(missionId: string, score: number): Promise<void> {
  await apiFetch('/leaderboard', { method: 'POST', body: JSON.stringify({ missionId, score }) });
}

export interface LeaderboardEntry {
  rank: number;
  email: string;
  score: number;
  date: string;
}

export async function fetchLeaderboard(missionId: string): Promise<LeaderboardEntry[]> {
  const res = await apiFetch<{ entries: LeaderboardEntry[] }>(`/leaderboard/${missionId}`);
  return res.entries;
}

export async function checkApiHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`);
    return res.ok;
  } catch {
    return false;
  }
}
