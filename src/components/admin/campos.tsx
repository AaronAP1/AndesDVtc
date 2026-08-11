"use client";

const BASE =
  "w-full rounded-[10px] border border-white/[0.08] bg-black/20 px-3.5 py-2.5 text-[13px] text-white placeholder:text-white/20 outline-none focus:border-white/20 transition-colors";

export function Campo({
  etiqueta,
  valor,
  onChange,
  multilinea = false,
  marcador,
  ayuda,
  tipo = "text",
}: {
  etiqueta: string;
  valor: string;
  onChange: (valor: string) => void;
  multilinea?: boolean;
  marcador?: string;
  ayuda?: string;
  tipo?: "text" | "number";
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-white/30">
        {etiqueta}
      </span>
      {multilinea ? (
        <textarea
          value={valor}
          onChange={(evento) => onChange(evento.target.value)}
          rows={3}
          placeholder={marcador}
          className={`${BASE} resize-y`}
        />
      ) : (
        <input
          type={tipo}
          value={valor}
          onChange={(evento) => onChange(evento.target.value)}
          placeholder={marcador}
          className={BASE}
        />
      )}
      {ayuda && <span className="text-[10px] text-white/25">{ayuda}</span>}
    </label>
  );
}

export function Selector({
  etiqueta,
  valor,
  opciones,
  onChange,
}: {
  etiqueta: string;
  valor: string;
  opciones: { valor: string; label: string }[];
  onChange: (valor: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-white/30">
        {etiqueta}
      </span>
      <select
        value={valor}
        onChange={(evento) => onChange(evento.target.value)}
        className={`${BASE} cursor-pointer`}
      >
        {opciones.map((opcion) => (
          <option key={opcion.valor} value={opcion.valor} className="bg-[#141414]">
            {opcion.label}
          </option>
        ))}
      </select>
    </label>
  );
}
