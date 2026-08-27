"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { salirDeEmpresa, solicitarIngreso } from "@/lib/acciones";
import { entrar, useSesion } from "@/lib/sesion";
import { SteamIcon } from "./icons";

const BOTON =
  "w-full rounded-[10px] px-4 py-2.5 text-[12px] font-bold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed";

/**
 * Unirse y salir de la empresa. Los dos endpoints aceptan la cookie de la
 * web, así que ya no hay que mandar al conductor al hub para esto.
 */
export function AccionesEmpresa({
  companyId,
  nombre,
  slug,
  lleno,
}: {
  companyId: string;
  nombre: string;
  slug: string;
  /** Con la flota al completo no se deja ni intentarlo. */
  lleno: boolean;
}) {
  const estado = useSesion();
  const router = useRouter();
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enviada, setEnviada] = useState(false);
  const [confirmandoSalida, setConfirmandoSalida] = useState(false);

  if (estado.estado === "cargando") {
    return <div className="h-[42px] w-full rounded-[10px] bg-white/[0.04] animate-pulse" />;
  }

  if (estado.estado === "invitado") {
    return (
      <button
        type="button"
        onClick={() => entrar(`/empresa/${slug}`)}
        className={`${BOTON} flex items-center justify-center gap-2 bg-white text-[#1e1e1e] hover:bg-white/90`}
      >
        <SteamIcon className="w-[16px] h-[16px]" />
        Entrar para unirte
      </button>
    );
  }

  const sesion = estado.sesion;
  const esDeAqui = sesion.companyId === companyId;
  const enOtra = sesion.companyId !== null && !esDeAqui;

  async function ejecutar(tarea: () => Promise<unknown>, alTerminar: () => void) {
    setOcupado(true);
    setError(null);
    try {
      await tarea();
      alTerminar();
      // La cabecera y el listado de miembros los pinta el servidor.
      router.refresh();
    } catch (fallo) {
      setError((fallo as Error).message);
    } finally {
      setOcupado(false);
    }
  }

  if (enviada) {
    return (
      <p className="rounded-[10px] border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-[11px] leading-relaxed text-emerald-200/80">
        Solicitud enviada. Queda pendiente hasta que un gestor de {nombre} la
        apruebe.
      </p>
    );
  }

  if (esDeAqui) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-[11px] text-white/35">
          Ya perteneces a {nombre}.
        </p>
        {confirmandoSalida ? (
          <div className="rounded-[10px] border border-white/[0.08] bg-black/20 p-3.5">
            <p className="text-[11px] leading-relaxed text-white/50">
              Al salir dejas de aparecer en la flota. Los trabajos que ya
              hiciste siguen contando para {nombre}.
            </p>
            <div className="mt-2.5 flex gap-2">
              <button
                type="button"
                disabled={ocupado}
                onClick={() =>
                  ejecutar(() => salirDeEmpresa(companyId), () =>
                    setConfirmandoSalida(false),
                  )
                }
                className="rounded-[8px] bg-rose-600 hover:bg-rose-500 px-3 py-1.5 text-[11px] font-bold text-white transition-colors cursor-pointer disabled:opacity-40"
              >
                {ocupado ? "Saliendo…" : "Sí, salir"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmandoSalida(false)}
                className="rounded-[8px] px-3 py-1.5 text-[11px] font-semibold text-white/40 hover:text-white transition-colors cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmandoSalida(true)}
            className={`${BOTON} border border-white/[0.08] bg-white/[0.03] text-white/60 hover:text-white hover:bg-white/[0.08]`}
          >
            Salir de la empresa
          </button>
        )}
        {error && <Aviso texto={error} />}
      </div>
    );
  }

  if (enOtra) {
    return (
      <p className="rounded-[10px] border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-[11px] leading-relaxed text-white/40">
        Ya estás en otra empresa. Un conductor sólo puede estar activo en una
        a la vez: sal de la tuya antes de pedir entrar aquí.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        disabled={ocupado || lleno}
        onClick={() =>
          ejecutar(() => solicitarIngreso(companyId), () => setEnviada(true))
        }
        className={`${BOTON} bg-rose-600 hover:bg-rose-500 text-white`}
      >
        {lleno
          ? "Flota completa"
          : ocupado
            ? "Enviando…"
            : "Unirse a la empresa"}
      </button>
      {error && <Aviso texto={error} />}
    </div>
  );
}

function Aviso({ texto }: { texto: string }) {
  return (
    <p className="rounded-[10px] border border-rose-500/25 bg-rose-500/10 px-3 py-2 text-[11px] text-rose-200/80">
      {texto}
    </p>
  );
}
