import React, { memo } from "react";
import { History, ArrowDownLeft, ArrowUpRight, Clock, ExternalLink, Activity } from "lucide-react";

/**
 * TransactionHistory - High-Density Integrated Ledger
 * - Fixed Header: Title remains visible during scroll
 * - Isolated Scroll: Only the list container scrolls
 * - Memoized: Prevents re-renders from parent modal toggles
 */
const TransactionHistory = memo(({ publicKey }) => {
  // Mock data - In production, this fetches from Stellar Horizon via your api service
  const transactions = []; 

  return (
    <div className="bg-[#1e2329] border border-white/5 rounded-[2rem] flex flex-col h-[500px] overflow-hidden shadow-2xl animate-in fade-in duration-700">
      {/* FIXED HEADER: Requirement 2 */}
      <header className="p-6 border-b border-white/5 bg-[#1e2329]/50 backdrop-blur-md shrink-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 rounded-xl text-cyan-400">
              <History size={18} />
            </div>
            <div>
              <h3 className="text-white font-black text-sm uppercase tracking-widest">Transaction History</h3>
              <p className="text-[9px] font-bold text-gray-500 uppercase tracking-tighter">Stellar Network Ledger</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg">LIVE</span>
          </div>
        </div>
      </header>

      {/* SCROLLABLE BODY: Requirement 3 */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
        {transactions.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-20 py-10">
            <Activity size={40} className="mb-4 text-gray-500" />
            <p className="text-xs font-black uppercase tracking-widest">No Recent Activity</p>
          </div>
        ) : (
          <div className="space-y-1">
            {transactions.map((tx, i) => (
              <div 
                key={i} 
                className="flex items-center justify-between p-4 hover:bg-white/[0.02] rounded-2xl transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${tx.type === 'send' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                    {tx.type === 'send' ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
                  </div>
                  <div>
                    <p className="text-white text-xs font-black uppercase">{tx.type === 'send' ? 'Payment Sent' : 'Payment Received'}</p>
                    <p className="text-[10px] text-gray-500 font-mono mt-0.5">{tx.address}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-xs font-black ${tx.type === 'send' ? 'text-white' : 'text-emerald-400'}`}>
                    {tx.type === 'send' ? '-' : '+'}{tx.amount} XLM
                  </p>
                  <div className="flex items-center justify-end gap-1 text-gray-600 mt-1">
                    <Clock size={10} />
                    <span className="text-[9px] font-bold">2m ago</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer className="p-4 border-t border-white/5 bg-black/20 text-center">
        <button className="text-[10px] font-black text-cyan-500 uppercase tracking-widest hover:text-cyan-400 transition-colors flex items-center justify-center gap-2 mx-auto">
          View Full Ledger <ExternalLink size={12} />
        </button>
      </footer>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: rgba(255, 255, 255, 0.05); 
          border-radius: 10px; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.1); }
      `}</style>
    </div>
  );
});

export default TransactionHistory;