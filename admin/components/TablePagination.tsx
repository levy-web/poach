"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Pagination from "@/components/Pagination";

/** Drives the `page` URL param for a server-rendered table. */
export default function TablePagination({
  from,
  to,
  total,
  noun,
  currentPage,
  totalPages,
}: {
  from: number;
  to: number;
  total: number;
  noun: string;
  currentPage: number;
  totalPages: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams);
    if (page <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(page));
    }
    router.push(`${pathname}${params.size ? `?${params}` : ""}`, { scroll: false });
  };

  return (
    <Pagination
      from={from}
      to={to}
      total={total}
      noun={noun}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={goToPage}
    />
  );
}
