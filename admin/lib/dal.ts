import "server-only";
import { cache } from "react";
import { getAccessToken } from "@/lib/session";

const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:8000";

export interface AuthenticatedUser {
  id: number;
  phone_number: string;
  full_name: string;
  is_phone_verified: boolean;
  is_staff: boolean;
}

/**
 * Confirms the access token in the request's cookies against the Django
 * backend rather than trusting the cookie's mere presence — dedupes across
 * a single render pass via `cache`.
 */
export const getCurrentUser = cache(async (): Promise<AuthenticatedUser | null> => {
  const accessToken = await getAccessToken();
  if (!accessToken) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/me/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    if (!response.ok) return null;
    return (await response.json()) as AuthenticatedUser;
  } catch {
    return null;
  }
});
