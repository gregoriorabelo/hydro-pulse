import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";

// Tudo que o app carrega é do próprio domínio (imagens em /public, fonte via
// next/font que é auto-hospedada) — a única chamada externa do navegador é o
// beacon de erros do Sentry. 'unsafe-inline' fica em script-src e style-src
// porque o Next.js injeta scripts de hidratação e o Tailwind pode gerar
// estilos inline; sem poder testar direto no domínio de produção, prefiro
// isso a arriscar travar o app inteiro com uma CSP estrita demais.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self' https://*.sentry.io https://*.ingest.sentry.io https://*.ingest.us.sentry.io",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          { key: "Content-Security-Policy", value: CSP },
        ],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Reduz ruído no log de build; deixa o upload de source maps silencioso
  // quando SENTRY_AUTH_TOKEN não está configurado (nesse caso ele é pulado
  // automaticamente, sem quebrar o build).
  silent: true,

  // Evita que o SDK do Sentry no cliente aumente muito o bundle.
  widenClientFileUpload: false,

  // Desativa o tunneling de requisições do Sentry por uma rota própria
  // (não precisamos disso agora e evita uma rota extra no projeto).
  tunnelRoute: undefined,
});
