"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { onValue, ref } from "firebase/database";
import { StatusBadge } from "@/components/status-badge";
import { calcularOEE, calcularVidaRestante } from "@/lib/calculations";
import { getClientDatabase } from "@/lib/firebase/client";
import { normalizeSnapshot } from "@/lib/snapshot";
import { formatPercent } from "@/lib/utils";
import type { MoldGuardSnapshot } from "@/types";

interface MatrixRow {
  id: string;
  codigo: string;
  nome: string;
  ciclosAtuais: number;
  vidaRestante: number;
  saude: number;
  status: "SAUDAVEL" | "ATENCAO" | "RISCO" | "CRITICO";
  oee: number;
}

function mapRows(snapshot: MoldGuardSnapshot): MatrixRow[] {
  const normalized = normalizeSnapshot(snapshot);

  return Object.values(normalized.matrizes)
    .map((matriz) => {
      const leituras = Object.entries(normalized.leituras[matriz.id] ?? {}).map(
        ([id, leitura]) => ({
          id,
          matrizId: matriz.id,
          ...leitura,
        }),
      );

      return {
        id: matriz.id,
        codigo: matriz.codigo,
        nome: matriz.nome,
        ciclosAtuais: matriz.ciclosAtuais,
        vidaRestante: calcularVidaRestante(matriz.ciclosAtuais, matriz.vidaUtilTotal),
        saude: matriz.saude,
        status: matriz.status,
        oee: calcularOEE(leituras, matriz.cicloIdeal).oee * 100,
      };
    })
    .sort((a, b) => a.codigo.localeCompare(b.codigo));
}

export function MatrixTable({
  initialSnapshot,
}: {
  initialSnapshot: MoldGuardSnapshot;
}) {
  const [rows, setRows] = useState(() => mapRows(normalizeSnapshot(initialSnapshot)));

  useEffect(() => {
    const db = getClientDatabase();
    if (!db) return;

    return onValue(ref(db, "/"), (event) => {
      const next = normalizeSnapshot(event.val() as Partial<MoldGuardSnapshot> | null);
      setRows(mapRows(next));
    });
  }, []);

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-white/5 text-slate-400">
            <tr>
              <th className="px-5 py-4 font-medium">Codigo</th>
              <th className="px-5 py-4 font-medium">Nome</th>
              <th className="px-5 py-4 font-medium">Ciclos</th>
              <th className="px-5 py-4 font-medium">Vida restante</th>
              <th className="px-5 py-4 font-medium">Saude</th>
              <th className="px-5 py-4 font-medium">Status</th>
              <th className="px-5 py-4 font-medium">OEE</th>
              <th className="px-5 py-4 font-medium">Acao</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-white/5 text-slate-200">
                <td className="px-5 py-4 font-medium text-white">{row.codigo}</td>
                <td className="px-5 py-4">{row.nome}</td>
                <td className="px-5 py-4">{row.ciclosAtuais.toLocaleString("pt-BR")}</td>
                <td className="px-5 py-4">{formatPercent(row.vidaRestante)}</td>
                <td className="px-5 py-4">{formatPercent(row.saude)}</td>
                <td className="px-5 py-4">
                  <StatusBadge value={row.status} />
                </td>
                <td className="px-5 py-4">{formatPercent(row.oee)}</td>
                <td className="px-5 py-4">
                  <Link
                    href={`/matrizes/${row.id}`}
                    className="inline-flex rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-xs font-semibold text-cyan-200 transition hover:bg-cyan-400/20"
                  >
                    Ver detalhe
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
