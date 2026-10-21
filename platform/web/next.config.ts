import type { NextConfig } from "next";

const apiUrl = process.env.API_URL ?? "http://localhost:8080";

const nextConfig: NextConfig = {
  // Image Docker minimale ; Vercel (variable VERCEL définie à la compilation) a son propre format.
  output: process.env.VERCEL ? undefined : "standalone",
  experimental: {
    // Les requêtes relayées vers l'API sont coupées après 30 s par défaut : trop court pour
    // envoyer une vidéo de cours depuis le studio.
    proxyTimeout: 10 * 60 * 1000,
  },
  // Le navigateur appelle /api/* sur la même origine que le site : les cookies
  // d'authentification (étape 3) restent first-party et SameSite=Lax suffit.
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${apiUrl}/api/:path*` },
      // Parcours OAuth (Google, GitHub) : départ et retour passent par le domaine du site.
      { source: "/oauth2/:path*", destination: `${apiUrl}/oauth2/:path*` },
      { source: "/login/oauth2/:path*", destination: `${apiUrl}/login/oauth2/:path*` },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
};

export default nextConfig;
