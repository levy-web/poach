"use client";

import { useActionState, useEffect, useRef } from "react";
import { createUser, updateUser, type UserFormState } from "@/lib/user-actions";
import type { PlatformUser } from "@/lib/dal";

const EMPTY: UserFormState = {};

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  placeholder,
  required,
  error,
  hint,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block font-label-md text-label-md text-on-surface"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        className={`w-full rounded-md border bg-surface-container-lowest px-4 py-2 font-body-md text-on-surface outline-none transition-all placeholder:text-on-surface-variant/50 focus:ring-0 ${
          error ? "border-error" : "border-outline-variant focus:border-zest-orange"
        }`}
      />
      {error ? (
        <p className="mt-1 font-body-sm text-body-sm text-error">{error}</p>
      ) : hint ? (
        <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">{hint}</p>
      ) : null}
    </div>
  );
}

function Toggle({
  label,
  name,
  defaultChecked,
  description,
  disabled,
  disabledReason,
}: {
  label: string;
  name: string;
  defaultChecked?: boolean;
  description: string;
  disabled?: boolean;
  disabledReason?: string;
}) {
  return (
    <label
      className={`flex items-start gap-3 rounded-md border border-surface-container-high p-3 ${
        disabled ? "opacity-60" : "cursor-pointer hover:bg-surface-container-low"
      }`}
    >
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        disabled={disabled}
        className="mt-0.5 h-5 w-5 rounded border-outline-variant text-zest-orange focus:ring-zest-orange"
      />
      <span>
        <span className="block font-label-md text-label-md text-on-surface">{label}</span>
        <span className="block font-body-sm text-body-sm text-on-surface-variant">
          {disabled && disabledReason ? disabledReason : description}
        </span>
      </span>
    </label>
  );
}

export default function UserFormDialog({
  open,
  onClose,
  user,
  canManageStaff,
  isSelf,
}: {
  open: boolean;
  onClose: () => void;
  /** Null when creating. */
  user: PlatformUser | null;
  canManageStaff: boolean;
  isSelf: boolean;
}) {
  const isEdit = user !== null;
  const [state, formAction, pending] = useActionState(
    isEdit ? updateUser : createUser,
    EMPTY,
  );
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (state.success) closeRef.current();
  }, [state.success]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;

  const fieldErrors = state.fieldErrors ?? {};
  // Prefer what was just submitted (a failed attempt), then the row being
  // edited, then the create-form default — so a validation error never
  // discards the admin's typing.
  const submitted = state.values;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-inverse-surface/40"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-dialog-title"
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-surface-container-highest bg-surface-container-lowest shadow-elevated"
      >
        <div className="flex items-center justify-between border-b border-surface-container-high px-stack-lg py-stack-md">
          <h2
            id="user-dialog-title"
            className="font-headline-sm text-headline-sm text-on-surface"
          >
            {isEdit ? "Edit user" : "New user"}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form
          key={submitted ? "resubmit" : "initial"}
          action={formAction}
          className="space-y-5 px-stack-lg py-stack-md"
        >
          {isEdit && <input type="hidden" name="id" value={user.id} />}

          {state.error && (
            <div className="rounded-md border border-error/30 bg-error-container/40 px-4 py-3 font-body-sm text-body-sm text-on-error-container">
              {state.error}
            </div>
          )}

          <Field
            label="Phone number"
            name="phone_number"
            type="tel"
            required
            autoComplete="off"
            defaultValue={submitted?.phone_number ?? user?.phone_number ?? ""}
            placeholder="0712345678"
            error={fieldErrors.phone_number}
            hint="Kenyan formats are normalized automatically."
          />

          <Field
            label="Full name"
            name="full_name"
            defaultValue={submitted?.full_name ?? user?.full_name ?? ""}
            placeholder="Jane Wanjiku"
            error={fieldErrors.full_name}
          />

          <Field
            label={isEdit ? "New password" : "Initial password"}
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="Leave blank to skip"
            error={fieldErrors.password}
            hint={
              isEdit
                ? "Leave blank to keep the current password. Changing it signs them out everywhere."
                : "Leave blank and they'll set one via the SMS reset flow."
            }
          />

          <div className="space-y-3">
            <Toggle
              name="is_active"
              label="Active"
              defaultChecked={submitted?.is_active ?? user?.is_active ?? true}
              description="Inactive accounts can't sign in. This is how an account is retired."
              disabled={isEdit && isSelf}
              disabledReason="You can't deactivate your own account."
            />
            <Toggle
              name="is_phone_verified"
              label="Phone verified"
              defaultChecked={submitted?.is_phone_verified ?? user?.is_phone_verified ?? false}
              description="Marks the number as confirmed without running the OTP flow."
            />
            <Toggle
              name="is_staff"
              label="Admin access"
              defaultChecked={submitted?.is_staff ?? user?.is_staff ?? false}
              description="Can sign in to this console and manage every account."
              disabled={!canManageStaff || (isEdit && isSelf)}
              disabledReason={
                isEdit && isSelf
                  ? "You can't change your own admin access."
                  : "Only a superuser can grant or revoke admin access."
              }
            />
          </div>

          {fieldErrors.is_staff && (
            <p className="font-body-sm text-body-sm text-error">{fieldErrors.is_staff}</p>
          )}
          {fieldErrors.is_active && (
            <p className="font-body-sm text-body-sm text-error">{fieldErrors.is_active}</p>
          )}

          <div className="flex justify-end gap-3 border-t border-surface-container-high pt-stack-md">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-outline-variant px-5 py-2.5 font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-container"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className="flex items-center gap-2 rounded-md bg-zest-orange px-5 py-2.5 font-label-md text-label-md text-on-primary shadow-sm transition-colors hover:bg-zest-orange-container disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? "Saving..." : isEdit ? "Save changes" : "Create user"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
