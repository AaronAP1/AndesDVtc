export type SizeId = "square" | "wide" | "story" | "contra";

export type SizeOption = {
  id: SizeId;
  label: string;
  ratio: string;
  /** padding-bottom que reproduce el aspect ratio de la tarjeta */
  paddingBottom: string;
};

export const SIZE_OPTIONS: SizeOption[] = [
  { id: "square", label: "X / IG Square", ratio: "1:1", paddingBottom: "100%" },
  { id: "wide", label: "X Wide", ratio: "16:9", paddingBottom: "56.25%" },
  { id: "story", label: "IG Story/Reel", ratio: "9:16", paddingBottom: "177.78%" },
  { id: "contra", label: "Contra", ratio: "4:3", paddingBottom: "75%" },
];

/**
 * El selector de tamaño queda fijado en "X Wide": es el valor inicial y el
 * único seleccionable. Para permitir el cambio, borra `LOCKED_SIZE` y deja que
 * `SizeSelector` actualice el estado con la opción elegida.
 */
export const LOCKED_SIZE: SizeId = "wide";

export const getSize = (id: SizeId): SizeOption =>
  SIZE_OPTIONS.find((option) => option.id === id) ?? SIZE_OPTIONS[1];
