"use client";

import { useState, useTransition } from "react";
import { ConfirmDialog } from "@/components/FormDialog";
import type { MenuItem } from "@/lib/dal";
import { setMenuItemAvailable } from "@/lib/menu-actions";
import MenuItemDialog from "./MenuItemDialog";

export function MenuItemActions({ item, vendorId }: { item: MenuItem; vendorId: number }) {
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const setAvailable = (next: boolean) => {
    setError(null);
    startTransition(async () => {
      const result = await setMenuItemAvailable(item.id, vendorId, next);
      if (result?.error) setError(result.error);
      else if (result?.fieldErrors) setError(Object.values(result.fieldErrors)[0]);
      setConfirming(false);
    });
  };

  return (
    <>
      <div className="flex items-center gap-1">
        {error && (
          <span title={error} className="material-symbols-outlined text-[18px] text-error">
            error
          </span>
        )}
        <button
          onClick={() => setEditing(true)}
          title="Edit dish"
          className="rounded-md p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-zest-orange"
        >
          <span className="material-symbols-outlined text-[20px]">edit</span>
        </button>
        {item.is_available ? (
          <button
            onClick={() => setConfirming(true)}
            disabled={pending}
            title="Mark unavailable"
            className="rounded-md p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-error disabled:opacity-30"
          >
            <span className="material-symbols-outlined text-[20px]">visibility_off</span>
          </button>
        ) : (
          <button
            onClick={() => setAvailable(true)}
            disabled={pending}
            title="Mark available"
            className="rounded-md p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-secondary disabled:opacity-30"
          >
            <span className="material-symbols-outlined text-[20px]">visibility</span>
          </button>
        )}
      </div>

      <MenuItemDialog
        open={editing}
        onClose={() => setEditing(false)}
        item={item}
        vendorId={vendorId}
      />

      {confirming && (
        <ConfirmDialog
          title={`Mark “${item.dish_name}” unavailable?`}
          body="Customers won't see it while it's off. It stays on this menu and keeps its order history, so you can switch it back on any time."
          confirmLabel="Mark unavailable"
          pending={pending}
          onCancel={() => setConfirming(false)}
          onConfirm={() => setAvailable(false)}
        />
      )}
    </>
  );
}

export function AddDishButton({ vendorId }: { vendorId: number }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-md bg-zest-orange px-6 py-3 font-label-md text-label-md text-on-primary shadow-sm transition-colors hover:bg-zest-orange-container"
      >
        <span className="material-symbols-outlined">add</span>
        Add Dish
      </button>
      <MenuItemDialog open={open} onClose={() => setOpen(false)} item={null} vendorId={vendorId} />
    </>
  );
}
