"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { entrar, salir, useSesion } from "@/lib/sesion";
import { ChevronDownIcon, SteamIcon, UsersIcon } from "./icons";
import { SizeSelector } from "./SizeSelector";
import { LOCKED_SIZE } from "./sizes";

const PILL_SHADOW =
  "0 4px 4px rgba(0,0,0,0.3), 0 1px 0 rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.06)";
const PANEL_SHADOW =
  "0 8px 32px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.06)";

/** Mapa id de empresa → slug, para armar el enlace a "Mi empresa". */
export type MapaEmpresas = Record<string, string>;

export function BarraSesion({
  empresas,
  conSelectorDeTamano = false,
}: {
  empresas: MapaEmpresas;
  conSelectorDeTamano?: boolean;
}) {
  const estado = useSesion();
  const ruta = usePathname();

  return (
    <div className="absolute top-3 right-3 sm:top-5 sm:right-5 z-30 flex items-center gap-2.5">
      {conSelectorDeTamano && (
        <div className="hidden sm:block">
          <SizeSelector value={LOCKED_SIZE} anclado={false} />
        </div>
      )}

      {estado.estado === "cargando" && (
        <div
          className="h-[46px] w-[150px] rounded-[10px] bg-white/[0.04] animate-pulse"
          aria-hidden
        />
      )}

      {estado.estado === "invitado" && (
        <button
          type="button"
          onClick={() => entrar(ruta)}
          className="flex items-center gap-2.5 rounded-[10px] bg-white px-5 py-3.5 text-[13px] font-bold text-[#1e1e1e] hover:bg-white/90 transition-colors cursor-pointer"
          style={{
            boxShadow:
              "0 2px 12px rgba(255,255,255,0.15), 0 0 0 1px rgba(255,255,255,0.1)",
          }}
        >
          <SteamIcon className="w-[18px] h-[18px]" />
          Iniciar sesión
        </button>
      )}

      {estado.estado === "dentro" && (
        <MenuUsuario sesion={estado.sesion} empresas={empresas} />
      )}
    </div>
  );
}

function MenuUsuario({
  sesion,
  empresas,
}: {
  sesion: import("@/lib/sesion").Sesion;
  empresas: MapaEmpresas;
}) {
  const [abierto, setAbierto] = useState(false);
  const caja = useRef<HTMLDivElement>(null);

  const slugEmpresa = sesion.companyId ? empresas[sesion.companyId] : undefined;
  const esDueno = sesion.companyRole === "owner";

  useEffect(() => {
    if (!abierto) return;
    const fuera = (evento: MouseEvent) => {
      if (!caja.current?.contains(evento.target as Node)) setAbierto(false);
    };
    const escape = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") setAbierto(false);
    };
    document.addEventListener("mousedown", fuera);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("mousedown", fuera);
      document.removeEventListener("keydown", escape);
    };
  }, [abierto]);

  return (
    <div className="relative" ref={caja}>
      <button
        type="button"
        onClick={() => setAbierto((previo) => !previo)}
        aria-expanded={abierto}
        className="flex items-center gap-2.5 rounded-[10px] backdrop-blur-xl bg-[#0D0D0D]/80 pl-2 pr-3 py-2 cursor-pointer hover:bg-white/[0.06] transition-colors"
        style={{ boxShadow: PILL_SHADOW }}
      >
        <Avatar sesion={sesion} />
        <span className="hidden sm:block max-w-[140px] truncate text-[13px] font-bold text-white">
          {sesion.displayName}
        </span>
        <ChevronDownIcon
          className={`w-3.5 h-3.5 text-white/40 transition-transform ${
            abierto ? "rotate-180" : ""
          }`}
        />
      </button>

      {abierto && (
        <div
          className="absolute top-full right-0 mt-2 min-w-[220px] rounded-[10px] backdrop-blur-xl bg-[#1c1c1c]/95 py-1.5 z-50 overflow-hidden"
          style={{ boxShadow: PANEL_SHADOW, animation: "fadeIn 120ms ease-out both" }}
        >
          <div className="px-4 py-2.5 border-b border-white/[0.06]">
            <p className="text-[12px] font-bold text-white truncate">
              {sesion.displayName}
            </p>
            <p className="text-[10px] text-white/30">
              {etiquetaRol(sesion)}
            </p>
          </div>

          {slugEmpresa && (
            <Opcion
              href={`/empresa/${slugEmpresa}`}
              onClick={() => setAbierto(false)}
            >
              <UsersIcon className="w-3.5 h-3.5" />
              Mi empresa
            </Opcion>
          )}

          {slugEmpresa && esDueno && (
            <Opcion
              href={`/empresa/${slugEmpresa}/editar`}
              onClick={() => setAbierto(false)}
            >
              <UsersIcon className="w-3.5 h-3.5" />
              Editar empresa
            </Opcion>
          )}

          <Opcion href="/perfil" onClick={() => setAbierto(false)}>
            <UsersIcon className="w-3.5 h-3.5" />
            Mi perfil
          </Opcion>

          {(sesion.platformRole === "admin" ||
            sesion.platformRole === "superadmin") && (
            <Link
              href="/admin"
              onClick={() => setAbierto(false)}
              className="flex items-center gap-2 px-4 py-2.5 text-[12px] font-semibold text-rose-300/80 hover:text-rose-200 hover:bg-white/5 transition-colors"
            >
              <UsersIcon className="w-3.5 h-3.5" />
              Panel de administración
            </Link>
          )}

          {!sesion.companyId && (
            <p className="px-4 py-2 text-[11px] text-white/25">
              Todavía no perteneces a ninguna empresa.
            </p>
          )}

          <button
            type="button"
            onClick={salir}
            className="w-full text-left px-4 py-2.5 text-[12px] font-semibold text-white/40 hover:text-rose-300 hover:bg-white/5 transition-colors cursor-pointer border-t border-white/[0.06] mt-1"
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}

function Avatar({ sesion }: { sesion: import("@/lib/sesion").Sesion }) {
  const [falla, setFalla] = useState(false);

  if (!sesion.avatarUrl || falla) {
    return (
      <span className="w-[30px] h-[30px] shrink-0 rounded-full bg-white/10 flex items-center justify-center text-[11px] font-bold text-white/60">
        {sesion.displayName.slice(0, 2).toUpperCase()}
      </span>
    );
  }

  return (
    <Image
      src={sesion.avatarUrl}
      alt=""
      width={30}
      height={30}
      className="w-[30px] h-[30px] shrink-0 rounded-full object-cover"
      onError={() => setFalla(true)}
      unoptimized
    />
  );
}

function Opcion({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2.5 text-[12px] font-semibold text-white/60 hover:text-white hover:bg-white/5 transition-colors"
    >
      {children}
    </Link>
  );
}

function etiquetaRol(sesion: import("@/lib/sesion").Sesion) {
  if (sesion.platformRole === "superadmin") return "Superadmin de la plataforma";
  if (sesion.platformRole === "admin") return "Admin de la plataforma";
  if (sesion.companyRole === "owner") return "Dueño de empresa";
  if (sesion.companyRole === "manager") return "Gerente de empresa";
  return "Conductor";
}
