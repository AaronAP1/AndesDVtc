"use client";

import { CompanyDetail } from "./api";
import { llamar, subirFichero } from "./cliente";

/**
 * Lo que un conductor puede hacer sobre una empresa desde la web.
 *
 * Todo esto se pedía antes con el token de dispositivo que emite el hub, así
 * que la web sólo podía explicar el camino. Ahora los mismos endpoints
 * aceptan la cookie de sesión y los botones funcionan aquí.
 */

export type Solicitud = {
  driverId: string;
  displayName: string;
  avatarUrl: string;
  steamId: string | null;
  solicitadaEn: string;
  jobsCount: number;
  totalDistanceKm: string;
};

export type Membresia = {
  companyId: string;
  driverId: string;
  role: "owner" | "manager" | "driver";
  status: "pending" | "active" | "rejected" | "left" | "kicked";
  joinedAt: string | null;
  createdAt: string;
};

/** Quien la crea queda como propietario en la misma transacción. */
export const crearEmpresa = (datos: {
  name: string;
  tag: string;
  description?: string;
}) =>
  llamar<CompanyDetail>("/v1/companies", {
    method: "POST",
    body: JSON.stringify(datos),
  });

/** Queda pendiente hasta que un gestor la apruebe. */
export const solicitarIngreso = (companyId: string) =>
  llamar<Membresia>(`/v1/companies/${companyId}/applications`, {
    method: "POST",
  });

/**
 * El escaparate de la empresa. Nombre, tag, slug, estado y cupo no están
 * aquí a propósito: son de la plataforma, no del dueño.
 */
export type CambiosPropios = Partial<{
  description: string;
  website: string | null;
  discordUrl: string | null;
  cardImageUrl: string;
  bannerUrl: string;
  logoUrl: string;
}>;

export const editarMiEmpresa = (companyId: string, cambios: CambiosPropios) =>
  llamar<CompanyDetail>(`/v1/companies/${companyId}`, {
    method: "PATCH",
    body: JSON.stringify(cambios),
  });

export const listarSolicitudes = (companyId: string) =>
  llamar<Solicitud[]>(`/v1/companies/${companyId}/applications`);

export const aprobarSolicitud = (companyId: string, driverId: string) =>
  llamar<Membresia>(
    `/v1/companies/${companyId}/members/${driverId}/approve`,
    { method: "POST" },
  );

export const rechazarSolicitud = (companyId: string, driverId: string) =>
  llamar<Membresia>(`/v1/companies/${companyId}/applications/${driverId}`, {
    method: "DELETE",
  });

/**
 * Salir por decisión propia. La membresía queda como `left`, no como
 * `kicked`. El único propietario no puede irse sin nombrar antes a otro:
 * la API responde 400 y el mensaje se muestra tal cual.
 */
export const salirDeEmpresa = (companyId: string) =>
  llamar<Membresia>(`/v1/companies/${companyId}/membership`, {
    method: "DELETE",
  });

/** Las tres imágenes de la ficha, con la proporción que espera la API. */
export const IMAGENES = {
  card: { etiqueta: "Imagen de tarjeta", proporcion: "16 / 9", medida: "1280×720" },
  banner: { etiqueta: "Banner", proporcion: "3 / 1", medida: "1500×500" },
  logo: { etiqueta: "Logo", proporcion: "1 / 1", medida: "512×512" },
} as const;

export type TipoImagen = keyof typeof IMAGENES;

/** Lo que acepta la API. Se comprueba aquí para no gastar una subida. */
export const TIPOS_ACEPTADOS = ["image/jpeg", "image/png", "image/webp"];
export const TAMANO_MAXIMO = 5 * 1024 * 1024;

/**
 * Sube la imagen y devuelve la empresa ya actualizada: la API responde con
 * la ficha entera, así que no hace falta recargarla aparte.
 *
 * Ojo, la imagen que vuelve no es la que se mandó: la API la re-codifica a
 * WebP y al tamaño exacto de su sitio. Por eso la previsualización se
 * cambia por la URL de la respuesta en cuanto llega.
 */
export const subirImagenEmpresa = (
  companyId: string,
  tipo: TipoImagen,
  fichero: File,
  onProgreso?: (porcentaje: number) => void,
) =>
  subirFichero<CompanyDetail>(
    `/v1/companies/${companyId}/images/${tipo}`,
    fichero,
    onProgreso,
  );

/** Deja la columna vacía y borra el fichero: vuelve la imagen por defecto. */
export const borrarImagenEmpresa = (companyId: string, tipo: TipoImagen) =>
  llamar<CompanyDetail>(`/v1/companies/${companyId}/images/${tipo}`, {
    method: "DELETE",
  });
