"use server";

import { apiRequest } from "@/lib/admin-api";

export interface SelectableUser {
  id: number;
  phone_number: string;
  full_name: string;
  is_active: boolean;
}

/**
 * Typeahead source for the vendor/runner account pickers.
 *
 * A server action rather than a route handler: the access token is an
 * httpOnly cookie, and actions POST to the current route, which `proxy.ts`
 * covers — so an expired token still gets refreshed. Route handlers under
 * /api are excluded from that matcher and would miss the refresh.
 */
export async function searchSelectableUsers(
  query: string,
  role: "vendor" | "runner",
): Promise<SelectableUser[]> {
  const params = new URLSearchParams({
    available_for: role,
    page: "1",
    page_size: "8",
  });
  const trimmed = query.trim();
  if (trimmed) params.set("search", trimmed);

  const { data } = await apiRequest(`/api/users/?${params}`, "GET");
  if (!data || !Array.isArray(data.results)) return [];

  return (data.results as SelectableUser[]).map((user) => ({
    id: user.id,
    phone_number: user.phone_number,
    full_name: user.full_name,
    is_active: user.is_active,
  }));
}
