import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EmpresaTabs } from "@/components/EmpresaTabs";
import { FondoPuntos } from "@/components/FondoPuntos";
import { Avatar } from "@/components/Avatar";
import { EMPRESAS, ESTADO_STYLES, Empresa, getEmpresa } from "@/components/empresas";
import { UsersIcon } from "@/components/icons";

const PILL_SHADOW =
  "0 4px 4px rgba(0,0,0,0.3), 0 1px 0 rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.06)";
const PANEL = "rounded-[10px] border border-white/[0.06] bg-white/[0.02]";

export function generateStaticParams() {
  return EMPRESAS.map((empresa) => ({ slug: empresa.slug }));
}

export async function generateMetadata({ params }: PageProps<"/empresa/[slug]">) {
  const { slug } = await params;
  const empresa = getEmpresa(slug);
  if (!empresa) return { title: "Empresa no encontrada | AndesMP" };
  return {
    title: `${empresa.name} | AndesMP EMPRESAS`,
    description: empresa.descripcion,
  };
}

export default async function EmpresaPage({
  params,
}: PageProps<"/empresa/[slug]">) {
  const { slug } = await params;
  const empresa = getEmpresa(slug);
  if (!empresa) notFound();

  return (
    <div className="relative min-h-screen bg-[#0D0D0D] overflow-x-hidden">
      <FondoPuntos />

      <div className="relative z-10 mx-auto w-full max-w-[1600px] px-4 sm:px-8 lg:px-12 pt-4 sm:pt-6 pb-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 backdrop-blur-xl bg-[#0D0D0D]/80 rounded-[10px] px-3 py-2.5 text-[11px] sm:text-[12px] font-bold text-white/70 hover:text-white transition-colors"
          style={{ boxShadow: PILL_SHADOW }}
        >
          ← Empresas
        </Link>

        <Cabecera empresa={empresa} />

        <div className="mt-6 sm:mt-8 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
          <div className="lg:col-span-4 xl:col-span-3">
            <Info empresa={empresa} />
          </div>
          <div className="lg:col-span-8 xl:col-span-9">
            <Estadisticas empresa={empresa} />
          </div>
        </div>

        {empresa.destacados.length > 0 && (
        <div className="mt-5 sm:mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
          {empresa.destacados.map((destacado) => (
            <div
              key={destacado.titulo}
              className={`${PANEL} flex items-center gap-4 px-5 py-4`}
            >
              <span className="shrink-0 w-11 h-11 rounded-[10px] bg-rose-500/15 flex items-center justify-center text-rose-400/80">
                <UsersIcon className="w-5 h-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-[10px] uppercase tracking-wide text-white/30 leading-tight">
                  {destacado.titulo}
                </span>
                <span className="mt-1.5 flex items-center gap-2">
                  <Avatar nombre={destacado.miembro} size={22} />
                  <span className="text-[12px] font-semibold text-white/80 truncate">
                    {destacado.miembro}
                  </span>
                </span>
                {destacado.detalle && (
                  <span className="block mt-0.5 text-[11px] text-white/35">
                    {destacado.detalle}
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>
        )}

        <div className="mt-5 sm:mt-6">
          <EmpresaTabs empresa={empresa} />
        </div>

        {empresa.redes.length > 0 && (
        <div className={`${PANEL} mt-5 sm:mt-6 px-5 py-5 sm:px-6 sm:py-6`}>
          <h2 className="text-[13px] font-bold text-white/80">Redes</h2>
          <div className="mt-3.5 flex flex-wrap gap-2.5">
            {empresa.redes.map((red) => (
              <a
                key={red.nombre}
                href={red.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-1.5 text-[11px] font-semibold text-white/50 hover:text-white hover:bg-white/[0.08] transition-colors"
              >
                {red.nombre}
              </a>
            ))}
          </div>
        </div>
        )}

        <p className="mt-10 text-center text-[12px] text-white/25">
          Creado por{" "}
          <a
            href="https://andesmp.site"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/40 hover:text-white/70 transition-colors"
          >
            @TeamAndesMP
          </a>
        </p>
      </div>
    </div>
  );
}

function Cabecera({ empresa }: { empresa: Empresa }) {
  return (
    <div className="mt-4 sm:mt-5">
      {/* Franja rectangular a todo el ancho: 3:1 en escritorio. El banner de
          detalle se entrega en esa proporción; si no hay uno propio se
          reutiliza la imagen de la tarjeta. */}
      <div className="relative w-full aspect-[16/9] sm:aspect-[5/2] lg:aspect-[3/1] rounded-[10px] overflow-hidden bg-black">
        <Image
          src={empresa.banner ?? empresa.image}
          alt={`Banner de ${empresa.name}`}
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <span
          className="absolute inset-0 rounded-[10px]"
          style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)" }}
        />
      </div>

      {/* Logo superpuesto y datos principales */}
      <div className="relative -mt-10 sm:-mt-14 px-3 sm:px-6 flex flex-wrap items-end gap-4 sm:gap-5">
        <div className="shrink-0 w-20 h-20 sm:w-32 sm:h-32 rounded-[10px] overflow-hidden border border-white/10 bg-[#0D0D0D] flex items-center justify-center">
          {empresa.logo ? (
            <Image
              src={empresa.logo}
              alt={`Logo de ${empresa.name}`}
              width={128}
              height={128}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-[24px] sm:text-[36px] font-bold text-white/70">
              {empresa.name.slice(0, 2).toUpperCase()}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1 pb-1.5 flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-[24px] sm:text-[36px] font-bold tracking-[-0.02em] text-white truncate">
              {empresa.name}
            </h1>
            <span
              className={`flex items-center gap-1.5 text-[12px] ${
                ESTADO_STYLES[empresa.estado].text
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  ESTADO_STYLES[empresa.estado].dot
                }`}
              />
              {empresa.estado}
            </span>
          </div>

          {/* Resumen rápido, útil cuando el ancho sobra */}
          <dl className="hidden md:flex items-center gap-6 pb-1">
            <Resumen termino="Conductores" valor={`${empresa.conductores} / ${empresa.cupo}`} />
            <Resumen termino="Trabajos" valor={empresa.stats.trabajos} />
            <Resumen termino="Distancia" valor={empresa.stats.kmTotal} />
            <Resumen termino="Fundada" valor={empresa.fundada} />
          </dl>
        </div>
      </div>
    </div>
  );
}

function Resumen({ termino, valor }: { termino: string; valor: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-wide text-white/25">
        {termino}
      </dt>
      <dd className="text-[14px] font-bold text-white/75 tabular-nums">
        {valor}
      </dd>
    </div>
  );
}

function Info({ empresa }: { empresa: Empresa }) {
  const ocupacion = Math.min(
    100,
    Math.round((empresa.conductores / empresa.cupo) * 100),
  );

  return (
    <div className={`${PANEL} h-full p-5 sm:p-6 flex flex-col gap-5`}>
      <div>
        <h2 className="text-[13px] font-bold text-white/80">Info</h2>
        <p className="mt-2.5 text-[13px] leading-relaxed text-white/45">
          {empresa.descripcion}
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-white/40">
            <UsersIcon className="w-3.5 h-3.5 text-blue-400/70" />
            Conductores en Flota
          </span>
          <span className="text-[11px] font-semibold text-blue-400 shrink-0 tabular-nums">
            {empresa.conductores} / {empresa.cupo}
          </span>
        </div>
        <div
          className="mt-1.5 h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden"
          role="progressbar"
          aria-label={`Conductores en flota de ${empresa.name}`}
          aria-valuenow={empresa.conductores}
          aria-valuemin={0}
          aria-valuemax={empresa.cupo}
        >
          <div
            className="h-full rounded-full bg-blue-500"
            style={{ width: `${ocupacion}%` }}
          />
        </div>
      </div>

      <button
        type="button"
        className="mt-auto w-full rounded-[10px] bg-rose-600 hover:bg-rose-500 px-4 py-2.5 text-[12px] font-bold text-white transition-colors cursor-pointer"
      >
        Unirse a la empresa
      </button>
    </div>
  );
}

function Estadisticas({ empresa }: { empresa: Empresa }) {
  const { stats } = empresa;

  return (
    <div className={`${PANEL} h-full overflow-hidden`}>
      <h2 className="px-5 sm:px-6 py-3.5 text-[13px] font-bold text-white/80 border-b border-white/[0.06]">
        ETS2 · Estadísticas mensuales
      </h2>
      <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        <Tarjeta valor={stats.kmTotal} etiqueta="Total" color="text-violet-400" />
        <Tarjeta valor={stats.trabajos} etiqueta="Trabajos" color="text-violet-400" />
        <Tarjeta
          valor={stats.millasReal}
          etiqueta="Millas en Real"
          color="text-emerald-400"
          rango={stats.millasRealRank}
          rangoColor="bg-rose-600/90"
        />
        <Tarjeta
          valor={stats.kmCarrera}
          etiqueta="Estadísticas en Carrera"
          color="text-orange-400"
          rango={stats.kmCarreraRank}
          rangoColor="bg-amber-600/90"
        />
      </div>
    </div>
  );
}

function Tarjeta({
  valor,
  etiqueta,
  color,
  rango,
  rangoColor,
}: {
  valor: string;
  etiqueta: string;
  color: string;
  rango?: string;
  rangoColor?: string;
}) {
  return (
    <div className="rounded-[10px] border border-white/[0.06] bg-black/20 px-5 py-5 flex flex-col justify-center min-h-[104px]">
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-[24px] font-bold tracking-[-0.02em] ${color}`}>
          {valor}
        </span>
        {rango && (
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold text-white ${rangoColor}`}
          >
            {rango}
          </span>
        )}
      </div>
      <span className="mt-1 block text-[12px] text-white/40">{etiqueta}</span>
    </div>
  );
}
