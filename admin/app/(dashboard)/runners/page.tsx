import Image from "next/image";
import PageHeader from "@/components/PageHeader";
import Pagination from "@/components/Pagination";

const runners = [
  {
    name: "Alex Rivera",
    id: "RUN-8492",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAuIsDE4-LzxfyNd0H1UFSUYWTLSUwoEG3QZbj9TirBhppvmy4bn37H0uEdVE-xgMVnK1vf0fLm8D8inow1C3anugIfbBEOPYMxLLL3oszpC3Vi1YEBt-u0Zaxdo1dPaIhCIXCZWmKTluN2U3Rann-Gk0b3iRhTWkpxnw1iAC4Zfx-eRU-a7Q29ZhZckgD_RWZL71xQG3uJdUUbZtTtsO9ek4iZErCjNaHHSuSFIvgBEZ9I0_HKQrJx",
    status: "Online",
    statusClass: "bg-primary-fixed text-on-primary-fixed-variant",
    dotClass: "bg-zest-orange",
    activeOrders: 2,
    rating: 4.9,
    vehicle: "Scooter",
  },
  {
    name: "Sarah Chen",
    id: "RUN-9103",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA0aFaaI4d5AyzV6oztYCAQCekc93XbpIbq9v6wh48sgog4AEoAKWYnise4gg1R06fzi-ZRoQBoe7C8bLRD8O4dmrZkkALkthehDjI_phTHITN6lM8_1LXoQe3Le5zL6Mx8M2qa4pUYbaUODpU7ZzVAH_4JQi0RX9Im08024gclQqfw9-60V4uhHsIv9-zn5r5v7ZkVxZ6kSDUpot40v7slxBORAiL3eD4UYb3xP1jX5Xfh4zXog1sO",
    status: "Offline",
    statusClass: "bg-surface-variant text-on-surface-variant",
    dotClass: "bg-secondary",
    activeOrders: 0,
    rating: 5.0,
    vehicle: "Sedan",
  },
  {
    name: "Marcus Johnson",
    id: "RUN-7721",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCrPwewJpflSpShi-SGmS2tzUsMqScPy7M0iGSEGhLLkbHcckO5_nxZn-0vH424dka8R_qOKHfEKemhfx1CjyHyEoTwPB6NORrkGhk3czn9e20Pfmalz0uhmCNZ4nXdqGiLmApPvxDOtU86FEPAVgeVuA937_ZC6TyNcUZP9PXxyDJJGKAeXxJUe2kxU8aT4tVnpiJVq2mJuhBpT7Glc5pdvIdKYs5iHONrbGEo--zgqRUdxSKRglgo",
    status: "On Break",
    statusClass: "bg-secondary-container text-secondary",
    dotClass: "bg-secondary",
    activeOrders: 1,
    rating: 4.7,
    vehicle: "Bicycle",
  },
  {
    name: "Linda Torres",
    id: "RUN-3390",
    avatar: null,
    status: "Online",
    statusClass: "bg-primary-fixed text-on-primary-fixed-variant",
    dotClass: "bg-zest-orange",
    activeOrders: 3,
    rating: 4.8,
    vehicle: "Scooter",
  },
];

