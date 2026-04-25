import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Activity, Globe, Server, CheckCircle2, XCircle, Zap } from "lucide-react";
import { api } from "@/services/api"; // Assuming api.js exports the axios instance

/**
 * SystemHealthCard - Displays real-time status of Stellar Horizon and Nexa-Market-API.
 * Designed to be embedded directly into the dashboard layout.
 */
export default function SystemHealthCard({ wsActive }) {
  const [horizonStatus, setHorizonStatus] = useState("checking"); // 'checking', 'online', 'offline'
  const [marketApiStatus, setMarketApiStatus] = useState("checking"); // 'checking', 'online', 'offline'
  const [lastMarketSync, setLastMarketSync] = useState(null);

  const currentNetwork = useSelector((state) => state.auth?.network || "testnet");

  // Check Horizon Network Status
  useEffect(() => {
    const checkHorizon = async () => {
      try {
        const url =
          currentNetwork === "public"
            ? "https://horizon.stellar.org"
            : "https://horizon-testnet.stellar.org";

        const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
        setHorizonStatus(res.ok ? "online" : "offline");
      } catch {
        setHorizonStatus("offline");
      }
    };

    checkHorizon();
    const interval = setInterval(checkHorizon, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [currentNetwork]);

  // Check Market API Status
  useEffect(() => {
    const checkMarketApi = async () => {
      try {
        // Use the /market endpoint to check if the backend's market data proxy is responsive
        const res = await api.get("/market", { timeout: 5000 }); 
        // Check for a successful response and expected data structure
        setMarketApiStatus(res.data && res.data.xlm ? "online" : "offline"); 
        setLastMarketSync(new Date());
      } catch (e) {
        setMarketApiStatus("offline");
      }
    };

    checkMarketApi();
    const interval = setInterval(checkMarketApi, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status) => {
    if (status === "online") return <CheckCircle2 size={18} className="text-emerald-400" />;
    if (status === "offline") return <XCircle size={18} className="text-red-400" />;
    return <Activity size={18} className="text-gray-500 animate-spin" />;
  };

  const getStatusText = (status) => {
    if (status === "online") return "Online";
    if (status === "offline") return "Offline";
    return "Checking...";
  };

  return (
    <div className="bg-[#1e2329] border border-white/5 p-6 rounded-xl shadow-xl">
      <h3 className="text-white font-black text-lg mb-6 flex items-center gap-3">
        <Activity size={20} className="text-cyan-500" /> System Health
      </h3>

      <div className="space-y-4">
        {/* HORIZON STATUS */}
        <div className="p-4 bg-black/40 border border-white/5 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400"><Server size={18} /></div>
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Stellar Horizon</p>
              <p className="text-xs font-bold text-white capitalize">{currentNetwork} Node</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-black ${horizonStatus === 'online' ? 'text-emerald-400' : 'text-red-400'}`}>{getStatusText(horizonStatus)}</span>
            {getStatusIcon(horizonStatus)}
          </div>
        </div>

        {/* MARKET API STATUS */}
        <div className="p-4 bg-black/40 border border-white/5 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-purple-500/10 rounded-xl text-purple-400"><Globe size={18} /></div>
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Market Feed</p>
              <p className="text-xs font-bold text-white">Nexa Proxy V2</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-black ${marketApiStatus === 'online' ? 'text-emerald-400' : 'text-red-400'}`}>{getStatusText(marketApiStatus)}</span>
            {getStatusIcon(marketApiStatus)}
          </div>
        </div>

        {/* WEBSOCKET STATUS */}
        <div className="p-4 bg-black/40 border border-white/5 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-2 rounded-xl ${wsActive ? 'bg-cyan-500/10 text-cyan-400' : 'bg-amber-500/10 text-amber-400'}`}>
              <Zap size={18} className={wsActive ? "animate-pulse" : ""} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Real-time Stream</p>
              <p className="text-xs font-bold text-white">Binance WebSocket</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-black ${wsActive ? 'text-emerald-400' : 'text-amber-400'}`}>
              {wsActive ? 'Connected' : 'Syncing...'}
            </span>
            {wsActive ? <CheckCircle2 size={18} className="text-emerald-400" /> : <Activity size={18} className="text-amber-400 animate-spin" />}
          </div>
        </div>
      </div>
    </div>
  );
}