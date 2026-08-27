import { PerfilVista } from "@/components/PerfilVista";
import { getCompanies, sinFallar } from "@/lib/api";

export const metadata = {
  title: "Mi perfil | AndesMP EMPRESAS",
};

export default async function PerfilPage() {
  const empresas = await sinFallar(getCompanies);
  const mapa = Object.fromEntries(
    (empresas ?? []).map((empresa) => [empresa.id, empresa.slug]),
  );
  return <PerfilVista empresas={mapa} />;
}
