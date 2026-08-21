"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const DEBOUNCE_MS = 300;

export default function UsersSearch({ initialValue }: { initialValue: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(initialValue);
  const [isPending, startTransition] = useTransition();
  // Skips the initial render so simply landing on the page doesn't push a
  // duplicate history entry for the search term already in the URL.
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (value.trim()) {
        params.set("q", value.trim());
      } else {
        params.delete("q");
      }
      // Any new search restarts at page one — otherwise a narrower result
      // set would land the user on a page that no longer exists.
      params.delete("page");
      startTransition(() => {
        router.replace(`${pathname}?${params}`, { scroll: false });
      });
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [value, pathname, router, searchParams]);

  return (
    <div className="relative w-full sm:w-96">
      <span className="material-symbols-outlined absolute top-1/2 left-3 -translate-y-1/2 text-secondary">
        search
      </span>
      <input
        type="text"
        placeholder="Search by name or phone..."
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className="w-full rounded-md border border-outline-variant bg-surface-container-lowest py-2 pr-10 pl-10 font-body-sm text-body-sm shadow-sm outline-none focus:border-zest-orange focus:ring-0"
      />
      {isPending && (
        <span className="material-symbols-outlined absolute top-1/2 right-3 -translate-y-1/2 animate-spin text-[18px] text-secondary">
          progress_activity
        </span>
      )}
    </div>
  );
}
