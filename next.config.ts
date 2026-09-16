import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";

const nextConfig: NextConfig = {
  /* config options here */
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
