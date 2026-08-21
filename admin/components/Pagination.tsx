function PageButton({
  children,
  active = false,
  disabled = false,
}: {
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      disabled={disabled}
      className={`flex h-8 w-8 items-center justify-center rounded-md font-label-md text-label-md transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        active
          ? "bg-zest-orange text-on-primary"
          : "border border-outline-variant text-on-surface hover:bg-surface-container-low"
      }`}
    >
      {children}
    </button>
  );
}

export default function Pagination({
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
  const trailingPages = totalPages > currentPage + 2 ? [totalPages] : [];

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-surface-container-high bg-surface-cream p-stack-md sm:flex-row">
      <span className="font-body-sm text-body-sm text-on-surface-variant">
        Showing {from.toLocaleString()} to {to.toLocaleString()} of {total.toLocaleString()} {noun}
      </span>
      <div className="flex items-center gap-2">
        <PageButton disabled={currentPage === 1}>
          <span className="material-symbols-outlined text-[18px]">chevron_left</span>
        </PageButton>
        {Array.from({ length: Math.min(3, totalPages) }, (_, i) => i + 1).map((page) => (
          <PageButton key={page} active={page === currentPage}>
            {page}
          </PageButton>
        ))}
        {trailingPages.length > 0 && (
          <>
            <span className="px-1 text-on-surface-variant">...</span>
            {trailingPages.map((page) => (
              <PageButton key={page}>{page}</PageButton>
            ))}
          </>
        )}
        <PageButton disabled={currentPage === totalPages}>
          <span className="material-symbols-outlined text-[18px]">chevron_right</span>
        </PageButton>
      </div>
    </div>
  );
}
