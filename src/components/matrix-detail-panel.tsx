import { SimulateButton } from "@/components/simulate-button";
import { StatusBadge } from "@/components/status-badge";
import { MatrixCharts } from "@/components/matrix-charts";
import { SectionCard } from "@/components/section-card";
import { formatDateTime, formatNumber, formatPercent } from "@/lib/utils";
import type { Alerta, Leitura, Matriz, OEE } from "@/types";

export function MatrixDetailPanel({
  matriz,
  ultimaLeitura,
  vidaRestante,
  oee,
  leituras,
  alertas,
}: {
  matriz: Matriz;
  ultimaLeitura: Leitura | null;
  vidaRestante: number;
  oee: OEE;
  leituras: Leitura[];
  alertas: Alerta[];
}) {
  return (
    <div className="space-y-6">
      <SectionCard eyebrow={matriz.codigo} title={matriz.nome}>
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm leading-7 text-slate-300">{matriz.descricao}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <StatusBadge value={matriz.status} />
              <div className="rounded-full border border-white/10 px-3 py-1 text-xs tracking-[0.14em] text-slate-400">
                Atualizado em {formatDateTime(matriz.updatedAt)}
              </div>
            </div>
          </div>
          <SimulateButton matrizId={matriz.id} />
        </div>
      </SectionCard>

      <div className="grid gap-4 xl:grid-cols-4 md:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
          <p className="text-sm uppercase tracking-[0.16em] text-slate-400">Saude</p>
          <p className="mt-3 text-3xl font-semibold text-white">{formatPercent(matriz.saude)}</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
          <p className="text-sm uppercase tracking-[0.16em] text-slate-400">Vida restante</p>
          <p className="mt-3 text-3xl font-semibold text-white">{formatPercent(vidaRestante)}</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
          <p className="text-sm uppercase tracking-[0.16em] text-slate-400">Ciclos atuais</p>
          <p className="mt-3 text-3xl font-semibold text-white">
            {formatNumber(matriz.ciclosAtuais)}
          </p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
          <p className="text-sm uppercase tracking-[0.16em] text-slate-400">OEE final</p>
          <p className="mt-3 text-3xl font-semibold text-white">{formatPercent(oee.oee * 100)}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <SectionCard eyebrow="Leitura atual" title="Sensores e performance">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Temperatura</p>
              <p className="mt-3 text-2xl font-semibold text-white">
                {ultimaLeitura ? `${ultimaLeitura.temperatura.toFixed(1)}°C` : "--"}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Vibracao</p>
              <p className="mt-3 text-2xl font-semibold text-white">
                {ultimaLeitura ? ultimaLeitura.vibracao.toFixed(2) : "--"}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Impacto</p>
              <p className="mt-3 text-2xl font-semibold text-white">
                {ultimaLeitura ? ultimaLeitura.impacto.toFixed(1) : "--"}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Tempo medio</p>
              <p className="mt-3 text-2xl font-semibold text-white">
                {oee.tempoCicloMedio ? `${oee.tempoCicloMedio.toFixed(1)}s` : "--"}
              </p>
            </div>
          </div>
        </SectionCard>

        <SectionCard eyebrow="OEE" title="Composicao do indicador">
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-400">Disponibilidade</p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {formatPercent(oee.disponibilidade * 100)}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-400">Performance</p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {formatPercent(oee.performance * 100)}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-400">Qualidade</p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {formatPercent(oee.qualidade * 100)}
              </p>
            </div>
            <p className="text-sm text-slate-400">
              Classificacao operacional: <span className="font-semibold text-white">{oee.classificacao}</span>
            </p>
          </div>
        </SectionCard>
      </div>

      <SectionCard eyebrow="Historico" title="Graficos por leitura">
        <MatrixCharts leituras={leituras} />
      </SectionCard>

      <SectionCard eyebrow="Alertas" title="Ultimos eventos da matriz">
        <div className="space-y-3">
          {alertas.slice(0, 6).map((alerta) => (
            <div key={alerta.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <StatusBadge value={alerta.nivel} />
                  <span className="text-xs uppercase tracking-[0.16em] text-slate-400">
                    {alerta.tipo}
                  </span>
                </div>
                <span className="text-xs text-slate-500">{formatDateTime(alerta.createdAt)}</span>
              </div>
              <p className="mt-3 text-sm text-slate-200">{alerta.mensagem}</p>
            </div>
          ))}
          {!alertas.length ? (
            <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-sm text-slate-400">
              Nenhum alerta registrado para esta matriz.
            </p>
          ) : null}
        </div>
      </SectionCard>
    </div>
  );
}
