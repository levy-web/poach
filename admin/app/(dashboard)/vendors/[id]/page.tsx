import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import TablePagination from "@/components/TablePagination";
import TableSearch from "@/components/TableSearch";
import { getMenuItems, getVendor, LIST_PAGE_SIZE } from "@/lib/dal";
import { AddDishButton, MenuItemActions } from "./MenuActions";

/** Prices use a monospaced face so costs line up when scanning a menu. */
function Price({ value }: { value: string }) {
  const amount = Number(value);
  const display = Number.isFinite(amount)
    ? amount.toLocaleString(undefined, { maximumFractionDigits: 2 })
    : value;
  return (
    <span className="font-price text-[18px] font-semibold tracking-tight text-zest-orange">
      <span className="mr-1 text-[13px]">KSh</span>
      {display}
    </span>
  );
}

export default async function VendorMenuPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const { id } = await params;
  const vendorId = Number.parseInt(id, 10);
  if (!Number.isFinite(vendorId)) notFound();

  const { page: pageParam, q } = await searchParams;
  const search = q?.trim() ?? "";
  const requestedPage = Number.parseInt(pageParam ?? "1", 10);
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const [vendor, { items, total, totalPages, failed, outOfRange }] = await Promise.all([
    getVendor(vendorId),
    getMenuItems({ vendor: vendorId, page, search }),
  ]);

  if (!vendor) notFound();

  const from = total === 0 ? 0 : (page - 1) * LIST_PAGE_SIZE + 1;
  const to = Math.min(page * LIST_PAGE_SIZE, total);
  const availableCount = items.filter((item) => item.is_available).length;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-stack-lg p-margin-page">
      <div>
        <Link
          href="/vendors"
          className="mb-3 inline-flex items-center gap-1 font-label-md text-label-md text-on-surface-variant transition-colors hover:text-zest-orange"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          All vendors
        </Link>

        <PageHeader
          title={vendor.business_name}
          subtitle={`${vendor.zone_name}${
            vendor.pickup_building_name ? ` · ${vendor.pickup_building_name}` : ""
          } · ${vendor.user_phone}`}
          action={<AddDishButton vendorId={vendorId} />}
        />
      </div>

      <div className="flex flex-col gap-4 rounded-xl border border-surface-container-highest bg-surface-container-lowest p-stack-md shadow-standard sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-label-sm text-label-sm ${
              vendor.is_approved
                ? "bg-[#e6f4ea] text-[#137333]"
                : "bg-primary-fixed-dim/30 text-zest-orange"
            }`}
          >
            {vendor.is_approved ? "Approved" : "Pending"}
          </span>
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            {total} {total === 1 ? "dish" : "dishes"} on the menu
            {items.length > 0 && ` · ${availableCount} available on this page`}
          </span>
        </div>
        <TableSearch
          initialValue={search}
          placeholder="Search dishes..."
          className="w-full sm:w-64"
        />
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-surface-container-highest bg-surface-container-lowest p-stack-xl text-center font-body-md text-body-md text-on-surface-variant shadow-standard">
          {failed ? (
            "Couldn't load the menu — the API didn't respond."
          ) : outOfRange ? (
            <>
              Page {page} is past the end of the menu.{" "}
              <Link href={`/vendors/${vendorId}`} className="text-zest-orange underline">
                Back to the first page
              </Link>
            </>
          ) : search ? (
            `No dishes match “${search}”.`
          ) : (
            "No dishes on this menu yet — add the first one."
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <article
              key={item.id}
              className={`group flex flex-col overflow-hidden rounded-xl border bg-surface-container-lowest shadow-standard transition-shadow hover:shadow-elevated ${
                item.is_available
                  ? "border-surface-container-highest"
                  : "border-surface-container-high"
              }`}
            >
              {/* 16:9 top-aligned image with a status overlay, per the
                  vendor-card spec in the design system. */}
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-surface-container-low">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.dish_name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className={`object-cover transition-transform duration-300 group-hover:scale-105 ${
                      item.is_available ? "" : "grayscale"
                    }`}
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-1 text-on-surface-variant/60">
                    <span className="material-symbols-outlined text-[32px]">restaurant</span>
                    <span className="font-body-sm text-body-sm">No photo</span>
                  </div>
                )}

                {!item.is_available && (
                  <span className="absolute top-3 right-3 rounded bg-inverse-surface/80 px-2 py-1 font-label-sm text-label-sm text-inverse-on-surface">
                    Unavailable
                  </span>
                )}
              </div>

              <div className="flex flex-1 flex-col p-stack-md">
                <h3 className="font-title-md text-title-md font-semibold text-on-surface">
                  {item.dish_name}
                </h3>
                {item.description && (
                  <p className="mt-1 line-clamp-2 font-body-sm text-body-sm text-on-surface-variant">
                    {item.description}
                  </p>
                )}

                <div className="mt-auto flex items-center justify-between border-t border-surface-container-high pt-3">
                  <Price value={item.price} />
                  <MenuItemActions item={item} vendorId={vendorId} />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {items.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-surface-container-highest bg-surface-container-lowest shadow-standard">
          <TablePagination
            from={from}
            to={to}
            total={total}
            noun="dishes"
            currentPage={page}
            totalPages={totalPages}
          />
        </div>
      )}
    </div>
  );
}
