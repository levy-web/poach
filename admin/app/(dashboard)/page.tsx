import Image from "next/image";

const metrics = [
  {
    label: "Total Revenue",
    value: "$124,500.00",
    icon: "account_balance_wallet",
    trend: "12.5%",
    trendDirection: "up" as const,
    trendLabel: "vs last week",
    chart: true,
  },
  {
    label: "Active Orders",
    value: "3,452",
    icon: "shopping_bag",
    trend: "8.2%",
    trendDirection: "up" as const,
    trendLabel: "vs last week",
  },
  {
    label: "New Users",
    value: "892",
    icon: "person_add",
    trend: "2.1%",
    trendDirection: "down" as const,
    trendLabel: "vs last week",
  },
  {
    label: "Active Vendors",
    value: "156",
    icon: "store",
    trend: "5.0%",
    trendDirection: "up" as const,
    trendLabel: "vs last week",
  },
];

const activity = [
  {
    icon: "person_add",
    tone: "primary" as const,
    title: "New Runner Sign-up",
    detail: "Mike T. completed background check.",
    time: "10 mins ago",
  },
  {
    icon: "store",
    tone: "neutral" as const,
    title: "Vendor Registration",
    detail: "'Burger Queen' application submitted.",
    time: "45 mins ago",
  },
  {
    icon: "warning",
    tone: "error" as const,
    title: "Delivery Delay",
    detail: "Order #4429 delayed by traffic.",
    time: "2 hours ago",
  },
  {
    icon: "payments",
    tone: "primary" as const,
    title: "Payout Processed",
    detail: "Weekly payout to 50 vendors complete.",
    time: "4 hours ago",
  },
];

const liveOperations = [
  {
    id: "#ORD-9921",
    vendor: "Spicy Wok",
    customer: "Jane D.",
    runner: "Assigning...",
    runnerAvatar: null,
    status: "Preparing",
    amount: "$34.50",
  },
  {
    id: "#ORD-9920",
    vendor: "Luigi's Pizza",
    customer: "Mark S.",
    runner: "Tom H.",
    runnerAvatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAss36RrOdiM1r1IyauxT5NpdrT8BkYLuT4guAXOX_2AknMOFx0M7KeRa1v07OEBQt2JueB_j6dV3CiItuiSC1PuKneLStP822OSRjoqzW9g7lWO7TVmW7NlQIRiYa1HNn0-WdvOmK9lY6vRe7zsqe69qiuJ-SRthuuYS6mJpCL8KDfrfztJ8QCYurvwObenFSvWFu-ofb2kjLnlp1BsPR7LjK_1l30jQgTre5fuvTq7x1TF_fNvL5k",
    status: "Out for Delivery",
    amount: "$52.00",
  },
  {
    id: "#ORD-9919",
    vendor: "Green Bowl",
    customer: "Alice W.",
    runner: "Sarah J.",
    runnerAvatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCh08FTS3S-SmU0WcL9YHrKVpNRQDzjX6pQsS6X-KR06XQufX3TvwcD1xEvGMjNCtLvtI8ZALH_RJ5xeYLmBaubi15KVEYKruQHpa7WFWlt2Bwsa5qtKLtLNZBUUry0DITIrmpsZUlEJnfj8_c0nxO7mDysXGy-Q9hxlmiEGAZz4jLs1V5zBh-_QvAkPOTJqJWO-62EIrYz2ovsOoFnciyx2P0YKO14zuMwW3G1QKAP0yzlgM5cWrvx",
    status: "Delivered",
    amount: "$18.75",
  },
  {
    id: "#ORD-9918",
    vendor: "Taco Fiesta",
    customer: "Ben R.",
    runner: "Waiting at store...",
    runnerAvatar: null,
    status: "Delayed",
    amount: "$22.10",
  },
];

const barHeights = [30, 45, 25, 60, 55, 80, 40, 75, 65, 90, 50, 85];

function statusBadgeClasses(status: string) {
  switch (status) {
    case "Out for Delivery":
      return "bg-primary-fixed-dim text-on-primary-fixed";
    case "Delivered":
      return "bg-surface-variant text-on-surface-variant";
    case "Delayed":
      return "bg-error-container/50 text-error";
    default:
      return "bg-surface-container-high text-on-surface";
  }
}

