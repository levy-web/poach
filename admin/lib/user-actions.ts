"use server";

import { revalidatePath } from "next/cache";
import { apiRequest, parseApiErrors, type ActionResult } from "@/lib/admin-api";

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

  const { ok, data } = await apiRequest("/api/users/", "POST", payload);
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

  const { ok, data } = await apiRequest(`/api/users/${id}/`, "PATCH", payload);
  if (!ok) return { ...parseApiErrors(data), values };

  revalidatePath("/users");
  return { success: true };
}

/**
 * Activate/deactivate from the row menu. Deactivating is how an account is
 * retired — there is no delete, since removing a user would be blocked by
 * their order history or would cascade away their vendor/runner profile.
 */
export async function setUserActive(id: number, phoneNumber: string, isActive: boolean): Promise<ActionResult> {
  const { ok, data } = await apiRequest(`/api/users/${id}/`, "PATCH", {
    phone_number: phoneNumber,
    is_active: isActive,
  });

  if (!ok) return parseApiErrors(data);

  revalidatePath("/users");
  return { success: true };
}
