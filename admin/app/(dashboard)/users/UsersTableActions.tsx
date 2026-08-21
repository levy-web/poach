"use client";

import { useState, useTransition } from "react";
import type { PlatformUser } from "@/lib/dal";
import { setUserActive } from "@/lib/user-actions";
import UserFormDialog from "./UserFormDialog";

/**
 * Per-row edit / activate-toggle. Rendered by the server component for each
 * row; the dialog itself only mounts once a row is being edited.
 */
export default function UsersTableActions({
  user,
  canManageStaff,
  currentUserId,
}: {
  user: PlatformUser;
  canManageStaff: boolean;
  currentUserId: number | null;
}) {
  const [editing, setEditing] = useState(false);
  const [confirmingDeactivate, setConfirmingDeactivate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const isSelf = currentUserId === user.id;

  const toggleActive = (next: boolean) => {
    setError(null);
    startTransition(async () => {
      const result = await setUserActive(user.id, user.phone_number, next);
      if (result?.error) setError(result.error);
      else if (result?.fieldErrors) setError(Object.values(result.fieldErrors)[0]);
      setConfirmingDeactivate(false);
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
          title="Edit user"
          className="rounded-md p-2 text-secondary transition-colors hover:bg-surface-container hover:text-zest-orange"
        >
          <span className="material-symbols-outlined text-[20px]">edit</span>
        </button>

        {user.is_active ? (
          <button
            onClick={() => setConfirmingDeactivate(true)}
            disabled={isSelf || pending}
            title={isSelf ? "You can't deactivate your own account" : "Deactivate user"}
            className="rounded-md p-2 text-secondary transition-colors hover:bg-surface-container hover:text-error disabled:cursor-not-allowed disabled:opacity-30"
          >
            <span className="material-symbols-outlined text-[20px]">block</span>
          </button>
        ) : (
          <button
            onClick={() => toggleActive(true)}
            disabled={pending}
            title="Reactivate user"
            className="rounded-md p-2 text-secondary transition-colors hover:bg-surface-container hover:text-green-700 disabled:opacity-30"
          >
            <span className="material-symbols-outlined text-[20px]">restart_alt</span>
          </button>
        )}
      </div>

      <UserFormDialog
        open={editing}
        onClose={() => setEditing(false)}
        user={user}
        canManageStaff={canManageStaff}
        isSelf={isSelf}
      />

      {confirmingDeactivate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            aria-label="Cancel"
            onClick={() => setConfirmingDeactivate(false)}
            className="absolute inset-0 cursor-default bg-inverse-surface/40"
          />
          <div
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-md rounded-xl border border-surface-container-highest bg-surface-container-lowest p-stack-lg shadow-elevated"
          >
            <h2 className="mb-2 font-headline-sm text-headline-sm text-on-surface">
              Deactivate {user.full_name || user.phone_number}?
            </h2>
            <p className="mb-stack-md font-body-md text-body-md text-on-surface-variant">
              They won&apos;t be able to sign in, and any active session is revoked immediately.
              Their order history is kept, and you can reactivate them at any time.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmingDeactivate(false)}
                className="rounded-md border border-outline-variant px-5 py-2.5 font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-container"
              >
                Cancel
              </button>
              <button
                onClick={() => toggleActive(false)}
                disabled={pending}
                className="rounded-md bg-error px-5 py-2.5 font-label-md text-label-md text-on-error shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {pending ? "Deactivating..." : "Deactivate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
