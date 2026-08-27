import { notFound } from "next/navigation";
import { EditarEmpresaVista } from "@/components/EditarEmpresaVista";
import {
  getCompanies,
  getCompanyBySlug,
  sinFallar,
} from "@/lib/api";


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

  const empresa = await getCompanyBySlug(slug);
  if (!empresa) notFound();

  const listado = await sinFallar(getCompanies);

  const mapa = Object.fromEntries(
    (listado ?? []).map((item) => [item.id, item.slug]),
  );

  return <EditarEmpresaVista empresa={empresa} slug={slug} empresas={mapa} />;
}
