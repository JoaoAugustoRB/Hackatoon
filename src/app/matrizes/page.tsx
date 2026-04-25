import Link from "next/link";
import { MatrixTable } from "@/components/matrix-table";
import { SectionCard } from "@/components/section-card";
import { getMatrizes } from "@/lib/data";

export default async function MatrizesPage() {
  const { snapshot, matrizes } = await getMatrizes();

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-slate-950/70 p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Inventario</p>
          <h2 className="mt-2 text-3xl font-semibold text-white">Lista de matrizes</h2>
          <p className="mt-3 text-sm leading-7 text-slate-400">
            Visao consolidada de ciclos, vida restante, saude do ativo, status atual e OEE.
          </p>
        </div>
        <Link
          href="/matrizes/nova"
          className="inline-flex h-12 items-center rounded-2xl bg-cyan-400 px-5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
        >
          Cadastrar matriz
        </Link>
      </section>

      <SectionCard eyebrow="Operacao" title={`${matrizes.length} matrizes monitoradas`}>
        <MatrixTable initialSnapshot={snapshot} />
      </SectionCard>
    </div>
  );
}
