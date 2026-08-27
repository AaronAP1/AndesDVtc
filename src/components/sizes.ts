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
 * Las tarjetas del listado van fijas en "X Wide" (16:9). El selector que
 * dejaba elegir otra proporción se retiró cuando ese hueco pasó a ser el
 * botón del Top.
 */
export const LOCKED_SIZE: SizeId = "wide";

export const getSize = (id: SizeId): SizeOption =>
  SIZE_OPTIONS.find((option) => option.id === id) ?? SIZE_OPTIONS[1];
