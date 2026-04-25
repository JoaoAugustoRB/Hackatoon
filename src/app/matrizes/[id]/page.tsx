import { notFound } from "next/navigation";
import { MatrixDetailPanel } from "@/components/matrix-detail-panel";
import { getMatrizDetail } from "@/lib/data";

export default async function MatrizDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getMatrizDetail(id);

  if (!detail) {
    notFound();
  }

  return <MatrixDetailPanel {...detail} />;
}
