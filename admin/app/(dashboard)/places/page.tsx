import PageHeader from "@/components/PageHeader";
import TablePagination from "@/components/TablePagination";
import TableSearch from "@/components/TableSearch";
import { getBuildings, getZoneDetails, LIST_PAGE_SIZE } from "@/lib/dal";
import {
  BuildingRowActions,
  NewBuildingButton,
  NewZoneButton,
  ZoneRowActions,
} from "./PlacesActions";
import ZoneFilter from "./ZoneFilter";

function StatusChip({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-label-sm text-label-sm ${
        active ? "bg-[#e6f4ea] text-[#137333]" : "bg-surface-variant text-secondary"
      }`}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

/** Renders a rate that falls back to a platform default when unset. */
function Rate({ value, suffix = "" }: { value: string | null; suffix?: string }) {
  if (value === null) {
    return <span className="italic text-on-surface-variant/70">Default</span>;
  }
  return (
    <span>
      {value}
      {suffix}
    </span>
  );
}

export default async function PlacesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; zone?: string }>;
}) {
  const { page: pageParam, q, zone } = await searchParams;
  const search = q?.trim() ?? "";
  const zoneFilter = zone ?? "";
  const requestedPage = Number.parseInt(pageParam ?? "1", 10);
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const [zones, { items: buildings, total, totalPages, failed, outOfRange }] = await Promise.all([
    getZoneDetails(),
    getBuildings({ page, search, zone: zoneFilter }),
  ]);

  const from = total === 0 ? 0 : (page - 1) * LIST_PAGE_SIZE + 1;
  const to = Math.min(page * LIST_PAGE_SIZE, total);

  const activeZones = zones.filter((z) => z.is_active).length;
  const zoneColumns = ["Zone", "Status", "Delivery fee", "Commission", "Buildings", "Vendors", "Runners", "Actions"];
  const buildingColumns = ["Building", "Zone", "Landmark", "Status", "Actions"];

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-stack-lg p-margin-page">
      <PageHeader
        title="Zones & Buildings"
        subtitle="Define where you operate, and the buildings runners deliver to and collect from."
        action={<NewBuildingButton zones={zones} defaultZone={zoneFilter} />}
      />

      {/* --- zones --- */}
      <div className="flex flex-col overflow-hidden rounded-xl border border-surface-container-highest bg-surface-container-lowest shadow-standard">
        <div className="flex flex-col items-start justify-between gap-3 border-b border-surface-container-high bg-surface-cream p-stack-md sm:flex-row sm:items-center">
          <div>
            <h3 className="font-title-lg text-title-lg text-on-surface">Zones</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              {activeZones} active of {zones.length}
            </p>
          </div>
          <NewZoneButton />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-left">
            <thead>
              <tr className="border-b border-surface-container-high bg-surface-cream/50">
                {zoneColumns.map((heading) => (
                  <th
                    key={heading}
                    className={`px-stack-md py-3 font-label-sm text-label-sm tracking-wider text-on-surface-variant uppercase ${
                      heading === "Actions" ? "text-right" : ""
                    }`}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high font-body-sm text-body-sm">
              {zones.length === 0 ? (
                <tr>
                  <td
                    colSpan={zoneColumns.length}
                    className="p-stack-xl text-center font-body-md text-body-md text-on-surface-variant"
                  >
                    No zones yet — add one before registering buildings.
                  </td>
                </tr>
              ) : (
                zones.map((z) => (
                  <tr key={z.id} className="transition-colors hover:bg-surface-container-low">
                    <td className="px-stack-md py-3 font-title-md text-title-md text-on-surface">
                      {z.name}
                    </td>
                    <td className="px-stack-md py-3">
                      <StatusChip active={z.is_active} />
                    </td>
                    <td className="px-stack-md py-3 text-on-surface-variant">
                      <Rate value={z.delivery_fee} />
                    </td>
                    <td className="px-stack-md py-3 text-on-surface-variant">
                      <Rate value={z.commission_pct} suffix="%" />
                    </td>
                    <td className="px-stack-md py-3 text-on-surface-variant">
                      {z.building_count ?? 0}
                    </td>
                    <td className="px-stack-md py-3 text-on-surface-variant">
                      {z.vendor_count ?? 0}
                    </td>
                    <td className="px-stack-md py-3 text-on-surface-variant">
                      {z.runner_count ?? 0}
                    </td>
                    <td className="px-stack-md py-3 text-right">
                      <ZoneRowActions zone={z} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- buildings --- */}
      <div className="flex flex-col overflow-hidden rounded-xl border border-surface-container-highest bg-surface-container-lowest shadow-standard">
        <div className="flex flex-col items-start justify-between gap-3 border-b border-surface-container-high bg-surface-cream p-stack-md sm:flex-row sm:items-center">
          <h3 className="font-title-lg text-title-lg text-on-surface">Buildings</h3>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <ZoneFilter zones={zones} value={zoneFilter} />
            <TableSearch
              initialValue={search}
              placeholder="Search buildings..."
              className="w-full sm:w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr className="border-b border-surface-container-high bg-surface-cream/50">
                {buildingColumns.map((heading) => (
                  <th
                    key={heading}
                    className={`px-stack-md py-3 font-label-sm text-label-sm tracking-wider text-on-surface-variant uppercase ${
                      heading === "Actions" ? "text-right" : ""
                    }`}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high font-body-sm text-body-sm">
              {buildings.length === 0 ? (
                <tr>
                  <td
                    colSpan={buildingColumns.length}
                    className="p-stack-xl text-center font-body-md text-body-md text-on-surface-variant"
                  >
                    {failed ? (
                      "Couldn't load buildings — the API didn't respond."
                    ) : outOfRange ? (
                      <>
                        Page {page} is past the end of the list.{" "}
                        <a href="/places" className="text-zest-orange underline">
                          Back to the first page
                        </a>
                      </>
                    ) : search ? (
                      `No buildings match “${search}”.`
                    ) : zoneFilter ? (
                      "No buildings registered in this zone yet."
                    ) : (
                      "No buildings yet."
                    )}
                  </td>
                </tr>
              ) : (
                buildings.map((building) => (
                  <tr
                    key={building.id}
                    className="transition-colors hover:bg-surface-container-low"
                  >
                    <td className="px-stack-md py-3">
                      <div className="font-title-md text-title-md text-on-surface">
                        {building.name}
                      </div>
                      {building.entry_details && (
                        <div className="font-body-sm text-body-sm text-on-surface-variant">
                          {building.entry_details}
                        </div>
                      )}
                    </td>
                    <td className="px-stack-md py-3 text-on-surface-variant">
                      {building.zone_name}
                    </td>
                    <td className="px-stack-md py-3 text-on-surface-variant">
                      {building.landmark || (
                        <span className="italic text-on-surface-variant/70">Not set</span>
                      )}
                    </td>
                    <td className="px-stack-md py-3">
                      <StatusChip active={building.is_active} />
                    </td>
                    <td className="px-stack-md py-3 text-right">
                      <BuildingRowActions building={building} zones={zones} />
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
          noun="buildings"
          currentPage={page}
          totalPages={totalPages}
        />
      </div>
    </div>
  );
}
