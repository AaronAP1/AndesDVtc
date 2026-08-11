"use client";

import Link from "next/link";
import { useState } from "react";
import { Avatar } from "@/components/Avatar";
import { SearchIcon } from "@/components/icons";
import {
  AdminDriver,
  cambiarRolPlataforma,
  listarConductores,
  useRecurso,
} from "@/lib/admin";
import { fecha, km, rolLabel, rolStyle } from "@/lib/estilos";
import { useSesion } from "@/lib/sesion";
import {
  AdminShell,
  EstadoCarga,
  PANEL,
  usePuedeAdministrar,
} from "./AdminShell";

const POR_PAGINA = 25;

export function ConductoresAdmin() {
  const sesion = useSesion();
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(0);
  const [trabajando, setTrabajando] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const puede = usePuedeAdministrar();
  const { datos, cargando, error, recargar } = useRecurso(
    `conductores:${busqueda}:${pagina}`,
    () =>
      listarConductores({
        q: busqueda || undefined,
        limit: POR_PAGINA,
        offset: pagina * POR_PAGINA,
      }),
    puede,
  );

  const esSuperadmin =
    sesion.estado === "dentro" && sesion.sesion.platformRole === "superadmin";
  const yo = sesion.estado === "dentro" ? sesion.sesion.driverId : null;

  const conductores = datos?.items ?? [];
  const total = datos?.total ?? 0;
  const ultimaPagina = Math.max(0, Math.ceil(total / POR_PAGINA) - 1);

  async function alternarAdmin(conductor: AdminDriver) {
    const nuevoRol = conductor.platformRole === "admin" ? "driver" : "admin";
    setTrabajando(conductor.id);
    setAviso(null);
    try {
      await cambiarRolPlataforma(conductor.id, nuevoRol);
      recargar();
    } catch (fallo) {
      setAviso((fallo as Error).message);
    } finally {
      setTrabajando(null);
    }
  }

  return (
    <AdminShell titulo="Conductores">
      <div className="flex items-center gap-2.5 rounded-[10px] border border-white/[0.06] bg-black/20 px-3.5 py-2.5 focus-within:border-white/15 transition-colors">
        <SearchIcon className="w-4 h-4 text-white/30 shrink-0" />
        <input
          value={busqueda}
          onChange={(evento) => {
            setBusqueda(evento.target.value);
            setPagina(0);
          }}
          placeholder="Buscar por nombre o SteamID"
          className="flex-1 min-w-0 bg-transparent text-[13px] text-white placeholder:text-white/25 outline-none"
        />
      </div>

      {!esSuperadmin && (
        <p className="mt-4 rounded-[10px] border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-[11px] text-white/35">
          Conceder o retirar el rol de administrador está reservado a los
          superadmin. El resto de la ficha es de solo lectura para ti.
        </p>
      )}

      {aviso && (
        <p className="mt-4 rounded-[10px] border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-[12px] text-rose-200/80">
          {aviso}
        </p>
      )}

      <div className="mt-4">
        <EstadoCarga
          cargando={cargando}
          error={error}
          vacio={conductores.length === 0}
        >
          <div className={`${PANEL} overflow-x-auto`}>
            <table className="w-full min-w-[860px] text-[12px]">
              <thead>
                <tr className="border-b border-white/[0.06] text-left text-[10px] uppercase tracking-wide text-white/25">
                  <th className="px-4 py-3 font-semibold">Conductor</th>
                  <th className="px-4 py-3 font-semibold">Empresa</th>
                  <th className="px-4 py-3 font-semibold">Trabajos</th>
                  <th className="px-4 py-3 font-semibold">Distancia</th>
                  <th className="px-4 py-3 font-semibold">Alta</th>
                  <th className="px-4 py-3 font-semibold text-right">
                    Rol de plataforma
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {conductores.map((conductor) => (
                  <tr key={conductor.id} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar
                          nombre={conductor.displayName}
                          src={conductor.avatarUrl ?? undefined}
                          size={28}
                        />
                        <div className="min-w-0">
                          <span className="block font-semibold text-white/85 truncate">
                            {conductor.displayName}
                          </span>
                          {conductor.steamId && (
                            <span className="block text-[10px] text-white/25">
                              {conductor.steamId}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {conductor.companyId ? (
                        <Link
                          href={`/admin/empresas/${conductor.companyId}`}
                          className="text-white/60 hover:text-white transition-colors"
                        >
                          {conductor.companyName ?? "Ver empresa"}
                          {conductor.companyRole && (
                            <span
                              className={`ml-1.5 text-[10px] ${rolStyle(
                                conductor.companyRole,
                              )}`}
                            >
                              {rolLabel(conductor.companyRole)}
                            </span>
                          )}
                        </Link>
                      ) : (
                        <span className="text-white/20">Sin empresa</span>
                      )}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-white/60">
                      {conductor.jobsCount ?? 0}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-white/60">
                      {km(conductor.totalDistanceKm ?? 0)}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-white/35">
                      {conductor.createdAt ? fecha(conductor.createdAt) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2.5">
                        <Insignia rol={conductor.platformRole} />
                        {esSuperadmin &&
                          conductor.platformRole !== "superadmin" &&
                          conductor.id !== yo && (
                            <button
                              type="button"
                              onClick={() => alternarAdmin(conductor)}
                              disabled={trabajando === conductor.id}
                              className="rounded-[8px] border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[11px] font-semibold text-white/60 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer disabled:opacity-40"
                            >
                              {conductor.platformRole === "admin"
                                ? "Quitar admin"
                                : "Hacer admin"}
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="text-[11px] text-white/30">
              {total} conductores · página {pagina + 1} de {ultimaPagina + 1}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPagina((actual) => Math.max(0, actual - 1))}
                disabled={pagina === 0}
                className="rounded-[8px] border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[11px] font-semibold text-white/60 hover:text-white transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button
                type="button"
                onClick={() =>
                  setPagina((actual) => Math.min(ultimaPagina, actual + 1))
                }
                disabled={pagina >= ultimaPagina}
                className="rounded-[8px] border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[11px] font-semibold text-white/60 hover:text-white transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </div>
        </EstadoCarga>
      </div>
    </AdminShell>
  );
}

function Insignia({ rol }: { rol: AdminDriver["platformRole"] }) {
  if (rol === "superadmin")
    return (
      <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-bold text-amber-300">
        Superadmin
      </span>
    );
  if (rol === "admin")
    return (
      <span className="rounded-full bg-rose-500/20 px-2.5 py-0.5 text-[10px] font-bold text-rose-300">
        Admin
      </span>
    );
  return <span className="text-[10px] text-white/25">Conductor</span>;
}
