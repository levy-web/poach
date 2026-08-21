import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/lib/store";

export interface AdminTransaction {
  id: string;
  date: string;
  type: "Order" | "Payout" | "Refund";
  typeClass: string;
  typeIcon: string;
  entity: string;
  entityInitials?: string;
  entityIcon?: string;
  entityClass?: string;
  amount: string;
  amountClass: string;
  status: "Completed" | "Processing" | "Failed";
  statusClass?: string;
  dotClass: string;
  highlighted?: boolean;
}

export interface TransactionsState {
  items: AdminTransaction[];
  searchQuery: string;
  typeFilter: string;
  currentPage: number;
  totalRevenue: number;
  netProfit: number;
  pendingPayouts: number;
  pendingPayoutVendors: number;
}

const initialState: TransactionsState = {
  items: [
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
  ],
  searchQuery: "",
  typeFilter: "All",
  currentPage: 1,
  totalRevenue: 124592.0,
  netProfit: 18688.8,
  pendingPayouts: 4240.5,
  pendingPayoutVendors: 12,
};

const transactionsSlice = createSlice({
  name: "transactions",
  initialState,
  reducers: {
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
      state.currentPage = 1;
    },
    setTypeFilter(state, action: PayloadAction<string>) {
      state.typeFilter = action.payload;
      state.currentPage = 1;
    },
    setCurrentPage(state, action: PayloadAction<number>) {
      state.currentPage = action.payload;
    },
  },
});

export const { setSearchQuery, setTypeFilter, setCurrentPage } = transactionsSlice.actions;
export default transactionsSlice.reducer;

export const selectFilteredTransactions = (state: RootState) => {
  const query = state.transactions.searchQuery.trim().toLowerCase();
  const type = state.transactions.typeFilter;
  return state.transactions.items.filter((txn) => {
    const matchesQuery = !query || txn.id.toLowerCase().includes(query) || txn.entity.toLowerCase().includes(query);
    const matchesType = type === "All" || txn.type === type;
    return matchesQuery && matchesType;
  });
};
