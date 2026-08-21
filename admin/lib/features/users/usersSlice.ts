import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/lib/store";

export interface AdminUser {
  name: string;
  avatar: string | null;
  initials?: string;
  email: string;
  phone: string;
  joined: string;
  orders: number;
  status: "Active" | "Inactive";
  statusClass: string;
}

export interface UsersState {
  items: AdminUser[];
  searchQuery: string;
  currentPage: number;
  totalUsers: number;
  activeUsers30d: number;
  newUsers30d: number;
}

const initialState: UsersState = {
  items: [
    {
      name: "Alex Mercer",
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCOqgMG4y6cH4DWgy6jpB8JTPBNjIcf2gZlklFcLkTiXFRCxeiGx0QGoQwBySOUNrorMyYYAwjbkjpUnkTfurZNeeXuxjd7yUoGxHFMciIRaWvQqG2oN-6GWJ9MkGs0zoBi3O6GbOa-2J_1WH_SINcdAWITezyxr7CbxbMaBQ2qTUUO9VFj53YPFG1mV1WDO47zLAmOMAatJ5O1ap8m5GIDYhzmWd3zOHq2v1v0NtDUorU-bT6b8TU8",
      email: "alex.mercer@example.com",
      phone: "+1 (555) 123-4567",
      joined: "Oct 12, 2023",
      orders: 42,
      status: "Active",
      statusClass: "bg-[#e6f4ea] text-[#137333]",
    },
    {
      name: "Samantha Reed",
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBwubSyZ6EoUnuFEjBZf9q2e5o87nLTi01f0ANHTZ0DKkpA10brrmHxzKIn0wnaVmOHoiUJPd8_cPAlJD5d_vmDeb_SzmOueleaWGlImAnhNVBX9vd_ckW5IJ8in5OUEeQ8UzM-NfubahFc23aFCp2z1oSOYMHzzERBGVE66-m5OQvgKwKyTE9p1wKu48DgbwSQ1elc5Vsl32H1DtWVIZXN2bQTgNCenOKtWDrs4HK-vtruFhDggFcR",
      email: "s.reed99@example.com",
      phone: "+1 (555) 987-6543",
      joined: "Nov 04, 2023",
      orders: 15,
      status: "Active",
      statusClass: "bg-[#e6f4ea] text-[#137333]",
    },
    {
      name: "Jordan Tyler",
      avatar: null,
      initials: "JT",
      email: "jtyler.design@example.com",
      phone: "+1 (555) 222-3333",
      joined: "Jan 18, 2024",
      orders: 3,
      status: "Inactive",
      statusClass: "bg-surface-variant text-secondary",
    },
  ],
  searchQuery: "",
  currentPage: 1,
  totalUsers: 124592,
  activeUsers30d: 89204,
  newUsers30d: 3412,
};

const usersSlice = createSlice({
  name: "users",
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

export const { setSearchQuery, setCurrentPage } = usersSlice.actions;
export default usersSlice.reducer;

export const selectFilteredUsers = (state: RootState) => {
  const query = state.users.searchQuery.trim().toLowerCase();
  if (!query) return state.users.items;
  return state.users.items.filter(
    (user) =>
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.phone.toLowerCase().includes(query),
  );
};
