import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/lib/store";

export interface AdminVendor {
  name: string;
  logo: string | null;
  initials?: string;
  category: string;
  status: "Active" | "Paused" | "Onboarding";
  statusClass: string;
  rating: string | null;
  items: string;
}

export interface VendorsState {
  items: AdminVendor[];
  searchQuery: string;
  categoryFilter: string;
  currentPage: number;
  totalActiveVendors: number;
  avgRating: string;
  pendingMenuUpdates: number;
}

const initialState: VendorsState = {
  items: [
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
  ],
  searchQuery: "",
  categoryFilter: "All",
  currentPage: 1,
  totalActiveVendors: 142,
  avgRating: "4.8",
  pendingMenuUpdates: 24,
};

const vendorsSlice = createSlice({
  name: "vendors",
  initialState,
  reducers: {
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
      state.currentPage = 1;
    },
    setCategoryFilter(state, action: PayloadAction<string>) {
      state.categoryFilter = action.payload;
      state.currentPage = 1;
    },
    setCurrentPage(state, action: PayloadAction<number>) {
      state.currentPage = action.payload;
    },
  },
});

export const { setSearchQuery, setCategoryFilter, setCurrentPage } = vendorsSlice.actions;
export default vendorsSlice.reducer;

export const selectFilteredVendors = (state: RootState) => {
  const query = state.vendors.searchQuery.trim().toLowerCase();
  const category = state.vendors.categoryFilter;
  return state.vendors.items.filter((vendor) => {
    const matchesQuery = !query || vendor.name.toLowerCase().includes(query);
    const matchesCategory = category === "All" || vendor.category === category;
    return matchesQuery && matchesCategory;
  });
};
