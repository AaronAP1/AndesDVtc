"use client";

import Image from "next/image";
import Link from "next/link";
import { entrar, useSesion } from "@/lib/sesion";
import { BarraSesion, MapaEmpresas } from "./BarraSesion";
import { FondoPuntos } from "./FondoPuntos";
import { SteamIcon } from "./icons";

const PANEL = "rounded-[10px] border border-white/[0.06] bg-white/[0.02]";
const PILL_SHADOW =
  "0 4px 4px rgba(0,0,0,0.3), 0 1px 0 rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.06)";

export function PerfilVista({ empresas }: { empresas: MapaEmpresas }) {
  const estado = useSesion();

  return (
    <div className="relative min-h-screen bg-[#0D0D0D] overflow-x-hidden">
      <FondoPuntos />
      <BarraSesion empresas={empresas} />

      <div className="relative z-10 mx-auto w-full max-w-[900px] px-4 sm:px-8 pt-4 sm:pt-6 pb-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 backdrop-blur-xl bg-[#0D0D0D]/80 rounded-[10px] px-3 py-2.5 text-[11px] sm:text-[12px] font-bold text-white/70 hover:text-white transition-colors"
          style={{ boxShadow: PILL_SHADOW }}
        >
          ← Empresas
        </Link>

        <h1 className="mt-8 text-[28px] sm:text-[36px] font-bold tracking-[-0.02em] text-white">
          Mi perfil
        </h1>

        {estado.estado === "cargando" && (
          <div className={`${PANEL} mt-6 h-40 animate-pulse`} />
        )}

        {estado.estado === "invitado" && (
          <div className={`${PANEL} mt-6 p-8 text-center`}>
            <p className="text-[13px] text-white/45">
              Inicia sesión con Steam para ver tu perfil.
            </p>
            <button
              type="button"
              onClick={() => entrar("/perfil")}
              className="mt-5 inline-flex items-center gap-2.5 rounded-[10px] bg-white px-5 py-3.5 text-[13px] font-bold text-[#1e1e1e] hover:bg-white/90 transition-colors cursor-pointer"
            >
              <SteamIcon className="w-[18px] h-[18px]" />
              Iniciar sesión
            </button>
          </div>
        )}

        {estado.estado === "dentro" && (
          <>
            <div className={`${PANEL} mt-6 p-6 flex items-center gap-5`}>
              {estado.sesion.avatarUrl ? (
                <Image
                  src={estado.sesion.avatarUrl}
                  alt=""
                  width={72}
                  height={72}
                  className="w-[72px] h-[72px] rounded-full object-cover"
                  unoptimized
                />
              ) : (
                <span className="w-[72px] h-[72px] rounded-full bg-white/10 flex items-center justify-center text-[22px] font-bold text-white/60">
                  {estado.sesion.displayName.slice(0, 2).toUpperCase()}
                </span>
              )}
              <div className="min-w-0">
                <p className="text-[20px] font-bold text-white truncate">
                  {estado.sesion.displayName}
                </p>
                {estado.sesion.steamId && (
                  <p className="text-[12px] text-white/30">
                    SteamID {estado.sesion.steamId}
                  </p>
                )}
              </div>
            </div>

            <dl className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Dato
                termino="Rol en la plataforma"
                valor={estado.sesion.platformRole}
              />
              <Dato
                termino="Rol en la empresa"
                valor={estado.sesion.companyRole ?? "Sin empresa"}
              />
              <Dato
                termino="Empresa"
                valor={
                  estado.sesion.companyId
                    ? empresas[estado.sesion.companyId] ?? "Desconocida"
                    : "Ninguna"
                }
                href={
                  estado.sesion.companyId && empresas[estado.sesion.companyId]
                    ? `/empresa/${empresas[estado.sesion.companyId]}`
                    : undefined
                }
              />
            </dl>
          </>
        )}
      </div>
    </div>
  );
}

function Dato({
  termino,
  valor,
  href,
}: {
  termino: string;
  valor: string;
  href?: string;
}) {
  return (
    <div className={`${PANEL} px-4 py-3.5`}>
      <dt className="text-[10px] uppercase tracking-wide text-white/25">
        {termino}
      </dt>
      <dd className="mt-1 text-[13px] font-bold text-white/80 truncate">
        {href ? (
          <Link href={href} className="hover:text-white transition-colors">
            {valor}
          </Link>
        ) : (
          valor
        )}
      </dd>
    </div>
  );
}
