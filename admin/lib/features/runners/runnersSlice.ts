import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/lib/store";

export interface AdminRunner {
  name: string;
  id: string;
  avatar: string | null;
  status: "Online" | "Offline" | "On Break";
  statusClass: string;
  dotClass: string;
  activeOrders: number;
  rating: number;
  vehicle: string;
}

export interface RunnersState {
  items: AdminRunner[];
  searchQuery: string;
  currentPage: number;
  totalFleet: number;
  onlineNow: number;
  avgRating: string;
}

const initialState: RunnersState = {
  items: [
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
  ],
  searchQuery: "",
  currentPage: 1,
  totalFleet: 1248,
  onlineNow: 412,
  avgRating: "4.8",
};

const runnersSlice = createSlice({
  name: "runners",
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

export const { setSearchQuery, setCurrentPage } = runnersSlice.actions;
export default runnersSlice.reducer;

export const selectFilteredRunners = (state: RootState) => {
  const query = state.runners.searchQuery.trim().toLowerCase();
  if (!query) return state.runners.items;
  return state.runners.items.filter(
    (runner) => runner.name.toLowerCase().includes(query) || runner.id.toLowerCase().includes(query),
  );
};
