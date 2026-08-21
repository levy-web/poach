import PageHeader from "@/components/PageHeader";
import Pagination from "@/components/Pagination";

const transactions = [
  {
    id: "#TXN-8842",
    date: "Oct 24, 2023, 14:30",
    type: "Order",
    typeClass: "border border-blue-100 bg-blue-50 text-blue-700",
    typeIcon: "shopping_bag",
    entity: "John Doe",
    entityInitials: "JD",
    amount: "+$42.50",
    amountClass: "text-on-surface",
    status: "Completed",
    dotClass: "bg-emerald-500",
  },
  {
    id: "#TXN-8841",
    date: "Oct 24, 2023, 11:15",
    type: "Payout",
    typeClass: "border border-purple-100 bg-purple-50 text-purple-700",
    typeIcon: "account_balance",
    entity: "Spice Route Grill",
    entityIcon: "storefront",
    entityClass: "text-zest-orange",
    amount: "-$1,240.00",
    amountClass: "text-error",
    status: "Processing",
    dotClass: "animate-pulse bg-amber-500",
  },
  {
    id: "#TXN-8840",
    date: "Oct 23, 2023, 19:45",
    type: "Refund",
    typeClass: "border border-red-100 bg-red-50 text-red-700",
    typeIcon: "keyboard_return",
    entity: "Alice Smith",
    entityInitials: "AS",
    amount: "-$18.99",
    amountClass: "text-error",
    status: "Completed",
    dotClass: "bg-emerald-500",
    highlighted: true,
  },
  {
    id: "#TXN-8839",
    date: "Oct 23, 2023, 18:20",
    type: "Order",
    typeClass: "border border-blue-100 bg-blue-50 text-blue-700",
    typeIcon: "shopping_bag",
    entity: "Michael Ross",
    entityInitials: "MR",
    amount: "+$85.00",
    amountClass: "text-on-surface",
    status: "Failed",
    dotClass: "bg-red-500",
    statusClass: "text-error",
  },
];

