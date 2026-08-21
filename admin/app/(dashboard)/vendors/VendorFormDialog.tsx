"use client";

import { useActionState, useEffect, useRef } from "react";
import { DialogFooter, DialogShell, Field, FormError, Toggle } from "@/components/FormDialog";
import UserPicker from "@/components/UserPicker";
import type { Vendor, Zone } from "@/lib/dal";
import ZoneBuildingFields from "./ZoneBuildingFields";
import { createVendor, updateVendor, type VendorFormState } from "@/lib/vendor-actions";

const EMPTY: VendorFormState = {};

export default function VendorFormDialog({
  open,
  onClose,
  vendor,
  zones,
}: {
  open: boolean;
  onClose: () => void;
  /** Null when creating. */
  vendor: Vendor | null;
  zones: Zone[];
}) {
  const isEdit = vendor !== null;
  const [state, formAction, pending] = useActionState(
    isEdit ? updateVendor : createVendor,
    EMPTY,
  );
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (state.success) closeRef.current();
  }, [state.success]);

  if (!open) return null;

  const errors = state.fieldErrors ?? {};
  // Prefer the just-submitted values (a failed attempt), then the row being
  // edited — so a validation error never discards the admin's typing.
  const submitted = state.values;

  return (
    <DialogShell title={isEdit ? "Edit vendor" : "New vendor"} onClose={onClose}>
      <form
        key={submitted ? "resubmit" : "initial"}
        action={formAction}
        className="space-y-5 px-stack-lg py-stack-md"
      >
        {isEdit && <input type="hidden" name="id" value={vendor.id} />}

        <FormError message={state.error} />

        {isEdit ? (
          <Field
            label="Owner"
            name="owner_display"
            readOnly
            defaultValue={`${vendor.user_phone}${
              vendor.user_full_name ? ` — ${vendor.user_full_name}` : ""
            }`}
            hint="The account this vendor belongs to can't be reassigned here."
          />
        ) : (
          <UserPicker
            role="vendor"
            error={errors.user}
            hint="Only accounts without a vendor profile are listed."
          />
        )}

        <Field
          label="Business name"
          name="business_name"
          required
          defaultValue={submitted?.business_name ?? vendor?.business_name ?? ""}
          placeholder="Corner Cafe"
          error={errors.business_name}
        />

        <ZoneBuildingFields
          zones={zones}
          initialZone={submitted?.zone ?? (vendor ? String(vendor.zone) : "")}
          initialBuilding={
            submitted?.pickup_building ??
            (vendor?.pickup_building ? String(vendor.pickup_building) : "")
          }
          zoneError={errors.zone}
          buildingError={errors.pickup_building}
        />

        <Field
          label="Commission %"
          name="commission_pct"
          inputMode="decimal"
          defaultValue={submitted?.commission_pct ?? vendor?.commission_pct ?? ""}
          placeholder="Inherit zone default"
          error={errors.commission_pct}
          hint="Leave blank to use the zone's default rate."
        />

        <Toggle
          name="is_approved"
          label="Approved"
          defaultChecked={submitted?.is_approved ?? vendor?.is_approved ?? false}
          description="Unapproved vendors are hidden from customers and can't take orders."
        />

        <DialogFooter
          onCancel={onClose}
          pending={pending}
          submitLabel={isEdit ? "Save changes" : "Create vendor"}
        />
      </form>
    </DialogShell>
  );
}
