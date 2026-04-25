import { AlertsTable } from "@/components/alerts-table";
import { SectionCard } from "@/components/section-card";
import { getAlertas } from "@/lib/data";

export default async function AlertasPage() {
  const { snapshot, alertas } = await getAlertas();

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Eventos</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">Central de alertas</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
          Alertas gerados por extrapolacao de limite, aumento do ciclo e desgaste de vida util.
        </p>
      </section>

      <SectionCard eyebrow="Prioridade" title={`${alertas.length} alertas registrados`}>
        <AlertsTable alertas={alertas} matrizes={snapshot.matrizes} />
      </SectionCard>
    </div>
  );
}
