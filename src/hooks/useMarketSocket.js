import { useEffect, useRef, useState } from "react";

/**
 * useMarketSocket - Real-time Binance XLM Stream
 * @param {Function} onPriceUpdate - Callback for normalized price data
 */
export default function useMarketSocket(onPriceUpdate) {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimeoutRef = useRef(null);
  const lastUpdateRef = useRef(0);
  const prevPriceRef = useRef(null);
  const UPDATE_THROTTLE = 500; // ms

  const connect = () => {
    // Binance Real-time Ticker Stream
    const wsUrl = "wss://stream.binance.com:9443/ws/xlmusdt@ticker";
    
    socketRef.current = new WebSocket(wsUrl);

    socketRef.current.onopen = () => {
      setIsConnected(true);
    };

    socketRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const now = Date.now();

        if (now - lastUpdateRef.current > UPDATE_THROTTLE) {
          const currentPrice = parseFloat(data.c);
          
          // Calculate real-time trend based on previous tick
          let trend = "SIDEWAYS";
          if (prevPriceRef.current) {
            if (currentPrice > prevPriceRef.current) trend = "UP";
            else if (currentPrice < prevPriceRef.current) trend = "DOWN";
          }

          onPriceUpdate({
            price: currentPrice,
            change: parseFloat(data.P),
            trend: trend,
            timestamp: data.E
          });
          
          prevPriceRef.current = currentPrice;
          lastUpdateRef.current = now;
        }
      } catch (err) {
        console.error("WS Parse Error", err);
      }
    };

    socketRef.current.onerror = (err) => {
      console.error("🔴 Market WebSocket Error", err);
      setIsConnected(false);
    };

    socketRef.current.onclose = () => {
      console.log("🟠 Market WebSocket Closed. Retrying...");
      setIsConnected(false);
      // Exponential backoff or simple delay
      reconnectTimeoutRef.current = setTimeout(connect, 5000);
    };
  };

  useEffect(() => {
    connect();

    return () => {
      if (socketRef.current) {
        socketRef.current.onclose = null; // Prevent reconnect loop on unmount
        socketRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return { isConnected };
}