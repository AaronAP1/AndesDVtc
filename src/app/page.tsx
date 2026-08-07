"use client";

import { Kbd } from "@/components/Kbd";
import { SizeSelector } from "@/components/SizeSelector";
import { TemplateGrid } from "@/components/TemplateGrid";
import { UploadIcon } from "@/components/icons";
import { LOCKED_SIZE } from "@/components/sizes";

const PILL_SHADOW =
  "0 4px 4px rgba(0,0,0,0.3), 0 1px 0 rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.06)";
const CTA_SHADOW =
  "0 2px 12px rgba(255,255,255,0.15), 0 0 0 1px rgba(255,255,255,0.1)";

const SHORTCUTS: { keys: string[]; label: string }[] = [
  { keys: ["⌘", "V"], label: "Paste image" },
  { keys: ["⌘", "Z"], label: "Undo" },
  { keys: ["←", "→"], label: "Navigate" },
  { keys: ["Esc"], label: "Back to grid" },
  { keys: ["Enter"], label: "Edit card" },
];

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
        className="absolute top-0 left-0 right-0 h-24 z-20 pointer-events-none"
        style={{
          background:
            "linear-gradient(rgba(13,13,13,0.95) 0%, rgba(13,13,13,0.7) 50%, transparent 100%)",
        }}
      />

      <div className="absolute top-5 left-5 z-30 flex items-center gap-2.5">
        <div
          className="backdrop-blur-xl bg-[#0D0D0D]/80 flex items-center gap-2.5 px-[18px] py-3 rounded-[10px]"
          style={{ boxShadow: PILL_SHADOW }}
        >
          <span className="font-bold text-[12px] text-white">AndesMp | EMPRESAS</span>
        </div>
      </div>

      <SizeSelector value={LOCKED_SIZE} />

      <div
        className="absolute inset-0 z-10 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: "none" }}
      >
        <div
          className="flex flex-col items-center"
          style={{ paddingTop: 92, paddingBottom: 52 }}
        >
          <div className="text-center max-w-2xl px-4">
            <h1
              className="text-white text-[clamp(32px,5vw,56px)] tracking-[-0.03em] font-bold"
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
              <br />
              <span
                className="inline-block"
                style={{ animation: "riseIn 600ms ease-out 270ms both" }}
              >
                Oficial.
              </span>
            </h1>
            <p
              className="text-white/35 text-[clamp(14px,1.6vw,17px)] mt-4 max-w-md mx-auto"
              style={{
                lineHeight: 1.6,
                animation: "riseIn 600ms ease-out 380ms both",
              }}
            >
              Empresas registradas en AndesMP, 
              <br />
              Cada una, una experiencia única.
            </p>
          </div>

          <div
            className="mt-7 flex flex-col items-center"
            style={{ animation: "riseIn 600ms ease-out 480ms both" }}
          >
            <button
              type="button"
              className="relative flex items-center gap-2.5 px-7 py-3.5 bg-white rounded-xl text-[#1e1e1e] hover:bg-white/90 transition-all cursor-pointer"
              style={{ boxShadow: CTA_SHADOW }}
            >
              <span
                className="absolute inset-0 rounded-xl"
                style={{
                  boxShadow:
                    "0 0 20px 4px rgba(255,255,255,0.12), 0 0 40px 8px rgba(255,255,255,0.06)",
                  animation: "heroGlow 3s ease-in-out infinite",
                }}
              />
              <UploadIcon className="w-4 h-4 relative z-[1]" />
              <span className="text-[13px] font-bold relative z-[1]">
                Upload image
              </span>
            </button>

            <div className="flex items-center gap-2 mt-3.5 text-[12px] text-white/20">
              <span>or drag &amp; drop</span>
              <span className="text-white/10">·</span>
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-0.5">
                  <Kbd small>Ctrl</Kbd>
                  <Kbd small>V</Kbd>
                </div>
                <span className="text-white/20">paste from clipboard</span>
              </div>
            </div>
          </div>

          <div className="w-full mt-8">
            <TemplateGrid size={LOCKED_SIZE} />
          </div>

          <div
            className="flex flex-col items-center gap-6 py-10"
            style={{ paddingLeft: 20, paddingRight: 20 }}
          >
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
              {SHORTCUTS.map((shortcut) => (
                <div key={shortcut.label} className="flex items-center gap-1.5">
                  <div className="flex items-center gap-0.5">
                    {shortcut.keys.map((key) => (
                      <Kbd key={key}>{key}</Kbd>
                    ))}
                  </div>
                  <span className="text-[11px] text-white/20">
                    {shortcut.label}
                  </span>
                </div>
              ))}
            </div>

            <span className="text-[12px] text-white/25 flex items-center gap-1.5">
              Created by
              <a
                href="https://x.com/dannpetty"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/40 hover:text-white/70 transition-colors"
              >
                @DannPetty
              </a>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
