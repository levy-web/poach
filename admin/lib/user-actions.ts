"use server";

import { revalidatePath } from "next/cache";
import { getAccessToken } from "@/lib/session";

const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:8000";

export interface SubmittedUserValues {
  phone_number: string;
  full_name: string;
  is_active: boolean;
  is_phone_verified: boolean;
  is_staff: boolean;
}

export interface UserFormState {
  error?: string;
  /** Per-field messages from DRF, keyed by field name. */
  fieldErrors?: Record<string, string>;
  success?: boolean;
  /**
   * What the admin typed, echoed back on failure. React 19 resets
   * uncontrolled inputs once a form action settles, so without this a single
   * validation error would wipe every field they filled in. Never includes
   * the password — that is re-entered deliberately.
   */
  values?: SubmittedUserValues;
}

/**
 * DRF returns either {"detail": "..."} or {"field": ["msg", ...]}. Flatten
 * both into something the form can render next to the right input.
 */
function parseApiErrors(data: unknown): UserFormState {
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

async function sendUserRequest(path: string, method: string, body: Record<string, unknown>) {
  const accessToken = await getAccessToken();
  if (!accessToken) return { ok: false, data: { detail: "Your session expired. Sign in again." } };

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    if (response.status === 204) return { ok: true, data: null };
    const data = await response.json().catch(() => null);
    return { ok: response.ok, data };
  } catch {
    return { ok: false, data: { detail: "Couldn't reach the server. Try again shortly." } };
  }
}

function readForm(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  return {
    phone_number: String(formData.get("phone_number") ?? "").trim(),
    full_name: String(formData.get("full_name") ?? "").trim(),
    is_active: formData.get("is_active") === "on",
    is_phone_verified: formData.get("is_phone_verified") === "on",
    is_staff: formData.get("is_staff") === "on",
    password,
  };
}

export async function createUser(
  _prevState: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  const fields = readForm(formData);
  const values: SubmittedUserValues = {
    phone_number: fields.phone_number,
    full_name: fields.full_name,
    is_active: fields.is_active,
    is_phone_verified: fields.is_phone_verified,
    is_staff: fields.is_staff,
  };

  if (!fields.phone_number) {
    return { fieldErrors: { phone_number: "A phone number is required." }, values };
  }

  const payload: Record<string, unknown> = {
    phone_number: fields.phone_number,
    full_name: fields.full_name,
    is_active: fields.is_active,
    is_phone_verified: fields.is_phone_verified,
    is_staff: fields.is_staff,
  };
  // Omitted entirely when blank, so the backend assigns an unusable password
  // rather than receiving an empty string to validate.
  if (fields.password) payload.password = fields.password;

  const { ok, data } = await sendUserRequest("/api/users/", "POST", payload);
  if (!ok) return { ...parseApiErrors(data), values };

  revalidatePath("/users");
  return { success: true };
}

export async function updateUser(
  _prevState: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing user id." };

  const fields = readForm(formData);
  const values: SubmittedUserValues = {
    phone_number: fields.phone_number,
    full_name: fields.full_name,
    is_active: fields.is_active,
    is_phone_verified: fields.is_phone_verified,
    is_staff: fields.is_staff,
  };
  const payload: Record<string, unknown> = {
    phone_number: fields.phone_number,
    full_name: fields.full_name,
    is_active: fields.is_active,
    is_phone_verified: fields.is_phone_verified,
    is_staff: fields.is_staff,
  };
  // Blank means "leave the existing password alone", not "clear it".
  if (fields.password) payload.password = fields.password;

  const { ok, data } = await sendUserRequest(`/api/users/${id}/`, "PATCH", payload);
  if (!ok) return { ...parseApiErrors(data), values };

  revalidatePath("/users");
  return { success: true };
}

/**
 * Activate/deactivate from the row menu. Deactivating is how an account is
 * retired — there is no delete, since removing a user would be blocked by
 * their order history or would cascade away their vendor/runner profile.
 */
export async function setUserActive(id: number, phoneNumber: string, isActive: boolean) {
  const { ok, data } = await sendUserRequest(`/api/users/${id}/`, "PATCH", {
    phone_number: phoneNumber,
    is_active: isActive,
  });

  if (!ok) return parseApiErrors(data);

  revalidatePath("/users");
  return { success: true };
}
