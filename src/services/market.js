import { getMarketData } from "./api";

const CACHE_KEY = "nexa_market_backup";

// ================= PRICES =================
export const getMarketPrices = async () => {
  try {
    const data = await getMarketData();

    if (data && data.xlm) {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      return data;
    }

    throw new Error("Invalid market data");
  } catch (error) {
    console.warn("⚠️ Market fallback (cache):", error.message);

    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  }
};

// ================= HISTORY =================
export const getPriceHistory = async () => {
  try {
    const data = await getMarketData();

    if (data && data.history) {
      return data.history.map((price, index) => ({
        time: index,
        price: Number(price.toFixed(4))
      }));
    }

    return [];
  } catch (error) {
    console.error("❌ History fetch failed:", error.message);
    return [];
  }
};

