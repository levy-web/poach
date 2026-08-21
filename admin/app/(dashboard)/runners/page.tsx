import PageHeader from "@/components/PageHeader";
import TablePagination from "@/components/TablePagination";
import TableSearch from "@/components/TableSearch";
import { getRunnerStats, getRunners, getZones, LIST_PAGE_SIZE, type Runner } from "@/lib/dal";
import NewRunnerButton from "./NewRunnerButton";
import RunnersTableActions from "./RunnersTableActions";

function displayName(runner: Runner) {
  return runner.user_full_name?.trim() || runner.user_phone;
}

function initialsOf(runner: Runner) {
  const source = runner.user_full_name?.trim();
  if (!source) return runner.user_phone.slice(-2);
  return source
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** Approval gates going online, so an unapproved runner is neither. */
function statusOf(runner: Runner) {
  if (!runner.is_approved) {
    return { label: "Pending", chip: "bg-primary-fixed-dim/30 text-zest-orange", dot: "bg-zest-orange" };
  }
  if (runner.is_online) {
    return { label: "Online", chip: "bg-[#e6f4ea] text-[#137333]", dot: "bg-[#137333]" };
  }
  return { label: "Offline", chip: "bg-surface-variant text-secondary", dot: "bg-secondary" };
}

function StatCard({
  label,
  value,
  suffix,
  icon,
  iconClass,
  footer,
}: {
  label: string;
  value: string;
  suffix?: string;
  icon: string;
  iconClass: string;
  footer: string;
}) {
  return (
    <div className="flex flex-col justify-between rounded-xl border border-surface-container-low bg-surface-container-lowest p-stack-md shadow-standard">
      <div className="mb-4 flex items-start justify-between border-b border-surface-container-high pb-4">
        <span className="font-title-md text-title-md text-on-surface-variant">{label}</span>
        <div className={`rounded-md p-2 ${iconClass}`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
      </div>
      <div>
        <div className="mb-2 font-display-lg text-display-lg text-on-surface">
          {value}
          {suffix && (
            <span className="font-headline-md text-headline-md text-on-surface-variant">
              {suffix}
            </span>
          )}
        </div>
        <div className="font-body-sm text-body-sm text-on-surface-variant">{footer}</div>
      </div>
    </div>
  );
}

export default async function RunnersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const { page: pageParam, q } = await searchParams;
  const search = q?.trim() ?? "";
  const requestedPage = Number.parseInt(pageParam ?? "1", 10);
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const [{ items: runners, total, totalPages, failed, outOfRange }, stats, zones] =
    await Promise.all([getRunners({ page, search }), getRunnerStats(), getZones()]);

  const from = total === 0 ? 0 : (page - 1) * LIST_PAGE_SIZE + 1;
  const to = Math.min(page * LIST_PAGE_SIZE, total);
  const columns = ["Runner", "Zone", "Status", "Active Orders", "Rating", "Actions"];

  return (
    <div className="p-margin-page">
      <PageHeader
        title="Runner Fleet"
        subtitle="Manage and monitor delivery partner activity."
        action={<NewRunnerButton zones={zones} />}
      />

      <div className="mb-stack-xl grid grid-cols-1 gap-gutter md:grid-cols-3">
        <StatCard
          label="Total Fleet"
          value={stats ? stats.total_runners.toLocaleString() : "—"}
          icon="directions_bike"
          iconClass="bg-primary-fixed text-zest-orange"
          footer="Registered delivery partners"
        />
        <StatCard
          label="Online Now"
          value={stats ? stats.online_runners.toLocaleString() : "—"}
          icon="bolt"
          iconClass="bg-secondary-container text-secondary"
          footer="Approved and available for jobs"
        />
        <StatCard
          label="Avg. Rating"
          // Null until the ratings flow exists — shown as a dash rather than
          // a made-up number.
          value={stats?.average_rating != null ? stats.average_rating.toFixed(1) : "—"}
          suffix={stats?.average_rating != null ? " / 5.0" : undefined}
          icon="star_rate"
          iconClass="bg-secondary-container text-secondary"
          footer={
            stats?.average_rating != null ? "Based on customer feedback" : "No ratings recorded yet"
          }
        />
      </div>

      <div className="flex flex-col overflow-hidden rounded-xl border border-surface-container-low bg-surface-container-lowest shadow-standard">
        <div className="flex flex-col items-center justify-between gap-4 border-b border-surface-container-high bg-surface-cream p-stack-md md:flex-row">
          <h3 className="font-title-lg text-title-lg text-on-surface">Runner Roster</h3>
          <TableSearch
            initialValue={search}
            placeholder="Search runners..."
            className="w-full md:w-64"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] border-collapse text-left">
            <thead>
              <tr className="border-b border-surface-container-high bg-surface-container-low">
                {columns.map((heading) => (
                  <th
                    key={heading}
                    className={`px-stack-md py-3 font-label-sm text-label-sm tracking-wider text-on-surface opacity-50 uppercase ${
                      heading === "Actions" ? "text-right" : ""
                    }`}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high bg-surface-container-lowest font-body-sm text-body-sm">
              {runners.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="p-stack-xl text-center font-body-md text-body-md text-on-surface-variant"
                  >
                    {failed ? (
                      "Couldn't load runners — the API didn't respond."
                    ) : outOfRange ? (
                      <>
                        Page {page} is past the end of the list.{" "}
                        <a
                          href={search ? `/runners?q=${encodeURIComponent(search)}` : "/runners"}
                          className="text-zest-orange underline"
                        >
                          Back to the first page
                        </a>
                      </>
                    ) : search ? (
                      `No runners match “${search}”.`
                    ) : (
                      "No runners yet."
                    )}
                  </td>
                </tr>
              ) : (
                runners.map((runner) => {
                  const status = statusOf(runner);
                  return (
                    <tr
                      key={runner.id}
                      className="group h-[56px] transition-colors hover:bg-surface-container-low"
                    >
                      <td className="px-stack-md py-2">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-outline-variant bg-tertiary-fixed font-title-md text-title-md text-on-tertiary-fixed">
                            {initialsOf(runner)}
                          </div>
                          <div>
                            <div className="font-title-md text-title-md text-on-surface">
                              {displayName(runner)}
                            </div>
                            <div className="text-[12px] text-on-surface-variant">
                              {runner.user_phone}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-stack-md py-2 text-on-surface-variant">
                        {runner.zone_name}
                      </td>
                      <td className="px-stack-md py-2">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-label-sm text-label-sm ${status.chip}`}
                        >
                          <span className={`h-2 w-2 rounded-full ${status.dot}`} />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-stack-md py-2 font-title-md text-title-md text-on-surface">
                        {runner.active_order_count ?? 0}
                      </td>
                      <td className="px-stack-md py-2">
                        {runner.rating_avg ? (
                          <div className="flex items-center gap-1 text-on-surface">
                            <span className="material-symbols-outlined fill text-[16px] text-zest-orange">
                              star
                            </span>
                            <span>{Number(runner.rating_avg).toFixed(1)}</span>
                            <span className="text-on-surface-variant">({runner.rating_count})</span>
                          </div>
                        ) : (
                          <span className="font-label-sm text-on-surface-variant italic">
                            Unrated
                          </span>
                        )}
                      </td>
                      <td className="px-stack-md py-2 text-right">
                        <RunnersTableActions runner={runner} zones={zones} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <TablePagination
          from={from}
          to={to}
          total={total}
          noun="runners"
          currentPage={page}
          totalPages={totalPages}
        />
      </div>
    </div>
  );
}
