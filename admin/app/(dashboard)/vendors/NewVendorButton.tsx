"use client";

import { useState } from "react";
import type { Zone } from "@/lib/dal";
import VendorFormDialog from "./VendorFormDialog";

export default function NewVendorButton({ zones }: { zones: Zone[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-md bg-zest-orange px-6 py-3 font-label-md text-label-md text-on-primary shadow-sm transition-colors hover:bg-primary"
      >
        <span className="material-symbols-outlined">add</span>
        Add New Vendor
      </button>

      <VendorFormDialog
        open={open}
        onClose={() => setOpen(false)}
        vendor={null}
        zones={zones}
      />
    </>
  );
}
