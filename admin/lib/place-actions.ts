"use server";

import { revalidatePath } from "next/cache";
import {
  apiRequest,
  parseApiErrors,
  type ActionResult,
  type FormErrors,
} from "@/lib/admin-api";

const PLACES_PATH = "/places";

// --- zones ----------------------------------------------------------------

export interface SubmittedZoneValues {
  name: string;
  delivery_fee: string;
  commission_pct: string;
  is_active: boolean;
}

export interface ZoneFormState extends FormErrors {
  success?: boolean;
  /** Echoed back on failure so a validation error doesn't wipe the form. */
  values?: SubmittedZoneValues;
}

function readZoneForm(formData: FormData): SubmittedZoneValues {
  return {
    name: String(formData.get("name") ?? "").trim(),
    delivery_fee: String(formData.get("delivery_fee") ?? "").trim(),
    commission_pct: String(formData.get("commission_pct") ?? "").trim(),
    is_active: formData.get("is_active") === "on",
  };
}

function zonePayload(values: SubmittedZoneValues) {
  return {
    name: values.name,
    // Blank means "fall back to the platform default", which the model
    // stores as null — not zero, which would mean free delivery / 0%.
    delivery_fee: values.delivery_fee === "" ? null : values.delivery_fee,
    commission_pct: values.commission_pct === "" ? null : values.commission_pct,
    is_active: values.is_active,
  };
}

export async function createZone(
  _prevState: ZoneFormState,
  formData: FormData,
): Promise<ZoneFormState> {
  const values = readZoneForm(formData);
  const { ok, data } = await apiRequest("/api/zones/", "POST", zonePayload(values));
  if (!ok) return { ...parseApiErrors(data), values };

  revalidatePath(PLACES_PATH);
  return { success: true };
}

export async function updateZone(
  _prevState: ZoneFormState,
  formData: FormData,
): Promise<ZoneFormState> {
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing zone id." };

  const values = readZoneForm(formData);
  const { ok, data } = await apiRequest(`/api/zones/${id}/`, "PATCH", zonePayload(values));
  if (!ok) return { ...parseApiErrors(data), values };

  revalidatePath(PLACES_PATH);
  return { success: true };
}

/**
 * Zones are retired with is_active rather than deleted — buildings, vendors,
 * runners and orders all PROTECT them.
 */
export async function setZoneActive(id: number, isActive: boolean): Promise<ActionResult> {
  const { ok, data } = await apiRequest(`/api/zones/${id}/`, "PATCH", { is_active: isActive });
  if (!ok) return parseApiErrors(data);

  revalidatePath(PLACES_PATH);
  return { success: true };
}

// --- buildings ------------------------------------------------------------

export interface SubmittedBuildingValues {
  name: string;
  zone: string;
  landmark: string;
  entry_details: string;
  is_active: boolean;
}

export interface BuildingFormState extends FormErrors {
  success?: boolean;
  values?: SubmittedBuildingValues;
}

function readBuildingForm(formData: FormData): SubmittedBuildingValues {
  return {
    name: String(formData.get("name") ?? "").trim(),
    zone: String(formData.get("zone") ?? ""),
    landmark: String(formData.get("landmark") ?? "").trim(),
    entry_details: String(formData.get("entry_details") ?? "").trim(),
    is_active: formData.get("is_active") === "on",
  };
}

function buildingPayload(values: SubmittedBuildingValues) {
  return {
    name: values.name,
    zone: Number(values.zone),
    landmark: values.landmark,
    entry_details: values.entry_details,
    is_active: values.is_active,
  };
}

export async function createBuilding(
  _prevState: BuildingFormState,
  formData: FormData,
): Promise<BuildingFormState> {
  const values = readBuildingForm(formData);
  if (!values.zone) return { fieldErrors: { zone: "Choose a zone." }, values };

  const { ok, data } = await apiRequest(
    "/api/locations/buildings/",
    "POST",
    buildingPayload(values),
  );
  if (!ok) return { ...parseApiErrors(data), values };

  revalidatePath(PLACES_PATH);
  return { success: true };
}

export async function updateBuilding(
  _prevState: BuildingFormState,
  formData: FormData,
): Promise<BuildingFormState> {
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing building id." };

  const values = readBuildingForm(formData);
  if (!values.zone) return { fieldErrors: { zone: "Choose a zone." }, values };

  const { ok, data } = await apiRequest(
    `/api/locations/buildings/${id}/`,
    "PATCH",
    buildingPayload(values),
  );
  if (!ok) return { ...parseApiErrors(data), values };

  revalidatePath(PLACES_PATH);
  // A vendor's pickup building lives on the vendor page too.
  revalidatePath("/vendors");
  return { success: true };
}

/**
 * Buildings are deactivated rather than deleted — saved delivery locations
 * and vendor pickup points PROTECT them, and the model's own help_text says
 * to deactivate a mis-registered building.
 */
export async function setBuildingActive(id: number, isActive: boolean): Promise<ActionResult> {
  const { ok, data } = await apiRequest(`/api/locations/buildings/${id}/`, "PATCH", {
    is_active: isActive,
  });
  if (!ok) return parseApiErrors(data);

  revalidatePath(PLACES_PATH);
  return { success: true };
}
