import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mis Entradas",
    short_name: "Mis Entradas",
    description: "Entradas para eventos y fiestas, con QR al instante",
    start_url: "/",
    display: "standalone",
    background_color: "#0b0a12",
    theme_color: "#0b0a12",
    lang: "es-AR",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
