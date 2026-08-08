import Image from "next/image";

/** Paleta estable: el mismo nombre siempre recibe el mismo color. */
const COLORES = [
  "bg-rose-500/25 text-rose-200",
  "bg-blue-500/25 text-blue-200",
  "bg-emerald-500/25 text-emerald-200",
  "bg-amber-500/25 text-amber-200",
  "bg-violet-500/25 text-violet-200",
  "bg-cyan-500/25 text-cyan-200",
];

const hash = (texto: string) =>
  [...texto].reduce((total, letra) => total + letra.charCodeAt(0), 0);

/** Primeras letras alfanuméricas del nombre, ignorando el tag entre corchetes. */
const iniciales = (nombre: string) => {
  const limpio = nombre.replace(/\[.*?\]/g, " ").trim() || nombre;
  const letras = limpio.match(/[\p{L}\p{N}]/gu) ?? [];
  return letras.slice(0, 2).join("").toUpperCase() || "?";
};

export function Avatar({
  nombre,
  src,
  size = 34,
}: {
  nombre: string;
  src?: string;
  size?: number;
}) {
  if (src) {
    return (
      <span
        className="relative shrink-0 rounded-full overflow-hidden"
        style={{ width: size, height: size }}
      >
        <Image src={src} alt="" fill sizes={`${size}px`} className="object-cover" />
      </span>
    );
  }

  return (
    <span
      className={`shrink-0 rounded-full flex items-center justify-center font-bold ${
        COLORES[hash(nombre) % COLORES.length]
      }`}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      aria-hidden
    >
      {iniciales(nombre)}
    </span>
  );
}
