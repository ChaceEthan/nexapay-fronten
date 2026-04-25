import axios from "axios";

// ================= CONFIG =================
const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://nexapay-wallet.onrender.com/api";

const HORIZON_URL =
  import.meta.env.VITE_HORIZON_URL ||
  "https://horizon-testnet.stellar.org";

// ================= AXIOS INSTANCE =================
export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000
});
// ================= ERROR HANDLER =================
const handleError = (error) => {
  console.error("API Error:", error?.response?.data || error.message);
  return {
    success: false,
    message: error?.response?.data?.message || "Something went wrong"
  };
};

// ================= AUTH =================
export const signIn = async (email, password) => {
  try {
    const res = await api.post("/auth/signin", { email, password });
    return res.data;
  } catch (err) {
    return handleError(err);
  }
};

export const signUp = async (userData) => {
  try {
    const res = await api.post("/auth/signup", userData);
    return res.data;
  } catch (err) {
    return handleError(err);
  }
};

// ================= MARKET (BINANCE ONLY VIA BACKEND PROXY) =================

/**
 * Fetches core market prices (XLM, USDC, USDT) - BINANCE SOURCE
 */
export const getMarketData = async () => {
  try {
    const res = await api.get("/market");
    return res.data;
  } catch (err) {
    return handleError(err);
  }
};

/**
 * Fetches full market list for the explorer - BINANCE SOURCE
 */
export const getFullMarketList = async () => {
  try {
    const res = await api.get("/market?type=full");
    // Ensure we return an array even on partial failure
    if (res.data && Array.isArray(res.data)) {
      return res.data;
    }
    return [];
  } catch (err) {
    return handleError(err);
  }
};

// ================= WALLET =================
export const getWallet = async () => {
  try {
    const res = await api.get("/wallet");
    return res.data;
  } catch (err) {
    return handleError(err);
  }
};

// ================= TRANSACTIONS =================
export const getTransactions = async () => {
  try {
    const res = await api.get("/transaction");
    return res.data;
  } catch (err) {
    return handleError(err);
  }
};

// ================= STELLAR (DIRECT) =================
export const getAccountDetails = async (address) => {
  try {
    const res = await axios.get(`${HORIZON_URL}/accounts/${address}`);
    return res.data;
  } catch (err) {
    return handleError(err);
  }
};

export const getTransactionHistory = async (address) => {
  try {
    const res = await axios.get(
      `${HORIZON_URL}/accounts/${address}/payments?limit=10&order=desc`
    );
    return res.data._embedded.records;
  } catch (err) {
    return handleError(err);
  }
};

export const fundAccount = async (address) => {
  try {
    const res = await axios.get(
      `https://friendbot.stellar.org?addr=${address}`
    );
    return res.data;
  } catch (err) {
    return handleError(err);
  }
};

export const submitTransaction = async (xdr) => {
  try {
    const params = new URLSearchParams();
    params.append("tx", xdr);

    const res = await axios.post(
      `${HORIZON_URL}/transactions`,
      params
    );

    return res.data;
  } catch (err) {
    return handleError(err);
  }
};

export default api;