"use client";

import { useEffect, useRef } from "react";

/** Shared modal chrome: backdrop, escape-to-close, header, scroll container. */
export function DialogShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

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
        aria-label={title}
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-surface-container-highest bg-surface-container-lowest shadow-elevated"
      >
        <div className="flex items-center justify-between border-b border-surface-container-high px-stack-lg py-stack-md">
          <h2 className="font-headline-sm text-headline-sm text-on-surface">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

const inputClass = (error?: string) =>
  `w-full rounded-md border bg-surface-container-lowest px-4 py-2 font-body-md text-on-surface outline-none transition-all placeholder:text-on-surface-variant/50 focus:ring-0 ${
    error ? "border-error" : "border-outline-variant focus:border-zest-orange"
  }`;

export function Field({
  label,
  name,
  type = "text",
  defaultValue,
  placeholder,
  required,
  error,
  hint,
  readOnly,
  inputMode,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  readOnly?: boolean;
  inputMode?: "text" | "decimal" | "tel";
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-2 block font-label-md text-label-md text-on-surface">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        inputMode={inputMode}
        required={required}
        readOnly={readOnly}
        defaultValue={defaultValue}
        placeholder={placeholder}
        autoComplete="off"
        aria-invalid={error ? true : undefined}
        className={`${inputClass(error)} ${readOnly ? "opacity-60" : ""}`}
      />
      {error ? (
        <p className="mt-1 font-body-sm text-body-sm text-error">{error}</p>
      ) : hint ? (
        <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">{hint}</p>
      ) : null}
    </div>
  );
}

export function SelectField({
  label,
  name,
  defaultValue,
  options,
  error,
  hint,
  placeholder,
  disabled,
  onChange,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  options: { value: string; label: string }[];
  error?: string;
  hint?: string;
  placeholder?: string;
  disabled?: boolean;
  /** Supplied when a parent needs to react to the choice (e.g. to reload a
   *  dependent list). Makes the select controlled. */
  onChange?: (value: string) => void;
}) {
  const controlled = onChange !== undefined;
  return (
    <div>
      <label htmlFor={name} className="mb-2 block font-label-md text-label-md text-on-surface">
        {label}
      </label>
      <select
        id={name}
        name={name}
        disabled={disabled}
        {...(controlled
          ? { value: defaultValue ?? "", onChange: (e) => onChange(e.target.value) }
          : { defaultValue: defaultValue ?? "" })}
        aria-invalid={error ? true : undefined}
        className={`${inputClass(error)} cursor-pointer ${disabled ? "opacity-60" : ""}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? (
        <p className="mt-1 font-body-sm text-body-sm text-error">{error}</p>
      ) : hint ? (
        <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">{hint}</p>
      ) : null}
    </div>
  );
}

export function Toggle({
  label,
  name,
  defaultChecked,
  description,
}: {
  label: string;
  name: string;
  defaultChecked?: boolean;
  description: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-md border border-surface-container-high p-3 hover:bg-surface-container-low">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="mt-0.5 h-5 w-5 rounded border-outline-variant text-zest-orange focus:ring-zest-orange"
      />
      <span>
        <span className="block font-label-md text-label-md text-on-surface">{label}</span>
        <span className="block font-body-sm text-body-sm text-on-surface-variant">
          {description}
        </span>
      </span>
    </label>
  );
}

export function DialogFooter({
  onCancel,
  pending,
  submitLabel,
}: {
  onCancel: () => void;
  pending: boolean;
  submitLabel: string;
}) {
  return (
    <div className="flex justify-end gap-3 border-t border-surface-container-high pt-stack-md">
      <button
        type="button"
        onClick={onCancel}
        className="rounded-md border border-outline-variant px-5 py-2.5 font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-container"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={pending}
        className="flex items-center gap-2 rounded-md bg-zest-orange px-5 py-2.5 font-label-md text-label-md text-on-primary shadow-sm transition-colors hover:bg-zest-orange-container disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Saving..." : submitLabel}
      </button>
    </div>
  );
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div className="rounded-md border border-error/30 bg-error-container/40 px-4 py-3 font-body-sm text-body-sm text-on-error-container">
      {message}
    </div>
  );
}

/** Confirmation modal used before retiring a vendor/runner/user. */
export function ConfirmDialog({
  title,
  body,
  confirmLabel,
  pending,
  onCancel,
  onConfirm,
}: {
  title: string;
  body: string;
  confirmLabel: string;
  pending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        aria-label="Cancel"
        onClick={onCancel}
        className="absolute inset-0 cursor-default bg-inverse-surface/40"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md rounded-xl border border-surface-container-highest bg-surface-container-lowest p-stack-lg shadow-elevated"
      >
        <h2 className="mb-2 font-headline-sm text-headline-sm text-on-surface">{title}</h2>
        <p className="mb-stack-md font-body-md text-body-md text-on-surface-variant">{body}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-md border border-outline-variant px-5 py-2.5 font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-container"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={pending}
            className="rounded-md bg-error px-5 py-2.5 font-label-md text-label-md text-on-error shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {pending ? "Working..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
