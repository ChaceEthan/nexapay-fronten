import React, { useState, useEffect } from "react";
import { LineChart, TrendingUp, TrendingDown, Search, Globe, Activity, Star } from "lucide-react";
import { MarketRowSkeleton } from "@/components/Skeleton";
import { getFullMarketList } from "@/services/api";

export default function Markets() {
  const [marketList, setMarketList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarkets = async () => {
      setLoading(true);
      const data = await getFullMarketList();
      setMarketList(data || []);
      setLoading(false);
    };
    fetchMarkets();
  }, []);


  return (
    <div className="p-8 md:p-12 max-w-[1400px] mx-auto space-y-10 animate-in fade-in duration-700">
      <header>
        <h1 className="text-4xl font-black text-white tracking-tight">Market Explorer</h1>
        <p className="text-gray-500 font-medium mt-2 uppercase text-[10px] tracking-[0.3em]">Institutional Data Stream • Real-time Quotes</p>
      </header>

      {/* STATS OVERVIEW */}
      <div className="grid md:grid-cols-3 gap-6">
        {[
          { label: "Global Vol (24h)", value: "$64.2B", change: "+4.2%", icon: Globe, color: "text-blue-400" },
          { label: "Market Cap", value: "$2.4T", change: "-0.8%", icon: Activity, color: "text-purple-400" },
          { label: "BTC Dominance", value: "52.4%", change: "+0.1%", icon: TrendingUp, color: "text-amber-400" },
        ].map((stat, i) => (
          <div key={i} className="bg-[#1e2329] border border-[#2b3139] p-6 rounded-3xl shadow-xl">
             <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl bg-white/5 ${stat.color}`}><stat.icon size={20} /></div>
                <span className={`text-xs font-bold ${stat.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>{stat.change}</span>
             </div>
             <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
             <p className="text-2xl font-black text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* MARKET TABLE */}
      <div className="bg-[#1e2329] border border-[#2b3139] rounded-[3rem] overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-[#2b3139] flex justify-between items-center bg-[#181a20]">
           <div className="relative">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
             <input 
               type="text" 
               placeholder="Search assets..." 
               className="bg-black/40 border border-white/5 rounded-xl py-2 pl-12 pr-4 text-xs font-bold text-white outline-none focus:border-cyan-500/50 transition-all w-64"
             />
           </div>
           <div className="flex gap-2">
             {["All", "Layer 1", "Stablecoins", "DeFi"].map(tag => (
               <button key={tag} className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/5 hover:bg-white/5 transition-all text-gray-400 hover:text-white">{tag}</button>
             ))}
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#0b0e11] text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
              <tr>
                <th className="px-8 py-5">Asset</th>
                <th className="px-8 py-5 text-right">Price</th>
                <th className="px-8 py-5 text-right">Change (24h)</th>
                <th className="px-8 py-5 text-right">Market Cap</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                [1,2,3,4,5,6,7,8].map(i => <MarketRowSkeleton key={i} />)
              ) : (
                marketList.map((coin) => (
                  <tr key={coin.id} className="hover:bg-white/2 transition-colors cursor-pointer group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <img src={coin.image} alt="" className="w-8 h-8 rounded-full" />
                        <div>
                          <p className="text-white font-black text-sm">{coin.name}</p>
                          <p className="text-gray-500 text-[10px] font-bold uppercase">{coin.symbol}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <p className="text-white font-black text-sm">${coin.current_price.toLocaleString()}</p>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <p className={`text-xs font-black ${coin.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {coin.price_change_percentage_24h >= 0 ? '+' : ''}{coin.price_change_percentage_24h.toFixed(2)}%
                      </p>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <p className="text-gray-400 font-bold text-xs">${(coin.market_cap / 1e9).toFixed(1)}B</p>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <button className="p-2 text-gray-600 hover:text-amber-400 transition-colors">
                         <Star size={18} />
                       </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}