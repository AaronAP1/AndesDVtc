"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { EstadoEmpresa } from "@/lib/api";
import { ESTADO_LABEL, ESTADO_STYLES, esExterna } from "@/lib/presentacion";
import { PlusIcon, UsersIcon } from "./icons";
import { EstadoFiltro, SearchBar } from "./SearchBar";
import { SizeId, getSize } from "./sizes";

/** Ancho que ocupa una tarjeta en cada breakpoint (1, 2 y 3 columnas). */
const CARD_SIZES = "(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw";

/** Relleno para las empresas que aún no subieron su imagen de tarjeta. */
const SIN_IMAGEN =
  "linear-gradient(135deg, #1f2937 0%, #111827 55%, #0b1220 100%)";

export type EmpresaCard = {
  slug: string;
  name: string;
  estado: EstadoEmpresa;
  image?: string;
  conductores: number;
  cupo: number;
};

const normalizar = (texto: string) =>
  texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

export function TemplateGrid({
  size,
  empresas: todas,
  error = false,
}: {
  size: SizeId;
  empresas: EmpresaCard[];
  error?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [estado, setEstado] = useState<EstadoFiltro>("Todas");
  const { paddingBottom } = getSize(size);

  const empresas = useMemo(() => {
    const termino = normalizar(query.trim());
    return todas.filter((empresa) => {
      const coincideEstado = estado === "Todas" || empresa.estado === estado;
      const coincideTexto =
        !termino ||
        normalizar(empresa.name).includes(termino) ||
        normalizar(ESTADO_LABEL[empresa.estado] ?? "").includes(termino);
      return coincideEstado && coincideTexto;
    });
  }, [query, estado, todas]);

  return (
    <div className="flex flex-col gap-6 sm:gap-7">
      <SearchBar
        query={query}
        onQueryChange={setQuery}
        estado={estado}
        onEstadoChange={setEstado}
        resultados={empresas.length}
      />

      <div className="px-4 pb-4 sm:px-5 sm:pb-5">
        {error && (
          <p className="text-center text-[12px] text-rose-400/70 mb-5">
            No se pudo conectar con la API. Vuelve a intentarlo en un momento.
          </p>
        )}

        {/* 1 columna en móvil, 2 en tablet, 3 desde escritorio */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {empresas.map((empresa, index) => (
            <EmpresaTarjeta
              key={empresa.slug}
              empresa={empresa}
              paddingBottom={paddingBottom}
              index={index}
            />
          ))}

          <div
            style={{
              animation: `riseIn 500ms ease-out ${
                400 + empresas.length * 45
              }ms both`,
            }}
          >
            <div
              className="relative w-full rounded-[10px] overflow-hidden"
              style={{ paddingBottom }}
            >
              {/* Aviso, no botón: las empresas no se abren solas desde la
                  web. El formulario sigue en CrearEmpresa.tsx por si se
                  vuelve a habilitar. */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-5 text-center rounded-[10px] border border-dashed border-white/12 bg-white/[0.02] text-white/30">
                <PlusIcon className="w-7 h-7" />
                <span className="text-[11px] font-semibold">
                  Formar empresa
                </span>
                <span className="text-[10px] leading-relaxed text-white/25 text-balance">
                  Habla con soporte por WhatsApp o Discord.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 mt-2.5 px-0.5">
              <span className="text-[11px] font-semibold text-white/45 truncate">
                Formar empresa
              </span>
              <span className="text-[10px] text-white/20 shrink-0">Soporte</span>
            </div>
          </div>
        </div>

        {!error && empresas.length === 0 && (
          <p className="text-center text-[12px] text-white/25 mt-6">
            {todas.length === 0
              ? "Todavía no hay empresas registradas."
              : "Ninguna empresa coincide con la búsqueda."}
          </p>
        )}
      </div>
    </div>
  );
}

function EmpresaTarjeta({
  empresa,
  paddingBottom,
  index,
}: {
  empresa: EmpresaCard;
  paddingBottom: string;
  index: number;
}) {
  const estilo = ESTADO_STYLES[empresa.estado] ?? {
    dot: "bg-white/25",
    text: "text-white/25",
  };
  const ocupacion = empresa.cupo
    ? Math.min(100, Math.round((empresa.conductores / empresa.cupo) * 100))
    : 0;

  return (
    <div style={{ animation: `riseIn 500ms ease-out ${400 + index * 45}ms both` }}>
      <div
        className="relative w-full rounded-[10px] overflow-hidden"
        style={{ paddingBottom }}
      >
        <Link
          href={`/empresa/${empresa.slug}`}
          aria-label={`Ver ${empresa.name}`}
          className="absolute inset-0 block cursor-pointer transition-transform duration-300 hover:scale-[1.015]"
          style={empresa.image ? undefined : { background: SIN_IMAGEN }}
        >
          {empresa.image ? (
            <Image
              src={empresa.image}
              alt={empresa.name}
              fill
              sizes={CARD_SIZES}
              className="object-cover"
              unoptimized={esExterna(empresa.image)}
            />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center text-[13px] font-bold text-white/25">
              {empresa.name}
            </span>
          )}
          <span
            className="absolute inset-0 rounded-[10px]"
            style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)" }}
          />
        </Link>
      </div>

      <div className="flex items-center justify-between gap-2 mt-2.5 px-0.5">
        <span className="text-[11px] font-semibold text-white/45 truncate">
          {empresa.name}
        </span>
        <span
          className={`flex items-center gap-1.5 text-[10px] shrink-0 ${estilo.text}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${estilo.dot}`} />
          {ESTADO_LABEL[empresa.estado] ?? empresa.estado}
        </span>
      </div>

      {/* Ocupación de la flota */}
      <div className="mt-2 px-0.5">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-white/40">
            <UsersIcon className="w-3.5 h-3.5 text-blue-400/70" />
            Conductores en Flota
          </span>
          <span className="text-[11px] font-semibold text-blue-400 shrink-0 tabular-nums">
            {empresa.conductores} / {empresa.cupo}
          </span>
        </div>
        <div
          className="mt-1.5 h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden"
          role="progressbar"
          aria-label={`Conductores en flota de ${empresa.name}`}
          aria-valuenow={empresa.conductores}
          aria-valuemin={0}
          aria-valuemax={empresa.cupo}
        >
          <div
            className="h-full rounded-full bg-blue-500 transition-[width] duration-500"
            style={{ width: `${ocupacion}%` }}
          />
        </div>
      </div>
    </div>
  );
}
