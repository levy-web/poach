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
  /** Only superusers may grant or revoke staff access. */
  is_superuser: boolean;
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

export interface ListPage<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  /** True when the backend couldn't be reached, so the UI can say so
   *  instead of rendering an empty table that looks like "no rows". */
  failed: boolean;
  /** True when the requested page number is past the end of the result set. */
  outOfRange: boolean;
}

export const LIST_PAGE_SIZE = 10;

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

/**
 * Fetches one page from a DRF paginated list endpoint.
 *
 * `page`/`page_size` are always sent: the vendor and runner endpoints only
 * switch to the paginated envelope when asked (see OptInPageNumberPagination
 * on the API side), so omitting them would return a bare array.
 */
async function fetchListPage<T>(
  basePath: string,
  { page, search }: { page: number; search: string },
): Promise<ListPage<T>> {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(LIST_PAGE_SIZE),
  });
  if (search) params.set("search", search);

  const { data, status } = await authorizedFetch(`${basePath}?${params}`);

  if (!data) {
    // DRF answers an out-of-range page with 404, which is a navigation
    // problem rather than a backend failure — callers show a different
    // message for each so a bookmarked page 9 doesn't look like an outage.
    return {
      items: [],
      total: 0,
      page,
      pageSize: LIST_PAGE_SIZE,
      totalPages: 1,
      failed: status !== 404,
      outOfRange: status === 404,
    };
  }

  const total: number = data.count ?? 0;
  return {
    items: (data.results ?? []) as T[],
    total,
    page,
    pageSize: LIST_PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / LIST_PAGE_SIZE)),
    failed: false,
    outOfRange: false,
  };
}

export function getUsers(opts: { page?: number; search?: string }) {
  return fetchListPage<PlatformUser>("/api/users/", {
    page: opts.page ?? 1,
    search: opts.search ?? "",
  });
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

export interface Vendor {
  id: number;
  business_name: string;
  user_phone: string;
  zone: number;
  zone_name: string;
  pickup_address: string;
  commission_pct: string | null;
  is_approved: boolean;
  wallet_balance: string;
  active_menu_item_count: number | null;
  created_at: string;
}

export interface VendorStats {
  total_vendors: number;
  approved_vendors: number;
  pending_vendors: number;
  active_menu_items: number;
}

export function getVendors(opts: { page?: number; search?: string }) {
  return fetchListPage<Vendor>("/api/vendors/profiles/", {
    page: opts.page ?? 1,
    search: opts.search ?? "",
  });
}

export async function getVendorStats(): Promise<VendorStats | null> {
  const { data } = await authorizedFetch("/api/vendors/stats/");
  return data as VendorStats | null;
}

export interface Runner {
  id: number;
  user_full_name: string;
  user_phone: string;
  zone: number;
  zone_name: string;
  is_approved: boolean;
  is_online: boolean;
  wallet_balance: string;
  rating_avg: string | null;
  rating_count: number;
  active_order_count: number | null;
  created_at: string;
}

export interface RunnerStats {
  total_runners: number;
  online_runners: number;
  pending_runners: number;
  /** Null until the ratings flow exists and starts writing rating_avg. */
  average_rating: number | null;
}

export function getRunners(opts: { page?: number; search?: string }) {
  return fetchListPage<Runner>("/api/runners/profiles/", {
    page: opts.page ?? 1,
    search: opts.search ?? "",
  });
}

export async function getRunnerStats(): Promise<RunnerStats | null> {
  const { data } = await authorizedFetch("/api/runners/stats/");
  return data as RunnerStats | null;
}
