import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ancla la raíz al proyecto para que no busque lockfiles fuera de la carpeta.
  turbopack: { root: __dirname },
};

export default nextConfig;
