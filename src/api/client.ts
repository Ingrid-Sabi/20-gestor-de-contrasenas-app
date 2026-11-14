import * as SecureStore from "expo-secure-store";
import { sha1Hex } from "@/services/crypto";

const TOKEN_KEY = "auth_token";
const REFRESH_KEY = "auth_refresh_token";

function getApiUrl(): string {
  return (
    process.env.EXPO_PUBLIC_API_URL ??
    "https://20-gestor-de-contrasenas-api.vercel.app"
  );
}

export async function saveTokens(
  token: string,
  refreshToken: string
): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
  await SecureStore.setItemAsync(REFRESH_KEY, refreshToken);
}

export async function clearTokens(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_KEY);
}

async function tryRefreshToken(): Promise<string | null> {
  const refreshToken = await SecureStore.getItemAsync(REFRESH_KEY);
  if (!refreshToken) {
    return null;
  }
  const res = await fetch(`${getApiUrl()}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) {
    await clearTokens();
    return null;
  }
  const data = (await res.json()) as { token: string; refreshToken: string };
  await saveTokens(data.token, data.refreshToken);
  return data.token;
}

export async function apiFetch(
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  const headers = new Headers(init.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  headers.set("Content-Type", "application/json");

  const res = await fetch(`${getApiUrl()}${path}`, { ...init, headers });
  if (res.status !== 401) {
    return res;
  }

  const newToken = await tryRefreshToken();
  if (!newToken) {
    return res;
  }
  headers.set("Authorization", `Bearer ${newToken}`);
  return fetch(`${getApiUrl()}${path}`, { ...init, headers });
}

export async function checkPasswordBreach(
  password: string
): Promise<{ compromised: boolean; count: number }> {
  const hash = await sha1Hex(password);
  const prefix = hash.slice(0, 5);
  const suffix = hash.slice(5);

  const res = await apiFetch(`/api/filtraciones/${prefix}`);
  if (!res.ok) {
    throw new Error("No se pudo verificar filtraciones");
  }
  const data = (await res.json()) as {
    sufijos: Array<{ sufijo: string; conteo: number }>;
  };
  const match = data.sufijos.find((item) => item.sufijo === suffix);
  return { compromised: Boolean(match), count: match?.conteo ?? 0 };
}