export default function OverviewPage() {
  return (
    <div className="p-margin-page">
      <div className="mb-stack-lg flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h2 className="mb-2 font-headline-lg text-headline-lg text-on-surface">
            Welcome Back, Sarah.
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Here&apos;s what&apos;s happening across the Zest platform today.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 rounded-md border border-outline-warm bg-surface-container-lowest px-4 py-2 font-label-md text-label-md text-on-surface shadow-sm transition-colors hover:bg-surface-container-low">
            <span className="material-symbols-outlined text-sm">download</span>
            Export Report
          </button>
          <button className="flex items-center gap-2 rounded-md bg-zest-orange px-4 py-2 font-label-md text-label-md text-on-primary shadow-sm shadow-zest-orange/20 transition-colors hover:bg-primary-container">
            <span className="material-symbols-outlined text-sm">add</span>
            New Action
          </button>
        </div>
      </div>

      <div className="mb-stack-xl grid grid-cols-1 gap-gutter md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="group relative overflow-hidden rounded-xl border border-surface-container-highest bg-surface-container-lowest p-stack-md shadow-standard"
          >
            <div className="relative z-10 mb-4 flex items-start justify-between">
              <div>
                <p className="mb-1 font-label-sm text-label-sm tracking-wider text-on-surface-variant uppercase">
                  {metric.label}
                </p>
                <h3 className="font-headline-md text-headline-md text-on-surface">{metric.value}</h3>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-fixed text-primary">
                <span className="material-symbols-outlined fill">{metric.icon}</span>
              </div>
            </div>
            <div className="relative z-10 flex items-center gap-2">
              <span
                className={`flex items-center gap-1 rounded-full px-2 py-1 font-label-sm text-label-sm ${
                  metric.trendDirection === "up"
                    ? "bg-primary-fixed-dim text-on-primary-fixed"
                    : "bg-error-container text-error"
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">
                  {metric.trendDirection === "up" ? "arrow_upward" : "arrow_downward"}
                </span>
                {metric.trend}
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                {metric.trendLabel}
              </span>
            </div>
            {metric.chart && (
              <div className="pointer-events-none absolute bottom-0 left-0 h-16 w-full opacity-10 transition-transform duration-500 group-hover:scale-105">
                <svg className="h-full w-full fill-zest-orange" preserveAspectRatio="none" viewBox="0 0 100 30">
                  <path d="M0 30 V 20 Q 10 15, 20 25 T 40 15 T 60 22 T 80 10 T 100 18 V 30 Z" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-gutter lg:grid-cols-3">
        <div className="flex h-[400px] flex-col rounded-xl border border-surface-container-highest bg-surface-container-lowest shadow-standard lg:col-span-2">
          <div className="flex items-center justify-between border-b border-surface-container-highest p-stack-md">
            <h3 className="font-title-md text-title-md text-on-surface">Sales Trends</h3>
            <select className="rounded-md border border-outline-variant bg-surface-container-low px-3 py-1 text-sm text-on-surface outline-none focus:ring-1 focus:ring-zest-orange">
              <option>Last 30 Days</option>
              <option>Last 7 Days</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="relative flex flex-1 items-end justify-center overflow-hidden p-stack-md">
            <div className="z-10 flex h-full w-full items-end justify-between gap-1 px-4 pt-4 pb-6">
              {barHeights.map((height, i) => (
                <div
                  key={i}
                  className={`h-full w-full rounded-t-sm transition-colors ${
                    height === 80 ? "bg-zest-orange/60 hover:bg-zest-orange" : "bg-surface-container-highest hover:bg-zest-orange/30"
                  }`}
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex h-[400px] flex-col rounded-xl border border-surface-container-highest bg-surface-container-lowest shadow-standard">
          <div className="flex items-center justify-between border-b border-surface-container-highest p-stack-md">
            <h3 className="font-title-md text-title-md text-on-surface">Recent Activity</h3>
            <button className="text-sm font-semibold text-zest-orange transition-colors hover:text-primary">
              View All
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-stack-md">
            <ul className="space-y-4">
              {activity.map((item) => (
                <li key={item.title} className="flex items-start gap-3">
                  <div
                    className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      item.tone === "error"
                        ? "bg-error-container text-error"
                        : item.tone === "primary"
                          ? "bg-primary-fixed text-primary"
                          : "bg-surface-container-high text-on-surface"
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">{item.icon}</span>
                  </div>
                  <div>
                    <p className="font-body-sm text-body-sm text-on-surface">
                      <span className="font-semibold">{item.title}</span>
                    </p>
                    <p className="text-sm text-on-surface-variant">{item.detail}</p>
                    <p className="mt-1 text-xs text-secondary">{item.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-stack-md flex flex-col rounded-xl border border-surface-container-highest bg-surface-container-lowest shadow-standard lg:col-span-3">
          <div className="flex items-center justify-between border-b border-surface-container-highest p-stack-md">
            <div>
              <h3 className="flex items-center gap-2 font-title-md text-title-md text-on-surface">
                <span className="h-2 w-2 animate-pulse rounded-full bg-zest-orange" />
                Live Operations
              </h3>
              <p className="mt-1 text-sm text-on-surface-variant">Real-time status of active orders.</p>
            </div>
            <button className="rounded-md border border-outline-variant bg-surface-container-low px-4 py-2 font-label-md text-label-md text-on-surface shadow-sm transition-colors hover:bg-surface-container-high">
              Manage Orders
            </button>
          </div>
          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-surface-container-highest bg-surface-container-lowest">
                  {["Order ID", "Vendor", "Customer", "Runner", "Status", "Amount"].map((h, i) => (
                    <th
                      key={h}
                      className={`px-stack-md py-3 font-label-sm text-label-sm tracking-wider text-on-surface/50 uppercase ${
                        i === 5 ? "text-right" : ""
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-highest font-body-sm text-body-sm text-on-surface">
                {liveOperations.map((row) => (
                  <tr key={row.id} className="h-14 transition-colors hover:bg-surface-container-low">
                    <td className="px-stack-md py-2 font-semibold text-zest-orange">{row.id}</td>
                    <td className="px-stack-md py-2">{row.vendor}</td>
                    <td className="px-stack-md py-2">{row.customer}</td>
                    <td className="flex items-center gap-2 px-stack-md py-2">
                      {row.runnerAvatar ? (
                        <>
                          <Image
                            src={row.runnerAvatar}
                            alt={row.runner}
                            width={24}
                            height={24}
                            className="h-6 w-6 rounded-full object-cover"
                          />
                          {row.runner}
                        </>
                      ) : (
                        <span className="text-on-surface-variant">{row.runner}</span>
                      )}
                    </td>
                    <td className="px-stack-md py-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeClasses(row.status)}`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-stack-md py-2 text-right font-semibold">{row.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
