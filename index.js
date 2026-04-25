// @ts-nocheck
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import authReducer, { lockWallet, APP_RESET } from "./src/authSlice.js";
import walletReducer from "./src/walletSlice.js";
import toastReducer from "./src/toastSlice.js";

// ================= REDUCER CONFIGURATION =================
const appReducer = combineReducers({
  auth: authReducer, 
  wallet: walletReducer,
  toast: toastReducer,
});

const rootReducer = (state, action) => {
  // Reset the entire Redux state to initial values when the user logs out
  if (action.type === APP_RESET.type) { // Only reset on APP_RESET
    // Setting state to undefined forces Redux to re-initialize with initialStates
    console.log("🔄 Redux Store: Resetting state to initial values...");
    state = undefined;
  }
  return appReducer(state, action);
};

// ================= PERSISTENCE MIDDLEWARE =================
const persistenceMiddleware = (store) => (next) => (action) => {
  const result = next(action);
  const state = store.getState();

  // Only persist if state is healthy and not resetting
  if (state && action.type !== APP_RESET.type) {
    if (state.auth.token) {
      localStorage.setItem("nexapayToken", state.auth.token);
    }
    if (state.auth.user) {
      localStorage.setItem("nexapayUser", JSON.stringify(state.auth.user));
    }
    // Sync the legacy key for backward compatibility/health checks
    if (state.wallet.address) {
      localStorage.setItem("nexa_wallet_pub", state.wallet.address);
      localStorage.setItem("nexa_wallet_type", state.wallet.walletType || "internal");
    }
  }

  return result;
};

// ================= STORE CONFIGURATION =================
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(persistenceMiddleware),
});

// Expose store to window for console debugging
if (import.meta.env.MODE === 'development') {
  window.store = store;
  console.log("🛠️ NexaPay Debug: Access the store via 'window.store.getState()'");
}

export default store;