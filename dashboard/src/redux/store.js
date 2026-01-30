import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./reducer/authReducer";
import downlineReducer from "./reducer/downlineReducer";
import marketAnalyzeReducer from "./reducer/marketAnalyzeReducer";
import walletReducer from "./reducer/walletReducer";
import adminReducer from "./reducer/adminReducer";


export const store = configureStore({
  reducer: {
    admin: adminReducer,
    auth: authReducer,
    downline: downlineReducer,
    market: marketAnalyzeReducer,
    wallet: walletReducer,
  },
});
