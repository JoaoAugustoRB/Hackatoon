import type { ReactNode } from "react";

export function MetricCard({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_10px_40px_rgba(0,0,0,0.18)] backdrop-blur">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm uppercase tracking-[0.18em] text-slate-400">{label}</p>
        <div className="rounded-xl border border-white/10 bg-slate-950/60 p-2 text-cyan-300">
          {icon}
        </div>
      </div>
      <p className="text-3xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-sm text-slate-400">{detail}</p>
    </div>
  );
}
