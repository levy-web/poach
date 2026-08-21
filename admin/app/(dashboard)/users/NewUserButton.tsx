"use client";

import { useState } from "react";
import UserFormDialog from "./UserFormDialog";

export default function NewUserButton({ canManageStaff }: { canManageStaff: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-md bg-zest-orange px-6 py-3 font-label-md text-label-md text-white shadow-sm transition-all duration-200 active:scale-95 hover:bg-zest-orange-container"
      >
        <span className="material-symbols-outlined">add</span>
        New User
      </button>

      <UserFormDialog
        open={open}
        onClose={() => setOpen(false)}
        user={null}
        canManageStaff={canManageStaff}
        isSelf={false}
      />
    </>
  );
}
