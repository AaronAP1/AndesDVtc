"use client";

import { SizeSelector } from "@/components/SizeSelector";
import { TemplateGrid } from "@/components/TemplateGrid";
import { LOCKED_SIZE } from "@/components/sizes";

const PILL_SHADOW =
  "0 4px 4px rgba(0,0,0,0.3), 0 1px 0 rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.06)";

const HERO_WORDS = ["Andes", "Map", "Empresas"];

export default function Home() {
  return (
    <div className="flex flex-col items-center size-full bg-[#0D0D0D] select-none overflow-hidden relative min-h-screen">
      {/* Patrón de puntos con deriva lenta */}
      <div
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, #ffffff 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          animation: "dotDrift 60s linear infinite",
        }}
      />

      {/* Degradado superior que funde la barra con el contenido */}
      <div
        className="absolute top-0 left-0 right-0 h-20 sm:h-24 z-20 pointer-events-none"
        style={{
          background:
            "linear-gradient(rgba(13,13,13,0.95) 0%, rgba(13,13,13,0.7) 50%, transparent 100%)",
        }}
      />

      <div className="absolute top-3 left-3 sm:top-5 sm:left-5 z-30 flex items-center gap-2.5">
        <div
          className="backdrop-blur-xl bg-[#0D0D0D]/80 flex items-center gap-2.5 px-3 py-2.5 sm:px-[18px] sm:py-3 rounded-[10px]"
          style={{ boxShadow: PILL_SHADOW }}
        >
          <span className="font-bold text-[11px] sm:text-[12px] text-white whitespace-nowrap">
            AndesMp | EMPRESAS
          </span>
        </div>
      </div>

      <SizeSelector value={LOCKED_SIZE} />

      <div
        className="absolute inset-0 z-10 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: "none" }}
      >
        <div className="flex flex-col items-center pt-[76px] pb-10 sm:pt-[92px] sm:pb-[52px]">
          <div className="text-center max-w-2xl px-4">
            <h1
              className="text-white text-[clamp(28px,7vw,56px)] tracking-[-0.03em] font-bold text-balance"
              style={{ lineHeight: 1.1 }}
            >
              {HERO_WORDS.map((word, index) => (
                <span
                  key={word}
                  className="inline-block"
                  style={{
                    marginRight: "0.3em",
                    animation: `riseIn 600ms ease-out ${index * 90}ms both`,
                  }}
                >
                  {word}
                </span>
              ))}
              <br className="hidden sm:block" />
              <span
                className="inline-block"
                style={{ animation: "riseIn 600ms ease-out 270ms both" }}
              >
                Oficial.
              </span>
            </h1>
            <p
              className="text-white/35 text-[clamp(13px,3.4vw,17px)] mt-3 sm:mt-4 max-w-md mx-auto text-balance"
              style={{
                lineHeight: 1.6,
                animation: "riseIn 600ms ease-out 380ms both",
              }}
            >
              Empresas registradas en AndesMP,
              <br className="hidden sm:block" /> Cada una, una experiencia
              única.
            </p>
          </div>

          <div className="w-full mt-7 sm:mt-9">
            <TemplateGrid size={LOCKED_SIZE} />
          </div>

          <div className="flex flex-col items-center gap-6 px-4 sm:px-5 py-8 sm:py-10">
            <span className="text-[12px] text-white/25 flex items-center gap-1.5">
              Creado por
              <a
                href="https://andesmp.site"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/40 hover:text-white/70 transition-colors"
              >
                @TeamAndesMP
              </a>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
