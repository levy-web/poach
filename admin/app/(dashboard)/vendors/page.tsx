import Image from "next/image";
import PageHeader from "@/components/PageHeader";
import Pagination from "@/components/Pagination";

const vendors = [
  {
    name: "Burger Haven",
    logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuD346bNLUElm2En_e6kVZaOVw350B9nquitEWu4aIu0Y7F7kXOwZOGi91GCrtBhqTvwYJbdyVQ_SqVyl1tbd21QwylyjkJpgv6XxUtwRXdXUDKAcSvq-ioVmWacOiRkpviVQZzYHuNUR1uU6vngGPVss5ulq2DHpVQvk07z8Y3aT4PIGPnZJJb7HgI8AJuOhcsrNgM6ojEBqTaYb1_Wrxmk0kuxjMbMBQ6tl3Vd1Ksi2JF0P6F5wmUA",
    category: "Fast Food",
    status: "Active",
    statusClass: "border border-[#a5d6a7] bg-[#e8f5e9] text-[#2e7d32]",
    rating: "4.8",
    items: "42 items",
  },
  {
    name: "Green Bowl Co.",
    logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuC8zL4oFoAkSRv1gP7PO_1aVHt5nNR7KiSjyGsNZwrYE2wGFFLnGqSM1id88w5UhkN7H8ICmdzOkE6MWEovxrxBvRq6dwFWnA4AjWP6nXSUX4TR0IxXZfWESAlascim_nHlmKksw3bb05QFnwy64E2JTyFLfesJmr4r7L23AIqOmQh_XXiCqW_e87K-FyBb0pzJl57w3Yb06a8L9cWXOz20mvVenwmX_qrPvHy0zWiTrFdFr27GAszL",
    category: "Healthy",
    status: "Active",
    statusClass: "border border-[#a5d6a7] bg-[#e8f5e9] text-[#2e7d32]",
    rating: "4.9",
    items: "28 items",
  },
  {
    name: "Tokyo Noodle Bar",
    logo: null,
    initials: "TN",
    category: "Asian",
    status: "Paused",
    statusClass: "border border-outline-variant bg-surface-container-highest text-on-surface-variant",
    rating: "4.5",
    items: "35 items",
  },
  {
    name: "Spicy Fiesta",
    logo: null,
    initials: "SF",
    category: "Mexican",
    status: "Onboarding",
    statusClass: "border border-blue-200 bg-blue-50 text-blue-700",
    rating: null,
    items: "--",
  },
];

