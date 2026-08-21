"use client";

import { useActionState, useEffect, useRef } from "react";
import { DialogFooter, DialogShell, Field, FormError, Toggle } from "@/components/FormDialog";
import type { ZoneDetail } from "@/lib/dal";
import { createZone, updateZone, type ZoneFormState } from "@/lib/place-actions";

const EMPTY: ZoneFormState = {};

export default function ZoneFormDialog({
  open,
  onClose,
  zone,
}: {
  open: boolean;
  onClose: () => void;
  /** Null when creating. */
  zone: ZoneDetail | null;
}) {
  const isEdit = zone !== null;
  const [state, formAction, pending] = useActionState(isEdit ? updateZone : createZone, EMPTY);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (state.success) closeRef.current();
  }, [state.success]);

  if (!open) return null;

  const errors = state.fieldErrors ?? {};
  const submitted = state.values;

  return (
    <DialogShell title={isEdit ? "Edit zone" : "New zone"} onClose={onClose}>
      <form
        key={submitted ? "resubmit" : "initial"}
        action={formAction}
        className="space-y-5 px-stack-lg py-stack-md"
      >
        {isEdit && <input type="hidden" name="id" value={zone.id} />}

        <FormError message={state.error} />

        <Field
          label="Zone name"
          name="name"
          required
          defaultValue={submitted?.name ?? zone?.name ?? ""}
          placeholder="Kilimani"
          error={errors.name}
          hint="A town or neighbourhood you operate in."
        />

        <Field
          label="Delivery fee"
          name="delivery_fee"
          inputMode="decimal"
          defaultValue={submitted?.delivery_fee ?? zone?.delivery_fee ?? ""}
          placeholder="Platform default"
          error={errors.delivery_fee}
          hint="Flat fee for this zone. Leave blank to use the platform default."
        />

        <Field
          label="Commission %"
          name="commission_pct"
          inputMode="decimal"
          defaultValue={submitted?.commission_pct ?? zone?.commission_pct ?? ""}
          placeholder="Platform default"
          error={errors.commission_pct}
          hint="Default vendor commission here. A vendor's own rate overrides it."
        />

        <Toggle
          name="is_active"
          label="Active"
          defaultChecked={submitted?.is_active ?? zone?.is_active ?? true}
          description="Inactive zones are hidden from signup and search, but keep their history."
        />

        <DialogFooter
          onCancel={onClose}
          pending={pending}
          submitLabel={isEdit ? "Save changes" : "Create zone"}
        />
      </form>
    </DialogShell>
  );
}
