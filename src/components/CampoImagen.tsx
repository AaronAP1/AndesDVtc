"use client";

import { useEffect, useRef, useState } from "react";
import {
  IMAGENES,
  TAMANO_MAXIMO,
  TIPOS_ACEPTADOS,
  TipoImagen,
  borrarImagenEmpresa,
  subirImagenEmpresa,
} from "@/lib/acciones";
import { CompanyDetail } from "@/lib/api";
import { ErrorApi } from "@/lib/cliente";

/**
 * Un hueco de imagen de la ficha: previsualiza, sube y borra.
 *
 * La subida es inmediata, no espera al botón de guardar del formulario: son
 * endpoints distintos —`POST .../images/{kind}` frente al `PATCH` del resto—
 * y mezclarlos haría que "Guardar cambios" a veces subiera ficheros y a
 * veces no.
 */
export function CampoImagen({
  companyId,
  tipo,
  url,
  onCambio,
}: {
  companyId: string;
  tipo: TipoImagen;
  /** La que hay puesta ahora, vacía si no hay ninguna. */
  url: string;
  onCambio: (empresa: CompanyDetail) => void;
}) {
  const { etiqueta, proporcion, medida } = IMAGENES[tipo];
  const entrada = useRef<HTMLInputElement>(null);
  const [progreso, setProgreso] = useState<number | null>(null);
  const [previsualizacion, setPrevisualizacion] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [espera, setEspera] = useState<number | null>(null);
  const [borrando, setBorrando] = useState(false);

  // La cuenta atrás del 429, para no dejar al usuario adivinando.
  useEffect(() => {
    if (espera === null) return;
    // Al llegar a uno se pasa a null desde el propio temporizador: cambiar
    // el estado en el cuerpo del efecto encadena renders.
    const reloj = setTimeout(
      () => setEspera((queda) => (queda && queda > 1 ? queda - 1 : null)),
      1000,
    );
    return () => clearTimeout(reloj);
  }, [espera]);

  // La URL del objeto ocupa memoria hasta que se libera.
  useEffect(() => {
    return () => {
      if (previsualizacion) URL.revokeObjectURL(previsualizacion);
    };
  }, [previsualizacion]);

  const ocupado = progreso !== null || borrando;

  function fallo(problema: unknown) {
    const apiFallo = problema as ErrorApi;
    setError(apiFallo.message);
    if (apiFallo.estado === 429 && apiFallo.reintentarEn) {
      setEspera(apiFallo.reintentarEn);
    }
  }

  async function elegido(fichero: File | undefined) {
    if (!fichero) return;
    setError(null);

    // Se comprueba aquí lo que la API va a rechazar de todos modos: así el
    // aviso es inmediato y no se gasta una subida del cupo.
    if (!TIPOS_ACEPTADOS.includes(fichero.type)) {
      return setError("Tiene que ser una imagen JPEG, PNG o WebP.");
    }
    if (fichero.size > TAMANO_MAXIMO) {
      return setError(
        `La imagen pesa ${(fichero.size / 1024 / 1024).toFixed(1)} MB y el límite son 5 MB.`,
      );
    }

    setPrevisualizacion(URL.createObjectURL(fichero));
    setProgreso(0);
    try {
      const empresa = await subirImagenEmpresa(
        companyId,
        tipo,
        fichero,
        setProgreso,
      );
      onCambio(empresa);
      // A partir de aquí manda la imagen que devolvió la API, que es la
      // re-codificada y recortada, no la que se eligió en el disco.
      setPrevisualizacion(null);
    } catch (problema) {
      fallo(problema);
      setPrevisualizacion(null);
    } finally {
      setProgreso(null);
      if (entrada.current) entrada.current.value = "";
    }
  }

  async function borrar() {
    setBorrando(true);
    setError(null);
    try {
      onCambio(await borrarImagenEmpresa(companyId, tipo));
    } catch (problema) {
      fallo(problema);
    } finally {
      setBorrando(false);
    }
  }

  const mostrada = previsualizacion ?? url;

  return (
    <div className="flex flex-col gap-2">
      <span className="flex flex-wrap items-baseline gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-white/30">
          {etiqueta}
        </span>
        <span className="text-[10px] text-white/25">{medida}</span>
      </span>

      <div
        className="relative w-full overflow-hidden rounded-[10px] border border-white/[0.08] bg-black/30"
        style={{ aspectRatio: proporcion }}
      >
        {mostrada ? (
          // Imagen suelta y no next/image: la URL cambia con cada subida y
          // aquí no hay nada que optimizar, la API ya la sirve en su medida.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={mostrada}
            alt={`${etiqueta} de la empresa`}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-[11px] text-white/20">
            Sin imagen
          </span>
        )}

        {progreso !== null && (
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/70">
            <span className="text-[11px] font-semibold text-white/70">
              Subiendo… {progreso}%
            </span>
            <span className="h-1.5 w-2/3 overflow-hidden rounded-full bg-white/10">
              <span
                className="block h-full rounded-full bg-rose-500 transition-[width] duration-150"
                style={{ width: `${progreso}%` }}
              />
            </span>
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={ocupado || espera !== null}
          onClick={() => entrada.current?.click()}
          className="rounded-[8px] border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[11px] font-semibold text-white/60 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {url ? "Cambiar" : "Subir imagen"}
        </button>

        {url && (
          <button
            type="button"
            disabled={ocupado || espera !== null}
            onClick={borrar}
            className="rounded-[8px] px-3 py-1.5 text-[11px] font-semibold text-white/35 hover:text-rose-300 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {borrando ? "Quitando…" : "Quitar"}
          </button>
        )}

        <input
          ref={entrada}
          type="file"
          accept={TIPOS_ACEPTADOS.join(",")}
          onChange={(evento) => elegido(evento.target.files?.[0])}
          className="hidden"
        />
      </div>

      {espera !== null ? (
        <p className="rounded-[8px] border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-200/80">
          Has cambiado imágenes muchas veces seguidas. Podrás volver a hacerlo
          en {formatoEspera(espera)}.
        </p>
      ) : (
        error && (
          <p className="rounded-[8px] border border-rose-500/25 bg-rose-500/10 px-3 py-2 text-[11px] text-rose-200/80">
            {error}
          </p>
        )
      )}
    </div>
  );
}

/** 95 → "1 min 35 s". Un número de tres cifras en segundos no dice nada. */
function formatoEspera(segundos: number) {
  if (segundos < 60) return `${segundos} s`;
  const minutos = Math.floor(segundos / 60);
  const resto = segundos % 60;
  return resto ? `${minutos} min ${resto} s` : `${minutos} min`;
}
