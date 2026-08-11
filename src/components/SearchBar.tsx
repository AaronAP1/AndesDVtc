"use client";

import { EstadoEmpresa } from "@/lib/api";
import { ESTADOS, ESTADO_LABEL } from "@/lib/presentacion";
import { SearchIcon } from "./icons";

const FIELD_SHADOW =
  "0 4px 4px rgba(0,0,0,0.3), 0 1px 0 rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.06)";

export type EstadoFiltro = EstadoEmpresa | "Todas";

const FILTROS: EstadoFiltro[] = ["Todas", ...ESTADOS];

export function SearchBar({
  query,
  onQueryChange,
  estado,
  onEstadoChange,
  resultados,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  estado: EstadoFiltro;
  onEstadoChange: (value: EstadoFiltro) => void;
  resultados: number;
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-4 sm:px-5">
      <div
        className="flex items-center gap-2.5 w-full max-w-md backdrop-blur-xl bg-[#0D0D0D]/80 rounded-[10px] px-3.5 py-2.5 focus-within:bg-white/[0.04] transition-colors"
        style={{ boxShadow: FIELD_SHADOW }}
      >
        <SearchIcon className="w-4 h-4 text-white/30 shrink-0" />
        <input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Buscar empresa por nombre o estado…"
          aria-label="Buscar empresa por nombre o estado"
          className="flex-1 min-w-0 bg-transparent text-[13px] text-white placeholder:text-white/25 outline-none [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <button
            type="button"
            onClick={() => onQueryChange("")}
            aria-label="Limpiar búsqueda"
            className="text-[11px] text-white/30 hover:text-white/70 transition-colors cursor-pointer shrink-0"
          >
            Limpiar
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {FILTROS.map((filtro) => {
          const activo = filtro === estado;
          const etiqueta =
            filtro === "Todas" ? "Todas" : ESTADO_LABEL[filtro] ?? filtro;
          return (
            <button
              key={filtro}
              type="button"
              onClick={() => onEstadoChange(filtro)}
              aria-pressed={activo}
              className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                activo
                  ? "bg-white/10 text-white"
                  : "text-white/30 hover:text-white/60 hover:bg-white/5"
              }`}
            >
              {etiqueta}
            </button>
          );
        })}
      </div>

      <span
        className="text-[11px] text-white/20"
        role="status"
        aria-live="polite"
      >
        {resultados === 1 ? "1 empresa" : `${resultados} empresas`}
      </span>
    </div>
  );
}
