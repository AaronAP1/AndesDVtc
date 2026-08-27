"use client";

import Link from "next/link";
import { useState } from "react";
import { CampoImagen } from "@/components/CampoImagen";
import { SearchIcon } from "@/components/icons";
import {
  AdminCompany,
  AdminDriver,
  CambiosEmpresa,
  NuevaEmpresa,
  crearEmpresaAdmin,
  editarEmpresa,
  listarConductores,
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
  const [creando, setCreando] = useState(false);

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
        <button
          type="button"
          onClick={() => setCreando(true)}
          className="rounded-[10px] bg-rose-600 hover:bg-rose-500 px-4 py-2.5 text-[12px] font-bold text-white transition-colors cursor-pointer shrink-0"
        >
          Crear empresa
        </button>
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

      {creando && (
        <ModalCrear
          onCerrar={() => setCreando(false)}
          onCreada={() => {
            setCreando(false);
            recargar();
          }}
        />
      )}

      {editando && (
        <ModalEditar
          empresa={editando}
          onCerrar={() => {
            setEditando(null);
            // Puede haberse subido una imagen aunque no se pulse Guardar.
            recargar();
          }}
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
  });
  // Las imágenes van por su endpoint y se guardan al elegirlas, así que no
  // entran en el cuerpo del PATCH: si entraran, guardar con este estado ya
  // viejo pisaría la que se acabara de subir.
  const [imagenes, setImagenes] = useState({
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
          <div className="border-t border-white/[0.06] pt-4">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-white/30">
              Imágenes
            </span>
            <p className="mt-1 text-[10px] text-white/25">
              Se suben al elegirlas, sin esperar a guardar.
            </p>
            <div className="mt-4 flex flex-col gap-4">
              <CampoImagen
                companyId={empresa.id}
                tipo="banner"
                url={imagenes.bannerUrl}
                onCambio={(ficha) =>
                  setImagenes({
                    cardImageUrl: ficha.cardImageUrl ?? "",
                    bannerUrl: ficha.bannerUrl ?? "",
                    logoUrl: ficha.logoUrl ?? "",
                  })
                }
              />
              <div className="grid grid-cols-2 gap-4">
                <CampoImagen
                  companyId={empresa.id}
                  tipo="card"
                  url={imagenes.cardImageUrl}
                  onCambio={(ficha) =>
                    setImagenes({
                      cardImageUrl: ficha.cardImageUrl ?? "",
                      bannerUrl: ficha.bannerUrl ?? "",
                      logoUrl: ficha.logoUrl ?? "",
                    })
                  }
                />
                <CampoImagen
                  companyId={empresa.id}
                  tipo="logo"
                  url={imagenes.logoUrl}
                  onCambio={(ficha) =>
                    setImagenes({
                      cardImageUrl: ficha.cardImageUrl ?? "",
                      bannerUrl: ficha.bannerUrl ?? "",
                      logoUrl: ficha.logoUrl ?? "",
                    })
                  }
                />
              </div>
            </div>
          </div>
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

/**
 * Alta de una empresa desde el panel. Antes no había ningún camino:
 * `POST /v1/companies` deja como propietario a quien llama —que aquí sería
 * el administrador, no el líder de la VTC—, así que registrar una empresa
 * para otra persona pasaba por tocar la base de datos a mano.
 */
function ModalCrear({
  onCerrar,
  onCreada,
}: {
  onCerrar: () => void;
  onCreada: () => void;
}) {
  const [datos, setDatos] = useState({
    name: "",
    tag: "",
    slug: "",
    description: "",
    maxDrivers: "15",
  });
  const [lider, setLider] = useState<AdminDriver | null>(null);
  const [creando, setCreando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const valido =
    datos.name.trim().length >= 3 &&
    /^[A-Z0-9]{2,8}$/.test(datos.tag.trim().toUpperCase());

  async function crear() {
    setCreando(true);
    setError(null);

    const cuerpo: NuevaEmpresa = {
      name: datos.name.trim(),
      tag: datos.tag.trim().toUpperCase(),
    };
    if (datos.slug.trim()) cuerpo.slug = datos.slug.trim();
    if (datos.description.trim()) cuerpo.description = datos.description.trim();
    if (Number(datos.maxDrivers) > 0) cuerpo.maxDrivers = Number(datos.maxDrivers);
    if (lider) cuerpo.ownerDriverId = lider.id;

    try {
      await crearEmpresaAdmin(cuerpo);
      onCreada();
    } catch (fallo) {
      setError((fallo as Error).message);
      setCreando(false);
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
        <h2 className="text-[16px] font-bold text-white">Crear empresa</h2>
        <p className="mt-1 text-[11px] leading-relaxed text-white/30">
          Con un líder elegido, la empresa nace con su propietario puesto en la
          misma operación. Sin él queda sin dueño y hay que asignarlo desde
          Miembros.
        </p>

        <div className="mt-5 flex flex-col gap-4">
          <Campo
            etiqueta="Nombre"
            valor={datos.name}
            onChange={(name) => setDatos({ ...datos, name })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Campo
              etiqueta="Tag"
              valor={datos.tag}
              onChange={(tag) => setDatos({ ...datos, tag: tag.toUpperCase() })}
              ayuda="2 a 8, mayúsculas y números."
            />
            <Campo
              etiqueta="Cupo"
              valor={datos.maxDrivers}
              onChange={(maxDrivers) => setDatos({ ...datos, maxDrivers })}
              tipo="number"
            />
          </div>
          <Campo
            etiqueta="Slug"
            valor={datos.slug}
            onChange={(slug) => setDatos({ ...datos, slug })}
            ayuda="Opcional: si lo dejas vacío se genera del nombre."
          />
          <Campo
            etiqueta="Descripción"
            valor={datos.description}
            onChange={(description) => setDatos({ ...datos, description })}
            multilinea
          />
          <BuscadorLider seleccionado={lider} onElegir={setLider} />
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
            disabled={creando || !valido}
            className="rounded-[10px] bg-rose-600 hover:bg-rose-500 px-5 py-2.5 text-[12px] font-bold text-white transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {creando ? "Creando…" : "Crear empresa"}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Busca al conductor que quedará como propietario. */
function BuscadorLider({
  seleccionado,
  onElegir,
}: {
  seleccionado: AdminDriver | null;
  onElegir: (conductor: AdminDriver | null) => void;
}) {
  const [busqueda, setBusqueda] = useState("");

  const { datos, cargando } = useRecurso(
    `lider:${busqueda}`,
    () => listarConductores({ q: busqueda || undefined, limit: 6 }),
    busqueda.trim().length >= 2,
  );

  if (seleccionado) {
    return (
      <div className="flex items-center gap-3 rounded-[10px] border border-white/[0.08] bg-black/20 px-3.5 py-2.5">
        <span className="min-w-0 flex-1">
          <span className="block text-[10px] uppercase tracking-wide text-white/30">
            Propietario
          </span>
          <span className="block text-[13px] font-semibold text-white/85 truncate">
            {seleccionado.displayName}
          </span>
        </span>
        <button
          type="button"
          onClick={() => onElegir(null)}
          className="text-[11px] font-semibold text-white/40 hover:text-white transition-colors cursor-pointer shrink-0"
        >
          Quitar
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-white/30">
        Propietario
      </span>
      <div className="flex items-center gap-2.5 rounded-[10px] border border-white/[0.08] bg-black/20 px-3.5 py-2.5 focus-within:border-white/20 transition-colors">
        <SearchIcon className="w-4 h-4 text-white/30 shrink-0" />
        <input
          value={busqueda}
          onChange={(evento) => setBusqueda(evento.target.value)}
          placeholder="Buscar conductor por nombre"
          className="flex-1 min-w-0 bg-transparent text-[13px] text-white placeholder:text-white/20 outline-none"
        />
      </div>

      {busqueda.trim().length >= 2 && (
        <div className="rounded-[10px] border border-white/[0.06] bg-black/20 divide-y divide-white/[0.06] max-h-[180px] overflow-y-auto">
          {cargando && (
            <p className="px-3.5 py-2.5 text-[11px] text-white/25">Buscando…</p>
          )}
          {!cargando && (datos?.items ?? []).length === 0 && (
            <p className="px-3.5 py-2.5 text-[11px] text-white/25">
              Ningún conductor coincide.
            </p>
          )}
          {(datos?.items ?? []).map((conductor) => (
            <button
              key={conductor.id}
              type="button"
              onClick={() => onElegir(conductor)}
              className="w-full text-left px-3.5 py-2.5 hover:bg-white/[0.04] transition-colors cursor-pointer"
            >
              <span className="block text-[12px] font-semibold text-white/80 truncate">
                {conductor.displayName}
              </span>
              <span className="block text-[10px] text-white/25">
                {conductor.companyName
                  ? `Ya está en ${conductor.companyName}`
                  : "Sin empresa"}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
