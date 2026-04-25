import axios from 'axios';

/**
 * Crypto Service Layer (V2)
 * 🛡️ Proxies all market requests through the backend to avoid CORS.
 * 💾 Implements double-layer caching (Memory + LocalStorage).
 * 🔄 Robust retry logic with exponential backoff.
 */

const CACHE_KEY = 'nexa_market_cache';
const RETRY_LIMIT = 3;
const INITIAL_BACKOFF = 1000; // 1s

// Memory Cache
let marketCache = {
  prices: { XLM: 0, USDC: 1.0, USDT: 1.0 },
  history: [],
  timestamp: 0,
  TTL: 60000 // 60 seconds
};

// Initialize from LocalStorage if available
const hydrateCache = () => {
  try {
    const saved = localStorage.getItem(CACHE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Only hydrate if data is somewhat fresh (e.g. less than 1 hour old) or better than nothing
      marketCache = { ...marketCache, ...parsed };
      console.log("💾 Market Cache Hydrated:", marketCache.prices);
    }
  } catch (e) {
    console.error("Failed to hydrate market cache", e);
  }
};

hydrateCache();

/**
 * Helper: Sleep for backoff
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Main Fetcher: Proxied through /api/market
 */
const fetchMarketData = async (retryCount = 0) => {
  try {
    const now = Date.now();
    
    // 1. Debounce and TTL check
    if (marketCache.timestamp > 0 && now - marketCache.timestamp < marketCache.TTL) {
      return marketCache;
    }

    const response = await axios.get('/api/market', { timeout: 10000 });
    
    if (response.data && response.data.prices) {
      marketCache = {
        ...response.data,
        timestamp: now
      };
      
      // Persist to localStorage for cross-session fallback
      localStorage.setItem(CACHE_KEY, JSON.stringify(marketCache));
      return marketCache;
    }
    
    throw new Error("Invalid response format from proxy");
  } catch (error) {
    console.error(`Market Fetch Attempt ${retryCount + 1} Failed:`, error.message);

    // 2. Retry Logic (Exponential Backoff)
    if (retryCount < RETRY_LIMIT) {
      const delay = INITIAL_BACKOFF * Math.pow(2, retryCount);
      console.warn(`🔄 Retrying market fetch in ${delay}ms...`);
      await sleep(delay);
      return fetchMarketData(retryCount + 1);
    }

    // 3. Absolute Fallback: Return memory cache (which is at least 0.0 or hydrated from localStorage)
    console.error("❌ Market API Exhausted. Using fallback data.");
    return marketCache;
  }
};

/**
 * Public API: Get Current Prices
 */
export const getStellarPrices = async () => {
  const data = await fetchMarketData();
  // Return XLM price for backward compatibility with existing callers
  return data.prices.XLM || marketCache.prices.XLM || 0;
};

/**
 * Public API: Get All Token Prices
 */
export const getAllPrices = async () => {
  const data = await fetchMarketData();
  return data.prices;
};

/**
 * Public API: Get Full Market List
 */
export const getMarketList = async () => {
  try {
    const response = await axios.get('/api/market?type=full', { timeout: 10000 });
    if (response.data && Array.isArray(response.data)) {
      localStorage.setItem('nexa_full_market_cache', JSON.stringify(response.data));
      return response.data;
    }
    throw new Error("Invalid list format");
  } catch (error) {
    console.warn("Market List Fetch Failed, using fallback...");
    const cached = localStorage.getItem('nexa_full_market_cache');
    return cached ? JSON.parse(cached) : [];
  }
};

/**
 * Public API: Get Price History
 */
export const getStellarPriceHistory = async () => {
  const data = await fetchMarketData();
  return data.history && data.history.length > 0 ? data.history : marketCache.history;
};