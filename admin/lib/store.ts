import { configureStore } from "@reduxjs/toolkit";
import vendorsReducer from "@/lib/features/vendors/vendorsSlice";
import runnersReducer from "@/lib/features/runners/runnersSlice";
import ordersReducer from "@/lib/features/orders/ordersSlice";
import transactionsReducer from "@/lib/features/transactions/transactionsSlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      vendors: vendorsReducer,
      runners: runnersReducer,
      orders: ordersReducer,
      transactions: transactionsReducer,
    },
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
