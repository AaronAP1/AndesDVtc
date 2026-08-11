import { MiembrosAdmin } from "@/components/admin/MiembrosAdmin";

export const metadata = { title: "Miembros · Administración | AndesMP" };

export default async function MiembrosAdminPage({
  params,
}: PageProps<"/admin/empresas/[id]">) {
  const { id } = await params;
  return <MiembrosAdmin empresaId={id} />;
}
