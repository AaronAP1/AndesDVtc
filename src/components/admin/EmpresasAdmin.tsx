"use client";

import Link from "next/link";
import { useState } from "react";
import { SearchIcon } from "@/components/icons";
import {
  AdminCompany,
  CambiosEmpresa,
  editarEmpresa,
  listarEmpresas,
  useRecurso,
} from "@/lib/admin";
import { km } from "@/lib/estilos";
import { ESTADOS, ESTADO_LABEL, ESTADO_STYLES } from "@/lib/presentacion";
import {
  AdminShell,
  EstadoCarga,
  PANEL,
  usePuedeAdministrar,
} from "./AdminShell";
import { Campo, Selector } from "./campos";

export function EmpresasAdmin() {
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("");
  const [editando, setEditando] = useState<AdminCompany | null>(null);

  const puede = usePuedeAdministrar();
  const { datos, cargando, error, recargar } = useRecurso(
    `empresas:${busqueda}:${filtro}`,
    () => listarEmpresas({ q: busqueda || undefined, status: filtro || undefined }),
    puede,
  );

  return (
    <AdminShell titulo="Empresas">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2.5 flex-1 min-w-0 rounded-[10px] border border-white/[0.06] bg-black/20 px-3.5 py-2.5 focus-within:border-white/15 transition-colors">
          <SearchIcon className="w-4 h-4 text-white/30 shrink-0" />
          <input
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
            placeholder="Buscar por nombre, tag o slug"
            className="flex-1 min-w-0 bg-transparent text-[13px] text-white placeholder:text-white/25 outline-none"
          />
        </div>
        <select
          value={filtro}
          onChange={(evento) => setFiltro(evento.target.value)}
          className="rounded-[10px] border border-white/[0.06] bg-black/20 px-3 py-2.5 text-[12px] text-white/60 outline-none focus:border-white/15 cursor-pointer"
        >
          <option value="" className="bg-[#141414]">
            Todos los estados
          </option>
          {ESTADOS.map((estado) => (
            <option key={estado} value={estado} className="bg-[#141414]">
              {ESTADO_LABEL[estado]}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4">
        <EstadoCarga
          cargando={cargando}
          error={error}
          vacio={(datos ?? []).length === 0}
        >
          <div className={`${PANEL} overflow-x-auto`}>
            <table className="w-full min-w-[900px] text-[12px]">
              <thead>
                <tr className="border-b border-white/[0.06] text-left text-[10px] uppercase tracking-wide text-white/25">
                  <th className="px-4 py-3 font-semibold">Empresa</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                  <th className="px-4 py-3 font-semibold">Flota</th>
                  <th className="px-4 py-3 font-semibold">Pendientes</th>
                  <th className="px-4 py-3 font-semibold">Trabajos</th>
                  <th className="px-4 py-3 font-semibold">Distancia</th>
                  <th className="px-4 py-3 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {(datos ?? []).map((empresa) => (
                  <tr key={empresa.id} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <span className="block font-semibold text-white/85">
                        {empresa.name}
                      </span>
                      <span className="block text-[10px] text-white/25">
                        {empresa.tag} · /{empresa.slug}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`flex items-center gap-1.5 ${
                          ESTADO_STYLES[empresa.status]?.text ?? "text-white/40"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            ESTADO_STYLES[empresa.status]?.dot ?? "bg-white/25"
                          }`}
                        />
                        {ESTADO_LABEL[empresa.status] ?? empresa.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 tabular-nums text-white/60">
                      {empresa.memberCount} / {empresa.maxDrivers}
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      {empresa.pendingCount > 0 ? (
                        <span className="rounded-full bg-rose-500/20 px-2 py-0.5 font-bold text-rose-300">
                          {empresa.pendingCount}
                        </span>
                      ) : (
                        <span className="text-white/20">0</span>
                      )}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-white/60">
                      {empresa.jobsCount ?? 0}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-white/60">
                      {km(empresa.totalDistanceKm ?? 0)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditando(empresa)}
                          className="rounded-[8px] border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[11px] font-semibold text-white/60 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
                        >
                          Editar
                        </button>
                        <Link
                          href={`/admin/empresas/${empresa.id}`}
                          className="rounded-[8px] border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[11px] font-semibold text-white/60 hover:text-white hover:bg-white/[0.08] transition-colors"
                        >
                          Miembros
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </EstadoCarga>
      </div>

      {editando && (
        <ModalEditar
          empresa={editando}
          onCerrar={() => setEditando(null)}
          onGuardado={() => {
            setEditando(null);
            recargar();
          }}
        />
      )}
    </AdminShell>
  );
}

function ModalEditar({
  empresa,
  onCerrar,
  onGuardado,
}: {
  empresa: AdminCompany;
  onCerrar: () => void;
  onGuardado: () => void;
}) {
  const [datos, setDatos] = useState({
    name: empresa.name,
    slug: empresa.slug,
    description: empresa.description ?? "",
    status: empresa.status,
    maxDrivers: String(empresa.maxDrivers),
    cardImageUrl: empresa.cardImageUrl ?? "",
    bannerUrl: empresa.bannerUrl ?? "",
    logoUrl: empresa.logoUrl ?? "",
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function guardar() {
    setGuardando(true);
    setError(null);

    // Sólo se manda lo que cambió: la API rechaza un cuerpo vacío y así
    // el registro de auditoría no se llena de cambios que no lo son.
    const cambios: CambiosEmpresa = {};
    if (datos.name !== empresa.name) cambios.name = datos.name;
    if (datos.slug !== empresa.slug) cambios.slug = datos.slug;
    if (datos.description !== (empresa.description ?? ""))
      cambios.description = datos.description;
    if (datos.status !== empresa.status) cambios.status = datos.status;
    if (Number(datos.maxDrivers) !== empresa.maxDrivers)
      cambios.maxDrivers = Number(datos.maxDrivers);
    if (datos.cardImageUrl !== (empresa.cardImageUrl ?? ""))
      cambios.cardImageUrl = datos.cardImageUrl;
    if (datos.bannerUrl !== (empresa.bannerUrl ?? ""))
      cambios.bannerUrl = datos.bannerUrl;
    if (datos.logoUrl !== (empresa.logoUrl ?? "")) cambios.logoUrl = datos.logoUrl;

    if (Object.keys(cambios).length === 0) {
      setGuardando(false);
      return onCerrar();
    }

    try {
      await editarEmpresa(empresa.id, cambios);
      onGuardado();
    } catch (fallo) {
      setError((fallo as Error).message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 sm:p-8"
      onClick={onCerrar}
    >
      <div
        className="w-full max-w-[560px] rounded-[10px] border border-white/[0.08] bg-[#141414] p-6"
        onClick={(evento) => evento.stopPropagation()}
      >
        <h2 className="text-[16px] font-bold text-white">Editar {empresa.name}</h2>
        <p className="mt-1 text-[11px] text-white/30">
          Desactivar no borra nada: la esconde del listado público.
        </p>

        <div className="mt-5 flex flex-col gap-4">
          <Campo
            etiqueta="Nombre"
            valor={datos.name}
            onChange={(name) => setDatos({ ...datos, name })}
          />
          <Campo
            etiqueta="Slug"
            valor={datos.slug}
            onChange={(slug) => setDatos({ ...datos, slug })}
            ayuda="Minúsculas, números y guiones. Cambia la URL pública."
          />
          <Campo
            etiqueta="Descripción"
            valor={datos.description}
            onChange={(description) => setDatos({ ...datos, description })}
            multilinea
          />
          <div className="grid grid-cols-2 gap-4">
            <Selector
              etiqueta="Estado"
              valor={datos.status}
              opciones={ESTADOS.map((estado) => ({
                valor: estado,
                label: ESTADO_LABEL[estado],
              }))}
              onChange={(status) =>
                setDatos({ ...datos, status: status as AdminCompany["status"] })
              }
            />
            <Campo
              etiqueta="Cupo"
              valor={datos.maxDrivers}
              onChange={(maxDrivers) => setDatos({ ...datos, maxDrivers })}
              tipo="number"
              ayuda="No puede quedar por debajo de los activos."
            />
          </div>
          <Campo
            etiqueta="Imagen de tarjeta (16:9)"
            valor={datos.cardImageUrl}
            onChange={(cardImageUrl) => setDatos({ ...datos, cardImageUrl })}
            marcador="https://…"
          />
          <Campo
            etiqueta="Banner (3:1)"
            valor={datos.bannerUrl}
            onChange={(bannerUrl) => setDatos({ ...datos, bannerUrl })}
            marcador="https://…"
          />
          <Campo
            etiqueta="Logo (1:1)"
            valor={datos.logoUrl}
            onChange={(logoUrl) => setDatos({ ...datos, logoUrl })}
            marcador="https://…"
          />
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
            onClick={guardar}
            disabled={guardando}
            className="rounded-[10px] bg-rose-600 hover:bg-rose-500 px-5 py-2.5 text-[12px] font-bold text-white transition-colors cursor-pointer disabled:opacity-40"
          >
            {guardando ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}
