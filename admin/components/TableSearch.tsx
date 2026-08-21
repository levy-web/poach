"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const DEBOUNCE_MS = 300;

/**
 * Search box that drives the `q` URL param, so the server component owning
 * the table re-renders with fresh results. Keeping the term in the URL makes
 * a filtered table linkable and survives a refresh.
 */
export default function TableSearch({
  initialValue,
  placeholder,
  className = "w-full sm:w-96",
}: {
  initialValue: string;
  placeholder: string;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(initialValue);
  const [isPending, startTransition] = useTransition();
  // Skips the initial render so landing on the page doesn't immediately
  // rewrite the URL it was opened with.
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
      // A new search restarts at page one — a narrower result set would
      // otherwise strand the user on a page that no longer exists.
      params.delete("page");
      startTransition(() => {
        router.replace(`${pathname}?${params}`, { scroll: false });
      });
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [value, pathname, router, searchParams]);

  return (
    <div className={`relative ${className}`}>
      <span className="material-symbols-outlined absolute top-1/2 left-3 -translate-y-1/2 text-[20px] text-on-surface-variant">
        search
      </span>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className="w-full rounded-md border border-outline-variant bg-surface-container-lowest py-2 pr-10 pl-10 font-body-sm text-body-sm shadow-sm outline-none focus:border-zest-orange focus:ring-0"
      />
      {isPending && (
        <span className="material-symbols-outlined absolute top-1/2 right-3 -translate-y-1/2 animate-spin text-[18px] text-on-surface-variant">
          progress_activity
        </span>
      )}
    </div>
  );
}
