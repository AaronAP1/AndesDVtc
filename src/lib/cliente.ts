"use client";

import { API_PUBLICA } from "./sesion";

/**
 * Llamadas desde el navegador. Van con `credentials: "include"` para que
 * viaje la cookie `andes_session`: es la unica credencial que tiene la web.
 * El token de dispositivo lo emite el hub y no debe pasar por aqui.
 */

export class ErrorApi extends Error {
  constructor(
    readonly estado: number,
    mensaje: string,
    /** Segundos que hay que esperar. Sólo viene en los 429. */
    readonly reintentarEn?: number,
  ) {
    super(mensaje);
  }
}

/**
 * Los segundos de espera de un 429. La cabecera `Retry-After` es lo suyo,
 * pero la API de momento sólo los pone dentro del mensaje ("... en 849 s."),
 * así que se lee de donde estén.
 */
function esperaDe(cabecera: string | null, mensaje: string) {
  const deCabecera = Number(cabecera);
  if (Number.isFinite(deCabecera) && deCabecera > 0) return deCabecera;
  const enElTexto = mensaje.match(/(\d+)\s*s(?![a-z])/i);
  return enElTexto ? Number(enElTexto[1]) : undefined;
}

export async function llamar<T>(ruta: string, init?: RequestInit): Promise<T> {
  const respuesta = await fetch(`${API_PUBLICA}${ruta}`, {
    ...init,
    credentials: "include",
    headers: {
      accept: "application/json",
      ...(init?.body && !(init.body instanceof FormData)
        ? { "content-type": "application/json" }
        : {}),
      ...init?.headers,
    },
  });

  if (!respuesta.ok) {
    let mensaje = `Error ${respuesta.status}`;
    try {
      const cuerpo = await respuesta.json();
      if (cuerpo?.message) {
        mensaje = Array.isArray(cuerpo.message)
          ? cuerpo.message.join(", ")
          : cuerpo.message;
      }
    } catch {
      // Respuesta sin JSON: nos quedamos con el código.
    }
    throw new ErrorApi(
      respuesta.status,
      mensaje,
      esperaDe(respuesta.headers.get("retry-after"), mensaje),
    );
  }

  if (respuesta.status === 204) return undefined as T;
  return (await respuesta.json()) as T;
}

/**
 * Subida de un fichero con aviso de progreso. Va con XMLHttpRequest y no con
 * `fetch` porque fetch no informa de cuánto lleva subido, y en una imagen de
 * varios MB por una conexión lenta la barra es la diferencia entre esperar y
 * pensar que se ha colgado.
 */
export function subirFichero<T>(
  ruta: string,
  fichero: File,
  onProgreso?: (porcentaje: number) => void,
): Promise<T> {
  return new Promise<T>((resolver, rechazar) => {
    const cuerpo = new FormData();
    cuerpo.append("file", fichero);

    const peticion = new XMLHttpRequest();
    peticion.open("POST", `${API_PUBLICA}${ruta}`);
    // Equivale al credentials: "include" del resto de llamadas.
    peticion.withCredentials = true;
    peticion.setRequestHeader("accept", "application/json");

    peticion.upload.addEventListener("progress", (evento) => {
      if (evento.lengthComputable) {
        onProgreso?.(Math.round((evento.loaded / evento.total) * 100));
      }
    });

    peticion.addEventListener("load", () => {
      let cuerpoJson: unknown = null;
      try {
        cuerpoJson = JSON.parse(peticion.responseText);
      } catch {
        // Respuesta sin JSON: nos quedamos con el código.
      }

      if (peticion.status >= 200 && peticion.status < 300) {
        return resolver(cuerpoJson as T);
      }

      const dicho = (cuerpoJson as { message?: string | string[] } | null)
        ?.message;
      const mensaje = Array.isArray(dicho)
        ? dicho.join(", ")
        : (dicho ?? `Error ${peticion.status}`);
      rechazar(
        new ErrorApi(
          peticion.status,
          mensaje,
          esperaDe(peticion.getResponseHeader("retry-after"), mensaje),
        ),
      );
    });

    peticion.addEventListener("error", () =>
      rechazar(new ErrorApi(0, "No se pudo conectar con la API.")),
    );
    peticion.addEventListener("abort", () =>
      rechazar(new ErrorApi(0, "Subida cancelada.")),
    );

    peticion.send(cuerpo);
  });
}
