"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createMatriz, registerLeitura, resolverAlerta } from "@/lib/data";

function getNumber(formData: FormData, key: string) {
  const raw = formData.get(key);
  const value = Number(raw);

  if (Number.isNaN(value)) {
    throw new Error(`Campo invalido: ${key}`);
  }

  return value;
}

export async function createMatrizAction(_: unknown, formData: FormData) {
  try {
    const matriz = await createMatriz({
      codigo: String(formData.get("codigo") ?? ""),
      nome: String(formData.get("nome") ?? ""),
      descricao: String(formData.get("descricao") ?? ""),
      vidaUtilTotal: getNumber(formData, "vidaUtilTotal"),
      ciclosAtuais: getNumber(formData, "ciclosAtuais"),
      temperaturaLimite: getNumber(formData, "temperaturaLimite"),
      vibracaoLimite: getNumber(formData, "vibracaoLimite"),
      impactoLimite: getNumber(formData, "impactoLimite"),
      cicloIdeal: getNumber(formData, "cicloIdeal"),
    });

    revalidatePath("/");
    revalidatePath("/matrizes");
    redirect(`/matrizes/${matriz.id}`);
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Nao foi possivel cadastrar a matriz.",
    };
  }
}

export async function simularLeituraAction(matrizId: string) {
  const temperatura = Number((40 + Math.random() * 55).toFixed(1));
  const vibracao = Number((0.5 + Math.random() * 5.5).toFixed(2));
  const impacto = Number((10 + Math.random() * 100).toFixed(1));
  const tempoCiclo = Number((8 + Math.random() * 14).toFixed(1));
  const pecaBoa = Math.random() > 0.18;

  await registerLeitura(matrizId, {
    temperatura,
    vibracao,
    impacto,
    tempoCiclo,
    pecaBoa,
  });

  revalidatePath("/");
  revalidatePath("/matrizes");
  revalidatePath(`/matrizes/${matrizId}`);
  revalidatePath("/alertas");
}

export async function resolverAlertaAction(alertaId: string) {
  await resolverAlerta(alertaId);
  revalidatePath("/");
  revalidatePath("/alertas");
}
