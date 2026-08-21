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

export interface PlatformUser extends AuthenticatedUser {
  is_active: boolean;
  date_joined: string;
  last_login: string | null;
  order_count: number;
}

export interface UserPage {
  users: PlatformUser[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  /** True when the backend couldn't be reached, so the UI can say so
   *  instead of rendering an empty table that looks like "no users". */
  failed: boolean;
  /** True when the requested page number is past the end of the result set. */
  outOfRange: boolean;
}

export const USERS_PAGE_SIZE = 10;

async function authorizedFetch(path: string) {
  const accessToken = await getAccessToken();
  if (!accessToken) return { data: null, status: 401 };

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    if (!response.ok) return { data: null, status: response.status };
    return { data: await response.json(), status: response.status };
  } catch {
    // 0 stands for "never got a response" — distinct from a real HTTP status.
    return { data: null, status: 0 };
  }
}

export async function getUsers({
  page = 1,
  search = "",
}: {
  page?: number;
  search?: string;
}): Promise<UserPage> {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(USERS_PAGE_SIZE),
  });
  if (search) params.set("search", search);

  const { data, status } = await authorizedFetch(`/api/users/?${params}`);

  if (!data) {
    // DRF answers an out-of-range page with 404, which is a navigation
    // problem rather than a backend failure — the caller shows a different
    // message for each so a bookmarked page 9 doesn't look like an outage.
    return {
      users: [],
      total: 0,
      page,
      pageSize: USERS_PAGE_SIZE,
      totalPages: 1,
      failed: status !== 404,
      outOfRange: status === 404,
    };
  }

  const total: number = data.count ?? 0;
  return {
    users: (data.results ?? []) as PlatformUser[],
    total,
    page,
    pageSize: USERS_PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / USERS_PAGE_SIZE)),
    failed: false,
    outOfRange: false,
  };
}

export interface UserStats {
  total_users: number;
  active_users: number;
  new_users: number;
  window_days: number;
}

export async function getUserStats(): Promise<UserStats | null> {
  const { data } = await authorizedFetch("/api/users/stats/");
  return data as UserStats | null;
}
