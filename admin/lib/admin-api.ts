import "server-only";
import { getAccessToken } from "@/lib/session";

const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:8000";

export interface FormErrors {
  error?: string;
  /** Per-field messages from DRF, keyed by field name. */
  fieldErrors?: Record<string, string>;
}

/** What a toggle-style action returns: either an error or a success flag. */
export interface ActionResult extends FormErrors {
  success?: boolean;
}

/**
 * DRF returns either {"detail": "..."} or {"field": ["msg", ...]}. Flatten
 * both so a form can render each message next to the input it belongs to.
 */
export function parseApiErrors(data: unknown): FormErrors {
  if (!data || typeof data !== "object") {
    return { error: "Something went wrong. Try again." };
  }

  const body = data as Record<string, unknown>;
  if (typeof body.detail === "string") return { error: body.detail };

  const fieldErrors: Record<string, string> = {};
  for (const [field, value] of Object.entries(body)) {
    const message = Array.isArray(value) ? String(value[0]) : String(value);
    fieldErrors[field] = message;
  }

  return Object.keys(fieldErrors).length
    ? { fieldErrors }
    : { error: "Something went wrong. Try again." };
}

/**
 * Calls the Django API with the caller's access token. Runs server-side
 * only — the token is an httpOnly cookie the browser can't read, which is
 * why every mutation goes through a server action rather than client fetch.
 */
export async function apiRequest(
  path: string,
  method: string,
  body?: Record<string, unknown>,
) {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return { ok: false, data: { detail: "Your session expired. Sign in again." } };
  }

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });

    if (response.status === 204) return { ok: true, data: null };
    const data = await response.json().catch(() => null);
    return { ok: response.ok, data };
  } catch {
    return { ok: false, data: { detail: "Couldn't reach the server. Try again shortly." } };
  }
}
