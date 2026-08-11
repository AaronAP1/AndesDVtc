"use client";

import Link from "next/link";
import { useState } from "react";
import { CompanyDetail } from "@/lib/api";
import { entrar, useSesion } from "@/lib/sesion";
import { BarraSesion, MapaEmpresas } from "./BarraSesion";
import { FondoPuntos } from "./FondoPuntos";
import { SteamIcon } from "./icons";

const PANEL = "rounded-[10px] border border-white/[0.06] bg-white/[0.02]";
const PILL_SHADOW =
  "0 4px 4px rgba(0,0,0,0.3), 0 1px 0 rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.06)";

export function EditarEmpresaVista({
  empresa,
  slug,
  empresas,
}: {
  empresa: CompanyDetail;
  slug: string;
  empresas: MapaEmpresas;
}) {
  const estado = useSesion();
  const [datos, setDatos] = useState({
    name: empresa.name,
    tag: empresa.tag,
    description: empresa.description ?? "",
    website: empresa.website ?? "",
    discordUrl: empresa.discordUrl ?? "",
  });

  const esDueno =
    estado.estado === "dentro" &&
    estado.sesion.companyId === empresa.id &&
    estado.sesion.companyRole === "owner";

  return (
    <div className="relative min-h-screen bg-[#0D0D0D] overflow-x-hidden">
      <FondoPuntos />
      <BarraSesion empresas={empresas} />

      <div className="relative z-10 mx-auto w-full max-w-[900px] px-4 sm:px-8 pt-4 sm:pt-6 pb-20">
        <Link
          href={`/empresa/${slug}`}
          className="inline-flex items-center gap-2 backdrop-blur-xl bg-[#0D0D0D]/80 rounded-[10px] px-3 py-2.5 text-[11px] sm:text-[12px] font-bold text-white/70 hover:text-white transition-colors"
          style={{ boxShadow: PILL_SHADOW }}
        >
          ← {empresa.name}
        </Link>

        <h1 className="mt-8 text-[28px] sm:text-[36px] font-bold tracking-[-0.02em] text-white">
          Editar empresa
        </h1>

        {estado.estado === "cargando" && (
          <div className={`${PANEL} mt-6 h-64 animate-pulse`} />
        )}

        {estado.estado === "invitado" && (
          <div className={`${PANEL} mt-6 p-8 text-center`}>
            <p className="text-[13px] text-white/45">
              Inicia sesión para editar los datos de la empresa.
            </p>
            <button
              type="button"
              onClick={() => entrar(`/empresa/${slug}/editar`)}
              className="mt-5 inline-flex items-center gap-2.5 rounded-[10px] bg-white px-5 py-3.5 text-[13px] font-bold text-[#1e1e1e] hover:bg-white/90 transition-colors cursor-pointer"
            >
              <SteamIcon className="w-[18px] h-[18px]" />
              Iniciar sesión
            </button>
          </div>
        )}

        {estado.estado === "dentro" && !esDueno && (
          <div className={`${PANEL} mt-6 p-8 text-center`}>
            <p className="text-[13px] text-white/45">
              Solo el dueño de {empresa.name} puede editar estos datos.
            </p>
            <Link
              href={`/empresa/${slug}`}
              className="mt-5 inline-block text-[12px] font-bold text-rose-400 hover:text-rose-300 transition-colors"
            >
              Volver a la empresa
            </Link>
          </div>
        )}

        {esDueno && (
          <>
            <p className="mt-6 rounded-[10px] border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-[12px] text-amber-200/80">
              La API todavía no expone un endpoint para guardar estos cambios.
              El formulario queda listo y se activa en cuanto exista
              <code className="mx-1 rounded bg-black/30 px-1.5 py-0.5 text-[11px]">
                PATCH /v1/companies/{"{id}"}
              </code>
              .
            </p>

            <form
              className={`${PANEL} mt-4 p-6 flex flex-col gap-5`}
              onSubmit={(evento) => evento.preventDefault()}
            >
              <Campo
                etiqueta="Nombre"
                valor={datos.name}
                onChange={(name) => setDatos({ ...datos, name })}
              />
              <Campo
                etiqueta="Tag"
                valor={datos.tag}
                onChange={(tag) => setDatos({ ...datos, tag })}
              />
              <Campo
                etiqueta="Descripción"
                valor={datos.description}
                onChange={(description) => setDatos({ ...datos, description })}
                multilinea
              />
              <Campo
                etiqueta="Web"
                valor={datos.website}
                onChange={(website) => setDatos({ ...datos, website })}
                marcador="https://"
              />
              <Campo
                etiqueta="Discord"
                valor={datos.discordUrl}
                onChange={(discordUrl) => setDatos({ ...datos, discordUrl })}
                marcador="https://discord.gg/"
              />

              <button
                type="submit"
                disabled
                className="self-start rounded-[10px] bg-rose-600 px-5 py-2.5 text-[12px] font-bold text-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Guardar cambios
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function Campo({
  etiqueta,
  valor,
  onChange,
  multilinea = false,
  marcador,
}: {
  etiqueta: string;
  valor: string;
  onChange: (valor: string) => void;
  multilinea?: boolean;
  marcador?: string;
}) {
  const clases =
    "w-full rounded-[10px] border border-white/[0.08] bg-black/20 px-3.5 py-2.5 text-[13px] text-white placeholder:text-white/20 outline-none focus:border-white/20 transition-colors";

  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-white/30">
        {etiqueta}
      </span>
      {multilinea ? (
        <textarea
          value={valor}
          onChange={(evento) => onChange(evento.target.value)}
          rows={3}
          placeholder={marcador}
          className={`${clases} resize-y`}
        />
      ) : (
        <input
          value={valor}
          onChange={(evento) => onChange(evento.target.value)}
          placeholder={marcador}
          className={clases}
        />
      )}
    </label>
  );
}
