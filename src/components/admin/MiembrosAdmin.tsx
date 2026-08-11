"use client";

import Link from "next/link";
import { useState } from "react";
import { Avatar } from "@/components/Avatar";
import {
  AdminMember,
  asignarMiembro,
  cambiarRolEnEmpresa,
  ErrorApi,
  listarConductores,
  listarEmpresas,
  listarMiembros,
  sacarMiembro,
  useRecurso,
} from "@/lib/admin";
import { estadoMiembro, fecha, km, rolLabel, rolStyle } from "@/lib/estilos";
import { ESTADO_LABEL } from "@/lib/presentacion";
import {
  AdminShell,
  EstadoCarga,
  PANEL,
  usePuedeAdministrar,
} from "./AdminShell";

const ROLES = ["owner", "manager", "driver"] as const;

export function MiembrosAdmin({ empresaId }: { empresaId: string }) {
  const [aviso, setAviso] = useState<string | null>(null);
  const [trabajando, setTrabajando] = useState<string | null>(null);

  const puede = usePuedeAdministrar();
  const empresas = useRecurso("empresas", () => listarEmpresas(), puede);
  const miembros = useRecurso(
    `miembros:${empresaId}`,
    () => listarMiembros(empresaId),
    puede,
  );

  const empresa = (empresas.datos ?? []).find((e) => e.id === empresaId);
  const lista = miembros.datos ?? [];
  const activos = lista.filter((m) => m.status === "active");
  const pendientes = lista.filter((m) => m.status === "pending");
  const fuera = lista.filter(
    (m) => m.status !== "active" && m.status !== "pending",
  );

  async function ejecutar(clave: string, accion: () => Promise<unknown>) {
    setTrabajando(clave);
    setAviso(null);
    try {
      await accion();
      miembros.recargar();
    } catch (fallo) {
      setAviso((fallo as Error).message);
    } finally {
      setTrabajando(null);
    }
  }

  return (
    <AdminShell titulo={empresa ? `Miembros · ${empresa.name}` : "Miembros"}>
      {empresa && (
        <div className="flex flex-wrap items-center gap-3 text-[12px]">
          <Link
            href="/admin/empresas"
            className="text-white/40 hover:text-white transition-colors"
          >
            ← Todas las empresas
          </Link>
          <span className="text-white/20">·</span>
          <span className="text-white/40">
            {ESTADO_LABEL[empresa.status] ?? empresa.status}
          </span>
          <span className="text-white/20">·</span>
          <span className="text-white/40 tabular-nums">
            {activos.length} / {empresa.maxDrivers} plazas
          </span>
          <Link
            href={`/empresa/${empresa.slug}`}
            className="text-rose-400 hover:text-rose-300 transition-colors"
          >
            Ver ficha pública
          </Link>
        </div>
      )}

      {aviso && (
        <p className="mt-4 rounded-[10px] border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-[12px] text-rose-200/80">
          {aviso}
        </p>
      )}

      <div className="mt-5">
        <Asignar
          empresaId={empresaId}
          onHecho={() => {
            setAviso(null);
            miembros.recargar();
          }}
          onError={setAviso}
        />
      </div>

      <div className="mt-6">
        <EstadoCarga
          cargando={miembros.cargando}
          error={miembros.error}
          vacio={lista.length === 0}
        >
          <Tabla
            titulo="Activos"
            miembros={activos}
            trabajando={trabajando}
            onRol={(driverId, rol) =>
              ejecutar(driverId, () =>
                cambiarRolEnEmpresa(empresaId, driverId, rol),
              )
            }
            onSacar={(driverId) =>
              ejecutar(driverId, () => sacarMiembro(empresaId, driverId))
            }
          />

          {pendientes.length > 0 && (
            <div className="mt-6">
              <Tabla
                titulo="Solicitudes pendientes"
                miembros={pendientes}
                trabajando={trabajando}
                onRol={(driverId, rol) =>
                  ejecutar(driverId, () =>
                    cambiarRolEnEmpresa(empresaId, driverId, rol),
                  )
                }
                onSacar={(driverId) =>
                  ejecutar(driverId, () => sacarMiembro(empresaId, driverId))
                }
              />
            </div>
          )}

          {fuera.length > 0 && (
            <div className="mt-6">
              <Tabla
                titulo="Historial"
                miembros={fuera}
                trabajando={trabajando}
                soloLectura
              />
            </div>
          )}
        </EstadoCarga>
      </div>
    </AdminShell>
  );
}

