"use client";

import { useActionState } from "react";
import { createMatrizAction } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";
import { SectionCard } from "@/components/section-card";

const initialState = {
  success: true,
  message: "",
};

const fields = [
  { name: "codigo", label: "Codigo", type: "text", placeholder: "MX-010" },
  { name: "nome", label: "Nome", type: "text", placeholder: "Matriz Linha Premium" },
  {
    name: "vidaUtilTotal",
    label: "Vida util total",
    type: "number",
    placeholder: "150000",
  },
  { name: "ciclosAtuais", label: "Ciclos atuais", type: "number", placeholder: "0" },
  {
    name: "temperaturaLimite",
    label: "Temperatura limite",
    type: "number",
    placeholder: "80",
  },
  {
    name: "vibracaoLimite",
    label: "Vibracao limite",
    type: "number",
    step: "0.1",
    placeholder: "4.5",
  },
  { name: "impactoLimite", label: "Impacto limite", type: "number", placeholder: "90" },
  { name: "cicloIdeal", label: "Ciclo ideal (s)", type: "number", step: "0.1", placeholder: "12" },
];

export function MatrixForm() {
  const [state, formAction] = useActionState(createMatrizAction, initialState);

  return (
    <SectionCard eyebrow="Cadastro" title="Nova matriz">
      <form action={formAction} className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          {fields.map((field) => (
            <label key={field.name} className="space-y-2">
              <span className="text-sm font-medium text-slate-300">{field.label}</span>
              <input
                required
                name={field.name}
                type={field.type}
                step={field.step}
                placeholder={field.placeholder}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50 focus:bg-white/7"
              />
            </label>
          ))}
        </div>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-300">Descricao</span>
          <textarea
            name="descricao"
            rows={4}
            placeholder="Descreva a aplicacao da matriz, linha e condicoes operacionais."
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50 focus:bg-white/7"
          />
        </label>

        {state.message ? (
          <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {state.message}
          </p>
        ) : null}

        <SubmitButton
          label="Salvar matriz"
          pendingLabel="Salvando..."
          className="inline-flex h-12 items-center rounded-2xl bg-cyan-400 px-5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
        />
      </form>
    </SectionCard>
  );
}
