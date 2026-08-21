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
import UserPicker from "@/components/UserPicker";
import type { Runner, Zone } from "@/lib/dal";
import { createRunner, updateRunner, type RunnerFormState } from "@/lib/runner-actions";

const EMPTY: RunnerFormState = {};

export default function RunnerFormDialog({
  open,
  onClose,
  runner,
  zones,
}: {
  open: boolean;
  onClose: () => void;
  /** Null when creating. */
  runner: Runner | null;
  zones: Zone[];
}) {
  const isEdit = runner !== null;
  const [state, formAction, pending] = useActionState(
    isEdit ? updateRunner : createRunner,
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
    <DialogShell title={isEdit ? "Edit runner" : "Onboard runner"} onClose={onClose}>
      <form
        key={submitted ? "resubmit" : "initial"}
        action={formAction}
        className="space-y-5 px-stack-lg py-stack-md"
      >
        {isEdit && <input type="hidden" name="id" value={runner.id} />}

        <FormError message={state.error} />

        {isEdit ? (
          <Field
            label="Runner"
            name="runner_display"
            readOnly
            defaultValue={`${runner.user_phone}${
              runner.user_full_name ? ` — ${runner.user_full_name}` : ""
            }`}
            hint="The account this profile belongs to can't be reassigned here."
          />
        ) : (
          <UserPicker
            role="runner"
            error={errors.user}
            hint="Only accounts without a runner profile are listed."
          />
        )}

        <SelectField
          label="Zone"
          name="zone"
          placeholder="Select a zone"
          defaultValue={submitted?.zone ?? (runner ? String(runner.zone) : "")}
          options={zones.map((zone) => ({ value: String(zone.id), label: zone.name }))}
          error={errors.zone}
        />

        <Toggle
          name="is_approved"
          label="Approved"
          defaultChecked={submitted?.is_approved ?? runner?.is_approved ?? false}
          description="Unapproved runners can't go online or claim delivery jobs."
        />

        {isEdit && (
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Online status is controlled by the runner in their own app, so it isn&apos;t
            editable here — they&apos;re currently{" "}
            <span className="text-on-surface">{runner.is_online ? "online" : "offline"}</span>.
          </p>
        )}

        <DialogFooter
          onCancel={onClose}
          pending={pending}
          submitLabel={isEdit ? "Save changes" : "Onboard runner"}
        />
      </form>
    </DialogShell>
  );
}