function Tabla({
  titulo,
  miembros,
  trabajando,
  onRol,
  onSacar,
  soloLectura = false,
}: {
  titulo: string;
  miembros: AdminMember[];
  trabajando: string | null;
  onRol?: (driverId: string, rol: (typeof ROLES)[number]) => void;
  onSacar?: (driverId: string) => void;
  soloLectura?: boolean;
}) {
  if (miembros.length === 0) return null;

  return (
    <div>
      <h2 className="text-[13px] font-bold text-white/80">
        {titulo}{" "}
        <span className="text-white/25 font-semibold">({miembros.length})</span>
      </h2>
      <div className={`${PANEL} mt-3 overflow-x-auto`}>
        <table className="w-full min-w-[760px] text-[12px]">
          <thead>
            <tr className="border-b border-white/[0.06] text-left text-[10px] uppercase tracking-wide text-white/25">
              <th className="px-4 py-3 font-semibold">Conductor</th>
              <th className="px-4 py-3 font-semibold">Estado</th>
              <th className="px-4 py-3 font-semibold">Trabajos</th>
              <th className="px-4 py-3 font-semibold">Distancia</th>
              <th className="px-4 py-3 font-semibold">Desde</th>
              <th className="px-4 py-3 font-semibold text-right">Rol</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {miembros.map((miembro) => (
              <tr key={miembro.driverId} className="hover:bg-white/[0.02]">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar nombre={miembro.displayName} size={28} />
                    <span className="font-semibold text-white/85 truncate">
                      {miembro.displayName}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-white/40">
                  {estadoMiembro(miembro.status)}
                </td>
                <td className="px-4 py-3 tabular-nums text-white/60">
                  {miembro.jobsCount ?? 0}
                </td>
                <td className="px-4 py-3 tabular-nums text-white/60">
                  {km(miembro.totalDistanceKm ?? 0)}
                </td>
                <td className="px-4 py-3 tabular-nums text-white/35">
                  {miembro.joinedAt ? fecha(miembro.joinedAt) : "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    {soloLectura ? (
                      <span className={`text-[11px] ${rolStyle(miembro.role)}`}>
                        {rolLabel(miembro.role)}
                      </span>
                    ) : (
                      <>
                        <select
                          value={miembro.role}
                          disabled={trabajando === miembro.driverId}
                          onChange={(evento) =>
                            onRol?.(
                              miembro.driverId,
                              evento.target.value as (typeof ROLES)[number],
                            )
                          }
                          className="rounded-[8px] border border-white/[0.08] bg-black/20 px-2.5 py-1.5 text-[11px] text-white/60 outline-none focus:border-white/20 cursor-pointer disabled:opacity-40"
                        >
                          {ROLES.map((rol) => (
                            <option key={rol} value={rol} className="bg-[#141414]">
                              {rolLabel(rol)}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => onSacar?.(miembro.driverId)}
                          disabled={trabajando === miembro.driverId}
                          className="rounded-[8px] border border-rose-500/20 bg-rose-500/10 px-3 py-1.5 text-[11px] font-semibold text-rose-300/80 hover:bg-rose-500/20 hover:text-rose-200 transition-colors cursor-pointer disabled:opacity-40"
                        >
                          Sacar
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** Buscador de conductores libres + alta en la empresa. */
function Asignar({
  empresaId,
  onHecho,
  onError,
}: {
  empresaId: string;
  onHecho: () => void;
  onError: (mensaje: string) => void;
}) {
  const [busqueda, setBusqueda] = useState("");
  const [rol, setRol] = useState<(typeof ROLES)[number]>("driver");
  const [trabajando, setTrabajando] = useState<string | null>(null);

  const { datos, cargando } = useRecurso(
    `buscar:${busqueda}`,
    () =>
      busqueda.trim().length < 2
        ? Promise.resolve({ items: [], total: 0 })
        : listarConductores({ q: busqueda, limit: 8 }),
  );

  async function asignar(driverId: string, reemplazar: boolean) {
    setTrabajando(driverId);
    try {
      await asignarMiembro(empresaId, {
        driverId,
        role: rol,
        replaceCurrent: reemplazar,
      });
      setBusqueda("");
      onHecho();
    } catch (fallo) {
      // 409 = ya está en otra empresa; se puede mover confirmando.
      if (fallo instanceof ErrorApi && fallo.estado === 409) {
        const mover = window.confirm(
          `${fallo.message}\n\n¿Moverlo a esta empresa? Sus trabajos anteriores seguirán atribuidos a la empresa con la que se hicieron.`,
        );
        if (mover) return asignar(driverId, true);
      }
      onError((fallo as Error).message);
    } finally {
      setTrabajando(null);
    }
  }

  return (
    <div className={`${PANEL} p-5`}>
      <h2 className="text-[13px] font-bold text-white/80">Asignar conductor</h2>
      <div className="mt-3 flex flex-col sm:flex-row gap-3">
        <input
          value={busqueda}
          onChange={(evento) => setBusqueda(evento.target.value)}
          placeholder="Buscar conductor por nombre o SteamID"
          className="flex-1 min-w-0 rounded-[10px] border border-white/[0.08] bg-black/20 px-3.5 py-2.5 text-[13px] text-white placeholder:text-white/20 outline-none focus:border-white/20 transition-colors"
        />
        <select
          value={rol}
          onChange={(evento) =>
            setRol(evento.target.value as (typeof ROLES)[number])
          }
          className="rounded-[10px] border border-white/[0.08] bg-black/20 px-3 py-2.5 text-[12px] text-white/60 outline-none focus:border-white/20 cursor-pointer"
        >
          {ROLES.map((valor) => (
            <option key={valor} value={valor} className="bg-[#141414]">
              {rolLabel(valor)}
            </option>
          ))}
        </select>
      </div>

      {busqueda.trim().length >= 2 && (
        <ul className="mt-3 flex flex-col gap-2">
          {cargando && (
            <li className="text-[11px] text-white/25">Buscando…</li>
          )}
          {!cargando && (datos?.items ?? []).length === 0 && (
            <li className="text-[11px] text-white/25">
              Ningún conductor coincide.
            </li>
          )}
          {(datos?.items ?? []).map((conductor) => (
            <li
              key={conductor.id}
              className="flex items-center gap-3 rounded-[10px] border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5"
            >
              <Avatar
                nombre={conductor.displayName}
                src={conductor.avatarUrl ?? undefined}
                size={26}
              />
              <span className="min-w-0 flex-1">
                <span className="block text-[12px] font-semibold text-white/80 truncate">
                  {conductor.displayName}
                </span>
                <span className="block text-[10px] text-white/25">
                  {conductor.companyName ?? "Sin empresa"}
                </span>
              </span>
              <button
                type="button"
                onClick={() => asignar(conductor.id, false)}
                disabled={trabajando === conductor.id}
                className="rounded-[8px] bg-rose-600 hover:bg-rose-500 px-3 py-1.5 text-[11px] font-bold text-white transition-colors cursor-pointer disabled:opacity-40"
              >
                Asignar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
