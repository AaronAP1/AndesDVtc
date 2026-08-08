export type Estado = "Activa" | "Reclutando" | "Inactiva";

export type Rol = "Owner" | "Administrador" | "Conductor";

export type Miembro = {
  nombre: string;
  rol: Rol;
  /** Ruta a la foto de perfil; si falta se dibuja un avatar con iniciales. */
  avatar?: string;
};

export type Destacado = {
  titulo: string;
  miembro: string;
  detalle?: string;
};

export type Red = {
  nombre: string;
  url: string;
};

export type Empresa = {
  /** Segmento de la URL: /empresa/<slug> */
  slug: string;
  name: string;
  estado: Estado;
  /** Imagen 16:9 de la tarjeta del listado. */
  image: string;
  /** Banner 3:1 de la página de detalle. Si falta se reutiliza `image`. */
  banner?: string;
  /** Logo cuadrado que se superpone al banner. Opcional. */
  logo?: string;
  descripcion: string;
  fundada: string;
  conductores: number;
  cupo: number;
  stats: {
    kmTotal: string;
    trabajos: string;
    millasReal: string;
    millasRealRank: string;
    kmCarrera: string;
    kmCarreraRank: string;
  };
  destacados: Destacado[];
  miembros: Miembro[];
  redes: Red[];
};

export const EMPRESAS: Empresa[] = [
  {
    slug: "turintours",
    name: "Torin Tours",
    estado: "Activa",
    image: "/empresas/TorinTours.jpg",
    descripcion:
      "Empresa de transporte de pasajeros dentro de AndesMP. Convoyes semanales, rutas por toda la sierra y ambiente tranquilo para conductores nuevos y veteranos.",
    fundada: "2025",
    conductores: 5,
    cupo: 15,
    stats: {
      kmTotal: "3.895 km",
      trabajos: "10",
      millasReal: "0 km",
      millasRealRank: "#3097",
      kmCarrera: "3.895 km",
      kmCarreraRank: "#1221",
    },
    destacados: [
      { titulo: "La mayoría de los trabajos cuentan", miembro: "[ЛЛЖЋ] Lvis" },
      { titulo: "Mayor daño recibido", miembro: "[ЛЛЖЋ] Lvis" },
      {
        titulo: "Mayor distancia recorrida",
        miembro: "[ЛЛЖЋ] Lvis",
        detalle: "2.833 km",
      },
    ],
    miembros: [
      { nombre: "ADMIN [PSV]", rol: "Owner" },
      { nombre: "Fuchs 2.0", rol: "Administrador" },
      { nombre: "[JDT] Tulokotron", rol: "Conductor" },
      { nombre: "[JDT] Nexuszzz_666", rol: "Conductor" },
      { nombre: "[JDT] TOTO", rol: "Conductor" },
      { nombre: "[JDT] E R V I S", rol: "Conductor" },
      { nombre: "[JDT] LUIS", rol: "Conductor" },
      { nombre: "[JDT] Jh3MsS", rol: "Conductor" },
      { nombre: "[JDT] PEDRO", rol: "Conductor" },
      { nombre: "[JDT] JEzze", rol: "Conductor" },
      { nombre: "[JDT] AMD Ryzen 5 8500G w", rol: "Conductor" },
      { nombre: "[JDT] dotaps663", rol: "Conductor" },
    ],
    redes: [
      { nombre: "Discord", url: "#" },
      { nombre: "TruckersMP", url: "#" },
      { nombre: "YouTube", url: "#" },
    ],
  },
];

export const getEmpresa = (slug: string) =>
  EMPRESAS.find((empresa) => empresa.slug === slug);

/** Color del punto y del texto de cada estado. */
export const ESTADO_STYLES: Record<Estado, { dot: string; text: string }> = {
  Activa: { dot: "bg-emerald-400", text: "text-emerald-400/70" },
  Reclutando: { dot: "bg-blue-400", text: "text-blue-400/70" },
  Inactiva: { dot: "bg-white/25", text: "text-white/25" },
};

export const ROL_STYLES: Record<Rol, string> = {
  Owner: "text-amber-400/80",
  Administrador: "text-rose-400/80",
  Conductor: "text-blue-400/70",
};

export const ESTADOS: Estado[] = ["Activa", "Reclutando", "Inactiva"];
