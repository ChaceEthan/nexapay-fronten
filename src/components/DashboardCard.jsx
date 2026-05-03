import React from "react";
import { ArrowDownCircle, CreditCard, Send, ShieldCheck, Wallet } from "lucide-react";

const safeBalance = (value) => {
  const number = Number.parseFloat(value);
  return Number.isFinite(number) ? number : 0;
};

const formatBalance = (value, fractionDigits = 4) =>
  safeBalance(value).toLocaleString(undefined, {
    maximumFractionDigits: fractionDigits,
  });

const BalanceSkeleton = () => (
  <div className="bg-gradient-to-br from-[#1e2329] to-[#12161a] p-5 rounded-2xl shadow-2xl border border-white/5 relative overflow-hidden">
    <div className="space-y-5 animate-pulse">
      <div className="space-y-3">
        <div className="h-3 w-40 rounded bg-white/10" />
        <div className="h-10 w-56 rounded-xl bg-white/10" />
        <div className="h-3 w-44 rounded bg-white/5" />
      </div>
      <div className="space-y-2">
        {[1, 2].map((item) => (
          <div key={item} className="h-[66px] rounded-xl border border-white/5 bg-white/[0.03]" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="h-11 rounded-xl bg-white/10" />
        <div className="h-11 rounded-xl bg-white/10" />
      </div>
    </div>
  </div>
);

const AssetRow = ({ icon: Icon, title, subtitle, value, symbol, accent }) => (
  <div className="flex items-center justify-between gap-3 p-3 bg-white/[0.02] rounded-xl border border-white/5 min-w-0">
    <div className="flex items-center gap-3 min-w-0">
      <Icon size={16} className={accent} />
      <div className="min-w-0">
        <p className="text-[10px] font-black text-white uppercase truncate">{title}</p>
        <p className="text-[9px] font-bold text-gray-500 uppercase truncate">{subtitle}</p>
      </div>
    </div>
    <p className="text-sm font-black text-white text-right tabular-nums shrink-0">
      {formatBalance(value)} <span className="text-[10px] text-gray-600">{symbol}</span>
    </p>
  </div>
);

/**
 * DashboardCard - ordered asset hub.
 * 1. Total Portfolio Value
 * 2. XLM
 * 3. USDC
 */
export default function DashboardCard({ balances = [], address, loading, portfolioValue, onSend, onReceive }) {
  const short = address ? `${address.slice(0, 8)}...${address.slice(-8)}` : "No vault selected";
  const nativeBalance =
    balances.find((balance) => balance?.asset_type === "native" || balance?.asset_code === "XLM")?.balance || "0";
  const usdcBalance = balances.find((balance) => balance?.asset_code === "USDC")?.balance || "0";

  if (loading && !balances.length) return <BalanceSkeleton />;

  return (
    <div className="bg-gradient-to-br from-[#1e2329] to-[#12161a] p-5 rounded-2xl shadow-2xl border border-white/5 relative overflow-hidden group min-w-0">
      <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none" />

      <div className="relative z-10 min-w-0">
        <div className="mb-6">
          <p className="text-gray-500 text-[9px] font-black uppercase tracking-[0.2em] mb-1 flex items-center gap-1.5">
            <ShieldCheck size={10} className="text-cyan-500" /> Total Portfolio Value
          </p>
          <div className="flex items-baseline gap-1.5 min-w-0">
            <span className="text-gray-400 text-lg font-bold">$</span>
            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight tabular-nums truncate">
              {safeBalance(portfolioValue).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h1>
          </div>
          <p className="text-cyan-500/60 font-mono text-[10px] font-black mt-1 tracking-wider truncate">
            {short}
          </p>
        </div>

        <div className="space-y-2 mb-6">
          <AssetRow
            icon={Wallet}
            title="Stellar Lumens"
            subtitle="Native network asset"
            value={nativeBalance}
            symbol="XLM"
            accent="text-cyan-400"
          />
          <AssetRow
            icon={CreditCard}
            title="USD Coin"
            subtitle="Stable asset"
            value={usdcBalance}
            symbol="USDC"
            accent="text-blue-400"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={onSend}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-cyan-500 hover:bg-cyan-400 text-black rounded-xl transition-all active:scale-95"
          >
            <Send size={14} strokeWidth={3} />
            <span className="text-[10px] font-black uppercase tracking-widest">Send</span>
          </button>
          <button
            onClick={onReceive}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/10 transition-all active:scale-95"
          >
            <ArrowDownCircle size={14} strokeWidth={3} />
            <span className="text-[10px] font-black uppercase tracking-widest">Receive</span>
          </button>
        </div>
      </div>
    </div>
  );
}
