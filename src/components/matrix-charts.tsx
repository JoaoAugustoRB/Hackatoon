"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatDateTime } from "@/lib/utils";
import type { Leitura } from "@/types";

export function MatrixCharts({ leituras }: { leituras: Leitura[] }) {
  const data = leituras.slice(-10).map((leitura) => ({
    label: formatDateTime(leitura.createdAt),
    temperatura: leitura.temperatura,
    vibracao: leitura.vibracao,
    impacto: leitura.impacto,
    tempoCiclo: leitura.tempoCiclo,
  }));

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      {[
        { key: "temperatura", label: "Temperatura", color: "#22d3ee" },
        { key: "vibracao", label: "Vibracao", color: "#f59e0b" },
        { key: "impacto", label: "Impacto", color: "#fb7185" },
        { key: "tempoCiclo", label: "Tempo de ciclo", color: "#4ade80" },
      ].map((metric) => (
        <div key={metric.key} className="h-72 rounded-3xl border border-white/10 bg-white/5 p-4">
          <p className="mb-4 text-sm font-medium text-white">{metric.label}</p>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="label" hide />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#020617",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 16,
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey={metric.key}
                stroke={metric.color}
                strokeWidth={3}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ))}
    </div>
  );
}
