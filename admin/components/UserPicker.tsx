"use client";

import { useEffect, useRef, useState } from "react";
import { searchSelectableUsers, type SelectableUser } from "@/lib/user-search";

const DEBOUNCE_MS = 250;

function label(user: SelectableUser) {
  return user.full_name?.trim() ? `${user.full_name} — ${user.phone_number}` : user.phone_number;
}

/**
 * Typeahead for choosing an existing account by phone number or name.
 *
 * Submits the selected account's id in a hidden `user` field. The list only
 * contains accounts that can still take this role — the API filters out
 * anyone who already has one, since the profile FK is OneToOne.
 */
export default function UserPicker({
  role,
  error,
  hint,
}: {
  role: "vendor" | "runner";
  error?: string;
  hint?: string;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SelectableUser[]>([]);
  const [selected, setSelected] = useState<SelectableUser | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  // Guards against an earlier, slower request overwriting a newer one.
  const requestId = useRef(0);

  useEffect(() => {
    if (selected) return;

    const id = ++requestId.current;
    setLoading(true);
    const timer = setTimeout(async () => {
      const found = await searchSelectableUsers(query, role);
      if (id !== requestId.current) return;
      setResults(found);
      setSearched(true);
      setLoading(false);
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [query, role, selected]);

  useEffect(() => {
    const onClickAway = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickAway);
    return () => document.removeEventListener("mousedown", onClickAway);
  }, []);

  const choose = (user: SelectableUser) => {
    setSelected(user);
    setQuery("");
    setOpen(false);
  };

  const clear = () => {
    setSelected(null);
    setOpen(true);
  };

  return (
    <div ref={containerRef}>
      <label htmlFor="user-picker" className="mb-2 block font-label-md text-label-md text-on-surface">
        {role === "vendor" ? "Owner's account" : "Runner's account"}
      </label>

      {/* What the form actually submits. */}
      <input type="hidden" name="user" value={selected?.id ?? ""} />

      {selected ? (
        <div className="flex items-center justify-between gap-3 rounded-md border border-outline-variant bg-surface-container-low px-4 py-2">
          <span className="min-w-0">
            <span className="block truncate font-body-md text-on-surface">
              {selected.full_name?.trim() || "Unnamed"}
            </span>
            <span className="block truncate font-body-sm text-body-sm text-on-surface-variant">
              {selected.phone_number}
              {!selected.is_active && " · inactive"}
            </span>
          </span>
          <button
            type="button"
            onClick={clear}
            className="shrink-0 rounded-md p-1 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
            aria-label="Choose a different account"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
      ) : (
        <div className="relative">
          <span className="material-symbols-outlined absolute top-1/2 left-3 -translate-y-1/2 text-[20px] text-on-surface-variant">
            search
          </span>
          <input
            id="user-picker"
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => setOpen(true)}
            autoComplete="off"
            placeholder="Search by phone or name..."
            aria-invalid={error ? true : undefined}
            className={`w-full rounded-md border bg-surface-container-lowest py-2 pr-10 pl-10 font-body-md text-on-surface outline-none transition-all placeholder:text-on-surface-variant/50 focus:ring-0 ${
              error ? "border-error" : "border-outline-variant focus:border-zest-orange"
            }`}
          />
          {loading && (
            <span className="material-symbols-outlined absolute top-1/2 right-3 -translate-y-1/2 animate-spin text-[18px] text-on-surface-variant">
              progress_activity
            </span>
          )}

          {open && (
            <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-outline-variant bg-surface-container-lowest shadow-elevated">
              {results.length === 0 ? (
                <li className="px-4 py-3 font-body-sm text-body-sm text-on-surface-variant">
                  {!searched
                    ? "Searching..."
                    : query.trim()
                      ? `No available account matches “${query.trim()}”.`
                      : "No accounts available for this role."}
                </li>
              ) : (
                results.map((user) => (
                  <li key={user.id}>
                    <button
                      type="button"
                      onClick={() => choose(user)}
                      className="flex w-full flex-col items-start gap-0.5 px-4 py-2 text-left transition-colors hover:bg-surface-container-low"
                    >
                      <span className="font-body-md text-on-surface">
                        {user.full_name?.trim() || "Unnamed"}
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        {user.phone_number}
                        {!user.is_active && " · inactive"}
                      </span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      )}

      {error ? (
        <p className="mt-1 font-body-sm text-body-sm text-error">{error}</p>
      ) : hint ? (
        <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">{hint}</p>
      ) : null}
    </div>
  );
}
