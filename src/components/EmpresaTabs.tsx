"use client";

import { useMemo, useState } from "react";
import { CompanyMember, LeaderboardRow } from "@/lib/api";
import { km, rolLabel, rolStyle } from "@/lib/estilos";
import { Avatar } from "./Avatar";
import { SearchIcon, UsersIcon } from "./icons";

const PANEL = "rounded-[10px] border border-white/[0.06] bg-white/[0.02]";

const PAGE_SIZES = [12, 24, 60];

const normalizar = (texto: string) =>
  texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

type Tab = "acerca" | "miembros";

export function EmpresaTabs({
  nombre,
  descripcion,
  estado,
  fundada,
  conductores,
  cupo,
  trabajos,
  miembros,
  ranking,
}: {
  nombre: string;
  descripcion: string | null;
  estado: string;
  fundada: string;
  conductores: number;
  cupo: number;
  trabajos: number;
  miembros: CompanyMember[];
  ranking: LeaderboardRow[];
}) {
  const [tab, setTab] = useState<Tab>("miembros");
  const [query, setQuery] = useState("");
  const [porPagina, setPorPagina] = useState(PAGE_SIZES[2]);

  const encontrados = useMemo(() => {
    const termino = normalizar(query.trim());
    if (!termino) return miembros;
    return miembros.filter(
      (miembro) =>
        normalizar(miembro.displayName).includes(termino) ||
        normalizar(rolLabel(miembro.role)).includes(termino),
    );
  }, [query, miembros]);

  const visibles = encontrados.slice(0, porPagina);

  return (
    <div className={PANEL}>
      <div className="flex items-center gap-1 px-2 sm:px-3 border-b border-white/[0.06]">
        <TabButton
          activo={tab === "acerca"}
          onClick={() => setTab("acerca")}
          label="Acerca de"
        />
        <TabButton
          activo={tab === "miembros"}
          onClick={() => setTab("miembros")}
          label="Miembros"
          icon={<UsersIcon className="w-3.5 h-3.5" />}
          badge={miembros.length}
        />
      </div>

      {tab === "acerca" ? (
        <div className="p-5 sm:p-6 flex flex-col gap-5">
          <p className="text-[13px] leading-relaxed text-white/50 max-w-2xl">
            {descripcion ?? `${nombre} es una empresa registrada en AndesMP.`}
          </p>
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Dato termino="Estado" valor={estado} />
            <Dato termino="Fundada" valor={fundada} />
            <Dato termino="Conductores" valor={`${conductores} / ${cupo}`} />
            <Dato termino="Trabajos" valor={String(trabajos)} />
          </dl>

          {ranking.length > 0 && (
            <div>
              <h3 className="text-[12px] font-bold text-white/70">
                Ranking de kilómetros
              </h3>
              <ol className="mt-3 flex flex-col gap-2">
                {ranking.map((fila, indice) => (
                  <li
                    key={fila.driverId}
                    className="flex items-center gap-3 rounded-[10px] border border-white/[0.06] bg-white/[0.02] px-4 py-2.5"
                  >
                    <span className="w-5 shrink-0 text-[11px] font-bold text-white/25 tabular-nums">
                      {indice + 1}
                    </span>
                    <Avatar nombre={fila.displayName} size={28} />
                    <span className="min-w-0 flex-1 text-[12px] font-semibold text-white/80 truncate">
                      {fila.displayName}
                    </span>
                    <span className="text-[11px] text-white/30 shrink-0 tabular-nums">
                      {fila.jobsCount} trabajos
                    </span>
                    <span className="text-[12px] font-bold text-blue-400 shrink-0 tabular-nums">
                      {km(fila.distanceKm)}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      ) : (
        <div className="p-5 sm:p-6 flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2.5 flex-1 min-w-0 rounded-[10px] border border-white/[0.06] bg-black/20 px-3.5 py-2.5 focus-within:border-white/15 transition-colors">
              <SearchIcon className="w-4 h-4 text-white/30 shrink-0" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar por nombre de jugador"
                aria-label="Buscar miembro por nombre"
                className="flex-1 min-w-0 bg-transparent text-[13px] text-white placeholder:text-white/25 outline-none [&::-webkit-search-cancel-button]:hidden"
              />
            </div>
            <span
              className="text-[11px] text-white/30 shrink-0"
              role="status"
              aria-live="polite"
            >
              {encontrados.length === 1
                ? "1 miembro"
                : `${encontrados.length} miembros`}
            </span>
            <label className="flex items-center gap-2 text-[11px] text-white/30 shrink-0">
              <span className="sr-only">Miembros por página</span>
              <select
                value={porPagina}
                onChange={(event) => setPorPagina(Number(event.target.value))}
                className="rounded-[8px] border border-white/[0.06] bg-black/20 px-2.5 py-1.5 text-[11px] text-white/60 outline-none focus:border-white/15 cursor-pointer"
              >
                {PAGE_SIZES.map((tamano) => (
                  <option key={tamano} value={tamano} className="bg-[#141414]">
                    {tamano} por página
                  </option>
                ))}
              </select>
            </label>
          </div>

          {visibles.length > 0 ? (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
              {visibles.map((miembro) => (
                <li
                  key={miembro.driverId}
                  className="flex items-center gap-3 rounded-[10px] border border-white/[0.06] bg-white/[0.02] px-4 py-3 hover:bg-white/[0.05] transition-colors"
                >
                  <Avatar nombre={miembro.displayName} />
                  <span className="min-w-0">
                    <span className="block text-[12px] font-semibold text-white/80 truncate">
                      {miembro.displayName}
                    </span>
                    <span
                      className={`block text-[10px] font-semibold ${rolStyle(
                        miembro.role,
                      )}`}
                    >
                      {rolLabel(miembro.role)}
                    </span>
                  </span>
                  <span className="ml-auto text-[10px] text-white/25 shrink-0 tabular-nums">
                    {km(miembro.totalDistanceKm)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-[12px] text-white/25 py-6">
              {miembros.length === 0
                ? "Esta empresa todavía no tiene miembros registrados."
                : "Ningún miembro coincide con la búsqueda."}
            </p>
          )}

          {encontrados.length > visibles.length && (
            <p className="text-center text-[11px] text-white/25">
              Mostrando {visibles.length} de {encontrados.length} miembros.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function TabButton({
  activo,
  onClick,
  label,
  icon,
  badge,
}: {
  activo: boolean;
  onClick: () => void;
  label: string;
  icon?: React.ReactNode;
  badge?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activo}
      className={`flex items-center gap-1.5 px-3 py-3 text-[12px] font-semibold border-b-2 -mb-px transition-colors cursor-pointer ${
        activo
          ? "border-rose-500 text-white"
          : "border-transparent text-white/30 hover:text-white/60"
      }`}
    >
      {icon}
      {label}
      {badge !== undefined && (
        <span className="ml-0.5 rounded-full bg-rose-500/90 px-1.5 py-0.5 text-[10px] font-bold text-white">
          {badge}
        </span>
      )}
    </button>
  );
}

function Dato({ termino, valor }: { termino: string; valor: string }) {
  return (
    <div className="rounded-[10px] border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
      <dt className="text-[10px] uppercase tracking-wide text-white/25">
        {termino}
      </dt>
      <dd className="mt-1 text-[13px] font-bold text-white/80">{valor}</dd>
    </div>
  );
}
