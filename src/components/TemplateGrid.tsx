"use client";

import { useEffect, useState } from "react";
import { SizeId, getSize } from "./sizes";

const SHIMMER =
  "linear-gradient(110deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.07) 40%, rgba(255,255,255,0.03) 60%)";

type Template = {
  name: string;
  tag: string;
  background: string;
};

const TEMPLATES: Template[] = [
  { name: "Gradient Mesh", tag: "Template", background: "linear-gradient(135deg, #ff7a45 0%, #d93f6b 50%, #6d28d9 100%)" },
  { name: "Deep Ocean", tag: "Template", background: "linear-gradient(160deg, #0f2027 0%, #203a43 45%, #2c5364 100%)" },
  { name: "Soft Paper", tag: "Template", background: "linear-gradient(135deg, #f4f1ea 0%, #ded7c7 100%)" },
  { name: "Midnight Grid", tag: "Template", background: "linear-gradient(135deg, #111827 0%, #1f2937 60%, #374151 100%)" },
  { name: "Sunset Fade", tag: "Template", background: "linear-gradient(135deg, #fbbf24 0%, #f97316 45%, #db2777 100%)" },
  { name: "Mint Studio", tag: "Template", background: "linear-gradient(135deg, #0f766e 0%, #14b8a6 55%, #a7f3d0 100%)" },
  { name: "Violet Haze", tag: "Template", background: "linear-gradient(135deg, #4c1d95 0%, #7c3aed 50%, #c4b5fd 100%)" },
  { name: "Carbon", tag: "Template", background: "linear-gradient(135deg, #18181b 0%, #27272a 50%, #3f3f46 100%)" },
  { name: "Coral Pop", tag: "Template", background: "linear-gradient(135deg, #fb7185 0%, #f43f5e 50%, #881337 100%)" },
  { name: "Blueprint", tag: "Template", background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 55%, #93c5fd 100%)" },
  { name: "Sand Dune", tag: "Template", background: "linear-gradient(135deg, #d6bb96 0%, #b08968 55%, #7f5539 100%)" },
  { name: "Neon Line", tag: "Template", background: "linear-gradient(135deg, #052e16 0%, #15803d 50%, #bbf7d0 100%)" },
];

const COLUMNS = 3;

export function TemplateGrid({ size }: { size: SizeId }) {
  const [loading, setLoading] = useState(true);
  const { paddingBottom } = getSize(size);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 900);
    return () => window.clearTimeout(timer);
  }, []);

  const columns = Array.from({ length: COLUMNS }, (_, column) =>
    TEMPLATES.filter((_, index) => index % COLUMNS === column),
  );

  return (
    <div style={{ padding: "0 20px 20px" }}>
      <div className="flex" style={{ gap: 20 }}>
        {columns.map((items, columnIndex) => (
          <div
            key={columnIndex}
            className="flex-1 flex flex-col"
            style={{ gap: 20 }}
          >
            {items.map((template, itemIndex) => {
              const delay = (columnIndex + itemIndex * COLUMNS) * 45;
              return (
                <div
                  key={template.name}
                  style={{
                    animation: `riseIn 500ms ease-out ${400 + delay}ms both`,
                  }}
                >
                  <div
                    className="relative w-full rounded-[10px] overflow-hidden"
                    style={{ paddingBottom }}
                  >
                    {loading ? (
                      <div
                        className="absolute inset-0"
                        style={{
                          background: SHIMMER,
                          backgroundSize: "200% 100%",
                          animation: "shimmer 2s ease-in-out infinite",
                        }}
                      />
                    ) : (
                      <button
                        type="button"
                        className="absolute inset-0 cursor-pointer transition-transform duration-300 hover:scale-[1.015]"
                        style={{ background: template.background }}
                      >
                        <span
                          className="absolute inset-0"
                          style={{
                            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)",
                            borderRadius: 10,
                          }}
                        />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-2.5 px-0.5">
                    {loading ? (
                      <>
                        <div
                          className="h-3 rounded-full"
                          style={{ width: 72, background: "rgba(255,255,255,0.04)" }}
                        />
                        <div
                          className="h-2.5 rounded-full"
                          style={{ width: 56, background: "rgba(255,255,255,0.03)" }}
                        />
                      </>
                    ) : (
                      <>
                        <span className="text-[11px] font-semibold text-white/45">
                          {template.name}
                        </span>
                        <span className="text-[10px] text-white/20">
                          {template.tag}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
