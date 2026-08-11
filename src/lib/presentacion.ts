import { EstadoEmpresa } from "./api";

/**
 * Imágenes locales mientras la API tenga las URLs vacías. En cuanto se
 * rellenen `cardImageUrl`, `bannerUrl` y `logoUrl` desde el panel de admin,
 * estas dejan de usarse: la API manda.
 */
export const IMAGENES_LOCALES: Record<
  string,
  { card?: string; banner?: string; logo?: string }
> = {
  "turin-tours": {
    card: "/empresas/TurinTours-card.jpg",
    banner: "/empresas/Turintours-banner.jpg",
    logo: "/empresas/Turintours-logo.jpg",
  },
  cautivo: {
    card: "/empresas/cautivo-card.png",
    banner: "/empresas/cautivo-banner.png",
    logo: "/empresas/cautivo-logo.jpeg",
  },
};

type Imagen = "card" | "banner" | "logo";

/** URL de la API si existe; si no, la imagen local; si no, nada. */
export function imagenDe(
  slug: string,
  tipo: Imagen,
  urlDeLaApi: string | null | undefined,
): string | undefined {
  if (urlDeLaApi) return urlDeLaApi;
  return IMAGENES_LOCALES[slug]?.[tipo];
}

/** Las URLs externas no pasan por el optimizador (evita configurar dominios). */
export const esExterna = (url: string) => /^https?:\/\//.test(url);

export const ESTADO_LABEL: Record<EstadoEmpresa, string> = {
  active: "Activa",
  recruiting: "Reclutando",
  inactive: "Inactiva",
};

export const ESTADO_STYLES: Record<
  EstadoEmpresa,
  { dot: string; text: string }
> = {
  active: { dot: "bg-emerald-400", text: "text-emerald-400/70" },
  recruiting: { dot: "bg-blue-400", text: "text-blue-400/70" },
  inactive: { dot: "bg-white/25", text: "text-white/25" },
};

export const ESTADOS: EstadoEmpresa[] = ["active", "recruiting", "inactive"];
