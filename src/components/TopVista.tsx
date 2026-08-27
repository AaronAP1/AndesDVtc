"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FilaTop, FilaTopEmpresa } from "@/lib/api";
import { km } from "@/lib/estilos";
import { Avatar } from "./Avatar";
import { SearchIcon, TrophyIcon, UsersIcon } from "./icons";

const POR_PAGINA = 15;

type Ambito = "jugadores" | "empresas";
type Periodo = "total" | "mes";

export type Rankings = {
  conductores: { total: FilaTop[]; mes: FilaTop[] };
  empresas: { total: FilaTopEmpresa[]; mes: FilaTopEmpresa[] };
};

const normalizar = (texto: string) =>
  texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

export function TopVista({ rankings }: { rankings: Rankings }) {
  const [ambito, setAmbito] = useState<Ambito>("jugadores");
  const [periodo, setPeriodo] = useState<Periodo>("total");
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(0);

  const conductores = rankings.conductores[periodo];
  const empresas = rankings.empresas[periodo];

  const filtrados = useMemo(() => {
    const termino = normalizar(busqueda.trim());
    if (ambito === "jugadores") {
      if (!termino) return conductores;
      return conductores.filter(
        (fila) =>
          normalizar(fila.displayName).includes(termino) ||
          normalizar(fila.empresaNombre ?? "").includes(termino),
      );
    }
    if (!termino) return empresas;
    return empresas.filter(
      (fila) =>
        normalizar(fila.nombre).includes(termino) ||
        normalizar(fila.tag ?? "").includes(termino),
    );
  }, [ambito, busqueda, conductores, empresas]);

  const ultimaPagina = Math.max(0, Math.ceil(filtrados.length / POR_PAGINA) - 1);
  const actual = Math.min(pagina, ultimaPagina);
  const visibles = filtrados.slice(
    actual * POR_PAGINA,
    actual * POR_PAGINA + POR_PAGINA,
  );

  const cambiar = (cambio: () => void) => {
    cambio();
    setPagina(0);
  };

  return (
    <>
      {/* Los cuatro cuadros: dos ámbitos por dos periodos. */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <Cuadro
          activo={ambito === "jugadores" && periodo === "total"}
          onClick={() =>
            cambiar(() => {
              setAmbito("jugadores");
              setPeriodo("total");
            })
          }
          icono={<UsersIcon className="w-4 h-4" />}
          grupo="Jugadores"
          titulo="Histórico"
          detalle={`${rankings.conductores.total.length} conductores`}
        />
        <Cuadro
          activo={ambito === "jugadores" && periodo === "mes"}
          onClick={() =>
            cambiar(() => {
              setAmbito("jugadores");
              setPeriodo("mes");
            })
          }
          icono={<UsersIcon className="w-4 h-4" />}
          grupo="Jugadores"
          titulo="Este mes"
          detalle={`${rankings.conductores.mes.length} conductores`}
        />
        <Cuadro
          activo={ambito === "empresas" && periodo === "total"}
          onClick={() =>
            cambiar(() => {
              setAmbito("empresas");
              setPeriodo("total");
            })
          }
          icono={<TrophyIcon className="w-4 h-4" />}
          grupo="Empresas"
          titulo="Histórico"
          detalle={`${rankings.empresas.total.length} empresas`}
        />
        <Cuadro
          activo={ambito === "empresas" && periodo === "mes"}
          onClick={() =>
            cambiar(() => {
              setAmbito("empresas");
              setPeriodo("mes");
            })
          }
          icono={<TrophyIcon className="w-4 h-4" />}
          grupo="Empresas"
          titulo="Este mes"
          detalle={`${rankings.empresas.mes.length} empresas`}
        />
      </div>

      <div className="mt-4 flex items-center gap-2.5 rounded-[10px] border border-white/[0.06] bg-black/20 px-3.5 py-2.5 focus-within:border-white/15 transition-colors">
        <SearchIcon className="w-4 h-4 text-white/30 shrink-0" />
        <input
          value={busqueda}
          onChange={(evento) => {
            setBusqueda(evento.target.value);
            setPagina(0);
          }}
          placeholder={
            ambito === "jugadores"
              ? "Buscar conductor o empresa"
              : "Buscar empresa o tag"
          }
          aria-label={
            ambito === "jugadores"
              ? "Buscar conductor o empresa"
              : "Buscar empresa o tag"
          }
          className="flex-1 min-w-0 bg-transparent text-[13px] text-white placeholder:text-white/25 outline-none"
        />
      </div>

      {filtrados.length === 0 ? (
        <p className="mt-6 rounded-[10px] border border-white/[0.06] bg-white/[0.02] px-4 py-10 text-center text-[12px] text-white/25">
          {periodo === "mes"
            ? "Nadie ha registrado kilómetros este mes."
            : "Todavía no hay kilómetros válidos que ordenar."}
        </p>
      ) : (
        <>
          <div className="mt-5 rounded-[10px] border border-white/[0.06] bg-white/[0.02] overflow-x-auto">
            {ambito === "jugadores" ? (
              <TablaConductores
                filas={visibles as FilaTop[]}
                desde={actual * POR_PAGINA}
              />
            ) : (
              <TablaEmpresas
                filas={visibles as FilaTopEmpresa[]}
                desde={actual * POR_PAGINA}
              />
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <span className="text-[11px] text-white/30">
              {filtrados.length}{" "}
              {ambito === "jugadores"
                ? filtrados.length === 1
                  ? "conductor"
                  : "conductores"
                : filtrados.length === 1
                  ? "empresa"
                  : "empresas"}{" "}
              · página {actual + 1} de {ultimaPagina + 1}
            </span>
            <div className="flex gap-2">
              <Paso
                onClick={() => setPagina((valor) => Math.max(0, valor - 1))}
                inactivo={actual === 0}
              >
                Anterior
              </Paso>
              <Paso
                onClick={() =>
                  setPagina((valor) => Math.min(ultimaPagina, valor + 1))
                }
                inactivo={actual >= ultimaPagina}
              >
                Siguiente
              </Paso>
            </div>
          </div>
        </>
      )}
    </>
  );
}

function TablaConductores({
  filas,
  desde,
}: {
  filas: FilaTop[];
  desde: number;
}) {
  return (
    <table className="w-full min-w-[720px] text-[12px]">
      <Encabezado columnas={["Conductor", "Empresa"]} />
      <tbody className="divide-y divide-white/[0.06]">
        {filas.map((fila, indice) => (
          <tr key={fila.driverId} className="hover:bg-white/[0.02]">
            <td className="px-4 py-3">
              <Puesto numero={desde + indice + 1} />
            </td>
            <td className="px-4 py-3">
              <Link
                href={`/conductor/${fila.driverId}`}
                className="flex items-center gap-3 group"
              >
                <Avatar nombre={fila.displayName} size={28} />
                <span className="font-semibold text-white/85 truncate group-hover:text-white transition-colors">
                  {fila.displayName}
                </span>
              </Link>
            </td>
            <td className="px-4 py-3">
              {fila.empresaSlug ? (
                <Link
                  href={`/empresa/${fila.empresaSlug}`}
                  className="text-white/45 hover:text-white transition-colors"
                >
                  {fila.empresaNombre}
                </Link>
              ) : (
                <span className="text-white/20">Sin empresa</span>
              )}
            </td>
            <Cifras
              trabajos={fila.jobsCount}
              distancia={fila.distanceKm}
              ingresos={fila.revenue}
            />
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function TablaEmpresas({
  filas,
  desde,
}: {
  filas: FilaTopEmpresa[];
  desde: number;
}) {
  return (
    <table className="w-full min-w-[720px] text-[12px]">
      <Encabezado columnas={["Empresa", "Conductores"]} />
      <tbody className="divide-y divide-white/[0.06]">
        {filas.map((fila, indice) => (
          <tr key={fila.companyId} className="hover:bg-white/[0.02]">
            <td className="px-4 py-3">
              <Puesto numero={desde + indice + 1} />
            </td>
            <td className="px-4 py-3">
              {fila.slug ? (
                <Link
                  href={`/empresa/${fila.slug}`}
                  className="flex items-center gap-3 group"
                >
                  <Avatar nombre={fila.nombre} size={28} />
                  <span className="min-w-0">
                    <span className="block font-semibold text-white/85 truncate group-hover:text-white transition-colors">
                      {fila.nombre}
                    </span>
                    {fila.tag && (
                      <span className="block text-[10px] text-white/25">
                        {fila.tag}
                      </span>
                    )}
                  </span>
                </Link>
              ) : (
                <span className="text-white/45">{fila.nombre}</span>
              )}
            </td>
            <td className="px-4 py-3 tabular-nums text-white/45">
              {fila.conductores}
            </td>
            <Cifras
              trabajos={fila.jobsCount}
              distancia={fila.distanceKm}
              ingresos={fila.revenue}
            />
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Las tres últimas columnas son iguales en los dos rankings. */
function Cifras({
  trabajos,
  distancia,
  ingresos,
}: {
  trabajos: number;
  distancia: number;
  ingresos: number;
}) {
  return (
    <>
      <td className="px-4 py-3 text-right tabular-nums text-white/60">
        {trabajos}
      </td>
      <td className="px-4 py-3 text-right tabular-nums font-semibold text-blue-400">
        {km(distancia)}
      </td>
      <td className="px-4 py-3 text-right tabular-nums text-white/45">
        {ingresos.toLocaleString("es-PE")}
      </td>
    </>
  );
}

function Encabezado({ columnas }: { columnas: [string, string] }) {
  return (
    <thead>
      <tr className="border-b border-white/[0.06] text-left text-[10px] uppercase tracking-wide text-white/25">
        <th className="px-4 py-3 font-semibold w-12">#</th>
        {columnas.map((columna) => (
          <th key={columna} className="px-4 py-3 font-semibold">
            {columna}
          </th>
        ))}
        <th className="px-4 py-3 font-semibold text-right">Trabajos</th>
        <th className="px-4 py-3 font-semibold text-right">Distancia</th>
        <th className="px-4 py-3 font-semibold text-right">Ingresos</th>
      </tr>
    </thead>
  );
}

/** Uno de los cuatro cuadros que eligen qué ranking se ve. */
function Cuadro({
  activo,
  onClick,
  icono,
  grupo,
  titulo,
  detalle,
}: {
  activo: boolean;
  onClick: () => void;
  icono: React.ReactNode;
  grupo: string;
  titulo: string;
  detalle: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activo}
      className={`rounded-[10px] border px-4 py-3.5 text-left transition-colors cursor-pointer ${
        activo
          ? "border-rose-500/40 bg-rose-500/10"
          : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05]"
      }`}
    >
      <span
        className={`flex items-center gap-1.5 text-[10px] uppercase tracking-wide ${
          activo ? "text-rose-300/80" : "text-white/25"
        }`}
      >
        {icono}
        {grupo}
      </span>
      <span
        className={`mt-1.5 block text-[15px] font-bold ${
          activo ? "text-white" : "text-white/60"
        }`}
      >
        {titulo}
      </span>
      <span className="mt-0.5 block text-[11px] text-white/30">{detalle}</span>
    </button>
  );
}

/** Los tres primeros puestos llevan color; el resto, número a secas. */
function Puesto({ numero }: { numero: number }) {
  const medallas: Record<number, string> = {
    1: "bg-amber-400/20 text-amber-300",
    2: "bg-white/15 text-white/70",
    3: "bg-orange-700/25 text-orange-300",
  };
  const estilo = medallas[numero];

  if (!estilo) {
    return (
      <span className="text-[12px] tabular-nums text-white/25">{numero}</span>
    );
  }
  return (
    <span
      className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-[12px] font-bold tabular-nums ${estilo}`}
    >
      {numero}
    </span>
  );
}

function Paso({
  onClick,
  inactivo,
  children,
}: {
  onClick: () => void;
  inactivo: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={inactivo}
      className="rounded-[8px] border border-white/[0.08] bg-white/[0.03] px-3.5 py-1.5 text-[11px] font-semibold text-white/60 hover:text-white transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
}
