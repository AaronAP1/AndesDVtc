const KEY_SHADOW =
  "inset 0 -1px 0 rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)";

export function Kbd({
  children,
  small = false,
}: {
  children: React.ReactNode;
  small?: boolean;
}) {
  const sizeClasses = small
    ? "min-w-[20px] h-[18px] text-[9px] text-white/35"
    : "min-w-[22px] h-[20px] text-[10px] text-white/40";

  return (
    <span
      className={`inline-flex items-center justify-center px-1 rounded font-semibold ${sizeClasses}`}
      style={{ background: "rgba(255,255,255,0.06)", boxShadow: KEY_SHADOW }}
    >
      {children}
    </span>
  );
}
