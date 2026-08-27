import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/Avatar";
import { AccionHub } from "@/components/AccionHub";
import { BarraSesion } from "@/components/BarraSesion";
import { EmpresaTabs } from "@/components/EmpresaTabs";
import { FondoPuntos } from "@/components/FondoPuntos";
import { UsersIcon } from "@/components/icons";
import {
  CompanyMember,
  getCompanies,
  sinFallar,
  getCompanyBySlug,
  getCompanyLeaderboard,
  getCompanyMembers,
  getJobs,
  getReviewQueue,
} from "@/lib/api";
import { km } from "@/lib/estilos";
import {
  ESTADO_LABEL,
  ESTADO_STYLES,
  esExterna,
  imagenDe,
} from "@/lib/presentacion";

const PILL_SHADOW =
  "0 4px 4px rgba(0,0,0,0.3), 0 1px 0 rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.06)";
const PANEL = "rounded-[10px] border border-white/[0.06] bg-white/[0.02]";

export async function generateMetadata({
  params,
}: PageProps<"/empresa/[slug]">) {
  const { slug } = await params;
  const empresa = await getCompanyBySlug(slug);
  if (!empresa) return { title: "Empresa no encontrada | AndesMP" };
  return {
    title: `${empresa.name} | AndesMP EMPRESAS`,
    description: empresa.description ?? `Empresa registrada en AndesMP.`,
  };
}

