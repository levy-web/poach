import { configureStore } from "@reduxjs/toolkit";
import ordersReducer from "@/lib/features/orders/ordersSlice";
import transactionsReducer from "@/lib/features/transactions/transactionsSlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      orders: ordersReducer,
      transactions: transactionsReducer,
    },
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
