"use server";

import { revalidatePath } from "next/cache";
import { parseApiErrors, type ActionResult, type FormErrors } from "@/lib/admin-api";
import { getAccessToken } from "@/lib/session";

const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:8000";

export interface SubmittedMenuItemValues {
  dish_name: string;
  description: string;
  price: string;
  is_available: boolean;
}

export interface MenuItemFormState extends FormErrors {
  success?: boolean;
  /** Echoed back on failure so a validation error doesn't wipe the form.
   *  The chosen file can't be echoed back — browsers won't let us re-populate
   *  a file input — so the form warns when one needs re-picking. */
  values?: SubmittedMenuItemValues;
  imageNeedsReselect?: boolean;
}

/**
 * Menu items carry an uploaded photo, so these go up as multipart/form-data
 * rather than JSON. `fetch` sets the multipart boundary itself — passing an
 * explicit Content-Type here would produce a malformed body.
 */
async function sendMultipart(path: string, method: string, body: FormData) {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return { ok: false, data: { detail: "Your session expired. Sign in again." } };
  }

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: { Authorization: `Bearer ${accessToken}` },
      body,
      cache: "no-store",
    });
    if (response.status === 204) return { ok: true, data: null };
    const data = await response.json().catch(() => null);
    return { ok: response.ok, data };
  } catch {
    return { ok: false, data: { detail: "Couldn't reach the server. Try again shortly." } };
  }
}

function readForm(formData: FormData): SubmittedMenuItemValues {
  return {
    dish_name: String(formData.get("dish_name") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    price: String(formData.get("price") ?? "").trim(),
    is_available: formData.get("is_available") === "on",
  };
}

function buildUpload(values: SubmittedMenuItemValues, image: File | null, vendorId?: number) {
  const upload = new FormData();
  if (vendorId !== undefined) upload.set("vendor", String(vendorId));
  upload.set("dish_name", values.dish_name);
  upload.set("description", values.description);
  upload.set("price", values.price);
  upload.set("is_available", String(values.is_available));
  // Only sent when a new file was picked — otherwise the existing photo stays.
  if (image && image.size > 0) upload.set("image", image);
  return upload;
}

function pickedImage(formData: FormData) {
  const image = formData.get("image");
  return image instanceof File && image.size > 0 ? image : null;
}

export async function createMenuItem(
  _prevState: MenuItemFormState,
  formData: FormData,
): Promise<MenuItemFormState> {
  const vendorId = Number(formData.get("vendor") ?? 0);
  if (!vendorId) return { error: "Missing vendor." };

  const values = readForm(formData);
  const image = pickedImage(formData);

  const { ok, data } = await sendMultipart(
    "/api/vendors/menu-items/",
    "POST",
    buildUpload(values, image, vendorId),
  );
  if (!ok) return { ...parseApiErrors(data), values, imageNeedsReselect: image !== null };

  revalidatePath(`/vendors/${vendorId}`);
  revalidatePath("/vendors");
  return { success: true };
}

export async function updateMenuItem(
  _prevState: MenuItemFormState,
  formData: FormData,
): Promise<MenuItemFormState> {
  const id = String(formData.get("id") ?? "");
  const vendorId = Number(formData.get("vendor") ?? 0);
  if (!id) return { error: "Missing menu item id." };

  const values = readForm(formData);
  const image = pickedImage(formData);

  const { ok, data } = await sendMultipart(
    `/api/vendors/menu-items/${id}/`,
    "PATCH",
    buildUpload(values, image),
  );
  if (!ok) return { ...parseApiErrors(data), values, imageNeedsReselect: image !== null };

  revalidatePath(`/vendors/${vendorId}`);
  revalidatePath("/vendors");
  return { success: true };
}

/**
 * Availability is how a dish leaves the menu — vendors toggle this when
 * they sell out, and there's no delete, so past orders keep their reference.
 */
export async function setMenuItemAvailable(
  id: number,
  vendorId: number,
  isAvailable: boolean,
): Promise<ActionResult> {
  const upload = new FormData();
  upload.set("is_available", String(isAvailable));

  const { ok, data } = await sendMultipart(
    `/api/vendors/menu-items/${id}/`,
    "PATCH",
    upload,
  );
  if (!ok) return parseApiErrors(data);

  revalidatePath(`/vendors/${vendorId}`);
  revalidatePath("/vendors");
  return { success: true };
}
