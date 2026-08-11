"use client";

import { useEffect, useState } from "react";

/** La URL sí lleva NEXT_PUBLIC_: el navegador llama a la API con la cookie. */
export const API_PUBLICA =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export type Sesion = {
  driverId: string;
  displayName: string;
  steamId: string | null;
  avatarUrl: string;
  platformRole: "driver" | "admin" | "superadmin";
  companyId: string | null;
  companyRole: "owner" | "manager" | "driver" | null;
};

export type EstadoSesion =
  | { estado: "cargando" }
  | { estado: "invitado" }
  | { estado: "dentro"; sesion: Sesion };

/**
 * Pregunta a la API quién está conectado. Un 401 no es un error: significa
 * que no hay sesión y toca mostrar el botón de entrar.
 */
export function useSesion(): EstadoSesion {
  const [valor, setValor] = useState<EstadoSesion>({ estado: "cargando" });

  useEffect(() => {
    let vigente = true;

    fetch(`${API_PUBLICA}/v1/auth/web/me`, { credentials: "include" })
      .then(async (respuesta) => {
        if (!vigente) return;
        if (!respuesta.ok) return setValor({ estado: "invitado" });
        setValor({ estado: "dentro", sesion: await respuesta.json() });
      })
      .catch(() => vigente && setValor({ estado: "invitado" }));

    return () => {
      vigente = false;
    };
  }, []);

  return valor;
}

/** Lleva a Steam y vuelve a la ruta indicada (solo rutas internas). */
export function entrar(volverA: string) {
  const destino = volverA.startsWith("/") ? volverA : "/";
  // Navegación completa a propósito: el login de Steam sale del dominio y
  // vuelve con la cookie puesta, así que el router de Next no sirve aquí.
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  window.location.href = `${API_PUBLICA}/v1/auth/web/steam?next=${encodeURIComponent(
    destino,
  )}`;
}

export async function salir() {
  await fetch(`${API_PUBLICA}/v1/auth/web/logout`, {
    method: "POST",
    credentials: "include",
  });
  window.location.reload();
}
