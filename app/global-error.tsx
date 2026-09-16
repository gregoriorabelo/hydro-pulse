"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body className="flex min-h-screen items-center justify-center bg-brand-deep p-6 text-white">
        <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/[0.03] p-10 text-center">
          <h1 className="text-2xl font-black">Algo deu errado</h1>
          <p className="mt-4 text-slate-400">
            Registramos o problema automaticamente. Tente recarregar a página.
          </p>
        </div>
      </body>
    </html>
  );
}
