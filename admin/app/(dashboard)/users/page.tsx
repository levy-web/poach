import Image from "next/image";
import PageHeader from "@/components/PageHeader";
import Pagination from "@/components/Pagination";

const users = [
  {
    name: "Alex Mercer",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCOqgMG4y6cH4DWgy6jpB8JTPBNjIcf2gZlklFcLkTiXFRCxeiGx0QGoQwBySOUNrorMyYYAwjbkjpUnkTfurZNeeXuxjd7yUoGxHFMciIRaWvQqG2oN-6GWJ9MkGs0zoBi3O6GbOa-2J_1WH_SINcdAWITezyxr7CbxbMaBQ2qTUUO9VFj53YPFG1mV1WDO47zLAmOMAatJ5O1ap8m5GIDYhzmWd3zOHq2v1v0NtDUorU-bT6b8TU8",
    email: "alex.mercer@example.com",
    phone: "+1 (555) 123-4567",
    joined: "Oct 12, 2023",
    orders: 42,
    status: "Active",
    statusClass: "bg-[#e6f4ea] text-[#137333]",
  },
  {
    name: "Samantha Reed",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBwubSyZ6EoUnuFEjBZf9q2e5o87nLTi01f0ANHTZ0DKkpA10brrmHxzKIn0wnaVmOHoiUJPd8_cPAlJD5d_vmDeb_SzmOueleaWGlImAnhNVBX9vd_ckW5IJ8in5OUEeQ8UzM-NfubahFc23aFCp2z1oSOYMHzzERBGVE66-m5OQvgKwKyTE9p1wKu48DgbwSQ1elc5Vsl32H1DtWVIZXN2bQTgNCenOKtWDrs4HK-vtruFhDggFcR",
    email: "s.reed99@example.com",
    phone: "+1 (555) 987-6543",
    joined: "Nov 04, 2023",
    orders: 15,
    status: "Active",
    statusClass: "bg-[#e6f4ea] text-[#137333]",
  },
  {
    name: "Jordan Tyler",
    avatar: null,
    initials: "JT",
    email: "jtyler.design@example.com",
    phone: "+1 (555) 222-3333",
    joined: "Jan 18, 2024",
    orders: 3,
    status: "Inactive",
    statusClass: "bg-surface-variant text-secondary",
  },
];

export default function UsersPage() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-stack-lg p-margin-page">
      <PageHeader
        title="User Management"
        subtitle="Manage customer accounts, view activity, and update status."
        action={
          <button className="flex items-center gap-2 rounded-md bg-zest-orange px-6 py-3 font-label-md text-label-md text-white shadow-sm transition-all duration-200 active:scale-95 hover:bg-zest-orange-container">
            <span className="material-symbols-outlined">add</span>
            New User
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-gutter md:grid-cols-3">
        <div className="flex items-center gap-4 rounded-xl bg-surface-container-lowest p-stack-md shadow-standard">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-fixed text-primary-container">
            <span className="material-symbols-outlined fill">groups</span>
          </div>
          <div>
            <p className="font-label-md text-label-md tracking-wider text-secondary uppercase">
              Total Users
            </p>
            <p className="font-headline-lg text-headline-lg">124,592</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl bg-surface-container-lowest p-stack-md shadow-standard">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary-fixed text-secondary">
            <span className="material-symbols-outlined fill">how_to_reg</span>
          </div>
          <div>
            <p className="font-label-md text-label-md tracking-wider text-secondary uppercase">
              Active Users (30d)
            </p>
            <p className="font-headline-lg text-headline-lg">89,204</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl bg-surface-container-lowest p-stack-md shadow-standard">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container-highest text-tertiary">
            <span className="material-symbols-outlined fill">trending_up</span>
          </div>
          <div>
            <p className="font-label-md text-label-md tracking-wider text-secondary uppercase">
              New Users (30d)
            </p>
            <p className="font-headline-lg text-headline-lg text-zest-orange">+3,412</p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-surface-container-highest bg-surface-container-lowest shadow-standard">
        <div className="flex flex-col items-center justify-between gap-4 border-b border-surface-container-high bg-surface-cream p-stack-md sm:flex-row">
          <div className="relative w-full sm:w-96">
            <span className="material-symbols-outlined absolute top-1/2 left-3 -translate-y-1/2 text-secondary">
              search
            </span>
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              className="w-full rounded-md border border-outline-variant bg-surface-container-lowest py-2 pr-4 pl-10 font-body-sm text-body-sm shadow-sm outline-none focus:border-zest-orange focus:ring-0"
            />
          </div>
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
                {["User", "Email", "Phone", "Join Date", "Total Orders", "Status", "Actions"].map((h) => (
                  <th
                    key={h}
                    className={`p-4 font-label-sm text-label-sm tracking-wider text-secondary uppercase ${
                      h === "Actions" ? "pr-stack-md text-right" : h === "User" ? "pl-stack-md" : ""
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high font-body-sm text-body-sm">
              {users.map((user) => (
                <tr key={user.email} className="group transition-colors hover:bg-surface-container-low">
                  <td className="p-4 pl-stack-md">
                    <div className="flex items-center gap-3">
                      {user.avatar ? (
                        <Image
                          src={user.avatar}
                          alt={user.name}
                          width={40}
                          height={40}
                          className="h-10 w-10 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-container-highest font-title-md text-tertiary">
                          {user.initials}
                        </div>
                      )}
                      <p className="font-title-md text-title-md text-on-surface">{user.name}</p>
                    </div>
                  </td>
                  <td className="p-4 text-on-surface-variant">{user.email}</td>
                  <td className="p-4 text-on-surface-variant">{user.phone}</td>
                  <td className="p-4 text-on-surface-variant">{user.joined}</td>
                  <td className="p-4 font-title-md text-title-md">{user.orders}</td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${user.statusClass}`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="p-4 pr-stack-md text-right">
                    <button className="text-secondary opacity-0 transition-opacity group-hover:opacity-100 hover:text-zest-orange">
                      <span className="material-symbols-outlined">more_vert</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination from={1} to={10} total={124592} noun="users" currentPage={1} totalPages={3} />
      </div>
    </div>
  );
}
