"use client";

import { useState } from "react";
import type { Zone } from "@/lib/dal";
import RunnerFormDialog from "./RunnerFormDialog";

export default function NewRunnerButton({ zones }: { zones: Zone[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-md bg-zest-orange px-6 py-3 font-label-md text-label-md text-on-primary shadow-sm transition-colors hover:bg-primary"
      >
        <span className="material-symbols-outlined">add</span>
        Onboard Runner
      </button>

      <RunnerFormDialog open={open} onClose={() => setOpen(false)} runner={null} zones={zones} />
    </>
  );
}
