"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  DialogFooter,
  DialogShell,
  Field,
  FormError,
  SelectField,
  Toggle,
} from "@/components/FormDialog";
import type { Building, Zone } from "@/lib/dal";
import { createBuilding, updateBuilding, type BuildingFormState } from "@/lib/place-actions";

const EMPTY: BuildingFormState = {};

export default function BuildingFormDialog({
  open,
  onClose,
  building,
  zones,
  defaultZone = "",
}: {
  open: boolean;
  onClose: () => void;
  /** Null when creating. */
  building: Building | null;
  zones: Zone[];
  /** Pre-selects the zone currently being filtered by. */
  defaultZone?: string;
}) {
  const isEdit = building !== null;
  const [state, formAction, pending] = useActionState(
    isEdit ? updateBuilding : createBuilding,
    EMPTY,
  );
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (state.success) closeRef.current();
  }, [state.success]);

  if (!open) return null;

  const errors = state.fieldErrors ?? {};
  const submitted = state.values;

  return (
    <DialogShell title={isEdit ? "Edit building" : "New building"} onClose={onClose}>
      <form
        key={submitted ? "resubmit" : "initial"}
        action={formAction}
        className="space-y-5 px-stack-lg py-stack-md"
      >
        {isEdit && <input type="hidden" name="id" value={building.id} />}

        <FormError message={state.error} />

        <Field
          label="Building name"
          name="name"
          required
          defaultValue={submitted?.name ?? building?.name ?? ""}
          placeholder="Green Court Apartments"
          error={errors.name}
          hint="Must be unique within its zone."
        />

        <SelectField
          label="Zone"
          name="zone"
          placeholder="Select a zone"
          defaultValue={submitted?.zone ?? (building ? String(building.zone) : defaultZone)}
          options={zones.map((zone) => ({ value: String(zone.id), label: zone.name }))}
          error={errors.zone}
        />

        <Field
          label="Landmark"
          name="landmark"
          defaultValue={submitted?.landmark ?? building?.landmark ?? ""}
          placeholder="Opposite the green kiosk, blue gate"
          error={errors.landmark}
          hint="How a runner on foot finds it — there are no GPS coordinates."
        />

        <Field
          label="Entry details"
          name="entry_details"
          defaultValue={submitted?.entry_details ?? building?.entry_details ?? ""}
          placeholder="Ask for the caretaker at the gate"
          error={errors.entry_details}
          hint="Gate or security instructions for gated compounds."
        />

        <Toggle
          name="is_active"
          label="Active"
          defaultChecked={submitted?.is_active ?? building?.is_active ?? true}
          description="Deactivate rather than delete if a building is mis-registered."
        />

        <DialogFooter
          onCancel={onClose}
          pending={pending}
          submitLabel={isEdit ? "Save changes" : "Create building"}
        />
      </form>
    </DialogShell>
  );
}
