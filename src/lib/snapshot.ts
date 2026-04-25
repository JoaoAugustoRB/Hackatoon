import type { MoldGuardSnapshot } from "@/types";

export function normalizeSnapshot(
  snapshot: Partial<MoldGuardSnapshot> | null | undefined,
): MoldGuardSnapshot {
  return {
    matrizes: snapshot?.matrizes ?? {},
    leituras: snapshot?.leituras ?? {},
    alertas: snapshot?.alertas ?? {},
  };
}
