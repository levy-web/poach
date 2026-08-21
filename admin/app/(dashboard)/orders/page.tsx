import PageHeader from "@/components/PageHeader";
import Pagination from "@/components/Pagination";

const metrics = [
  {
    label: "Active Orders",
    value: "342",
    icon: "speed",
    iconClass: "bg-primary-fixed text-primary",
    footer: (
      <div className="mt-2 flex items-center gap-1.5">
        <span className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-error opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-error" />
        </span>
        <span className="font-label-sm text-label-sm text-error">Live</span>
      </div>
    ),
  },
  {
    label: "Pending Acceptance",
    value: "18",
    valueClass: "text-error",
    icon: "pending_actions",
    iconClass: "bg-error-container text-zest-orange",
    footer: (
      <div className="mt-2 flex items-center gap-1.5">
        <span className="material-symbols-outlined text-[16px] text-error">warning</span>
        <span className="font-label-sm text-label-sm text-error">Requires Attention</span>
      </div>
    ),
  },
  {
    label: "Completed Today",
    value: "1,894",
    icon: "task_alt",
    iconClass: "bg-[#dcfce7] text-[#14532d]",
    footer: (
      <div className="mt-2 flex items-center gap-1.5">
        <span className="material-symbols-outlined text-[16px] text-[#166534]">trending_up</span>
        <span className="font-label-sm text-label-sm text-[#166534]">+5% vs yesterday</span>
      </div>
    ),
  },
  {
    label: "Avg. Delivery Time",
    value: "28",
    valueSuffix: "mins",
    icon: "schedule",
    iconClass: "bg-[#dbeafe] text-[#1e40af]",
    footer: (
      <div className="mt-2 flex items-center gap-1.5">
        <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
          horizontal_rule
        </span>
        <span className="font-label-sm text-label-sm text-on-surface-variant">Stable</span>
      </div>
    ),
  },
];

const orders = [
  {
    id: "#ORD-9925",
    initials: "AM",
    customer: "Alex Mercer",
    vendor: "Burger Haven",
    runner: "Alex Rivera",
    status: "Preparing",
    statusClass: "bg-[#fef08a] text-[#854d0e]",
    total: "$42.50",
  },
  {
    id: "#ORD-9924",
    initials: "SR",
    customer: "Samantha Reed",
    vendor: "Green Bowl Co.",
    runner: "Sarah Chen",
    status: "Out for Delivery",
    statusClass: "bg-[#bfdbfe] text-[#1e40af]",
    total: "$28.75",
  },
  {
    id: "#ORD-9923",
    initials: "JT",
    customer: "Jordan Tyler",
    vendor: "Tokyo Noodle Bar",
    runner: "Marcus Johnson",
    status: "Pending",
    statusClass: "border border-error/20 bg-error-container text-on-error-container",
    total: "$35.00",
    highlighted: true,
  },
  {
    id: "#ORD-9922",
    initials: "LT",
    customer: "Linda Torres",
    vendor: "Spicy Fiesta",
    runner: null,
    status: "Preparing",
    statusClass: "bg-[#fef08a] text-[#854d0e]",
    total: "$22.10",
  },
];

export default function OrdersPage() {
  return (
    <div className="space-y-stack-lg px-margin-page py-stack-xl">
      <PageHeader
        title="Order Management"
        subtitle="Monitor and manage live orders across the platform."
      />

      <div className="grid grid-cols-1 gap-gutter md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="relative flex flex-col justify-between overflow-hidden rounded-xl border border-surface-container-high bg-surface-container-lowest p-stack-md shadow-standard transition-shadow duration-300 hover:shadow-standard-hover"
          >
            <div className="mb-4 flex items-start justify-between">
              <span className="font-label-md text-label-md text-on-surface-variant">
                {metric.label}
              </span>
              <span className={`material-symbols-outlined rounded-md p-1.5 ${metric.iconClass}`}>
                {metric.icon}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`font-display-lg text-display-lg text-on-surface ${metric.valueClass ?? ""}`}>
                {metric.value}
                {metric.valueSuffix && (
                  <span className="ml-1 font-title-lg text-title-lg text-on-surface-variant">
                    {metric.valueSuffix}
                  </span>
                )}
              </span>
            </div>
            {metric.footer}
          </div>
        ))}
      </div>

      <div className="flex flex-col overflow-hidden rounded-xl border border-surface-container-high bg-surface-container-lowest shadow-standard">
        <div className="flex flex-col items-start justify-between gap-4 border-b border-surface-container-high bg-surface-cream p-stack-md sm:flex-row sm:items-center">
          <h3 className="font-title-md text-title-md text-on-surface">Live Orders</h3>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <div className="relative w-full sm:w-64">
              <span className="material-symbols-outlined absolute top-1/2 left-3 -translate-y-1/2 text-[20px] text-on-surface-variant">
                search
              </span>
              <input
                type="text"
                placeholder="Search Order ID or Customer..."
                className="w-full rounded-md border border-outline-variant bg-surface py-2 pr-3 pl-10 font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant outline-none focus:border-transparent focus:ring-2 focus:ring-zest-orange"
              />
            </div>
            <button className="flex w-full items-center justify-between gap-2 rounded-md border border-outline-variant bg-surface px-4 py-2 font-label-sm text-label-sm text-on-surface transition-colors hover:bg-surface-container-low sm:w-auto">
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">filter_list</span> Status: All
              </span>
              <span className="material-symbols-outlined text-[20px]">expand_more</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-surface-container-high bg-surface-container-low/50">
                {["Order ID", "Customer", "Vendor", "Runner", "Status", "Total", "Actions"].map((h) => (
                  <th
                    key={h}
                    className={`px-stack-md py-3 font-label-sm text-label-sm whitespace-nowrap text-on-surface-variant opacity-70 ${
                      h === "Total" ? "text-right" : h === "Actions" ? "text-center" : ""
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-highest font-body-sm text-body-sm text-on-surface">
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className={`group h-[56px] transition-colors hover:bg-surface-container-lowest/50 ${
                    order.highlighted ? "bg-error-container/10" : ""
                  }`}
                >
                  <td className="px-stack-md py-3 font-label-md text-label-md whitespace-nowrap text-on-surface">
                    {order.id}
                  </td>
                  <td className="px-stack-md py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary-container font-label-sm text-on-secondary-container">
                        {order.initials}
                      </div>
                      <span>{order.customer}</span>
                    </div>
                  </td>
                  <td className="px-stack-md py-3 text-on-surface-variant">{order.vendor}</td>
                  <td className="px-stack-md py-3 text-on-surface-variant">
                    {order.runner ?? <span className="text-secondary opacity-50">--</span>}
                  </td>
                  <td className="px-stack-md py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${order.statusClass}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-stack-md py-3 text-right font-label-md text-label-md">
                    {order.total}
                  </td>
                  <td className="px-stack-md py-3 text-center">
                    <button className="rounded p-1 text-on-surface-variant opacity-0 transition-colors group-hover:opacity-100 hover:bg-surface-container-high hover:text-primary focus:opacity-100">
                      <span className="material-symbols-outlined text-[20px]">visibility</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination from={1} to={4} total={342} noun="entries" currentPage={1} totalPages={3} />
      </div>
    </div>
  );
}
