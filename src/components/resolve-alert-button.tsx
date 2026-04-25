import { resolverAlertaAction } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";

export function ResolveAlertButton({ alertaId }: { alertaId: string }) {
  const action = resolverAlertaAction.bind(null, alertaId);

  return (
    <form action={action}>
      <SubmitButton
        label="Resolver"
        pendingLabel="Salvando..."
        className="inline-flex h-9 items-center rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-3 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-60"
      />
    </form>
  );
}