export default async function EmpresaPage({
  params,
}: PageProps<"/empresa/[slug]">) {
  const { slug } = await params;
  // by-slug ya devuelve la ficha completa: no hace falta pedir el listado.
  const detalle = await getCompanyBySlug(slug);
  if (!detalle) notFound();

  const [miembros, ranking, trabajos, revision, listado] = await Promise.all([
    getCompanyMembers(detalle.id),
    getCompanyLeaderboard(detalle.id, 10),
    getJobs({ companyId: detalle.id, limit: 8 }),
    getReviewQueue(detalle.id),
    sinFallar(getCompanies),
  ]);

  const estado = detalle.status;
  const cupo = detalle.maxDrivers;
  const banner = imagenDe(slug, "banner", detalle.bannerUrl);
  const logo = imagenDe(slug, "logo", detalle.logoUrl);
  const mapa = Object.fromEntries(
    (listado ?? []).map((item) => [item.id, item.slug]),
  );
  const lista = miembros ?? [];
  const conductores = lista.length || detalle.memberCount;

  const totales = lista.reduce(
    (acumulado, miembro) => ({
      km: acumulado.km + Number(miembro.totalDistanceKm ?? 0),
      trabajos: acumulado.trabajos + (miembro.jobsCount ?? 0),
    }),
    { km: 0, trabajos: 0 },
  );

  const destacados = calcularDestacados(lista);
  const redes = [
    detalle.discordUrl && { nombre: "Discord", url: detalle.discordUrl },
    detalle.website && { nombre: "Web", url: detalle.website },
  ].filter(Boolean) as { nombre: string; url: string }[];

  const fundada = new Date(detalle.createdAt).getFullYear().toString();

  return (
    <div className="relative min-h-screen bg-[#0D0D0D] overflow-x-hidden">
      <FondoPuntos />

      <BarraSesion empresas={mapa} />

      <div className="relative z-10 mx-auto w-full max-w-[1600px] px-4 sm:px-8 lg:px-12 pt-4 sm:pt-6 pb-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 backdrop-blur-xl bg-[#0D0D0D]/80 rounded-[10px] px-3 py-2.5 text-[11px] sm:text-[12px] font-bold text-white/70 hover:text-white transition-colors"
          style={{ boxShadow: PILL_SHADOW }}
        >
          ← Empresas
        </Link>

        {/* Cabecera */}
        <div className="mt-4 sm:mt-5">
          <div className="relative w-full aspect-[16/9] sm:aspect-[5/2] lg:aspect-[3/1] rounded-[10px] overflow-hidden bg-black">
            {banner ? (
              <Image
                src={banner}
                unoptimized={esExterna(banner)}
                alt={`Banner de ${detalle.name}`}
                fill
                sizes="100vw"
                className="object-cover"
                priority
              />
            ) : (
              <span
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(135deg, #1f2937 0%, #111827 55%, #0b1220 100%)",
                }}
              />
            )}
            <span
              className="absolute inset-0 rounded-[10px]"
              style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)" }}
            />
          </div>

          <div className="relative -mt-10 sm:-mt-14 px-3 sm:px-6 flex flex-wrap items-end gap-4 sm:gap-5">
            <div className="shrink-0 w-20 h-20 sm:w-32 sm:h-32 rounded-[10px] overflow-hidden border border-white/10 bg-[#0D0D0D] flex items-center justify-center">
              {logo ? (
                <Image
                  src={logo}
                  unoptimized={esExterna(logo)}
                  alt={`Logo de ${detalle.name}`}
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-[24px] sm:text-[36px] font-bold text-white/70">
                  {detalle.name.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1 pb-1.5 flex flex-wrap items-end justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-[24px] sm:text-[36px] font-bold tracking-[-0.02em] text-white truncate">
                  {detalle.name}
                </h1>
                <span className="flex flex-wrap items-center gap-2.5 text-[12px]">
                  <span
                    className={`flex items-center gap-1.5 ${ESTADO_STYLES[estado].text}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${ESTADO_STYLES[estado].dot}`}
                    />
                    {ESTADO_LABEL[estado] ?? estado}
                  </span>
                  <span className="text-white/20">·</span>
                  <span className="text-white/30 font-semibold">
                    {detalle.tag}
                  </span>
                </span>
              </div>

              <dl className="hidden md:flex items-center gap-6 pb-1">
                <Resumen termino="Conductores" valor={`${conductores} / ${cupo}`} />
                <Resumen termino="Trabajos" valor={String(totales.trabajos)} />
                <Resumen termino="Distancia" valor={km(totales.km)} />
                <Resumen termino="Fundada" valor={fundada} />
              </dl>
            </div>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
          <div className="lg:col-span-4 xl:col-span-3">
            <div className={`${PANEL} h-full p-5 sm:p-6 flex flex-col gap-5`}>
              <div>
                <h2 className="text-[13px] font-bold text-white/80">Info</h2>
                <p className="mt-2.5 text-[13px] leading-relaxed text-white/45">
                  {detalle.description ?? "Empresa registrada en AndesMP."}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold text-white/40">
                    <UsersIcon className="w-3.5 h-3.5 text-blue-400/70" />
                    Conductores en Flota
                  </span>
                  <span className="text-[11px] font-semibold text-blue-400 shrink-0 tabular-nums">
                    {conductores} / {cupo}
                  </span>
                </div>
                <div
                  className="mt-1.5 h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden"
                  role="progressbar"
                  aria-label={`Conductores en flota de ${detalle.name}`}
                  aria-valuenow={conductores}
                  aria-valuemin={0}
                  aria-valuemax={cupo}
                >
                  <div
                    className="h-full rounded-full bg-blue-500"
                    style={{
                      width: `${Math.min(100, Math.round((conductores / cupo) * 100))}%`,
                    }}
                  />
                </div>
              </div>

              <div className="mt-auto">
                <AccionHub
                  etiqueta="Unirse a la empresa"
                  detalle="La solicitud se envía desde el hub de AndesMP, dentro del juego: es donde tu cuenta de Steam queda vinculada al conductor. Cuando la mandes, quedará pendiente hasta que un gestor de la empresa la apruebe."
                  className="w-full rounded-[10px] bg-rose-600 hover:bg-rose-500 px-4 py-2.5 text-[12px] font-bold text-white transition-colors cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 xl:col-span-9">
            <div className={`${PANEL} h-full overflow-hidden`}>
              <h2 className="px-5 sm:px-6 py-3.5 text-[13px] font-bold text-white/80 border-b border-white/[0.06]">
                ETS2 · Estadísticas de la empresa
              </h2>
              <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
                <Tarjeta
                  valor={km(totales.km)}
                  etiqueta="Distancia total"
                  color="text-violet-400"
                />
                <Tarjeta
                  valor={String(totales.trabajos)}
                  etiqueta="Trabajos"
                  color="text-violet-400"
                />
                <Tarjeta
                  valor={String(conductores)}
                  etiqueta="Conductores"
                  color="text-emerald-400"
                />
                <Tarjeta
                  valor={km(
                    totales.trabajos ? totales.km / totales.trabajos : 0,
                  )}
                  etiqueta="Media por trabajo"
                  color="text-orange-400"
                />
              </div>
            </div>
          </div>
        </div>

        {destacados.length > 0 && (
          <div className="mt-5 sm:mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            {destacados.map((destacado) => (
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
          <EmpresaTabs
            nombre={detalle.name}
            descripcion={detalle.description}
            estado={ESTADO_LABEL[estado] ?? estado}
            fundada={fundada}
            conductores={conductores}
            cupo={cupo}
            trabajos={totales.trabajos}
            miembros={lista}
            ranking={ranking ?? []}
            trabajosRecientes={trabajos?.items ?? []}
            enRevision={revision ?? []}
          />
        </div>

        {redes.length > 0 && (
          <div className={`${PANEL} mt-5 sm:mt-6 px-5 py-5 sm:px-6 sm:py-6`}>
            <h2 className="text-[13px] font-bold text-white/80">Redes</h2>
            <div className="mt-3.5 flex flex-wrap gap-2.5">
              {redes.map((red) => (
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

/** Los destacados salen de los totales de cada miembro, no hay endpoint propio. */
function calcularDestacados(miembros: CompanyMember[]) {
  if (miembros.length === 0) return [];

  const porKm = [...miembros].sort(
    (a, b) => Number(b.totalDistanceKm) - Number(a.totalDistanceKm),
  )[0];
  const porTrabajos = [...miembros].sort((a, b) => b.jobsCount - a.jobsCount)[0];
  const veterano = [...miembros].sort(
    (a, b) => +new Date(a.joinedAt) - +new Date(b.joinedAt),
  )[0];

  return [
    {
      titulo: "Mayor distancia recorrida",
      miembro: porKm.displayName,
      detalle: km(porKm.totalDistanceKm),
    },
    {
      titulo: "La mayoría de los trabajos",
      miembro: porTrabajos.displayName,
      detalle: `${porTrabajos.jobsCount} trabajos`,
    },
    {
      titulo: "Miembro más antiguo",
      miembro: veterano.displayName,
      detalle: new Date(veterano.joinedAt).toLocaleDateString("es-PE"),
    },
  ];
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

function Tarjeta({
  valor,
  etiqueta,
  color,
}: {
  valor: string;
  etiqueta: string;
  color: string;
}) {
  return (
    <div className="rounded-[10px] border border-white/[0.06] bg-black/20 px-5 py-5 flex flex-col justify-center min-h-[104px]">
      <span className={`text-[24px] font-bold tracking-[-0.02em] ${color}`}>
        {valor}
      </span>
      <span className="mt-1 block text-[12px] text-white/40">{etiqueta}</span>
    </div>
  );
}
