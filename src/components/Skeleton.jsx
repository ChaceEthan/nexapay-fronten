import React from "react";

/**
 * Skeleton - Institutional Loading Placeholder
 * - Shimmering effect for async data states
 * - Prevents layout shifts during data synchronization
 */
export function Skeleton({ className, variant = "rect" }) {
  const base = "bg-white/5 animate-pulse";
  const variants = {
    rect: "rounded-2xl",
    circle: "rounded-full",
    card: "rounded-[3rem]",
    text: "rounded-lg h-4"
  };

  return (
    <div className={`${base} ${variants[variant]} ${className}`}>
      <div className="w-full h-full bg-gradient-to-r from-transparent via-white/[0.02] to-transparent animate-shimmer" 
           style={{ backgroundSize: '200% 100%' }} />
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-shimmer {
          animation: shimmer 2.5s infinite linear;
        }
      `}} />
    </div>
  );
}

export function AssetSkeleton() {
  return (
    <div className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5">
      <div className="flex items-center gap-4">
        <Skeleton variant="circle" className="w-10 h-10" />
        <div className="space-y-2">
           <Skeleton variant="text" className="w-24" />
           <Skeleton variant="text" className="w-12 opacity-50" />
        </div>
      </div>
      <Skeleton variant="text" className="w-16" />
    </div>
  );
}

export function MarketRowSkeleton() {
  return (
    <tr className="border-b border-white/5">
      <td className="px-8 py-6">
        <div className="flex items-center gap-4">
          <Skeleton variant="circle" className="w-8 h-8" />
          <div className="space-y-2">
            <Skeleton variant="text" className="w-20" />
            <Skeleton variant="text" className="w-10 opacity-50" />
          </div>
        </div>
      </td>
      <td className="px-8 py-6 text-right"><Skeleton variant="text" className="w-16 ml-auto" /></td>
      <td className="px-8 py-6 text-right"><Skeleton variant="text" className="w-12 ml-auto" /></td>
      <td className="px-8 py-6 text-right"><Skeleton variant="text" className="w-24 ml-auto" /></td>
      <td className="px-8 py-6"><Skeleton variant="circle" className="w-6 h-6 ml-auto" /></td>
    </tr>
  );
}
export function ChartSkeleton() {
  return (
    <div className="w-full h-full min-h-[300px] bg-white/2 rounded-[2rem] p-8 flex flex-col justify-end gap-4 overflow-hidden relative border border-white/5">
      <div className="flex gap-2 h-full items-end">
        {[40, 70, 45, 90, 65, 80, 50, 85, 60, 75].map((h, i) => (
          <Skeleton key={i} variant="rect" className="flex-1" style={{ height: `${h}%` }} />
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#1e2329] via-transparent to-transparent" />
    </div>
  );
}
