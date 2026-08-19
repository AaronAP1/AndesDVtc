import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ancla la raíz al proyecto para que no busque lockfiles fuera de la carpeta.
  turbopack: { root: __dirname },
  // Genera .next/standalone: un server.js con solo las dependencias que usa,
  // para que la imagen de Docker no cargue con todo node_modules.
  output: "standalone",
};

export default nextConfig;
