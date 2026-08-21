"use server";

import { revalidatePath } from "next/cache";
import {
  apiRequest,
  parseApiErrors,
  type ActionResult,
  type FormErrors,
} from "@/lib/admin-api";

export interface SubmittedRunnerValues {
  /** Selected account id, as a string (form values always are). */
  user: string;
  zone: string;
  is_approved: boolean;
}

export interface RunnerFormState extends FormErrors {
  success?: boolean;
  /** Echoed back on failure so a validation error doesn't wipe the form. */
  values?: SubmittedRunnerValues;
}

function readForm(formData: FormData): SubmittedRunnerValues {
  return {
    user: String(formData.get("user") ?? ""),
    zone: String(formData.get("zone") ?? ""),
    is_approved: formData.get("is_approved") === "on",
  };
}

export async function createRunner(
  _prevState: RunnerFormState,
  formData: FormData,
): Promise<RunnerFormState> {
  const values = readForm(formData);

  if (!values.user) {
    return { fieldErrors: { user: "Choose the runner's account." }, values };
  }
  if (!values.zone) {
    return { fieldErrors: { zone: "Choose a zone." }, values };
  }

  const { ok, data } = await apiRequest("/api/runners/profiles/", "POST", {
    user: Number(values.user),
    zone: Number(values.zone),
    is_approved: values.is_approved,
  });
  if (!ok) return { ...parseApiErrors(data), values };

  revalidatePath("/runners");
  return { success: true };
}

export async function updateRunner(
  _prevState: RunnerFormState,
  formData: FormData,
): Promise<RunnerFormState> {
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing runner id." };

  const values = readForm(formData);
  if (!values.zone) {
    return { fieldErrors: { zone: "Choose a zone." }, values };
  }

  // is_online is deliberately absent: the runner controls that from their
  // own app, and forcing it from here would misrepresent availability.
  const { ok, data } = await apiRequest(`/api/runners/profiles/${id}/`, "PATCH", {
    zone: Number(values.zone),
    is_approved: values.is_approved,
  });
  if (!ok) return { ...parseApiErrors(data), values };

  revalidatePath("/runners");
  return { success: true };
}

/**
 * Approval is the retire switch: an unapproved runner can't go online or
 * claim jobs, while their delivery history is preserved. There is no delete.
 */
export async function setRunnerApproved(id: number, isApproved: boolean): Promise<ActionResult> {
  const { ok, data } = await apiRequest(`/api/runners/profiles/${id}/`, "PATCH", {
    is_approved: isApproved,
  });

  if (!ok) return parseApiErrors(data);

  revalidatePath("/runners");
  return { success: true };
}
