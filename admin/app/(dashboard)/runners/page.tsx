"use client";

import Image from "next/image";
import PageHeader from "@/components/PageHeader";
import Pagination from "@/components/Pagination";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { selectFilteredRunners, setCurrentPage, setSearchQuery } from "@/lib/features/runners/runnersSlice";

export default function RunnersPage() {
  const dispatch = useAppDispatch();
  const runners = useAppSelector(selectFilteredRunners);
  const { searchQuery, currentPage, totalFleet, onlineNow, avgRating } = useAppSelector((state) => state.runners);

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
            <div className="mb-2 font-display-lg text-display-lg text-on-surface">
              {totalFleet.toLocaleString()}
            </div>
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
            <div className="mb-2 font-display-lg text-display-lg text-on-surface">
              {onlineNow.toLocaleString()}
            </div>
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
              {avgRating} <span className="font-headline-md text-headline-md text-on-surface-variant">/ 5.0</span>
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
                value={searchQuery}
                onChange={(event) => dispatch(setSearchQuery(event.target.value))}
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

        <Pagination
          from={runners.length ? 1 : 0}
          to={runners.length}
          total={totalFleet}
          noun="runners"
          currentPage={currentPage}
          totalPages={125}
          onPageChange={(page) => dispatch(setCurrentPage(page))}
        />
      </div>
    </div>
  );
}
