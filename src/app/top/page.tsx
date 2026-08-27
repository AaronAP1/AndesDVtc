import Link from "next/link";
import { BarraSesion } from "@/components/BarraSesion";
import { FondoPuntos } from "@/components/FondoPuntos";
import { TopVista } from "@/components/TopVista";
import { getCompanies, getTop, sinFallar } from "@/lib/api";
import { km } from "@/lib/estilos";

const PILL_SHADOW =
  "0 4px 4px rgba(0,0,0,0.3), 0 1px 0 rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.06)";
const PANEL = "rounded-[10px] border border-white/[0.06] bg-white/[0.02]";

export const metadata = {
  title: "Top | AndesMP EMPRESAS",
  description:
    "Rankings de AndesMP por kilómetros válidos: conductores y empresas, del mes y de siempre.",
};

export default async function TopPage() {
  const [top, listado] = await Promise.all([
    sinFallar(() => getTop()),
    sinFallar(getCompanies),
  ]);

  const conductores = top?.conductores.total ?? [];
  const mapa = Object.fromEntries(
    (listado ?? []).map((empresa) => [empresa.id, empresa.slug]),
  );

  const kmTotales = conductores.reduce((suma, fila) => suma + fila.distanceKm, 0);
  const trabajos = conductores.reduce((suma, fila) => suma + fila.jobsCount, 0);

  return (
    <div className="relative min-h-screen bg-[#0D0D0D] overflow-x-hidden">
      <FondoPuntos />
      <BarraSesion empresas={mapa} />

      <div className="relative z-10 mx-auto w-full max-w-[1200px] px-4 sm:px-8 pt-4 sm:pt-6 pb-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 backdrop-blur-xl bg-[#0D0D0D]/80 rounded-[10px] px-3 py-2.5 text-[11px] sm:text-[12px] font-bold text-white/70 hover:text-white transition-colors"
          style={{ boxShadow: PILL_SHADOW }}
        >
          ← Empresas
        </Link>

        <h1 className="mt-7 text-[28px] sm:text-[36px] font-bold tracking-[-0.02em] text-white">
          Top
        </h1>
        <p className="mt-2 text-[13px] text-white/40">
          Ordenados por kilómetros de trabajos válidos: los que el validador
          descartó no suman. El ranking de conductores incluye también a quien
          todavía no tiene empresa; el de empresas suma lo de su flota.
        </p>

        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Ficha
            valor={String(conductores.length)}
            etiqueta="Conductores"
            color="text-violet-400"
          />
          <Ficha
            valor={String((listado ?? []).length)}
            etiqueta="Empresas"
            color="text-blue-400"
          />
          <Ficha
            valor={String(trabajos)}
            etiqueta="Trabajos válidos"
            color="text-emerald-400"
          />
          <Ficha
            valor={km(kmTotales)}
            etiqueta="Distancia total"
            color="text-orange-400"
          />
        </div>

        <div className="mt-8">
          {top === null ? (
            <p className="rounded-[10px] border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-[12px] text-rose-200/80">
              No se pudo cargar el ranking. Vuelve a intentarlo en un momento.
            </p>
          ) : (
            <TopVista rankings={top} />
          )}
        </div>
      </div>
    </div>
  );
}

function Ficha({
  valor,
  etiqueta,
  color,
}: {
  valor: string;
  etiqueta: string;
  color: string;
}) {
  return (
    <div className={`${PANEL} px-5 py-5`}>
      <span
        className={`block text-[22px] font-bold tracking-[-0.02em] ${color}`}
      >
        {valor}
      </span>
      <span className="mt-1 block text-[12px] text-white/40">{etiqueta}</span>
    </div>
  );
}
