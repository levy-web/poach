import PageHeader from "@/components/PageHeader";
import TablePagination from "@/components/TablePagination";
import TableSearch from "@/components/TableSearch";
import { getCurrentUser, getUserStats, getUsers, LIST_PAGE_SIZE } from "@/lib/dal";
import NewUserButton from "./NewUserButton";
import UsersTableActions from "./UsersTableActions";

function initialsOf(user: { full_name: string; phone_number: string }) {
  const source = user.full_name.trim();
  if (!source) return user.phone_number.slice(-2);
  return source
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function formatJoined(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "—" : dateFormatter.format(parsed);
}

function StatCard({
  label,
  value,
  icon,
  iconClass,
  valueClass = "",
}: {
  label: string;
  value: string;
  icon: string;
  iconClass: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl bg-surface-container-lowest p-stack-md shadow-standard">
      <div className={`flex h-12 w-12 items-center justify-center rounded-full ${iconClass}`}>
        <span className="material-symbols-outlined fill">{icon}</span>
      </div>
      <div>
        <p className="font-label-md text-label-md tracking-wider text-secondary uppercase">
          {label}
        </p>
        <p className={`font-headline-lg text-headline-lg ${valueClass}`}>{value}</p>
      </div>
    </div>
  );
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const { page: pageParam, q } = await searchParams;
  const search = q?.trim() ?? "";
  const requestedPage = Number.parseInt(pageParam ?? "1", 10);
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const [{ items: users, total, totalPages, failed, outOfRange }, stats, currentUser] =
    await Promise.all([getUsers({ page, search }), getUserStats(), getCurrentUser()]);

  const canManageStaff = currentUser?.is_superuser ?? false;

  const from = total === 0 ? 0 : (page - 1) * LIST_PAGE_SIZE + 1;
  const to = Math.min(page * LIST_PAGE_SIZE, total);
  const columns = ["User", "Phone", "Join Date", "Total Orders", "Status", "Actions"];

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-stack-lg p-margin-page">
      <PageHeader
        title="User Management"
        subtitle="Manage customer accounts, view activity, and update status."
        action={<NewUserButton canManageStaff={canManageStaff} />}
      />

      <div className="grid grid-cols-1 gap-gutter md:grid-cols-3">
        <StatCard
          label="Total Users"
          value={stats ? stats.total_users.toLocaleString() : "—"}
          icon="groups"
          iconClass="bg-primary-fixed text-primary-container"
        />
        <StatCard
          label={`Active Users (${stats?.window_days ?? 30}d)`}
          value={stats ? stats.active_users.toLocaleString() : "—"}
          icon="how_to_reg"
          iconClass="bg-secondary-fixed text-secondary"
        />
        <StatCard
          label={`New Users (${stats?.window_days ?? 30}d)`}
          value={stats ? `+${stats.new_users.toLocaleString()}` : "—"}
          icon="trending_up"
          iconClass="bg-surface-container-highest text-tertiary"
          valueClass="text-zest-orange"
        />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-surface-container-highest bg-surface-container-lowest shadow-standard">
        <div className="flex flex-col items-center justify-between gap-4 border-b border-surface-container-high bg-surface-cream p-stack-md sm:flex-row">
          <TableSearch initialValue={search} placeholder="Search by name or phone..." />
          <div className="flex w-full gap-3 sm:w-auto">
            <button className="flex flex-1 items-center justify-center gap-2 rounded-md border border-outline-warm bg-surface-cream px-4 py-2 font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-container sm:flex-none">
              <span className="material-symbols-outlined text-sm">filter_list</span>
              Filter
            </button>
            <button className="flex flex-1 items-center justify-center gap-2 rounded-md border border-outline-warm bg-surface-cream px-4 py-2 font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-container sm:flex-none">
              <span className="material-symbols-outlined text-sm">download</span>
              Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] border-collapse text-left">
            <thead>
              <tr className="border-b border-surface-container-high bg-surface-cream/50">
                {columns.map((heading) => (
                  <th
                    key={heading}
                    className={`p-4 font-label-sm text-label-sm tracking-wider text-secondary uppercase ${
                      heading === "Actions"
                        ? "pr-stack-md text-right"
                        : heading === "User"
                          ? "pl-stack-md"
                          : ""
                    }`}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high font-body-sm text-body-sm">
              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="p-stack-xl text-center font-body-md text-body-md text-on-surface-variant"
                  >
                    {failed ? (
                      "Couldn't load users — the API didn't respond."
                    ) : outOfRange ? (
                      <>
                        Page {page} is past the end of the list.{" "}
                        <a
                          href={search ? `/users?q=${encodeURIComponent(search)}` : "/users"}
                          className="text-zest-orange underline"
                        >
                          Back to the first page
                        </a>
                      </>
                    ) : search ? (
                      `No users match “${search}”.`
                    ) : (
                      "No users yet."
                    )}
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="group transition-colors hover:bg-surface-container-low"
                  >
                    <td className="p-4 pl-stack-md">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-container-highest font-title-md text-tertiary">
                          {initialsOf(user)}
                        </div>
                        <div>
                          <p className="font-title-md text-title-md text-on-surface">
                            {user.full_name || "Unnamed"}
                          </p>
                          {user.is_staff && (
                            <p className="font-label-sm text-label-sm text-zest-orange">Admin</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-on-surface-variant">
                      <div className="flex items-center gap-1">
                        {user.phone_number}
                        {user.is_phone_verified && (
                          <span
                            title="Phone verified"
                            className="material-symbols-outlined text-[16px] text-green-700"
                          >
                            verified
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-on-surface-variant">
                      {formatJoined(user.date_joined)}
                    </td>
                    <td className="p-4 font-title-md text-title-md">{user.order_count}</td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          user.is_active
                            ? "bg-[#e6f4ea] text-[#137333]"
                            : "bg-surface-variant text-secondary"
                        }`}
                      >
                        {user.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="p-4 pr-stack-md text-right">
                      <UsersTableActions
                        user={user}
                        canManageStaff={canManageStaff}
                        currentUserId={currentUser?.id ?? null}
                      />
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
          noun="users"
          currentPage={page}
          totalPages={totalPages}
        />
      </div>
    </div>
  );
}
