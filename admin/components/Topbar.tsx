"use client";

import Image from "next/image";
import type { AuthenticatedUser } from "@/lib/dal";

const ADMIN_AVATAR_URL =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDzYNFMWvY8WiH171rhWSLLJBswUCoVZFWHF1xzMyputhdQMxDLpZC-RFUZHg5W-W-QicjHo3dhjipHa8B9iRkr-nwHslG41mWUM_-Zbu1mK4pMn3kHh5wlRwUV-ESAhOr-ncFUYTYJcRfL_qNbnWBJVx6m9EjFMjynb9O8X5Z_xft1-CxKkWb_JJ8QIiUkIsMuwf8lYfMpq0OXTl5x9NBuOdid-V8TU7SDnk-UxQxpEbb_J0CXP6zS";

export default function Topbar({
  onMenuClick,
  user,
}: {
  onMenuClick: () => void;
  user: AuthenticatedUser;
}) {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full shrink-0 items-center justify-between border-b border-surface-container-high bg-surface px-margin-page dark:border-outline-variant dark:bg-surface-dim">
      <div className="flex flex-1 items-center gap-4">
        <button
          onClick={onMenuClick}
          className="rounded-full p-2 text-zest-orange transition-colors hover:bg-surface-container-high md:hidden"
          aria-label="Open menu"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <span className="font-title-lg text-title-lg font-bold text-on-surface md:hidden">
          Admin Console
        </span>
        <div className="group relative hidden max-w-md flex-1 items-center md:flex">
          <span className="material-symbols-outlined pointer-events-none absolute left-3 text-on-surface-variant transition-colors group-focus-within:text-zest-orange">
            search
          </span>
          <input
            type="text"
            placeholder="Search orders, vendors, or users..."
            className="w-full rounded-md border border-outline-variant bg-surface-container-low py-2 pr-4 pl-10 font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-zest-orange"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-zest-orange-container dark:text-on-secondary-container"
          aria-label="Notifications"
        >
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button
          className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-zest-orange-container dark:text-on-secondary-container"
          aria-label="Help"
        >
          <span className="material-symbols-outlined">help</span>
        </button>
        <button
          className="hidden h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-zest-orange-container sm:flex dark:text-on-secondary-container"
          aria-label="Apps"
        >
          <span className="material-symbols-outlined">apps</span>
        </button>
        <span className="hidden font-label-md text-label-md text-on-surface-variant sm:inline">
          {user.full_name || user.phone_number}
        </span>
        <div
          className="ml-4 h-8 w-8 cursor-pointer overflow-hidden rounded-full border border-outline-variant shadow-sm transition-colors hover:border-zest-orange"
          title={user.full_name || user.phone_number}
        >
          <Image
            src={ADMIN_AVATAR_URL}
            alt={user.full_name || "Administrator profile"}
            width={32}
            height={32}
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </header>
  );
}
