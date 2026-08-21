"use client";

import { useState, useTransition } from "react";
import { ConfirmDialog } from "@/components/FormDialog";
import type { Runner, Zone } from "@/lib/dal";
import { setRunnerApproved } from "@/lib/runner-actions";
import RunnerFormDialog from "./RunnerFormDialog";

export default function RunnersTableActions({
  runner,
  zones,
}: {
  runner: Runner;
  zones: Zone[];
}) {
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const setApproved = (next: boolean) => {
    setError(null);
    startTransition(async () => {
      const result = await setRunnerApproved(runner.id, next);
      if (result?.error) setError(result.error);
      else if (result?.fieldErrors) setError(Object.values(result.fieldErrors)[0]);
      setConfirming(false);
    });
  };

  const name = runner.user_full_name?.trim() || runner.user_phone;

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
          title="Edit runner"
          className="rounded-md p-2 text-secondary transition-colors hover:bg-primary-fixed hover:text-zest-orange"
        >
          <span className="material-symbols-outlined text-[20px]">edit</span>
        </button>

        {runner.is_approved ? (
          <button
            onClick={() => setConfirming(true)}
            disabled={pending}
            title="Suspend runner"
            className="rounded-md p-2 text-secondary transition-colors hover:bg-primary-fixed hover:text-error disabled:opacity-30"
          >
            <span className="material-symbols-outlined text-[20px]">block</span>
          </button>
        ) : (
          <button
            onClick={() => setApproved(true)}
            disabled={pending}
            title="Approve runner"
            className="rounded-md p-2 text-secondary transition-colors hover:bg-primary-fixed hover:text-green-700 disabled:opacity-30"
          >
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
          </button>
        )}
      </div>

      <RunnerFormDialog
        open={editing}
        onClose={() => setEditing(false)}
        runner={runner}
        zones={zones}
      />

      {confirming && (
        <ConfirmDialog
          title={`Suspend ${name}?`}
          body="They'll go offline and can't claim new delivery jobs. Their delivery history is kept, and you can approve them again at any time."
          confirmLabel="Suspend"
          pending={pending}
          onCancel={() => setConfirming(false)}
          onConfirm={() => setApproved(false)}
        />
      )}
    </>
  );
}