export default function RunnersPage() {
  return (
    <div className="p-margin-page">
      <PageHeader
        title="Runner Fleet"
        subtitle="Manage and monitor delivery partner activity."
        action={
          <button className="flex items-center gap-2 rounded-md bg-zest-orange px-6 py-3 font-label-md text-label-md text-on-primary shadow-sm transition-colors hover:bg-primary">
            <span className="material-symbols-outlined">add</span>
            Onboard Runner
          </button>
        }
      />

      <div className="mb-stack-xl grid grid-cols-1 gap-gutter md:grid-cols-3">
        <div className="flex flex-col justify-between rounded-xl border border-surface-container-low bg-surface-container-lowest p-stack-md shadow-standard">
          <div className="mb-4 flex items-start justify-between border-b border-surface-container-high pb-4">
            <span className="font-title-md text-title-md text-on-surface-variant">Total Fleet</span>
            <div className="rounded-md bg-primary-fixed p-2 text-zest-orange">
              <span className="material-symbols-outlined">directions_bike</span>
            </div>
          </div>
          <div>
            <div className="mb-2 font-display-lg text-display-lg text-on-surface">1,248</div>
            <div className="flex items-center gap-2 font-label-sm text-label-sm text-primary-container">
              <span className="material-symbols-outlined text-[16px]">trending_up</span>
              <span>+12 this week</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-surface-container-low bg-surface-container-lowest p-stack-md shadow-standard">
          <div className="mb-4 flex items-start justify-between border-b border-surface-container-high pb-4">
            <span className="font-title-md text-title-md text-on-surface-variant">Online Now</span>
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-zest-orange opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-zest-orange" />
              </span>
              <span className="font-label-sm text-label-sm text-zest-orange">High demand</span>
            </div>
          </div>
          <div>
            <div className="mb-2 font-display-lg text-display-lg text-on-surface">412</div>
            <div className="font-body-sm text-body-sm text-on-surface-variant">
              Active delivery partners
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-surface-container-low bg-surface-container-lowest p-stack-md shadow-standard">
          <div className="mb-4 flex items-start justify-between border-b border-surface-container-high pb-4">
            <span className="font-title-md text-title-md text-on-surface-variant">Avg. Rating</span>
            <div className="rounded-md bg-secondary-container p-2 text-secondary">
              <span className="material-symbols-outlined">star_rate</span>
            </div>
          </div>
          <div>
            <div className="mb-2 font-display-lg text-display-lg text-on-surface">
              4.8 <span className="font-headline-md text-headline-md text-on-surface-variant">/ 5.0</span>
            </div>
            <div className="font-body-sm text-body-sm text-on-surface-variant">
              Based on customer feedback
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col overflow-hidden rounded-xl border border-surface-container-low bg-surface-container-lowest shadow-standard">
        <div className="flex flex-col items-center justify-between gap-4 border-b border-surface-container-high bg-surface-cream p-stack-md md:flex-row">
          <h3 className="font-title-lg text-title-lg text-on-surface">Runner Roster</h3>
          <div className="flex w-full items-center gap-3 md:w-auto">
            <div className="relative flex-1 md:w-64">
              <span className="material-symbols-outlined absolute top-1/2 left-3 -translate-y-1/2 text-[20px] text-on-surface-variant">
                search
              </span>
              <input
                type="text"
                placeholder="Search runners..."
                className="w-full rounded-md border border-outline-variant bg-surface py-2 pr-4 pl-10 font-body-sm text-body-sm outline-none focus:border-zest-orange focus:ring-0"
              />
            </div>
            <button className="flex items-center gap-2 rounded-md border border-outline-warm bg-surface px-4 py-2 font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-container-low">
              <span className="material-symbols-outlined text-[20px]">filter_list</span>
              Filter
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-surface-container-high bg-surface-container-low">
                {["Runner Name", "Status", "Active Orders", "Rating", "Vehicle Type", "Actions"].map(
                  (h) => (
                    <th
                      key={h}
                      className={`px-stack-md py-3 font-label-sm text-label-sm tracking-wider text-on-surface opacity-50 uppercase ${
                        h === "Actions" ? "text-right" : ""
                      }`}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high bg-surface-container-lowest font-body-sm text-body-sm">
              {runners.map((runner) => (
                <tr key={runner.id} className="group h-[56px] transition-colors hover:bg-surface-container-low">
                  <td className="px-stack-md py-2">
                    <div className="flex items-center gap-3">
                      {runner.avatar ? (
                        <Image
                          src={runner.avatar}
                          alt={runner.name}
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-full border border-outline-variant object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant bg-tertiary-fixed font-title-md text-title-md text-on-tertiary-fixed">
                          LT
                        </div>
                      )}
                      <div>
                        <div className="font-title-md text-title-md text-on-surface">{runner.name}</div>
                        <div className="text-[12px] text-on-surface-variant">ID: {runner.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-stack-md py-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-label-sm text-label-sm ${runner.statusClass}`}
                    >
                      <span className={`h-2 w-2 rounded-full ${runner.dotClass}`} />
                      {runner.status}
                    </span>
                  </td>
                  <td className="px-stack-md py-2 font-title-md text-title-md text-on-surface">
                    {runner.activeOrders}
                  </td>
                  <td className="px-stack-md py-2">
                    <div className="flex items-center gap-1 text-on-surface">
                      <span className="material-symbols-outlined fill text-[16px] text-zest-orange">
                        star
                      </span>
                      <span>{runner.rating.toFixed(1)}</span>
                    </div>
                  </td>
                  <td className="px-stack-md py-2 text-on-surface-variant">{runner.vehicle}</td>
                  <td className="px-stack-md py-2 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        className="rounded-md p-2 text-secondary transition-colors hover:bg-primary-fixed hover:text-zest-orange"
                        title="Edit"
                      >
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                      <button
                        className="rounded-md p-2 text-secondary transition-colors hover:bg-primary-fixed hover:text-zest-orange"
                        title="View Profile"
                      >
                        <span className="material-symbols-outlined text-[20px]">visibility</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination from={1} to={4} total={1248} noun="runners" currentPage={1} totalPages={125} />
      </div>
    </div>
  );
}
