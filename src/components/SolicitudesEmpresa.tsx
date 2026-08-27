"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  Solicitud,
  aprobarSolicitud,
  listarSolicitudes,
  rechazarSolicitud,
} from "@/lib/acciones";
import { fecha, km } from "@/lib/estilos";
import { useSesion } from "@/lib/sesion";
import { Avatar } from "./Avatar";

const PANEL = "rounded-[10px] border border-white/[0.06] bg-white/[0.02]";

/**
 * Solicitudes pendientes, sólo para el propietario y los gestores de esta
 * empresa. La API comprueba el permiso por su cuenta —antes valía cualquier
 * token—, así que esconderlo aquí es comodidad, no la defensa.
 */
export function SolicitudesEmpresa({
  companyId,
  nombre,
}: {
  companyId: string;
  nombre: string;
}) {
  const estado = useSesion();
  const router = useRouter();
  const [solicitudes, setSolicitudes] = useState<Solicitud[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [enCurso, setEnCurso] = useState<string | null>(null);

  const sesion = estado.estado === "dentro" ? estado.sesion : null;
  const gestiona =
    sesion?.companyId === companyId &&
    (sesion?.companyRole === "owner" || sesion?.companyRole === "manager");

  const cargar = useCallback(() => {
    listarSolicitudes(companyId)
      .then((lista) => {
        setSolicitudes(lista);
        setError(null);
      })
      .catch((fallo: Error) => setError(fallo.message));
  }, [companyId]);

  useEffect(() => {
    if (gestiona) cargar();
  }, [gestiona, cargar]);

  if (!gestiona) return null;

  async function resolver(
    driverId: string,
    accion: (companyId: string, driverId: string) => Promise<unknown>,
  ) {
    setEnCurso(driverId);
    setError(null);
    try {
      await accion(companyId, driverId);
      setSolicitudes((lista) =>
        (lista ?? []).filter((solicitud) => solicitud.driverId !== driverId),
      );
      // La flota y los totales los pinta el servidor.
      router.refresh();
    } catch (fallo) {
      setError((fallo as Error).message);
    } finally {
      setEnCurso(null);
    }
  }

  const lista = solicitudes ?? [];

  return (
    <div className={`${PANEL} mt-5 sm:mt-6 overflow-hidden`}>
      <div className="flex flex-wrap items-center gap-2 px-5 sm:px-6 py-3.5 border-b border-white/[0.06]">
        <h2 className="text-[13px] font-bold text-white/80">
          Solicitudes pendientes
        </h2>
        {lista.length > 0 && (
          <span className="rounded-full bg-rose-500/90 px-1.5 py-0.5 text-[10px] font-bold text-white">
            {lista.length}
          </span>
        )}
        <span className="ml-auto text-[11px] text-white/25">
          Sólo lo ves tú, que gestionas {nombre}.
        </span>
      </div>

      <div className="p-5 sm:p-6">
        {error && (
          <p className="mb-4 rounded-[10px] border border-rose-500/25 bg-rose-500/10 px-3 py-2 text-[11px] text-rose-200/80">
            {error}
          </p>
        )}

        {solicitudes === null && !error ? (
          <div className="h-16 rounded-[10px] bg-white/[0.03] animate-pulse" />
        ) : lista.length === 0 ? (
          <p className="text-center text-[12px] text-white/25 py-4">
            No hay solicitudes pendientes.
          </p>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {lista.map((solicitud) => (
              <li
                key={solicitud.driverId}
                className="flex flex-wrap items-center gap-3 rounded-[10px] border border-white/[0.06] bg-white/[0.02] px-4 py-3"
              >
                <Avatar nombre={solicitud.displayName} size={32} />
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/conductor/${solicitud.driverId}`}
                    className="block text-[12px] font-semibold text-white/85 truncate hover:text-white transition-colors"
                  >
                    {solicitud.displayName}
                  </Link>
                  <span className="block text-[10px] text-white/30">
                    Pidió entrar el {fecha(solicitud.solicitadaEn)} ·{" "}
                    {solicitud.jobsCount}{" "}
                    {solicitud.jobsCount === 1 ? "trabajo" : "trabajos"} ·{" "}
                    {km(solicitud.totalDistanceKm)}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    disabled={enCurso === solicitud.driverId}
                    onClick={() =>
                      resolver(solicitud.driverId, aprobarSolicitud)
                    }
                    className="rounded-[8px] bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-[11px] font-bold text-white transition-colors cursor-pointer disabled:opacity-40"
                  >
                    Aprobar
                  </button>
                  <button
                    type="button"
                    disabled={enCurso === solicitud.driverId}
                    onClick={() =>
                      resolver(solicitud.driverId, rechazarSolicitud)
                    }
                    className="rounded-[8px] border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[11px] font-semibold text-white/60 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer disabled:opacity-40"
                  >
                    Rechazar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
