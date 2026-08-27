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

/** Lo que devuelven `/companies/{id}` y `/companies/by-slug/{slug}`. */
export type CompanyDetail = CompanyListItem & {
  bannerUrl: string;
  website: string | null;
  discordUrl: string | null;
  maxTimeScale: string;
  minDistanceRatio: string;
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

export type DriverProfile = {
  id: string;
  displayName: string;
  steamId: string | null;
  discordId: string | null;
  platformRole: "driver" | "admin" | "superadmin";
  avatarUrl: string | null;
  createdAt: string;
  companyId: string | null;
  role: "owner" | "manager" | "driver" | null;
};

export type DriverStats = {
  driverId: string;
  jobsCount: number;
  totalDistanceKm: string;
  totalRevenue: string;
  avgCargoDamage: string;
  byDay: { day: string; distanceKm: string; jobsCount: number }[];
};

export type Job = {
  id: string;
  driverId: string;
  companyId: string | null;
  status: string;
  validationStatus: string;
  validationFlags: string[];
  sourceCity: string | null;
  destCity: string | null;
  cargo: string | null;
  cargoMassKg: string | null;
  market: string | null;
  plannedDistanceKm: number | null;
  drivenDistanceKm: string | null;
  revenue: number | null;
  cargoDamage: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
};

export type PaginaJobs = { items: Job[]; nextCursor: string | null };

/** La API no respondió. Distinto de "no existe": no es un 404. */
export class ApiCaida extends Error {}

/**
 * `null` significa 404 —el recurso no existe— y por eso la página puede
 * llamar a notFound(). Si la API no contesta se lanza ApiCaida: devolver
 * 404 ahí le diría a los buscadores que la empresa dejó de existir, cuando
 * en realidad es un corte pasajero.
 */
async function pedir<T>(ruta: string): Promise<T | null> {
  let respuesta: Response;
  try {
    respuesta = await fetch(`${API_URL}${ruta}`, {
      next: { revalidate: REVALIDATE },
      headers: { accept: "application/json" },
    });
  } catch {
    throw new ApiCaida(`No se pudo conectar con la API (${ruta}).`);
  }

  if (respuesta.status === 404) return null;
  if (!respuesta.ok) {
    throw new ApiCaida(`La API respondió ${respuesta.status} en ${ruta}.`);
  }
  return (await respuesta.json()) as T;
}

/** Para las vistas que prefieren pintar un aviso antes que fallar. */
export async function sinFallar<T>(
  promesa: () => Promise<T | null>,
): Promise<T | null> {
  try {
    return await promesa();
  } catch {
    return null;
  }
}

export const getCompanies = () => pedir<CompanyListItem[]>("/v1/companies");

export const getCompany = (id: string) =>
  pedir<CompanyDetail>(`/v1/companies/${id}`);

/** La API resuelve el slug por su cuenta: no hace falta traerse el listado. */
export const getCompanyBySlug = (slug: string) =>
  pedir<CompanyDetail>(`/v1/companies/by-slug/${encodeURIComponent(slug)}`);

export const getCompanyMembers = (id: string) =>
  pedir<CompanyMember[]>(`/v1/companies/${id}/members`);

export const getCompanyLeaderboard = (id: string, limit = 10) =>
  pedir<LeaderboardRow[]>(`/v1/companies/${id}/leaderboard?limit=${limit}`);

/** Trabajos marcados para revisión humana. */
export const getReviewQueue = (id: string) =>
  pedir<Job[]>(`/v1/companies/${id}/review-queue`);

export const getDriver = (id: string) =>
  pedir<DriverProfile>(`/v1/drivers/${id}`);

export const getDriverStats = (id: string, days = 30) =>
  pedir<DriverStats>(`/v1/drivers/${id}/stats?days=${days}`);

export function getJobs(filtros: {
  companyId?: string;
  driverId?: string;
  limit?: number;
  cursor?: string;
}) {
  const parametros = new URLSearchParams();
  if (filtros.companyId) parametros.set("companyId", filtros.companyId);
  if (filtros.driverId) parametros.set("driverId", filtros.driverId);
  parametros.set("limit", String(filtros.limit ?? 10));
  if (filtros.cursor) parametros.set("cursor", filtros.cursor);
  return pedir<PaginaJobs>(`/v1/jobs?${parametros}`);
}
