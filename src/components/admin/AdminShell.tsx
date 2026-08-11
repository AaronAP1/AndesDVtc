"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FondoPuntos } from "@/components/FondoPuntos";
import { SteamIcon } from "@/components/icons";
import { entrar, useSesion } from "@/lib/sesion";

const PILL_SHADOW =
  "0 4px 4px rgba(0,0,0,0.3), 0 1px 0 rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.06)";

export const PANEL = "rounded-[10px] border border-white/[0.06] bg-white/[0.02]";

/**
 * Si la sesión puede administrar. Las vistas lo usan para no lanzar consultas
 * al panel mientras no se sabe quién eres o si no tienes permiso.
 */
export function usePuedeAdministrar() {
  const estado = useSesion();
  if (estado.estado !== "dentro") return false;
  const rol = estado.sesion.platformRole;
  return rol === "admin" || rol === "superadmin";
}

const SECCIONES = [
  { href: "/admin", label: "Resumen" },
  { href: "/admin/empresas", label: "Empresas" },
  { href: "/admin/conductores", label: "Conductores" },
  { href: "/admin/auditoria", label: "Auditoría" },
];

export function AdminShell({
  titulo,
  children,
  /** Restringe la vista a superadmin (por ejemplo, conceder rol admin). */
  soloSuperadmin = false,
}: {
  titulo: string;
  children: React.ReactNode;
  soloSuperadmin?: boolean;
}) {
  const estado = useSesion();
  const ruta = usePathname();

  const rol = estado.estado === "dentro" ? estado.sesion.platformRole : null;
  const puedeEntrar = soloSuperadmin
    ? rol === "superadmin"
    : rol === "admin" || rol === "superadmin";

  return (
    <div className="relative min-h-screen bg-[#0D0D0D] overflow-x-hidden">
      <FondoPuntos />

      <div className="relative z-10 mx-auto w-full max-w-[1600px] px-4 sm:px-8 lg:px-12 pt-4 sm:pt-6 pb-20">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 backdrop-blur-xl bg-[#0D0D0D]/80 rounded-[10px] px-3 py-2.5 text-[11px] sm:text-[12px] font-bold text-white/70 hover:text-white transition-colors"
            style={{ boxShadow: PILL_SHADOW }}
          >
            ← Empresas
          </Link>
          <span className="rounded-full bg-rose-600/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
            Administración
          </span>
          {rol && (
            <span className="text-[11px] font-semibold text-white/30">
              {rol === "superadmin" ? "Superadmin" : "Admin"}
            </span>
          )}
        </div>

        <h1 className="mt-7 text-[28px] sm:text-[36px] font-bold tracking-[-0.02em] text-white">
          {titulo}
        </h1>

        {estado.estado !== "cargando" && puedeEntrar && (
          <nav className="mt-5 flex flex-wrap gap-1.5">
            {SECCIONES.map((seccion) => {
              const activo =
                seccion.href === "/admin"
                  ? ruta === "/admin"
                  : ruta.startsWith(seccion.href);
              return (
                <Link
                  key={seccion.href}
                  href={seccion.href}
                  className={`rounded-full px-3.5 py-1.5 text-[11px] font-semibold transition-colors ${
                    activo
                      ? "bg-white/10 text-white"
                      : "text-white/30 hover:text-white/60 hover:bg-white/5"
                  }`}
                >
                  {seccion.label}
                </Link>
              );
            })}
          </nav>
        )}

        <div className="mt-6">
          {estado.estado === "cargando" && (
            <div className={`${PANEL} h-48 animate-pulse`} />
          )}

          {estado.estado === "invitado" && (
            <div className={`${PANEL} p-10 text-center`}>
              <p className="text-[13px] text-white/45">
                Esta zona requiere una sesión con permisos de administración.
              </p>
              <button
                type="button"
                onClick={() => entrar(ruta)}
                className="mt-5 inline-flex items-center gap-2.5 rounded-[10px] bg-white px-5 py-3.5 text-[13px] font-bold text-[#1e1e1e] hover:bg-white/90 transition-colors cursor-pointer"
              >
                <SteamIcon className="w-[18px] h-[18px]" />
                Iniciar sesión
              </button>
            </div>
          )}

          {estado.estado === "dentro" && !puedeEntrar && (
            <div className={`${PANEL} p-10 text-center`}>
              <p className="text-[13px] text-white/45">
                {soloSuperadmin
                  ? "Solo un superadmin puede ver esta sección."
                  : "Tu cuenta no tiene permisos de administración."}
              </p>
              <Link
                href="/"
                className="mt-5 inline-block text-[12px] font-bold text-rose-400 hover:text-rose-300 transition-colors"
              >
                Volver al listado
              </Link>
            </div>
          )}

          {estado.estado === "dentro" && puedeEntrar && children}
        </div>
      </div>
    </div>
  );
}

/** Mensajes de carga y error, iguales en todas las tablas del panel. */
export function EstadoCarga({
  cargando,
  error,
  vacio,
  children,
}: {
  cargando: boolean;
  error: string | null;
  vacio?: boolean;
  children: React.ReactNode;
}) {
  if (cargando) return <div className={`${PANEL} h-56 animate-pulse`} />;
  if (error)
    return (
      <p className="rounded-[10px] border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-[12px] text-rose-200/80">
        {error}
      </p>
    );
  if (vacio)
    return (
      <p className={`${PANEL} px-4 py-10 text-center text-[12px] text-white/25`}>
        No hay nada que mostrar.
      </p>
    );
  return <>{children}</>;
}
