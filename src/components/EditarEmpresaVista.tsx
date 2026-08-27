"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CambiosPropios, editarMiEmpresa } from "@/lib/acciones";
import { CompanyDetail } from "@/lib/api";
import { entrar, useSesion } from "@/lib/sesion";
import { BarraSesion, MapaEmpresas } from "./BarraSesion";
import { CampoImagen } from "./CampoImagen";
import { FondoPuntos } from "./FondoPuntos";
import { SteamIcon } from "./icons";

const PANEL = "rounded-[10px] border border-white/[0.06] bg-white/[0.02]";
const PILL_SHADOW =
  "0 4px 4px rgba(0,0,0,0.3), 0 1px 0 rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.06)";

export function EditarEmpresaVista({
  empresa,
  slug,
  empresas,
}: {
  empresa: CompanyDetail;
  slug: string;
  empresas: MapaEmpresas;
}) {
  const estado = useSesion();
  const router = useRouter();
  // Las imágenes se suben por su cuenta y devuelven la ficha entera, así que
  // la empresa vive en el estado: la del servidor se queda vieja al instante.
  const [ficha, setFicha] = useState(empresa);
  const [datos, setDatos] = useState({
    description: empresa.description ?? "",
    website: empresa.website ?? "",
    discordUrl: empresa.discordUrl ?? "",
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);

  const sesion = estado.estado === "dentro" ? estado.sesion : null;
  // Un admin de plataforma también pasa el permiso en la API, pero para eso
  // tiene el panel: esto es el escaparate del dueño.
  const esDueno =
    sesion?.companyId === empresa.id && sesion?.companyRole === "owner";

  function actualizarFicha(actualizada: CompanyDetail) {
    setFicha(actualizada);
    // La ficha pública la pinta el servidor con caché.
    router.refresh();
  }

  async function guardar(evento: React.FormEvent) {
    evento.preventDefault();
    setGuardando(true);
    setError(null);
    setGuardado(false);

    // Sólo se manda lo que cambió: la API rechaza un cuerpo sin cambios.
    const cambios: CambiosPropios = {};
    if (datos.description !== (ficha.description ?? ""))
      cambios.description = datos.description;
    if (datos.website !== (ficha.website ?? ""))
      cambios.website = datos.website.trim() || null;
    if (datos.discordUrl !== (ficha.discordUrl ?? ""))
      cambios.discordUrl = datos.discordUrl.trim() || null;

    if (Object.keys(cambios).length === 0) {
      setGuardando(false);
      return setGuardado(true);
    }

    try {
      setFicha(await editarMiEmpresa(ficha.id, cambios));
      setGuardado(true);
      // La ficha la pinta el servidor con caché: sin esto los cambios no se
      // verían al volver a /empresa/<slug>.
      router.refresh();
    } catch (fallo) {
      setError((fallo as Error).message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="relative min-h-screen bg-[#0D0D0D] overflow-x-hidden">
      <FondoPuntos />
      <BarraSesion empresas={empresas} />

      <div className="relative z-10 mx-auto w-full max-w-[900px] px-4 sm:px-8 pt-4 sm:pt-6 pb-20">
        <Link
          href={`/empresa/${slug}`}
          className="inline-flex items-center gap-2 backdrop-blur-xl bg-[#0D0D0D]/80 rounded-[10px] px-3 py-2.5 text-[11px] sm:text-[12px] font-bold text-white/70 hover:text-white transition-colors"
          style={{ boxShadow: PILL_SHADOW }}
        >
          ← {empresa.name}
        </Link>

        <h1 className="mt-8 text-[28px] sm:text-[36px] font-bold tracking-[-0.02em] text-white">
          Editar empresa
        </h1>

        {estado.estado === "cargando" && (
          <div className={`${PANEL} mt-6 h-64 animate-pulse`} />
        )}

        {estado.estado === "invitado" && (
          <div className={`${PANEL} mt-6 p-8 text-center`}>
            <p className="text-[13px] text-white/45">
              Inicia sesión para editar los datos de la empresa.
            </p>
            <button
              type="button"
              onClick={() => entrar(`/empresa/${slug}/editar`)}
              className="mt-5 inline-flex items-center gap-2.5 rounded-[10px] bg-white px-5 py-3.5 text-[13px] font-bold text-[#1e1e1e] hover:bg-white/90 transition-colors cursor-pointer"
            >
              <SteamIcon className="w-[18px] h-[18px]" />
              Iniciar sesión
            </button>
          </div>
        )}

        {estado.estado === "dentro" && !esDueno && (
          <div className={`${PANEL} mt-6 p-8 text-center`}>
            <p className="text-[13px] text-white/45">
              Solo el dueño de {empresa.name} puede editar estos datos.
            </p>
            <Link
              href={`/empresa/${slug}`}
              className="mt-5 inline-block text-[12px] font-bold text-rose-400 hover:text-rose-300 transition-colors"
            >
              Volver a la empresa
            </Link>
          </div>
        )}

        {esDueno && (
          <>
            <p className="mt-6 text-[12px] leading-relaxed text-white/35">
              El nombre, el tag, la dirección y el cupo no están aquí: son la
              identidad pública de la VTC y los lleva un administrador.
            </p>

            <div className={`${PANEL} mt-4 p-6`}>
              <h2 className="text-[13px] font-bold text-white/80">Imágenes</h2>
              <p className="mt-1 text-[11px] leading-relaxed text-white/30">
                Se guardan al elegirlas, sin pasar por el botón de abajo. La
                API las recorta y las convierte a WebP, así que la que verás
                aquí es ya la definitiva.
              </p>
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <CampoImagen
                    companyId={ficha.id}
                    tipo="banner"
                    url={ficha.bannerUrl ?? ""}
                    onCambio={actualizarFicha}
                  />
                </div>
                <CampoImagen
                  companyId={ficha.id}
                  tipo="card"
                  url={ficha.cardImageUrl ?? ""}
                  onCambio={actualizarFicha}
                />
                <CampoImagen
                  companyId={ficha.id}
                  tipo="logo"
                  url={ficha.logoUrl ?? ""}
                  onCambio={actualizarFicha}
                />
              </div>
            </div>

            <form
              className={`${PANEL} mt-5 p-6 flex flex-col gap-5`}
              onSubmit={guardar}
            >
              <Campo
                etiqueta="Descripción"
                valor={datos.description}
                onChange={(description) => setDatos({ ...datos, description })}
                multilinea
              />
              <Campo
                etiqueta="Web"
                valor={datos.website}
                onChange={(website) => setDatos({ ...datos, website })}
                marcador="https://"
              />
              <Campo
                etiqueta="Discord"
                valor={datos.discordUrl}
                onChange={(discordUrl) => setDatos({ ...datos, discordUrl })}
                marcador="https://discord.gg/"
              />
              {error && (
                <p className="rounded-[8px] border border-rose-500/25 bg-rose-500/10 px-3 py-2 text-[11px] text-rose-200/80">
                  {error}
                </p>
              )}

              {guardado && !error && (
                <p className="rounded-[8px] border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-[11px] text-emerald-200/80">
                  Cambios guardados.{" "}
                  <Link
                    href={`/empresa/${slug}`}
                    className="font-bold underline underline-offset-2"
                  >
                    Ver la ficha
                  </Link>
                </p>
              )}

              <button
                type="submit"
                disabled={guardando}
                className="self-start rounded-[10px] bg-rose-600 hover:bg-rose-500 px-5 py-2.5 text-[12px] font-bold text-white transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {guardando ? "Guardando…" : "Guardar cambios"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function Campo({
  etiqueta,
  valor,
  onChange,
  multilinea = false,
  marcador,
  ayuda,
}: {
  etiqueta: string;
  valor: string;
  onChange: (valor: string) => void;
  multilinea?: boolean;
  marcador?: string;
  ayuda?: string;
}) {
  const clases =
    "w-full rounded-[10px] border border-white/[0.08] bg-black/20 px-3.5 py-2.5 text-[13px] text-white placeholder:text-white/20 outline-none focus:border-white/20 transition-colors";

  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-white/30">
        {etiqueta}
      </span>
      {multilinea ? (
        <textarea
          value={valor}
          onChange={(evento) => onChange(evento.target.value)}
          rows={3}
          placeholder={marcador}
          className={`${clases} resize-y`}
        />
      ) : (
        <input
          value={valor}
          onChange={(evento) => onChange(evento.target.value)}
          placeholder={marcador}
          className={clases}
        />
      )}
      {ayuda && <span className="text-[10px] text-white/25">{ayuda}</span>}
    </label>
  );
}
