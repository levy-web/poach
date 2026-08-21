"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Pagination from "@/components/Pagination";

export default function UsersPagination({
  from,
  to,
  total,
  currentPage,
  totalPages,
}: {
  from: number;
  to: number;
  total: number;
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
      noun="users"
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={goToPage}
    />
  );
}
