import { ResolveAlertButton } from "@/components/resolve-alert-button";
import { StatusBadge } from "@/components/status-badge";
import { formatDateTime } from "@/lib/utils";
import type { Alerta, Matriz } from "@/types";

export function AlertsTable({
  alertas,
  matrizes,
}: {
  alertas: Alerta[];
  matrizes: Record<string, Matriz>;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-white/5 text-slate-400">
            <tr>
              <th className="px-5 py-4 font-medium">Matriz</th>
              <th className="px-5 py-4 font-medium">Tipo</th>
              <th className="px-5 py-4 font-medium">Nivel</th>
              <th className="px-5 py-4 font-medium">Mensagem</th>
              <th className="px-5 py-4 font-medium">Data</th>
              <th className="px-5 py-4 font-medium">Status</th>
              <th className="px-5 py-4 font-medium">Acao</th>
            </tr>
          </thead>
          <tbody>
            {alertas.map((alerta) => (
              <tr key={alerta.id} className="border-t border-white/5 text-slate-200">
                <td className="px-5 py-4 font-medium text-white">
                  {matrizes[alerta.matrizId]?.codigo ?? alerta.matrizId}
                </td>
                <td className="px-5 py-4">{alerta.tipo}</td>
                <td className="px-5 py-4">
                  <StatusBadge value={alerta.nivel} />
                </td>
                <td className="px-5 py-4">{alerta.mensagem}</td>
                <td className="px-5 py-4">{formatDateTime(alerta.createdAt)}</td>
                <td className="px-5 py-4">
                  {alerta.resolvido ? (
                    <span className="text-emerald-300">Resolvido</span>
                  ) : (
                    <span className="text-slate-300">Aberto</span>
                  )}
                </td>
                <td className="px-5 py-4">
                  {alerta.resolvido ? null : <ResolveAlertButton alertaId={alerta.id} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
