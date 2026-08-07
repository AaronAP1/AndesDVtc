"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDownIcon } from "./icons";
import { LOCKED_SIZE, SIZE_OPTIONS, SizeId, getSize } from "./sizes";

const PANEL_SHADOW =
  "0 8px 32px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.06)";
const TRIGGER_SHADOW =
  "0 4px 4px rgba(0,0,0,0.3), 0 1px 0 rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.06)";

export function SizeSelector({ value }: { value: SizeId }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const current = getSize(value);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="absolute top-5 right-5 z-30">
      <div className="relative" ref={wrapperRef}>
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="backdrop-blur-xl bg-[#0D0D0D]/80 flex items-center gap-2 px-3.5 py-3 rounded-[10px] cursor-pointer"
          style={{ boxShadow: TRIGGER_SHADOW }}
        >
          <span className="font-bold text-[12px] text-white">
            {current.label}
          </span>
          <ChevronDownIcon
            className={`w-3.5 h-3.5 text-white/40 transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>

        {open && (
          <div
            className="absolute top-full right-0 mt-2 backdrop-blur-xl bg-[#1c1c1c]/95 rounded-[10px] overflow-hidden py-1 min-w-[160px] z-50 origin-top"
            style={{
              boxShadow: PANEL_SHADOW,
              animation: "fadeIn 120ms ease-out both",
            }}
          >
            {SIZE_OPTIONS.map((option) => {
              const active = option.id === value;
              return (
                <button
                  key={option.id}
                  type="button"
                  // El tamaño está bloqueado en X Wide, sólo esa opción responde.
                  disabled={option.id !== LOCKED_SIZE}
                  onClick={() => setOpen(false)}
                  className={`w-full text-left px-4 py-2.5 font-bold text-[12px] transition-all ${
                    active
                      ? "text-white bg-white/10"
                      : "text-white/40 hover:text-white/70 hover:bg-white/5 disabled:hover:text-white/40 disabled:hover:bg-transparent disabled:cursor-default"
                  }`}
                >
                  {option.label}
                  <span className="ml-2 text-[10px] text-white/20 font-normal">
                    {option.ratio}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
