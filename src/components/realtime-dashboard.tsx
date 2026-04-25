"use client";

import { useEffect, useState } from "react";
import { onValue, ref } from "firebase/database";
import { AlertTriangle, Gauge, ShieldCheck, Siren, TimerReset } from "lucide-react";
import { MetricCard } from "@/components/metric-card";
import { SectionCard } from "@/components/section-card";
import { StatusBadge } from "@/components/status-badge";
import { calcularOEE } from "@/lib/calculations";
import { getClientDatabase } from "@/lib/firebase/client";
import { formatDateTime, formatPercent } from "@/lib/utils";
import type { Alerta, DashboardStats, Matriz, MoldGuardSnapshot } from "@/types";

function mapData(snapshot: MoldGuardSnapshot) {
  const matrizes = Object.values(snapshot.matrizes);
  const alertas = Object.entries(snapshot.alertas)
    .map(([id, alerta]) => ({ id, ...alerta }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const stats: DashboardStats = {
    totalMatrizes: matrizes.length,
    porStatus: {
      SAUDAVEL: matrizes.filter((item) => item.status === "SAUDAVEL").length,
      ATENCAO: matrizes.filter((item) => item.status === "ATENCAO").length,
      RISCO: matrizes.filter((item) => item.status === "RISCO").length,
      CRITICO: matrizes.filter((item) => item.status === "CRITICO").length,
    },
    oeeMedio:
      matrizes.length > 0
        ? (matrizes.reduce((acc, matriz) => {
            const leituras = Object.entries(snapshot.leituras[matriz.id] ?? {}).map(
              ([id, leitura]) => ({
                id,
                matrizId: matriz.id,
                ...leitura,
              }),
            );
            return acc + calcularOEE(leituras, matriz.cicloIdeal).oee;
          }, 0) /
            matrizes.length) *
          100
        : 0,
    matrizesCriticas: matrizes.filter((item) => item.status === "CRITICO").length,
    alertasAbertos: alertas.filter((item) => !item.resolvido).length,
  };

  return { matrizes, alertas, stats };
}

export function RealtimeDashboard({
  initialSnapshot,
  initialStats,
  initialAlertas,
}: {
  initialSnapshot: MoldGuardSnapshot;
  initialStats: DashboardStats;
  initialAlertas: Alerta[];
}) {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [stats, setStats] = useState(initialStats);
  const [alertas, setAlertas] = useState(initialAlertas);

  useEffect(() => {
    const db = getClientDatabase();
    if (!db) return;

    return onValue(ref(db, "/"), (event) => {
      const nextSnapshot = event.val() as MoldGuardSnapshot | null;
      if (!nextSnapshot) return;

      setSnapshot(nextSnapshot);
      const mapped = mapData(nextSnapshot);
      setStats(mapped.stats);
      setAlertas(mapped.alertas);
    });
  }, []);

  const matrizes = Object.values(snapshot.matrizes);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-5 md:grid-cols-2">
        <MetricCard
          label="Matrizes"
          value={String(stats.totalMatrizes)}
          detail="Ativos monitorados na base atual"
          icon={<ShieldCheck className="size-5" />}
        />
        <MetricCard
          label="OEE medio"
          value={formatPercent(stats.oeeMedio)}
          detail="Media consolidada entre as matrizes"
          icon={<Gauge className="size-5" />}
        />
        <MetricCard
          label="Alertas abertos"
          value={String(stats.alertasAbertos)}
          detail="Eventos aguardando tratativa"
          icon={<Siren className="size-5" />}
        />
        <MetricCard
          label="Criticas"
          value={String(stats.matrizesCriticas)}
          detail="Ativos em estado critico"
          icon={<AlertTriangle className="size-5" />}
        />
        <MetricCard
          label="Atencao"
          value={String(stats.porStatus.ATENCAO + stats.porStatus.RISCO)}
          detail="Matrizes que pedem acompanhamento"
          icon={<TimerReset className="size-5" />}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <SectionCard eyebrow="Saude" title="Distribuicao por status">
          <div className="grid gap-3 sm:grid-cols-2">
            {(["SAUDAVEL", "ATENCAO", "RISCO", "CRITICO"] as const).map((status) => (
              <div key={status} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <StatusBadge value={status} />
                <p className="mt-4 text-3xl font-semibold text-white">
                  {stats.porStatus[status]}
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  Matrizes classificadas como {status.toLowerCase()}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard eyebrow="Radar" title="Alertas recentes">
          <div className="space-y-3">
            {alertas.slice(0, 5).map((alerta) => {
              const matriz = snapshot.matrizes[alerta.matrizId] as Matriz | undefined;
              return (
                <div key={alerta.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <StatusBadge value={alerta.nivel} />
                    <span className="text-xs text-slate-500">
                      {formatDateTime(alerta.createdAt)}
                    </span>
                  </div>
                  <p className="mt-3 text-sm font-medium text-white">{alerta.mensagem}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400">
                    {matriz?.codigo ?? alerta.matrizId} • {alerta.tipo}
                  </p>
                </div>
              );
            })}
          </div>
        </SectionCard>
      </div>

      <SectionCard eyebrow="Painel" title="Visao rapida das matrizes">
        <div className="grid gap-4 lg:grid-cols-3">
          {matrizes.map((matriz) => (
            <div key={matriz.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                    {matriz.codigo}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-white">{matriz.nome}</h3>
                </div>
                <StatusBadge value={matriz.status} />
              </div>
              <div className="mt-5 space-y-2 text-sm text-slate-300">
                <p>Saude: {formatPercent(matriz.saude)}</p>
                <p>Ciclos atuais: {matriz.ciclosAtuais.toLocaleString("pt-BR")}</p>
                <p>Atualizado em: {formatDateTime(matriz.updatedAt)}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
