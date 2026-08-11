"use client";

import Link from "next/link";
import { listarAuditoria, listarEmpresas, useRecurso } from "@/lib/admin";
import { fechaHora, km } from "@/lib/estilos";
import {
  AdminShell,
  EstadoCarga,
  PANEL,
  usePuedeAdministrar,
} from "./AdminShell";

export function ResumenAdmin() {
  const puede = usePuedeAdministrar();
  const empresas = useRecurso("empresas", () => listarEmpresas(), puede);
  const auditoria = useRecurso("auditoria:8", () => listarAuditoria(8), puede);

  const lista = empresas.datos ?? [];
  const activas = lista.filter((e) => e.status === "active").length;
  const reclutando = lista.filter((e) => e.status === "recruiting").length;
  const inactivas = lista.filter((e) => e.status === "inactive").length;
  const conductores = lista.reduce((total, e) => total + (e.memberCount ?? 0), 0);
  const pendientes = lista.reduce((total, e) => total + (e.pendingCount ?? 0), 0);
  const distancia = lista.reduce(
    (total, e) => total + Number(e.totalDistanceKm ?? 0),
    0,
  );

  return (
    <AdminShell titulo="Resumen">
      <EstadoCarga cargando={empresas.cargando} error={empresas.error}>
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <Ficha valor={String(lista.length)} etiqueta="Empresas" color="text-violet-400" />
          <Ficha valor={String(activas)} etiqueta="Activas" color="text-emerald-400" />
          <Ficha valor={String(reclutando)} etiqueta="Reclutando" color="text-blue-400" />
          <Ficha valor={String(inactivas)} etiqueta="Inactivas" color="text-white/50" />
          <Ficha valor={String(conductores)} etiqueta="Conductores" color="text-orange-400" />
          <Ficha
            valor={String(pendientes)}
            etiqueta="Solicitudes"
            color={pendientes > 0 ? "text-rose-400" : "text-white/50"}
          />
        </div>

        <p className="mt-4 text-[12px] text-white/30">
          Distancia acumulada por todas las empresas: {km(distancia)}.
        </p>

        <div className="mt-6 flex flex-wrap gap-2.5">
          <Acceso href="/admin/empresas">Gestionar empresas</Acceso>
          <Acceso href="/admin/conductores">Gestionar conductores</Acceso>
          <Acceso href="/admin/auditoria">Ver auditoría</Acceso>
        </div>
      </EstadoCarga>

      <div className="mt-8">
        <h2 className="text-[13px] font-bold text-white/80">
          Últimos movimientos
        </h2>
        <div className="mt-3">
          <EstadoCarga
            cargando={auditoria.cargando}
            error={auditoria.error}
            vacio={(auditoria.datos ?? []).length === 0}
          >
            <ul className={`${PANEL} divide-y divide-white/[0.06]`}>
              {(auditoria.datos ?? []).map((entrada) => (
                <li
                  key={entrada.id}
                  className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 text-[12px]"
                >
                  <span className="font-semibold text-white/70">
                    {entrada.actorName ?? entrada.actorId}
                  </span>
                  <code className="rounded bg-black/30 px-1.5 py-0.5 text-[11px] text-rose-300/80">
                    {entrada.action}
                  </code>
                  {entrada.targetType && (
                    <span className="text-white/30">
                      {entrada.targetType} {entrada.targetId?.slice(0, 8)}
                    </span>
                  )}
                  <span className="ml-auto text-white/25 tabular-nums">
                    {fechaHora(entrada.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          </EstadoCarga>
        </div>
      </div>
    </AdminShell>
  );
}

function Ficha({
  valor,
  etiqueta,
  color,
}: {
  valor: string;
  etiqueta: string;
  color: string;
}) {
  return (
    <div className={`${PANEL} px-5 py-5`}>
      <span className={`block text-[24px] font-bold tracking-[-0.02em] ${color}`}>
        {valor}
      </span>
      <span className="mt-1 block text-[12px] text-white/40">{etiqueta}</span>
    </div>
  );
}

function Acceso({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-[10px] border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-[12px] font-semibold text-white/60 hover:text-white hover:bg-white/[0.08] transition-colors"
    >
      {children}
    </Link>
  );
}
