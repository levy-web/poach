"use client";

import { useState, useTransition } from "react";
import { ConfirmDialog } from "@/components/FormDialog";
import type { Vendor, Zone } from "@/lib/dal";
import { setVendorApproved } from "@/lib/vendor-actions";
import VendorFormDialog from "./VendorFormDialog";

export default function VendorsTableActions({
  vendor,
  zones,
}: {
  vendor: Vendor;
  zones: Zone[];
}) {
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const setApproved = (next: boolean) => {
    setError(null);
    startTransition(async () => {
      const result = await setVendorApproved(vendor.id, next);
      if (result?.error) setError(result.error);
      else if (result?.fieldErrors) setError(Object.values(result.fieldErrors)[0]);
      setConfirming(false);
    });
  };

  return (
    <>
      <div className="flex items-center justify-end gap-1">
        {error && (
          <span title={error} className="material-symbols-outlined text-[18px] text-error">
            error
          </span>
        )}

        <button
          onClick={() => setEditing(true)}
          title="Edit vendor"
          className="rounded-md p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-zest-orange"
        >
          <span className="material-symbols-outlined text-[20px]">edit</span>
        </button>

        {vendor.is_approved ? (
          <button
            onClick={() => setConfirming(true)}
            disabled={pending}
            title="Suspend vendor"
            className="rounded-md p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-error disabled:opacity-30"
          >
            <span className="material-symbols-outlined text-[20px]">block</span>
          </button>
        ) : (
          <button
            onClick={() => setApproved(true)}
            disabled={pending}
            title="Approve vendor"
            className="rounded-md p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-green-700 disabled:opacity-30"
          >
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
          </button>
        )}
      </div>

      <VendorFormDialog
        open={editing}
        onClose={() => setEditing(false)}
        vendor={vendor}
        zones={zones}
      />

      {confirming && (
        <ConfirmDialog
          title={`Suspend ${vendor.business_name}?`}
          body="They'll be hidden from customers and can't receive new orders. Their menu and order history are kept, and you can approve them again at any time."
          confirmLabel="Suspend"
          pending={pending}
          onCancel={() => setConfirming(false)}
          onConfirm={() => setApproved(false)}
        />
      )}
    </>
  );
}
