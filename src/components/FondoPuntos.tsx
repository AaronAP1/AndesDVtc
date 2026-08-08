/** Patrón de puntos con deriva lenta, compartido por todas las vistas. */
export function FondoPuntos() {
  return (
    <>
      <div
        className="fixed inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, #ffffff 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          animation: "dotDrift 60s linear infinite",
        }}
      />
      <div
        className="fixed top-0 left-0 right-0 h-20 sm:h-24 z-20 pointer-events-none"
        style={{
          background:
            "linear-gradient(rgba(13,13,13,0.95) 0%, rgba(13,13,13,0.7) 50%, transparent 100%)",
        }}
      />
    </>
  );
}
