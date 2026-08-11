/** Roles dentro de una empresa, tal como los devuelve la API. */
export const ROL_LABEL: Record<string, string> = {
  owner: "Propietario",
  manager: "Gerente",
  driver: "Conductor",
};

export const ROL_STYLES: Record<string, string> = {
  owner: "text-amber-400/80",
  manager: "text-rose-400/80",
  driver: "text-blue-400/70",
};

export const rolLabel = (rol: string) => ROL_LABEL[rol] ?? rol;
export const rolStyle = (rol: string) => ROL_STYLES[rol] ?? "text-white/40";

/** Estado de la membresía: activo, pendiente o expulsado. */
export const ESTADO_MIEMBRO: Record<string, string> = {
  active: "Activo",
  pending: "Pendiente",
  kicked: "Fuera",
  left: "Se fue",
};

export const estadoMiembro = (estado: string) =>
  ESTADO_MIEMBRO[estado] ?? estado;

/** "11.92" → "12 km" con separadores en español. */
export const km = (valor: number | string) => {
  const numero = typeof valor === "string" ? Number(valor) : valor;
  if (!Number.isFinite(numero)) return "0 km";
  return `${numero.toLocaleString("es-PE", { maximumFractionDigits: 0 })} km`;
};

export const fecha = (iso: string) =>
  new Date(iso).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

export const fechaHora = (iso: string) =>
  new Date(iso).toLocaleString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
