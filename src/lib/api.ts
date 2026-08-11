/**
 * Cliente de la API de AndesMP (https://api.andesmp.site en producción).
 * Sólo se usa desde componentes de servidor: la URL no lleva prefijo
 * NEXT_PUBLIC_ para que no viaje al navegador.
 */

export const API_URL = process.env.API_URL ?? "http://localhost:3001";

/** Segundos que se cachea cada respuesta antes de volver a pedirla. */
const REVALIDATE = 60;

export type EstadoEmpresa = "active" | "recruiting" | "inactive";

export type CompanyListItem = {
  id: string;
  name: string;
  tag: string;
  slug: string;
  status: EstadoEmpresa;
  description: string | null;
  maxDrivers: number;
  cardImageUrl: string;
  logoUrl: string;
  createdAt: string;
  memberCount: number;
};

export type CompanyDetail = {
  id: string;
  name: string;
  tag: string;
  slug: string;
  status: EstadoEmpresa;
  description: string | null;
  maxDrivers: number;
  cardImageUrl: string;
  bannerUrl: string;
  logoUrl: string;
  website: string | null;
  discordUrl: string | null;
  maxTimeScale: string;
  minDistanceRatio: string;
  createdAt: string;
};

export type CompanyMember = {
  driverId: string;
  displayName: string;
  role: "owner" | "manager" | "driver" | string;
  status: string;
  joinedAt: string;
  jobsCount: number;
  /** Decimal serializado como texto por la API. */
  totalDistanceKm: string;
};

export type LeaderboardRow = {
  driverId: string;
  displayName: string;
  jobsCount: number;
  distanceKm: string;
  revenue: string;
};

async function pedir<T>(ruta: string): Promise<T | null> {
  try {
    const respuesta = await fetch(`${API_URL}${ruta}`, {
      next: { revalidate: REVALIDATE },
      headers: { accept: "application/json" },
    });
    if (!respuesta.ok) return null;
    return (await respuesta.json()) as T;
  } catch {
    // La API caída no debe tumbar la página: cada vista decide qué mostrar.
    return null;
  }
}

export const getCompanies = () => pedir<CompanyListItem[]>("/v1/companies");

export const getCompany = (id: string) =>
  pedir<CompanyDetail>(`/v1/companies/${id}`);

export const getCompanyMembers = (id: string) =>
  pedir<CompanyMember[]>(`/v1/companies/${id}/members`);

export const getCompanyLeaderboard = (id: string, limit = 10) =>
  pedir<LeaderboardRow[]>(`/v1/companies/${id}/leaderboard?limit=${limit}`);

/** El detalle sólo acepta UUID, así que el slug se resuelve contra el listado. */
export async function getCompanyBySlug(slug: string) {
  const empresas = await getCompanies();
  return empresas?.find((empresa) => empresa.slug === slug) ?? null;
}
