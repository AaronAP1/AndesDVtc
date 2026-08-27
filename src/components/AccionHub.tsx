"use client";

import { useState } from "react";

/**
 * Unirse y formar empresa se piden con un token de dispositivo, que sólo
 * emite el hub al iniciar sesión con Steam desde el juego. La cookie de la
 * web no sirve para esos endpoints, así que aquí explicamos el camino en
 * vez de dejar un botón que fallaría con 401.
 */
export function AccionHub({
  etiqueta,
  detalle,
  className,
  children,
}: {
  etiqueta: string;
  detalle: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const [abierto, setAbierto] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setAbierto((previo) => !previo)}
        aria-expanded={abierto}
        className={className}
      >
        {children ?? etiqueta}
      </button>

      {abierto && (
        <div
          className="absolute bottom-full left-0 right-0 mb-2 z-20 rounded-[10px] border border-white/[0.08] bg-[#1c1c1c] p-3.5 text-left"
          style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}
        >
          <p className="text-[11px] leading-relaxed text-white/50">{detalle}</p>
          <button
            type="button"
            onClick={() => setAbierto(false)}
            className="mt-2 text-[11px] font-bold text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
          >
            Entendido
          </button>
        </div>
      )}
    </div>
  );
}
