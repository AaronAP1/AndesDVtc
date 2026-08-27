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

/**
 * Las dos cifras van separadas y las dos son de ESTA empresa: `jobsCount` y
 * `totalDistanceKm` cuentan sólo lo validado —la misma base que el ranking y
 * que el perfil del conductor—, y los `...Todos` son lo mismo sin filtrar,
 * que es lo que necesita ver quien gestiona para saber qué queda por revisar.
 */
export type CompanyMember = {
  driverId: string;
  displayName: string;
  avatarUrl: string;
  role: "owner" | "manager" | "driver" | string;
  status: string;
  joinedAt: string | null;
  jobsCount: number;
  /** Decimal serializado como texto por la API. */
  totalDistanceKm: string;
  jobsCountTodos: number;
  totalDistanceKmTodos: string;
};

export type LeaderboardRow = {
  driverId: string;
  displayName: string;
  jobsCount: number;
  distanceKm: string;
  revenue: number;
};

/** Una fila del Top global: la del ranking de empresa más su empresa. */
export type LeaderboardGlobalRow = LeaderboardRow & {
  rank: number;
  avatarUrl: string;
  companyId: string | null;
  companyName: string | null;
  companyTag: string | null;
  companySlug: string | null;
};

export type PaginaLeaderboard = {
  period: "all" | "month";
  total: number;
  limit: number;
  offset: number;
  items: LeaderboardGlobalRow[];
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

/** Totales de un conductor. Sólo cuentan los trabajos entregados y válidos. */
export type TotalesConductor = {
  jobsCount: number;
  totalDistanceKm: string;
  totalRevenue: number;
  avgCargoDamage: number;
};

/**
 * Los totales de arriba son de SIEMPRE, no de la ventana pedida: `days`
 * recorta `byDay` y alimenta `window`, que trae esos mismos totales acotados.
 */
export type DriverStats = TotalesConductor & {
  driverId: string;
  days: number;
  window: TotalesConductor & { days: number; since: string };
  byDay: {
    day: string;
    distanceKm: string;
    jobsCount: number;
    revenue: number;
  }[];
};

export type DriverListItem = {
  id: string;
  displayName: string;
  avatarUrl: string;
  createdAt: string;
  companyId: string | null;
  companyName: string | null;
  companyTag: string | null;
  companySlug: string | null;
  companyRole: "owner" | "manager" | "driver" | null;
  jobsCount: number;
  totalDistanceKm: string;
};

export type PaginaDrivers = {
  items: DriverListItem[];
  total: number;
  limit: number;
  offset: number;
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
async function pedir<T>(
  ruta: string,
  revalidate = REVALIDATE,
): Promise<T | null> {
  let respuesta: Response;
  try {
    respuesta = await fetch(`${API_URL}${ruta}`, {
      next: { revalidate },
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
  /** `pending`, `valid`, `suspicious` o `invalid`. */
  validationStatus?: string;
  /** Fechas `YYYY-MM-DD`, inclusive. Evitan recorrer el historial por cursor. */
  from?: string;
  to?: string;
  limit?: number;
  cursor?: string;
}) {
  const parametros = new URLSearchParams();
  if (filtros.companyId) parametros.set("companyId", filtros.companyId);
  if (filtros.driverId) parametros.set("driverId", filtros.driverId);
  if (filtros.validationStatus)
    parametros.set("validationStatus", filtros.validationStatus);
  if (filtros.from) parametros.set("from", filtros.from);
  if (filtros.to) parametros.set("to", filtros.to);
  parametros.set("limit", String(filtros.limit ?? 10));
  if (filtros.cursor) parametros.set("cursor", filtros.cursor);
  return pedir<PaginaJobs>(`/v1/jobs?${parametros}`);
}

/** Listado público: incluye a los conductores sin empresa. */
export function getDrivers(opciones: {
  q?: string;
  limit?: number;
  offset?: number;
} = {}) {
  const parametros = new URLSearchParams();
  if (opciones.q) parametros.set("q", opciones.q);
  parametros.set("limit", String(opciones.limit ?? 50));
  parametros.set("offset", String(opciones.offset ?? 0));
  return pedir<PaginaDrivers>(`/v1/drivers?${parametros}`);
}

/** Segundos de caché del Top. */
const REVALIDATE_TOP = 300;

export type FilaTop = {
  driverId: string;
  displayName: string;
  empresaNombre: string | null;
  empresaSlug: string | null;
  jobsCount: number;
  distanceKm: number;
  revenue: number;
};

export const getLeaderboard = (
  periodo: "all" | "month",
  limit = 200,
  offset = 0,
) =>
  pedir<PaginaLeaderboard>(
    `/v1/leaderboard?period=${periodo}&limit=${limit}&offset=${offset}`,
    REVALIDATE_TOP,
  );

const aFila = (fila: LeaderboardGlobalRow): FilaTop => ({
  driverId: fila.driverId,
  displayName: fila.displayName,
  empresaNombre: fila.companyName,
  empresaSlug: fila.companySlug,
  jobsCount: fila.jobsCount,
  distanceKm: Number(fila.distanceKm ?? 0),
  revenue: fila.revenue ?? 0,
});

export type FilaTopEmpresa = {
  companyId: string;
  nombre: string;
  slug: string | null;
  tag: string | null;
  conductores: number;
  jobsCount: number;
  distanceKm: number;
  revenue: number;
};

/**
 * El ranking de empresas sale de sumar el de conductores por empresa: cada
 * fila del leaderboard ya trae la suya, así que no cuesta ninguna petición
 * más. Quien no tiene empresa no suma a nadie.
 */
function porEmpresa(filas: LeaderboardGlobalRow[]): FilaTopEmpresa[] {
  const cuentas = new Map<string, FilaTopEmpresa>();

  for (const fila of filas) {
    if (!fila.companyId) continue;
    const previa = cuentas.get(fila.companyId) ?? {
      companyId: fila.companyId,
      nombre: fila.companyName ?? "Empresa",
      slug: fila.companySlug,
      tag: fila.companyTag,
      conductores: 0,
      jobsCount: 0,
      distanceKm: 0,
      revenue: 0,
    };
    previa.conductores += 1;
    previa.jobsCount += fila.jobsCount ?? 0;
    previa.distanceKm += Number(fila.distanceKm ?? 0);
    previa.revenue += fila.revenue ?? 0;
    cuentas.set(fila.companyId, previa);
  }

  return [...cuentas.values()].sort((a, b) => b.distanceKm - a.distanceKm);
}

/**
 * El Top salía de juntar el ranking de cada empresa y, para el mensual, el
 * `byDay` de cada conductor: una petición por empresa y otra por conductor.
 * `/v1/leaderboard` lo resuelve en una llamada por periodo, y además incluye
 * a los conductores sin empresa, que antes no había manera de enumerar.
 *
 * Los cuatro cuadros del Top —conductores y empresas, del mes y de siempre—
 * salen de esas dos llamadas.
 */
export async function getTop(limit = 200) {
  const [historico, mensual] = await Promise.all([
    getLeaderboard("all", limit),
    getLeaderboard("month", limit),
  ]);
  if (!historico) return null;

  const deSiempre = historico.items;
  const delMes = mensual?.items ?? [];

  return {
    conductores: { total: deSiempre.map(aFila), mes: delMes.map(aFila) },
    empresas: { total: porEmpresa(deSiempre), mes: porEmpresa(delMes) },
  };
}