export default function VendorsPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-stack-xl px-margin-page py-stack-xl">
      <PageHeader
        title="Vendor Management"
        subtitle="Manage restaurant partners, track performance, and oversee active menus across the platform."
        action={
          <button className="flex items-center gap-2 rounded-md bg-zest-orange px-6 py-3 font-label-md text-label-md text-white shadow-[0px_4px_20px_rgba(171,53,0,0.2)] transition-colors duration-200 active:scale-95 hover:bg-primary">
            <span className="material-symbols-outlined text-[20px]">add</span>
            Add New Vendor
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-gutter md:grid-cols-3">
        <div className="group relative overflow-hidden rounded-xl border border-surface-container-highest bg-surface-container-lowest p-stack-lg shadow-standard">
          <div className="absolute top-0 right-0 p-stack-md opacity-10 transition-opacity group-hover:opacity-20">
            <span className="material-symbols-outlined text-[80px] text-zest-orange">storefront</span>
          </div>
          <p className="mb-2 font-label-sm text-label-sm tracking-wider text-on-surface-variant uppercase">
            Total Active Vendors
          </p>
          <h3 className="font-display-lg text-display-lg text-on-surface">142</h3>
          <div className="mt-4 flex w-fit items-center gap-2 rounded-full bg-green-50 px-2 py-1 font-label-sm text-label-sm text-green-700">
            <span className="material-symbols-outlined text-[16px]">trending_up</span>
            +12 this month
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-xl border border-surface-container-highest bg-surface-container-lowest p-stack-lg shadow-standard">
          <div className="absolute top-0 right-0 p-stack-md opacity-10 transition-opacity group-hover:opacity-20">
            <span className="material-symbols-outlined text-[80px] text-zest-orange">star</span>
          </div>
          <p className="mb-2 font-label-sm text-label-sm tracking-wider text-on-surface-variant uppercase">
            Avg Vendor Rating
          </p>
          <h3 className="font-display-lg text-display-lg text-on-surface">
            4.8<span className="text-title-lg text-on-surface-variant">/5.0</span>
          </h3>
          <div className="mt-4 flex w-fit items-center gap-2 rounded-full bg-surface-container px-2 py-1 font-label-sm text-label-sm text-on-surface-variant">
            Based on 12k reviews
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-xl border border-zest-orange/30 bg-surface-container-lowest p-stack-lg shadow-standard">
          <div className="absolute top-0 right-0 p-stack-md opacity-10 transition-opacity group-hover:opacity-20">
            <span className="material-symbols-outlined text-[80px] text-zest-orange">update</span>
          </div>
          <p className="mb-2 font-label-sm text-label-sm tracking-wider text-on-surface-variant uppercase">
            Pending Menu Updates
          </p>
          <h3 className="font-display-lg text-display-lg text-zest-orange">24</h3>
          <div className="mt-4 flex w-fit cursor-pointer items-center gap-2 rounded-full bg-primary-fixed-dim/30 px-2 py-1 font-label-sm text-label-sm text-zest-orange transition-colors hover:bg-primary-fixed-dim/50">
            Review Now <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-surface-container-highest bg-surface-container-lowest shadow-standard">
        <div className="flex flex-col items-center justify-between gap-4 border-b border-surface-container-high bg-surface-cream/50 p-stack-md sm:flex-row">
          <h3 className="font-title-lg text-title-lg text-on-surface">Vendor Directory</h3>
          <div className="flex w-full items-center gap-3 sm:w-auto">
            <div className="relative w-full sm:w-64">
              <span className="material-symbols-outlined absolute top-1/2 left-3 -translate-y-1/2 text-[20px] text-on-surface-variant">
                search
              </span>
              <input
                type="text"
                placeholder="Search vendors..."
                className="w-full rounded-md border border-outline-variant bg-surface px-4 py-2 pl-10 font-body-sm text-body-sm shadow-sm transition-all focus:border-zest-orange focus:ring-2 focus:ring-zest-orange"
              />
            </div>
            <div className="relative">
              <select className="cursor-pointer appearance-none rounded-md border border-outline-variant bg-surface px-4 py-2 pr-10 font-body-sm text-body-sm text-on-surface shadow-sm transition-all focus:border-zest-orange focus:ring-2 focus:ring-zest-orange">
                <option>All Categories</option>
                <option>Fast Food</option>
                <option>Healthy</option>
                <option>Asian</option>
              </select>
              <span className="material-symbols-outlined pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-on-surface-variant">
                expand_more
              </span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-surface-container-high bg-surface-cream/30">
                {["Vendor", "Category", "Status", "Rating", "Active Menu Items", "Actions"].map((h) => (
                  <th
                    key={h}
                    className={`px-stack-md py-4 font-label-sm text-label-sm tracking-wider text-on-surface-variant uppercase ${
                      h === "Actions" ? "text-right" : ""
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high font-body-md text-body-md text-on-surface">
              {vendors.map((vendor) => (
                <tr key={vendor.name} className="group transition-colors hover:bg-surface-container-low">
                  <td className="px-stack-md py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border border-outline-variant bg-white p-1 shadow-sm">
                        {vendor.logo ? (
                          <Image
                            src={vendor.logo}
                            alt={vendor.name}
                            width={40}
                            height={40}
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <span className="font-bold text-on-surface-variant">{vendor.initials}</span>
                        )}
                      </div>
                      <span className="font-title-md text-title-md font-semibold">{vendor.name}</span>
                    </div>
                  </td>
                  <td className="px-stack-md py-4 text-on-surface-variant">{vendor.category}</td>
                  <td className="px-stack-md py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-label-sm text-label-sm ${vendor.statusClass}`}
                    >
                      {vendor.status}
                    </span>
                  </td>
                  <td className="px-stack-md py-4">
                    {vendor.rating ? (
                      <div className="flex items-center gap-1 font-semibold">
                        <span className="material-symbols-outlined fill text-[16px] text-[#f59e0b]">
                          star
                        </span>
                        {vendor.rating}
                      </div>
                    ) : (
                      <span className="font-label-sm text-on-surface-variant italic">New</span>
                    )}
                  </td>
                  <td className="px-stack-md py-4 text-on-surface-variant">{vendor.items}</td>
                  <td className="px-stack-md py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                      {vendor.rating && (
                        <button
                          className="rounded-md p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-zest-orange"
                          title="View Menu"
                        >
                          <span className="material-symbols-outlined text-[20px]">restaurant_menu</span>
                        </button>
                      )}
                      <button
                        className="rounded-md p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-zest-orange"
                        title="Edit Vendor"
                      >
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination from={1} to={4} total={142} noun="vendors" currentPage={1} totalPages={3} />
      </div>
    </div>
  );
}
