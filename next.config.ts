import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // O indicador do modo dev ficava por cima do "Sair" no rodapé do menu lateral.
  devIndicators: { position: "bottom-right" },
};

export default nextConfig;
