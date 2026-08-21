import PageHeader from "@/components/PageHeader";
import TablePagination from "@/components/TablePagination";
import TableSearch from "@/components/TableSearch";
import { getVendorStats, getVendors, getZones, LIST_PAGE_SIZE } from "@/lib/dal";
import NewVendorButton from "./NewVendorButton";
import VendorsTableActions from "./VendorsTableActions";

function initialsOf(businessName: string) {
  const trimmed = businessName.trim();
  if (!trimmed) return "?";
  return trimmed
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function StatCard({
  label,
  value,
  icon,
  accent = false,
  valueClass = "text-on-surface",
  footer,
}: {
  label: string;
  value: string;
  icon: string;
  accent?: boolean;
  valueClass?: string;
  footer?: React.ReactNode;
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-xl border bg-surface-container-lowest p-stack-lg shadow-standard ${
        accent ? "border-zest-orange/30" : "border-surface-container-highest"
      }`}
    >
      <div className="absolute top-0 right-0 p-stack-md opacity-10 transition-opacity group-hover:opacity-20">
        <span className="material-symbols-outlined text-[80px] text-zest-orange">{icon}</span>
      </div>
      <p className="mb-2 font-label-sm text-label-sm tracking-wider text-on-surface-variant uppercase">
        {label}
      </p>
      <h3 className={`font-display-lg text-display-lg ${valueClass}`}>{value}</h3>
      {footer && <div className="mt-4">{footer}</div>}
    </div>
  );
}

export default async function VendorsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const { page: pageParam, q } = await searchParams;
  const search = q?.trim() ?? "";
  const requestedPage = Number.parseInt(pageParam ?? "1", 10);
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const [{ items: vendors, total, totalPages, failed, outOfRange }, stats, zones] =
    await Promise.all([getVendors({ page, search }), getVendorStats(), getZones()]);

  const from = total === 0 ? 0 : (page - 1) * LIST_PAGE_SIZE + 1;
  const to = Math.min(page * LIST_PAGE_SIZE, total);
  const columns = ["Vendor", "Zone", "Pickup", "Status", "Active Menu Items", "Actions"];

  return (
    <div className="p-margin-page">
      <PageHeader
        title="Vendor Management"
        subtitle="Manage restaurant partners, track performance, and oversee active menus across the platform."
        action={<NewVendorButton zones={zones} />}
      />

      <div className="mb-stack-xl grid grid-cols-1 gap-gutter md:grid-cols-3">
        <StatCard
          label="Total Active Vendors"
          value={stats ? stats.approved_vendors.toLocaleString() : "—"}
          icon="storefront"
          footer={
            stats && (
              <div className="flex w-fit items-center gap-2 rounded-full bg-surface-container px-2 py-1 font-label-sm text-label-sm text-on-surface-variant">
                {stats.total_vendors.toLocaleString()} total on the platform
              </div>
            )
          }
        />
        <StatCard
          label="Active Menu Items"
          value={stats ? stats.active_menu_items.toLocaleString() : "—"}
          icon="restaurant_menu"
          footer={
            <div className="flex w-fit items-center gap-2 rounded-full bg-surface-container px-2 py-1 font-label-sm text-label-sm text-on-surface-variant">
              Currently available to order
            </div>
          }
        />
        <StatCard
          label="Pending Approval"
          value={stats ? stats.pending_vendors.toLocaleString() : "—"}
          icon="pending_actions"
          accent
          valueClass="text-zest-orange"
          footer={
            <div className="flex w-fit items-center gap-2 rounded-full bg-primary-fixed-dim/30 px-2 py-1 font-label-sm text-label-sm text-zest-orange">
              Awaiting review
            </div>
          }
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-surface-container-highest bg-surface-container-lowest shadow-standard">
        <div className="flex flex-col items-center justify-between gap-4 border-b border-surface-container-high bg-surface-cream/50 p-stack-md sm:flex-row">
          <h3 className="font-title-lg text-title-lg text-on-surface">Vendor Directory</h3>
          <TableSearch
            initialValue={search}
            placeholder="Search vendors..."
            className="w-full sm:w-64"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] border-collapse text-left">
            <thead>
              <tr className="border-b border-surface-container-high bg-surface-cream/30">
                {columns.map((heading) => (
                  <th
                    key={heading}
                    className={`px-stack-md py-4 font-label-sm text-label-sm tracking-wider text-on-surface-variant uppercase ${
                      heading === "Actions" ? "text-right" : ""
                    }`}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high font-body-md text-body-md text-on-surface">
              {vendors.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="p-stack-xl text-center font-body-md text-body-md text-on-surface-variant"
                  >
                    {failed ? (
                      "Couldn't load vendors — the API didn't respond."
                    ) : outOfRange ? (
                      <>
                        Page {page} is past the end of the list.{" "}
                        <a
                          href={search ? `/vendors?q=${encodeURIComponent(search)}` : "/vendors"}
                          className="text-zest-orange underline"
                        >
                          Back to the first page
                        </a>
                      </>
                    ) : search ? (
                      `No vendors match “${search}”.`
                    ) : (
                      "No vendors yet."
                    )}
                  </td>
                </tr>
              ) : (
                vendors.map((vendor) => (
                  <tr
                    key={vendor.id}
                    className="group transition-colors hover:bg-surface-container-low"
                  >
                    <td className="px-stack-md py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-outline-variant bg-white p-1 font-bold text-on-surface-variant shadow-sm">
                          {initialsOf(vendor.business_name)}
                        </div>
                        <span className="font-title-md text-title-md font-semibold">
                          {vendor.business_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-stack-md py-4 text-on-surface-variant">{vendor.zone_name}</td>
                    <td className="px-stack-md py-4 text-on-surface-variant">
                      {vendor.pickup_building_name ?? (
                        <span className="italic text-on-surface-variant/70">Not set</span>
                      )}
                    </td>
                    <td className="px-stack-md py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-label-sm text-label-sm ${
                          vendor.is_approved
                            ? "bg-[#e6f4ea] text-[#137333]"
                            : "bg-primary-fixed-dim/30 text-zest-orange"
                        }`}
                      >
                        {vendor.is_approved ? "Approved" : "Pending"}
                      </span>
                    </td>
                    <td className="px-stack-md py-4 text-on-surface-variant">
                      {vendor.active_menu_item_count ?? 0}
                    </td>
                    <td className="px-stack-md py-4 text-right">
                      <VendorsTableActions vendor={vendor} zones={zones} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <TablePagination
          from={from}
          to={to}
          total={total}
          noun="vendors"
          currentPage={page}
          totalPages={totalPages}
        />
      </div>
    </div>
  );
}
