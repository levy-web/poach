"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Zone } from "@/lib/dal";

/** Scopes the buildings table to one zone via the `zone` URL param. */
export default function ZoneFilter({ zones, value }: { zones: Zone[]; value: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const onChange = (next: string) => {
    const params = new URLSearchParams(searchParams);
    if (next) params.set("zone", next);
    else params.delete("zone");
    // A narrower filter can leave the current page past the end of the list.
    params.delete("page");
    router.push(`${pathname}${params.size ? `?${params}` : ""}`, { scroll: false });
  };

  return (
    <select
      aria-label="Filter buildings by zone"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="cursor-pointer rounded-md border border-outline-variant bg-surface-container-lowest px-4 py-2 font-body-sm text-body-sm text-on-surface shadow-sm outline-none focus:border-zest-orange focus:ring-0"
    >
      <option value="">All zones</option>
      {zones.map((zone) => (
        <option key={zone.id} value={String(zone.id)}>
          {zone.name}
        </option>
      ))}
    </select>
  );
}
