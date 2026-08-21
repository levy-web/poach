"use server";

import { revalidatePath } from "next/cache";
import {
  apiRequest,
  parseApiErrors,
  type ActionResult,
  type FormErrors,
} from "@/lib/admin-api";

export interface SubmittedVendorValues {
  /** Selected account id, as a string (form values always are). */
  user: string;
  business_name: string;
  zone: string;
  pickup_building: string;
  commission_pct: string;
  is_approved: boolean;
}

export interface VendorFormState extends FormErrors {
  success?: boolean;
  /**
   * Echoed back on failure. React 19 resets uncontrolled inputs once a form
   * action settles, so without this a validation error would wipe the form.
   */
  values?: SubmittedVendorValues;
}

function readForm(formData: FormData): SubmittedVendorValues {
  return {
    user: String(formData.get("user") ?? ""),
    business_name: String(formData.get("business_name") ?? "").trim(),
    zone: String(formData.get("zone") ?? ""),
    pickup_building: String(formData.get("pickup_building") ?? ""),
    commission_pct: String(formData.get("commission_pct") ?? "").trim(),
    is_approved: formData.get("is_approved") === "on",
  };
}

function buildPayload(values: SubmittedVendorValues, isEdit: boolean) {
  const payload: Record<string, unknown> = {
    business_name: values.business_name,
    zone: values.zone ? Number(values.zone) : null,
    // Empty means "no pickup building recorded yet", which the model stores
    // as null rather than a dangling id.
    pickup_building: values.pickup_building ? Number(values.pickup_building) : null,
    is_approved: values.is_approved,
    // Blank means "inherit the zone's default", which the backend models as
    // null — not zero, which would mean a 0% commission.
    commission_pct: values.commission_pct === "" ? null : values.commission_pct,
  };
  // The owner is set at creation; reassigning an existing profile to a
  // different account isn't something this form offers.
  if (!isEdit) payload.user = Number(values.user);
  return payload;
}

export async function createVendor(
  _prevState: VendorFormState,
  formData: FormData,
): Promise<VendorFormState> {
  const values = readForm(formData);

  if (!values.user) {
    return { fieldErrors: { user: "Choose the owner's account." }, values };
  }
  if (!values.zone) {
    return { fieldErrors: { zone: "Choose a zone." }, values };
  }

  const { ok, data } = await apiRequest(
    "/api/vendors/profiles/",
    "POST",
    buildPayload(values, false),
  );
  if (!ok) return { ...parseApiErrors(data), values };

  revalidatePath("/vendors");
  return { success: true };
}

export async function updateVendor(
  _prevState: VendorFormState,
  formData: FormData,
): Promise<VendorFormState> {
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing vendor id." };

  const values = readForm(formData);
  if (!values.zone) {
    return { fieldErrors: { zone: "Choose a zone." }, values };
  }

  const { ok, data } = await apiRequest(
    `/api/vendors/profiles/${id}/`,
    "PATCH",
    buildPayload(values, true),
  );
  if (!ok) return { ...parseApiErrors(data), values };

  revalidatePath("/vendors");
  return { success: true };
}

/**
 * Approval is the retire switch: an unapproved vendor disappears from
 * customer listings and can't take orders, while keeping their menu and
 * order history. There is no delete.
 */
export async function setVendorApproved(id: number, isApproved: boolean): Promise<ActionResult> {
  const { ok, data } = await apiRequest(`/api/vendors/profiles/${id}/`, "PATCH", {
    is_approved: isApproved,
  });

  if (!ok) return parseApiErrors(data);

  revalidatePath("/vendors");
  return { success: true };
}
