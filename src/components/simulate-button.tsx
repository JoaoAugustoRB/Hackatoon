import { simularLeituraAction } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";

export function SimulateButton({ matrizId }: { matrizId: string }) {
  const action = simularLeituraAction.bind(null, matrizId);

  return (
    <form action={action}>
      <SubmitButton
        label="Simular leitura"
        pendingLabel="Simulando..."
        className="inline-flex h-12 items-center rounded-2xl bg-cyan-400 px-5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
      />
    </form>
  );
}
