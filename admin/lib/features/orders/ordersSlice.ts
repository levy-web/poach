import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/lib/store";

export interface AdminOrder {
  id: string;
  initials: string;
  customer: string;
  vendor: string;
  runner: string | null;
  status: "Preparing" | "Out for Delivery" | "Pending";
  statusClass: string;
  total: string;
  highlighted?: boolean;
}

export interface OrdersState {
  items: AdminOrder[];
  searchQuery: string;
  currentPage: number;
  activeOrders: number;
  pendingAcceptance: number;
  completedToday: number;
  avgDeliveryMins: number;
}

const initialState: OrdersState = {
  items: [
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
  ],
  searchQuery: "",
  currentPage: 1,
  activeOrders: 342,
  pendingAcceptance: 18,
  completedToday: 1894,
  avgDeliveryMins: 28,
};

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
      state.currentPage = 1;
    },
    setCurrentPage(state, action: PayloadAction<number>) {
      state.currentPage = action.payload;
    },
  },
});

export const { setSearchQuery, setCurrentPage } = ordersSlice.actions;
export default ordersSlice.reducer;

export const selectFilteredOrders = (state: RootState) => {
  const query = state.orders.searchQuery.trim().toLowerCase();
  if (!query) return state.orders.items;
  return state.orders.items.filter(
    (order) => order.id.toLowerCase().includes(query) || order.customer.toLowerCase().includes(query),
  );
};
