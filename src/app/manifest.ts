import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name:             "Sanchamar · Private Concierge",
    short_name:       "Sanchamar",
    description:      "Exclusive villa services at your fingertips — private chef, massage, transfers, yoga, wine & more.",
    start_url:        "/",
    display:          "standalone",
    orientation:      "portrait",
    background_color: "#0e1826",
    theme_color:      "#c4940a",
    categories:       ["lifestyle", "travel"],
    icons: [
      {
        src:   "/icon-192.png",
        sizes: "192x192",
        type:  "image/png",
      },
      {
        src:   "/icon-512.png",
        sizes: "512x512",
        type:  "image/png",
      },
      {
        src:     "/icon-maskable-512.png",
        sizes:   "512x512",
        type:    "image/png",
        purpose: "maskable",
      },
    ],
  };
}
