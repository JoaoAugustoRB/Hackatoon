import { cn } from "@/lib/utils";
import type { NivelAlerta, StatusMatriz } from "@/types";

const statusStyles: Record<StatusMatriz | NivelAlerta, string> = {
  SAUDAVEL: "border-emerald-500/30 bg-emerald-500/15 text-emerald-200",
  ATENCAO: "border-amber-500/30 bg-amber-500/15 text-amber-200",
  RISCO: "border-orange-500/30 bg-orange-500/15 text-orange-200",
  CRITICO: "border-red-500/30 bg-red-500/15 text-red-200",
};

export function StatusBadge({
  value,
  className,
}: {
  value: StatusMatriz | NivelAlerta;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold tracking-[0.08em]",
        statusStyles[value],
        className,
      )}
    >
      {value}
    </span>
  );
}
