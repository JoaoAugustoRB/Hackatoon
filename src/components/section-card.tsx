import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionCard({
  title,
  eyebrow,
  children,
  className,
}: {
  title: string;
  eyebrow?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-[0_10px_50px_rgba(2,12,27,0.35)]",
        className,
      )}
    >
      <div className="mb-5">
        {eyebrow ? (
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">{eyebrow}</p>
        ) : null}
        <h2 className="mt-2 text-xl font-semibold text-white">{title}</h2>
      </div>
      {children}
    </section>
  );
}
