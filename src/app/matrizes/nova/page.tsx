import { MatrixForm } from "@/components/matrix-form";

export default function NovaMatrizPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Setup</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">Cadastro de matriz</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
          Informe limites operacionais, vida util e ciclo ideal para que o MoldGuard consiga
          calcular degradacao, alertas e OEE a partir das leituras registradas.
        </p>
      </section>

      <MatrixForm />
    </div>
  );
}
