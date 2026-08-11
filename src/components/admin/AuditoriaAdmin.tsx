"use client";

import { useState } from "react";
import { AuditEntry, listarAuditoria, useRecurso } from "@/lib/admin";
import { fechaHora } from "@/lib/estilos";
import {
  AdminShell,
  EstadoCarga,
  PANEL,
  usePuedeAdministrar,
} from "./AdminShell";

export function AuditoriaAdmin() {
  const [limite, setLimite] = useState(100);
  const puede = usePuedeAdministrar();
  const { datos, cargando, error } = useRecurso(
    `auditoria:${limite}`,
    () => listarAuditoria(limite),
    puede,
  );

  const entradas = datos ?? [];

  return (
    <AdminShell titulo="Auditoría">
      <p className="text-[12px] text-white/35">
        Registro de solo lectura: queda constancia de quién cambió qué, con el
        antes y el después. No hay forma de editarlo ni borrarlo.
      </p>

      <div className="mt-4 flex items-center gap-2.5">
        <span className="text-[11px] text-white/30">Mostrar</span>
        <select
          value={limite}
          onChange={(evento) => setLimite(Number(evento.target.value))}
          className="rounded-[8px] border border-white/[0.08] bg-black/20 px-2.5 py-1.5 text-[11px] text-white/60 outline-none focus:border-white/20 cursor-pointer"
        >
          {[50, 100, 250].map((valor) => (
            <option key={valor} value={valor} className="bg-[#141414]">
              {valor} entradas
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4">
        <EstadoCarga
          cargando={cargando}
          error={error}
          vacio={entradas.length === 0}
        >
          <ul className={`${PANEL} divide-y divide-white/[0.06]`}>
            {entradas.map((entrada) => (
              <Fila key={entrada.id} entrada={entrada} />
            ))}
          </ul>
        </EstadoCarga>
      </div>
    </AdminShell>
  );
}

function Fila({ entrada }: { entrada: AuditEntry }) {
  const [abierto, setAbierto] = useState(false);
  const hayDetalle =
    entrada.before != null || entrada.after != null;

  return (
    <li className="px-4 py-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12px]">
        <span className="font-semibold text-white/75">
          {entrada.actorName ?? entrada.actorId?.slice(0, 8) ?? "—"}
        </span>
        <code className="rounded bg-black/30 px-1.5 py-0.5 text-[11px] text-rose-300/80">
          {entrada.action}
        </code>
        {entrada.targetType && (
          <span className="text-white/30">
            {entrada.targetType}{" "}
            <span className="text-white/20">
              {entrada.targetId?.slice(0, 8)}
            </span>
          </span>
        )}
        {hayDetalle && (
          <button
            type="button"
            onClick={() => setAbierto((previo) => !previo)}
            className="text-[11px] font-semibold text-white/35 hover:text-white transition-colors cursor-pointer"
          >
            {abierto ? "Ocultar cambios" : "Ver cambios"}
          </button>
        )}
        <span className="ml-auto text-white/25 tabular-nums">
          {entrada.createdAt ? fechaHora(entrada.createdAt) : ""}
        </span>
      </div>

      {abierto && hayDetalle && (
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Bloque titulo="Antes" valor={entrada.before} />
          <Bloque titulo="Después" valor={entrada.after} />
        </div>
      )}
    </li>
  );
}

function Bloque({ titulo, valor }: { titulo: string; valor: unknown }) {
  return (
    <div className="rounded-[8px] border border-white/[0.06] bg-black/20 p-3">
      <p className="text-[10px] uppercase tracking-wide text-white/25">
        {titulo}
      </p>
      <pre className="mt-1.5 overflow-x-auto text-[11px] leading-relaxed text-white/50">
        {valor == null ? "—" : JSON.stringify(valor, null, 2)}
      </pre>
    </div>
  );
}
