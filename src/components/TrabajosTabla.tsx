import Link from "next/link";
import { Job } from "@/lib/api";
import { fechaHora, km } from "@/lib/estilos";

const ESTADO_TRABAJO: Record<string, string> = {
  delivered: "Entregado",
  cancelled: "Cancelado",
  in_progress: "En curso",
  abandoned: "Abandonado",
};

const VALIDACION: Record<string, { label: string; clase: string }> = {
  valid: { label: "Válido", clase: "text-emerald-400/80" },
  review: { label: "En revisión", clase: "text-amber-400/80" },
  invalid: { label: "Inválido", clase: "text-rose-400/80" },
  pending: { label: "Pendiente", clase: "text-white/35" },
};

/** Tabla de trabajos, compartida por la ficha de empresa y la de conductor. */
export function TrabajosTabla({
  trabajos,
  conConductor = false,
}: {
  trabajos: Job[];
  conConductor?: boolean;
}) {
  if (trabajos.length === 0) {
    return (
      <p className="text-center text-[12px] text-white/25 py-6">
        Todavía no hay trabajos registrados.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[820px] text-[12px]">
        <thead>
          <tr className="border-b border-white/[0.06] text-left text-[10px] uppercase tracking-wide text-white/25">
            <th className="px-3 py-2.5 font-semibold">Ruta</th>
            <th className="px-3 py-2.5 font-semibold">Carga</th>
            {conConductor && (
              <th className="px-3 py-2.5 font-semibold">Conductor</th>
            )}
            <th className="px-3 py-2.5 font-semibold">Distancia</th>
            <th className="px-3 py-2.5 font-semibold">Estado</th>
            <th className="px-3 py-2.5 font-semibold">Validación</th>
            <th className="px-3 py-2.5 font-semibold text-right">Fecha</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.06]">
          {trabajos.map((trabajo) => {
            const validacion =
              VALIDACION[trabajo.validationStatus] ?? {
                label: trabajo.validationStatus,
                clase: "text-white/35",
              };
            return (
              <tr key={trabajo.id} className="hover:bg-white/[0.02]">
                <td className="px-3 py-2.5 font-semibold text-white/80">
                  {trabajo.sourceCity ?? "—"}
                  <span className="mx-1.5 text-white/25">→</span>
                  {trabajo.destCity ?? "—"}
                </td>
                <td className="px-3 py-2.5 text-white/45 truncate max-w-[220px]">
                  {trabajo.cargo ?? "—"}
                </td>
                {conConductor && (
                  <td className="px-3 py-2.5">
                    <Link
                      href={`/conductor/${trabajo.driverId}`}
                      className="text-white/50 hover:text-white transition-colors"
                    >
                      Ver conductor
                    </Link>
                  </td>
                )}
                <td className="px-3 py-2.5 tabular-nums text-white/60">
                  {km(trabajo.drivenDistanceKm ?? 0)}
                  {trabajo.plannedDistanceKm ? (
                    <span className="text-white/20">
                      {" "}
                      / {km(trabajo.plannedDistanceKm)}
                    </span>
                  ) : null}
                </td>
                <td className="px-3 py-2.5 text-white/45">
                  {ESTADO_TRABAJO[trabajo.status] ?? trabajo.status}
                </td>
                <td className="px-3 py-2.5">
                  <span className={validacion.clase}>{validacion.label}</span>
                  {trabajo.validationFlags?.length > 0 && (
                    <span
                      className="ml-1.5 text-[10px] text-white/25"
                      title={trabajo.validationFlags.join(", ")}
                    >
                      {trabajo.validationFlags.length} avisos
                    </span>
                  )}
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums text-white/30">
                  {trabajo.finishedAt
                    ? fechaHora(trabajo.finishedAt)
                    : trabajo.startedAt
                      ? fechaHora(trabajo.startedAt)
                      : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
