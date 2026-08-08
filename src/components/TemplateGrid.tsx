"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { EMPRESAS, ESTADO_STYLES, Empresa } from "./empresas";
import { PlusIcon, UsersIcon } from "./icons";
import { EstadoFiltro, SearchBar } from "./SearchBar";
import { SizeId, getSize } from "./sizes";

/** Color de la marca usado en los estados de carga. */
const LOADING_COLOR = "181, 38, 13"; // #b5260d

const SHIMMER = `linear-gradient(110deg, rgba(${LOADING_COLOR},0.18) 0%, rgba(${LOADING_COLOR},0.55) 40%, rgba(${LOADING_COLOR},0.18) 60%)`;

/** Ancho que ocupa una tarjeta en cada breakpoint (1, 2 y 3 columnas). */
const CARD_SIZES = "(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw";

/** Quita tildes y mayusculas para que "torin" encuentre "Torin". */
const normalizar = (texto: string) =>
  texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

export function TemplateGrid({ size }: { size: SizeId }) {
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [estado, setEstado] = useState<EstadoFiltro>("Todas");
  const { paddingBottom } = getSize(size);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 900);
    return () => window.clearTimeout(timer);
  }, []);

  const empresas = useMemo(() => {
    const termino = normalizar(query.trim());
    return EMPRESAS.filter((empresa) => {
      const coincideEstado = estado === "Todas" || empresa.estado === estado;
      const coincideTexto =
        !termino ||
        normalizar(empresa.name).includes(termino) ||
        normalizar(empresa.estado).includes(termino);
      return coincideEstado && coincideTexto;
    });
  }, [query, estado]);

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
        {/* 1 columna en móvil, 2 en tablet, 3 desde escritorio */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {loading ? (
            <SkeletonCard paddingBottom={paddingBottom} />
          ) : (
            empresas.map((empresa, index) => (
              <EmpresaCard
                key={empresa.name}
                empresa={empresa}
                paddingBottom={paddingBottom}
                index={index}
              />
            ))
          )}

          {!loading && (
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
                <button
                  type="button"
                  className="absolute inset-0 flex flex-col items-center justify-center gap-2 cursor-pointer rounded-[10px] border border-dashed border-white/12 bg-white/[0.02] text-white/30 transition-all duration-300 hover:border-white/25 hover:bg-white/[0.04] hover:text-white/60"
                >
                  <PlusIcon className="w-7 h-7" />
                  <span className="text-[11px] font-semibold">
                    Formar empresa
                  </span>
                </button>
              </div>

              <div className="flex items-center justify-between gap-2 mt-2.5 px-0.5">
                <span className="text-[11px] font-semibold text-white/45 truncate">
                  Formar empresa
                </span>
                <span className="text-[10px] text-white/20 shrink-0">
                  Nuevo
                </span>
              </div>
            </div>
          )}
        </div>

        {!loading && empresas.length === 0 && (
          <p className="text-center text-[12px] text-white/25 mt-6">
            Ninguna empresa coincide con la búsqueda.
          </p>
        )}
      </div>
    </div>
  );
}

function EmpresaCard({
  empresa,
  paddingBottom,
  index,
}: {
  empresa: Empresa;
  paddingBottom: string;
  index: number;
}) {
  const estilo = ESTADO_STYLES[empresa.estado];
  const ocupacion = Math.min(
    100,
    Math.round((empresa.conductores / empresa.cupo) * 100),
  );

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
        >
          <Image
            src={empresa.image}
            alt={empresa.name}
            fill
            sizes={CARD_SIZES}
            className="object-cover"
            priority
          />
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
          {empresa.estado}
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

function SkeletonCard({ paddingBottom }: { paddingBottom: string }) {
  return (
    <div>
      <div
        className="relative w-full rounded-[10px] overflow-hidden"
        style={{ paddingBottom }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: SHIMMER,
            backgroundSize: "200% 100%",
            animation: "shimmer 2s ease-in-out infinite",
          }}
        />
      </div>
      <div className="flex items-center justify-between mt-2.5 px-0.5">
        <div
          className="h-3 rounded-full"
          style={{ width: 72, background: `rgba(${LOADING_COLOR},0.35)` }}
        />
        <div
          className="h-2.5 rounded-full"
          style={{ width: 56, background: `rgba(${LOADING_COLOR},0.22)` }}
        />
      </div>
      <div
        className="mt-2 mx-0.5 h-1.5 rounded-full"
        style={{ background: `rgba(${LOADING_COLOR},0.28)` }}
      />
    </div>
  );
}
