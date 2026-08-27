"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EstadoEmpresa } from "./api";
import { llamar } from "./cliente";

export { ErrorApi } from "./cliente";

/**
 * Las llamadas de administración van desde el navegador para que viaje la
 * cookie `andes_session`. La API responde 401 sin sesión y 403 sin rol admin.
 */

export type AdminDriver = {
  id: string;
  displayName: string;
  steamId: string | null;
  avatarUrl: string | null;
  platformRole: "driver" | "admin" | "superadmin";
  companyId: string | null;
  companyName: string | null;
  companyRole: "owner" | "manager" | "driver" | null;
  jobsCount: number;
  totalDistanceKm: string;
  createdAt: string;
};

export type AdminCompany = {
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
  memberCount: number;
  pendingCount: number;
  jobsCount: number;
  totalDistanceKm: string;
  createdAt: string;
};

export type AdminMember = {
  driverId: string;
  displayName: string;
  role: "owner" | "manager" | "driver";
  status: "active" | "pending" | "kicked" | "left" | string;
  joinedAt: string;
  jobsCount: number;
  totalDistanceKm: string;
};

export type AuditEntry = {
  id: string;
  createdAt: string;
  actorId: string;
  actorName: string | null;
  action: string;
  targetType: string | null;
  targetId: string | null;
  before: unknown;
  after: unknown;
};

/**
 * El listado de conductores viene paginado. La API documenta que trae un
 * `total`; aceptamos las envolturas más habituales por si cambia el nombre.
 */
type Paginado<T> = { items: T[]; total: number };

function normalizarPaginado<T>(cuerpo: unknown): Paginado<T> {
  if (Array.isArray(cuerpo)) return { items: cuerpo as T[], total: cuerpo.length };
  const objeto = (cuerpo ?? {}) as Record<string, unknown>;
  const lista = ["items", "data", "drivers", "rows", "results"]
    .map((clave) => objeto[clave])
    .find(Array.isArray) as T[] | undefined;
  const total = typeof objeto.total === "number" ? objeto.total : lista?.length ?? 0;
  return { items: lista ?? [], total };
}

export async function listarConductores(opciones: {
  q?: string;
  limit?: number;
  offset?: number;
}) {
  const parametros = new URLSearchParams();
  if (opciones.q) parametros.set("q", opciones.q);
  parametros.set("limit", String(opciones.limit ?? 25));
  parametros.set("offset", String(opciones.offset ?? 0));
  const cuerpo = await llamar<unknown>(`/v1/admin/drivers?${parametros}`);
  return normalizarPaginado<AdminDriver>(cuerpo);
}

export const cambiarRolPlataforma = (id: string, role: "driver" | "admin") =>
  llamar<AdminDriver>(`/v1/admin/drivers/${id}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });

export function listarEmpresas(opciones: { q?: string; status?: string } = {}) {
  const parametros = new URLSearchParams();
  if (opciones.q) parametros.set("q", opciones.q);
  if (opciones.status) parametros.set("status", opciones.status);
  const cadena = parametros.toString();
  return llamar<AdminCompany[]>(
    `/v1/admin/companies${cadena ? `?${cadena}` : ""}`,
  );
}

/**
 * Alta de una empresa desde el panel. `ownerDriverId` deja al líder puesto
 * en la misma transacción: si se omite, la empresa nace sin propietario y
 * hay que asignarlo después desde Miembros.
 */
export type NuevaEmpresa = {
  name: string;
  tag: string;
  slug?: string;
  description?: string;
  status?: EstadoEmpresa;
  maxDrivers?: number;
  ownerDriverId?: string;
};

export const crearEmpresaAdmin = (datos: NuevaEmpresa) =>
  llamar<AdminCompany>("/v1/admin/companies", {
    method: "POST",
    body: JSON.stringify(datos),
  });

export type CambiosEmpresa = Partial<{
  name: string;
  slug: string;
  description: string;
  status: EstadoEmpresa;
  maxDrivers: number;
  cardImageUrl: string;
  bannerUrl: string;
  logoUrl: string;
  website: string | null;
  discordUrl: string | null;
  maxTimeScale: number;
}>;

export const editarEmpresa = (id: string, cambios: CambiosEmpresa) =>
  llamar<AdminCompany>(`/v1/admin/companies/${id}`, {
    method: "PATCH",
    body: JSON.stringify(cambios),
  });

export const listarMiembros = (id: string) =>
  llamar<AdminMember[]>(`/v1/admin/companies/${id}/members`);

export const asignarMiembro = (
  id: string,
  datos: {
    driverId: string;
    role?: "owner" | "manager" | "driver";
    replaceCurrent?: boolean;
  },
) =>
  llamar<AdminMember>(`/v1/admin/companies/${id}/members`, {
    method: "POST",
    body: JSON.stringify(datos),
  });

export const cambiarRolEnEmpresa = (
  id: string,
  driverId: string,
  role: "owner" | "manager" | "driver",
) =>
  llamar<AdminMember>(`/v1/admin/companies/${id}/members/${driverId}`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });

export const sacarMiembro = (id: string, driverId: string) =>
  llamar<void>(`/v1/admin/companies/${id}/members/${driverId}`, {
    method: "DELETE",
  });

export const listarAuditoria = (limit = 100) =>
  llamar<AuditEntry[]>(`/v1/admin/audit?limit=${limit}`);

/**
 * GET con estados de carga y recarga manual.
 *
 * `clave` identifica la consulta: cuando cambia, se vuelve a pedir y la vista
 * muestra el esqueleto. `recargar()` repite la misma consulta sin parpadeo,
 * que es lo que se quiere después de guardar algo.
 */
export function useRecurso<T>(
  clave: string,
  cargar: () => Promise<T>,
  /** En `false` no se pide nada: útil hasta saber si la sesión es admin. */
  activo = true,
) {
  const [resultado, setResultado] = useState<{
    clave: string;
    datos: T | null;
    error: string | null;
  } | null>(null);
  const [ronda, setRonda] = useState(0);

  // La función se recrea en cada render; guardarla en una ref evita que el
  // efecto se dispare por eso en vez de por un cambio real de consulta.
  const cargarRef = useRef(cargar);
  useEffect(() => {
    cargarRef.current = cargar;
  });

  useEffect(() => {
    if (!activo) return;
    let vigente = true;
    cargarRef
      .current()
      .then((datos) => vigente && setResultado({ clave, datos, error: null }))
      .catch(
        (fallo: Error) =>
          vigente && setResultado({ clave, datos: null, error: fallo.message }),
      );
    return () => {
      vigente = false;
    };
  }, [clave, ronda, activo]);

  const alDia = resultado?.clave === clave;

  return {
    datos: alDia ? resultado.datos : null,
    cargando: activo && !alDia,
    error: alDia ? resultado.error : null,
    recargar: useCallback(() => setRonda((numero) => numero + 1), []),
  };
}
