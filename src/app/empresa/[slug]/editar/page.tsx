import { notFound } from "next/navigation";
import { EditarEmpresaVista } from "@/components/EditarEmpresaVista";
import { getCompanies, getCompany, getCompanyBySlug } from "@/lib/api";


export async function generateMetadata({
  params,
}: PageProps<"/empresa/[slug]/editar">) {
  const { slug } = await params;
  return { title: `Editar ${slug} | AndesMP EMPRESAS` };
}

export default async function EditarEmpresaPage({
  params,
}: PageProps<"/empresa/[slug]/editar">) {
  const { slug } = await params;

  const resumen = await getCompanyBySlug(slug);
  if (!resumen) notFound();

  const [empresa, listado] = await Promise.all([
    getCompany(resumen.id),
    getCompanies(),
  ]);
  if (!empresa) notFound();

  const mapa = Object.fromEntries(
    (listado ?? []).map((item) => [item.id, item.slug]),
  );

  return <EditarEmpresaVista empresa={empresa} slug={slug} empresas={mapa} />;
}
