"use client";

import { useState, useTransition } from "react";
import { ConfirmDialog } from "@/components/FormDialog";
import type { Building, Zone, ZoneDetail } from "@/lib/dal";
import { setBuildingActive, setZoneActive } from "@/lib/place-actions";
import BuildingFormDialog from "./BuildingFormDialog";
import ZoneFormDialog from "./ZoneFormDialog";

function ActionButtons({
  isActive,
  onEdit,
  onDeactivate,
  onReactivate,
  pending,
  error,
  nouns,
}: {
  isActive: boolean;
  onEdit: () => void;
  onDeactivate: () => void;
  onReactivate: () => void;
  pending: boolean;
  error: string | null;
  nouns: string;
}) {
  return (
    <div className="flex items-center justify-end gap-1">
      {error && (
        <span title={error} className="material-symbols-outlined text-[18px] text-error">
          error
        </span>
      )}
      <button
        onClick={onEdit}
        title={`Edit ${nouns}`}
        className="rounded-md p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-zest-orange"
      >
        <span className="material-symbols-outlined text-[20px]">edit</span>
      </button>
      {isActive ? (
        <button
          onClick={onDeactivate}
          disabled={pending}
          title={`Deactivate ${nouns}`}
          className="rounded-md p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-error disabled:opacity-30"
        >
          <span className="material-symbols-outlined text-[20px]">block</span>
        </button>
      ) : (
        <button
          onClick={onReactivate}
          disabled={pending}
          title={`Reactivate ${nouns}`}
          className="rounded-md p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-green-700 disabled:opacity-30"
        >
          <span className="material-symbols-outlined text-[20px]">restart_alt</span>
        </button>
      )}
    </div>
  );
}

export function ZoneRowActions({ zone }: { zone: ZoneDetail }) {
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const setActive = (next: boolean) => {
    setError(null);
    startTransition(async () => {
      const result = await setZoneActive(zone.id, next);
      if (result?.error) setError(result.error);
      else if (result?.fieldErrors) setError(Object.values(result.fieldErrors)[0]);
      setConfirming(false);
    });
  };

  return (
    <>
      <ActionButtons
        isActive={zone.is_active}
        onEdit={() => setEditing(true)}
        onDeactivate={() => setConfirming(true)}
        onReactivate={() => setActive(true)}
        pending={pending}
        error={error}
        nouns="zone"
      />
      <ZoneFormDialog open={editing} onClose={() => setEditing(false)} zone={zone} />
      {confirming && (
        <ConfirmDialog
          title={`Deactivate ${zone.name}?`}
          body="It'll be hidden from signup and customer search. Vendors, runners and buildings already in this zone keep their records, and you can reactivate it at any time."
          confirmLabel="Deactivate"
          pending={pending}
          onCancel={() => setConfirming(false)}
          onConfirm={() => setActive(false)}
        />
      )}
    </>
  );
}

export function BuildingRowActions({
  building,
  zones,
}: {
  building: Building;
  zones: Zone[];
}) {
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const setActive = (next: boolean) => {
    setError(null);
    startTransition(async () => {
      const result = await setBuildingActive(building.id, next);
      if (result?.error) setError(result.error);
      else if (result?.fieldErrors) setError(Object.values(result.fieldErrors)[0]);
      setConfirming(false);
    });
  };

  return (
    <>
      <ActionButtons
        isActive={building.is_active}
        onEdit={() => setEditing(true)}
        onDeactivate={() => setConfirming(true)}
        onReactivate={() => setActive(true)}
        pending={pending}
        error={error}
        nouns="building"
      />
      <BuildingFormDialog
        open={editing}
        onClose={() => setEditing(false)}
        building={building}
        zones={zones}
      />
      {confirming && (
        <ConfirmDialog
          title={`Deactivate ${building.name}?`}
          body="It'll stop appearing as a delivery destination or vendor pickup point. Existing saved locations and vendor records keep pointing at it, and you can reactivate it at any time."
          confirmLabel="Deactivate"
          pending={pending}
          onCancel={() => setConfirming(false)}
          onConfirm={() => setActive(false)}
        />
      )}
    </>
  );
}

export function NewZoneButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-md border border-outline-warm bg-surface-cream px-4 py-2 font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-container"
      >
        <span className="material-symbols-outlined text-[20px]">add</span>
        New zone
      </button>
      <ZoneFormDialog open={open} onClose={() => setOpen(false)} zone={null} />
    </>
  );
}

export function NewBuildingButton({
  zones,
  defaultZone,
}: {
  zones: Zone[];
  defaultZone?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-md bg-zest-orange px-6 py-3 font-label-md text-label-md text-on-primary shadow-sm transition-colors hover:bg-zest-orange-container"
      >
        <span className="material-symbols-outlined">add</span>
        Add Building
      </button>
      <BuildingFormDialog
        open={open}
        onClose={() => setOpen(false)}
        building={null}
        zones={zones}
        defaultZone={defaultZone}
      />
    </>
  );
}
