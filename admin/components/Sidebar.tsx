"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, FOOTER_NAV_ITEMS, type NavItem } from "@/lib/nav";

function NavLink({ item, active, onNavigate }: { item: NavItem; active: boolean; onNavigate?: () => void }) {
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={`relative flex items-center gap-3 rounded-md px-4 py-3 font-title-md text-title-md transition-colors duration-200 active:scale-95 ${
        active
          ? "bg-secondary-container text-zest-orange dark:bg-secondary-fixed-dim"
          : "text-secondary hover:bg-surface-container-high dark:text-secondary-fixed dark:hover:bg-tertiary-container"
      }`}
    >
      {active && (
        <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-zest-orange" />
      )}
      <span className={`material-symbols-outlined ${active ? "fill" : ""}`}>{item.icon}</span>
      <span>{item.label}</span>
    </Link>
  );
}

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  const content = (
    <>
      <div className="mb-stack-lg flex items-center gap-3 px-stack-sm">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-zest-orange text-lg font-bold text-on-primary shadow-sm">
          Z
        </div>
        <div className="overflow-hidden">
          <h1 className="truncate font-headline-md text-headline-md font-bold text-zest-orange">
            Zest Admin
          </h1>
          <p className="truncate font-label-sm text-label-sm text-on-surface-variant">
            Operations Portal
          </p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            active={pathname === item.href}
            onNavigate={onClose}
          />
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-1 border-t border-surface-container-high pt-stack-md">
        {FOOTER_NAV_ITEMS.map((item) => (
          <NavLink key={item.href} item={item} active={pathname === item.href} onNavigate={onClose} />
        ))}
      </div>
    </>
  );

  return (
    <>
      <aside className="sticky top-0 left-0 z-40 hidden h-screen w-sidebar-width flex-shrink-0 flex-col border-r border-surface-container-highest bg-surface-container-lowest px-stack-sm py-stack-md shadow-standard md:flex dark:bg-deep-charcoal">
        {content}
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            aria-label="Close menu"
            className="absolute inset-0 bg-inverse-surface/40"
            onClick={onClose}
          />
          <aside className="relative flex h-full w-sidebar-width flex-col bg-surface-container-lowest px-stack-sm py-stack-md shadow-elevated dark:bg-deep-charcoal">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
