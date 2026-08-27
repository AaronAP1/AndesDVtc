import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BarraSesion } from "@/components/BarraSesion";
import { FondoPuntos } from "@/components/FondoPuntos";
import { TrabajosTabla } from "@/components/TrabajosTabla";
import {
  getCompanies,
  sinFallar,
  getCompany,
  getDriver,
  getDriverStats,
  getJobs,
} from "@/lib/api";
import { fecha, km, rolLabel, rolStyle } from "@/lib/estilos";

const PILL_SHADOW =
  "0 4px 4px rgba(0,0,0,0.3), 0 1px 0 rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.06)";
const PANEL = "rounded-[10px] border border-white/[0.06] bg-white/[0.02]";

export async function generateMetadata({
  params,
}: PageProps<"/conductor/[id]">) {
  const { id } = await params;
  const conductor = await getDriver(id);
  if (!conductor) return { title: "Conductor no encontrado | AndesMP" };
  return { title: `${conductor.displayName} | AndesMP EMPRESAS` };
}

export default async function ConductorPage({
  params,
}: PageProps<"/conductor/[id]">) {
  const { id } = await params;
  const conductor = await getDriver(id);
  if (!conductor) notFound();

  const [stats, trabajos, empresa, listado] = await Promise.all([
    getDriverStats(id, 30),
    getJobs({ driverId: id, limit: 10 }),
    conductor.companyId ? getCompany(conductor.companyId) : null,
    sinFallar(getCompanies),
  ]);

  const mapa = Object.fromEntries(
    (listado ?? []).map((item) => [item.id, item.slug]),
  );

  return (
    <div className="relative min-h-screen bg-[#0D0D0D] overflow-x-hidden">
      <FondoPuntos />
      <BarraSesion empresas={mapa} />

      <div className="relative z-10 mx-auto w-full max-w-[1200px] px-4 sm:px-8 pt-4 sm:pt-6 pb-20">
        <Link
          href={empresa ? `/empresa/${empresa.slug}` : "/"}
          className="inline-flex items-center gap-2 backdrop-blur-xl bg-[#0D0D0D]/80 rounded-[10px] px-3 py-2.5 text-[11px] sm:text-[12px] font-bold text-white/70 hover:text-white transition-colors"
          style={{ boxShadow: PILL_SHADOW }}
        >
          ← {empresa ? empresa.name : "Empresas"}
        </Link>

        <div className={`${PANEL} mt-6 p-6 flex flex-wrap items-center gap-5`}>
          {conductor.avatarUrl ? (
            <Image
              src={conductor.avatarUrl}
              alt=""
              width={80}
              height={80}
              className="w-20 h-20 rounded-full object-cover"
              unoptimized
            />
          ) : (
            <span className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center text-[24px] font-bold text-white/60">
              {conductor.displayName.slice(0, 2).toUpperCase()}
            </span>
          )}

          <div className="min-w-0 flex-1">
            <h1 className="text-[24px] sm:text-[30px] font-bold tracking-[-0.02em] text-white truncate">
              {conductor.displayName}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-2.5 text-[12px]">
              {empresa ? (
                <Link
                  href={`/empresa/${empresa.slug}`}
                  className="text-white/50 hover:text-white transition-colors"
                >
                  {empresa.name}
                </Link>
              ) : (
                <span className="text-white/25">Sin empresa</span>
              )}
              {conductor.role && (
                <>
                  <span className="text-white/20">·</span>
                  <span className={rolStyle(conductor.role)}>
                    {rolLabel(conductor.role)}
                  </span>
                </>
              )}
              {conductor.platformRole !== "driver" && (
                <>
                  <span className="text-white/20">·</span>
                  <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                    {conductor.platformRole === "superadmin"
                      ? "Superadmin"
                      : "Admin"}
                  </span>
                </>
              )}
            </div>
            {conductor.steamId && (
              <p className="mt-1 text-[11px] text-white/25">
                SteamID {conductor.steamId} · Desde {fecha(conductor.createdAt)}
              </p>
            )}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Ficha
            valor={km(stats?.totalDistanceKm ?? 0)}
            etiqueta="Distancia total"
            color="text-violet-400"
          />
          <Ficha
            valor={String(stats?.jobsCount ?? 0)}
            etiqueta="Trabajos válidos"
            color="text-blue-400"
          />
          <Ficha
            valor={`${(Number(stats?.avgCargoDamage ?? 0) * 100).toFixed(1)}%`}
            etiqueta="Daño medio a la carga"
            color="text-orange-400"
          />
          <Ficha
            valor={Number(stats?.totalRevenue ?? 0).toLocaleString("es-PE")}
            etiqueta="Ingresos"
            color="text-emerald-400"
          />
        </div>

        {stats && stats.byDay.length > 0 && (
          <div className={`${PANEL} mt-5 p-5 sm:p-6`}>
            <h2 className="text-[13px] font-bold text-white/80">
              Kilómetros por día
            </h2>
            <Barras dias={stats.byDay} />
          </div>
        )}

        <div className={`${PANEL} mt-5 p-5 sm:p-6`}>
          <h2 className="text-[13px] font-bold text-white/80">
            Últimos trabajos
          </h2>
          <p className="mt-1 text-[11px] text-white/30">
            Incluye los que el validador descartó; las cifras de arriba sólo
            cuentan los válidos.
          </p>
          <div className="mt-3">
            <TrabajosTabla trabajos={trabajos?.items ?? []} />
          </div>
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

/** Barras proporcionales al día con más kilómetros. */
function Barras({ dias }: { dias: { day: string; distanceKm: string }[] }) {
  const maximo = Math.max(...dias.map((dia) => Number(dia.distanceKm) || 0), 1);

  return (
    <div className="mt-4 flex items-end gap-1 h-32">
      {dias.map((dia) => {
        const valor = Number(dia.distanceKm) || 0;
        return (
          <div
            key={dia.day}
            className="flex-1 min-w-[4px] rounded-t bg-blue-500/70 hover:bg-blue-400 transition-colors"
            style={{ height: `${Math.max(2, (valor / maximo) * 100)}%` }}
            title={`${dia.day}: ${km(valor)}`}
          />
        );
      })}
    </div>
  );
}
