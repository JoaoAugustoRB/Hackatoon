import { Activity, Factory, ShieldAlert, Siren } from "lucide-react";
import { RealtimeDashboard } from "@/components/realtime-dashboard";
import { SectionCard } from "@/components/section-card";
import { getDashboardData } from "@/lib/data";
import { isFirebaseAdminConfigured } from "@/lib/firebase/admin";

export default async function Home() {
  const { snapshot, stats, alertas } = await getDashboardData();

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(34,211,238,0.16),rgba(15,23,42,0.9)_42%,rgba(2,6,23,1))] p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">
            Centro de monitoramento
          </p>
          <h2 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight text-white">
            MoldGuard acompanha a saude da matriz a cada ciclo e transforma leitura em acao.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
            O painel cruza vida util, anomalias de processo, OEE e historico recente para
            orientar manutencao preditiva e priorizacao operacional.
          </p>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <Factory className="size-5 text-cyan-300" />
              <p className="mt-3 text-sm text-slate-300">Cadastro e rastreio por ativo</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <Activity className="size-5 text-cyan-300" />
              <p className="mt-3 text-sm text-slate-300">Simulacao de leitura por ciclo</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <ShieldAlert className="size-5 text-cyan-300" />
              <p className="mt-3 text-sm text-slate-300">Alertas e degradacao de saude</p>
            </div>
          </div>
        </div>

        <SectionCard eyebrow="Operacao" title="Modo de dados">
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-400">Fonte principal</p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {isFirebaseAdminConfigured() ? "Firebase Realtime Database" : "Modo demo local"}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-400">Alertas recentes</p>
              <p className="mt-2 text-2xl font-semibold text-white">{alertas.length}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-400">OEE medio da planta</p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {stats.oeeMedio.toFixed(1)}%
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.18em] text-slate-400">
              <Siren className="size-4 text-cyan-300" />
              Atualizacao em tempo real quando o Firebase publico estiver configurado
            </div>
          </div>
        </SectionCard>
      </section>

      <RealtimeDashboard
        initialSnapshot={snapshot}
        initialStats={stats}
        initialAlertas={alertas}
      />
    </div>
  );
}