export default function TransactionsPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-stack-xl p-margin-page pb-12">
      <PageHeader
        title="Transactions & Ledger"
        subtitle="Track platform revenue, payouts, and financial history"
        action={
          <div className="flex gap-3">
            <button className="flex items-center gap-2 rounded-md border border-outline-warm bg-surface-cream px-4 py-2 font-label-md text-label-md text-on-surface shadow-sm transition-all hover:bg-surface-container">
              <span className="material-symbols-outlined text-lg">filter_list</span>
              Filter
            </button>
            <button className="flex items-center gap-2 rounded-md bg-zest-orange px-4 py-2 font-label-md text-label-md text-white shadow-sm transition-all duration-200 active:scale-95 hover:bg-primary-container">
              <span className="material-symbols-outlined text-lg">download</span>
              Export CSV
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-gutter md:grid-cols-3">
        <div className="group relative flex flex-col overflow-hidden rounded-xl border border-surface-container-low bg-surface-container-lowest p-stack-md shadow-standard">
          <div className="absolute top-0 right-0 p-4 opacity-5 transition-opacity group-hover:opacity-10">
            <span className="material-symbols-outlined fill text-6xl text-zest-orange">monitoring</span>
          </div>
          <h3 className="flex items-center gap-2 font-title-md text-title-md text-on-surface-variant">
            Total Revenue
            <span
              className="material-symbols-outlined cursor-help text-sm"
              title="Total gross revenue before payouts"
            >
              info
            </span>
          </h3>
          <div className="mt-4 flex items-end justify-between">
            <p className="font-headline-lg text-headline-lg leading-none text-on-surface">
              $124,592<span className="text-xl text-on-surface-variant">.00</span>
            </p>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 font-label-sm text-label-sm text-emerald-700">
              <span className="material-symbols-outlined mr-1 text-sm">trending_up</span>
              +12%
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">vs last month</span>
          </div>
        </div>

        <div className="group relative flex flex-col overflow-hidden rounded-xl border border-surface-container-low bg-surface-container-lowest p-stack-md shadow-standard">
          <div className="absolute top-0 right-0 p-4 opacity-5 transition-opacity group-hover:opacity-10">
            <span className="material-symbols-outlined fill text-6xl text-zest-orange">
              account_balance_wallet
            </span>
          </div>
          <h3 className="font-title-md text-title-md text-on-surface-variant">Net Profit</h3>
          <div className="mt-4 flex items-end justify-between">
            <p className="font-headline-lg text-headline-lg leading-none text-on-surface">
              $18,688<span className="text-xl text-on-surface-variant">.80</span>
            </p>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-surface-container px-2 py-0.5 font-label-sm text-label-sm text-on-surface-variant">
              15% margin
            </span>
          </div>
        </div>

        <div className="group relative flex flex-col overflow-hidden rounded-xl border border-zest-orange/20 bg-surface-container-lowest p-stack-md shadow-standard">
          <div className="absolute top-0 right-0 p-4 opacity-10 transition-opacity group-hover:opacity-20">
            <span className="material-symbols-outlined fill text-6xl text-zest-orange">outbound</span>
          </div>
          <h3 className="font-title-md text-title-md font-bold text-zest-orange">Pending Payouts</h3>
          <div className="mt-4 flex items-end justify-between">
            <p className="font-headline-lg text-headline-lg leading-none text-on-surface">
              $4,240<span className="text-xl text-on-surface-variant">.50</span>
            </p>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              for <span className="font-bold text-on-surface">12</span> vendors awaiting transfer
            </span>
          </div>
          <div className="absolute right-4 bottom-4">
            <button
              className="rounded-full p-2 text-zest-orange transition-colors hover:bg-zest-orange/10"
              title="Process Payouts"
            >
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-surface-container-low bg-surface-container-lowest shadow-standard">
        <div className="flex flex-col items-center justify-between gap-4 border-b border-surface-container-high bg-surface-cream/50 p-stack-md sm:flex-row">
          <h3 className="font-title-lg text-title-lg text-on-surface">Recent Transactions</h3>
          <div className="flex w-full gap-2 sm:w-auto">
            <div className="relative flex-1 sm:w-64 sm:flex-none">
              <span className="material-symbols-outlined absolute top-1/2 left-3 -translate-y-1/2 text-sm text-on-surface-variant">
                search
              </span>
              <input
                type="text"
                placeholder="Search ID or Entity..."
                className="w-full rounded-md border border-outline-variant bg-white py-1.5 pr-3 pl-9 text-on-surface transition-all outline-none focus:border-zest-orange focus:ring-1 focus:ring-zest-orange"
              />
            </div>
            <select className="rounded-md border border-outline-variant bg-white py-1.5 pr-8 pl-3 text-on-surface outline-none focus:border-zest-orange">
              <option>All Types</option>
              <option>Orders</option>
              <option>Payouts</option>
              <option>Refunds</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-surface-container-high bg-surface-bright">
                {["ID", "Date & Time", "Type", "Entity", "Amount", "Status", "Action"].map((h) => (
                  <th
                    key={h}
                    className={`px-6 py-4 font-label-sm text-label-sm font-semibold tracking-wider text-on-surface-variant uppercase ${
                      h === "Amount" || h === "Action" ? "text-right" : ""
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high font-body-sm text-body-sm text-on-surface">
              {transactions.map((txn) => (
                <tr
                  key={txn.id}
                  className={`group h-14 transition-colors hover:bg-surface-container-lowest ${
                    txn.highlighted ? "bg-red-50/20" : ""
                  }`}
                >
                  <td className="px-6 py-2 font-medium whitespace-nowrap text-on-surface">{txn.id}</td>
                  <td className="px-6 py-2 whitespace-nowrap text-on-surface-variant">{txn.date}</td>
                  <td className="px-6 py-2 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-label-sm text-label-sm ${txn.typeClass}`}
                    >
                      <span className="material-symbols-outlined text-[14px]">{txn.typeIcon}</span>
                      {txn.type}
                    </span>
                  </td>
                  <td className="px-6 py-2">
                    <div className="flex items-center gap-2">
                      {txn.entityIcon ? (
                        <div className="flex h-8 w-8 items-center justify-center rounded-md border border-orange-200 bg-orange-100 text-xs font-bold text-zest-orange">
                          <span className="material-symbols-outlined text-sm">{txn.entityIcon}</span>
                        </div>
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container text-xs font-bold text-on-surface-variant">
                          {txn.entityInitials}
                        </div>
                      )}
                      <span className={`font-medium ${txn.entityClass ?? ""}`}>{txn.entity}</span>
                    </div>
                  </td>
                  <td className={`px-6 py-2 text-right font-semibold whitespace-nowrap ${txn.amountClass}`}>
                    {txn.amount}
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${txn.dotClass}`} />
                      <span className={txn.statusClass ?? ""}>{txn.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-2 text-right whitespace-nowrap">
                    <button className="rounded-full p-1 text-on-surface-variant opacity-0 transition-all group-hover:opacity-100 hover:bg-surface-container hover:text-zest-orange">
                      <span className="material-symbols-outlined text-lg">more_vert</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination from={1} to={4} total={2492} noun="transactions" currentPage={1} totalPages={3} />
      </div>
    </div>
  );
}
