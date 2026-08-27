"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { crearEmpresa } from "@/lib/acciones";
import { entrar, useSesion } from "@/lib/sesion";
import { PlusIcon } from "./icons";

/**
 * `POST /v1/companies` acepta la cookie de la web y deja como propietario a
 * quien la crea, así que este botón ya no explica el camino: lo hace.
 */
export function CrearEmpresa({ className }: { className: string }) {
  const estado = useSesion();
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          if (estado.estado === "invitado") return entrar("/");
          setAbierto(true);
        }}
        disabled={estado.estado === "cargando"}
        className={className}
      >
        <PlusIcon className="w-7 h-7" />
        <span className="text-[11px] font-semibold">Formar empresa</span>
      </button>

      {abierto && estado.estado === "dentro" && (
        <Formulario
          yaTieneEmpresa={estado.sesion.companyId !== null}
          onCerrar={() => setAbierto(false)}
        />
      )}
    </>
  );
}

const CAMPO =
  "w-full rounded-[10px] border border-white/[0.08] bg-black/20 px-3.5 py-2.5 text-[13px] text-white placeholder:text-white/20 outline-none focus:border-white/20 transition-colors";

function Formulario({
  yaTieneEmpresa,
  onCerrar,
}: {
  yaTieneEmpresa: boolean;
  onCerrar: () => void;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [tag, setTag] = useState("");
  const [description, setDescription] = useState("");
  const [creando, setCreando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function crear() {
    setCreando(true);
    setError(null);
    try {
      const empresa = await crearEmpresa({
        name: name.trim(),
        tag: tag.trim().toUpperCase(),
        description: description.trim() || undefined,
      });
      // El listado es una página de servidor con caché: sin refresh la
      // empresa recién creada no aparecería al volver.
      router.refresh();
      router.push(`/empresa/${empresa.slug}`);
    } catch (fallo) {
      setError((fallo as Error).message);
      setCreando(false);
    }
  }

  const valido =
    name.trim().length >= 3 && /^[A-Z0-9]{2,8}$/.test(tag.trim().toUpperCase());

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 sm:p-8"
      onClick={onCerrar}
    >
      <div
        className="w-full max-w-[480px] rounded-[10px] border border-white/[0.08] bg-[#141414] p-6"
        onClick={(evento) => evento.stopPropagation()}
      >
        <h2 className="text-[16px] font-bold text-white">Formar empresa</h2>
        <p className="mt-1 text-[11px] leading-relaxed text-white/30">
          Quedas como propietario en el acto. El nombre y el tag son la
          identidad pública de la VTC: después sólo un administrador puede
          cambiarlos.
        </p>

        {yaTieneEmpresa && (
          <p className="mt-4 rounded-[10px] border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-200/80">
            Ya perteneces a una empresa. Sal de ella antes de formar otra: un
            conductor sólo puede estar activo en una a la vez.
          </p>
        )}

        <div className="mt-5 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-white/30">
              Nombre
            </span>
            <input
              value={name}
              onChange={(evento) => setName(evento.target.value)}
              maxLength={64}
              placeholder="Transportes Andinos"
              className={CAMPO}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-white/30">
              Tag
            </span>
            <input
              value={tag}
              onChange={(evento) => setTag(evento.target.value.toUpperCase())}
              maxLength={8}
              placeholder="ANDES"
              className={`${CAMPO} uppercase`}
            />
            <span className="text-[10px] text-white/25">
              De 2 a 8 caracteres, sólo mayúsculas y números.
            </span>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-white/30">
              Descripción
            </span>
            <textarea
              value={description}
              onChange={(evento) => setDescription(evento.target.value)}
              rows={3}
              maxLength={1000}
              placeholder="Opcional. Se puede editar luego."
              className={`${CAMPO} resize-y`}
            />
          </label>
        </div>

        {error && (
          <p className="mt-4 rounded-[8px] border border-rose-500/25 bg-rose-500/10 px-3 py-2 text-[11px] text-rose-200/80">
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onCerrar}
            className="rounded-[10px] px-4 py-2.5 text-[12px] font-semibold text-white/40 hover:text-white transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={crear}
            disabled={creando || !valido || yaTieneEmpresa}
            className="rounded-[10px] bg-rose-600 hover:bg-rose-500 px-5 py-2.5 text-[12px] font-bold text-white transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {creando ? "Creando…" : "Crear empresa"}
          </button>
        </div>
      </div>
    </div>
  );
}
