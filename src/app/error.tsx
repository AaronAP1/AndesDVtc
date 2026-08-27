"use client";

import Link from "next/link";

/**
 * Se muestra cuando una vista falla, típicamente porque la API no responde.
 * Es distinto del 404: aquí el recurso puede existir perfectamente.
 */
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-[24px] font-bold text-white">
          No se pudo cargar la información
        </h1>
        <p className="mt-3 text-[13px] leading-relaxed text-white/45">
          La API no respondió. Suele ser algo pasajero: vuelve a intentarlo en
          unos segundos.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-[10px] bg-rose-600 hover:bg-rose-500 px-5 py-2.5 text-[12px] font-bold text-white transition-colors cursor-pointer"
          >
            Reintentar
          </button>
          <Link
            href="/"
            className="text-[12px] font-semibold text-white/40 hover:text-white transition-colors"
          >
            Volver al listado
          </Link>
        </div>
      </div>
    </div>
  );
}
