"use client";

import { useEffect, useState } from "react";

type SchemaCheck = { label: string; ok: boolean };
type EnvCheck = { key: string; label: string; required: boolean; configured: boolean };

function StatusBadge({ ok }: { ok: boolean }) {
  return (
    <span
      className={`rounded-full border px-4 py-1.5 text-sm font-semibold ${
        ok
          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
          : "border-red-500/20 bg-red-500/10 text-red-300"
      }`}
    >
      {ok ? "OK" : "FALTANDO"}
    </span>
  );
}

export default function DiagnosticoPage() {
  const [schema, setSchema] = useState<SchemaCheck[]>([]);
  const [env, setEnv] = useState<EnvCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    fetch("/api/diagnostics")
      .then(async (response) => {
        if (response.status === 403) {
          setForbidden(true);
          setLoading(false);
          return null;
        }

        return response.json();
      })
      .then((data: { schema?: SchemaCheck[]; env?: EnvCheck[] } | null) => {
        if (!data) return;
        setSchema(data.schema ?? []);
        setEnv(data.env ?? []);
        setLoading(false);
      });
  }, []);

  if (forbidden) {
    return (
      <main>
        <h1 className="text-4xl font-black text-white">Diagnóstico</h1>
        <p className="mt-4 text-slate-400">
          Apenas a conta master tem acesso a esta área.
        </p>
      </main>
    );
  }

  const schemaIssues = schema.filter((c) => !c.ok).length;
  const envIssues = env.filter((c) => c.required && !c.configured).length;

  return (
    <main className="space-y-8">
      <div>
        <h1 className="text-4xl font-black text-white">Diagnóstico do Sistema</h1>
        <p className="mt-2 text-slate-400">
          Confere se o banco de dados e as configurações de ambiente estão em
          dia — visível só para a conta master.
        </p>
      </div>

      {loading ? (
        <p className="text-slate-400">Carregando…</p>
      ) : (
        <>
          <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-2xl font-black text-white">Estrutura do banco</h2>

              <span
                className={`text-sm font-semibold ${
                  schemaIssues === 0 ? "text-emerald-400" : "text-red-300"
                }`}
              >
                {schemaIssues === 0
                  ? "Tudo em dia"
                  : `${schemaIssues} pendência(s) encontrada(s)`}
              </span>
            </div>

            <div className="mt-6 space-y-3">
              {schema.map((check) => (
                <div
                  key={check.label}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-brand-petrol p-4"
                >
                  <p className="text-slate-200">{check.label}</p>
                  <StatusBadge ok={check.ok} />
                </div>
              ))}
            </div>

            {schemaIssues > 0 && (
              <p className="mt-6 text-sm text-slate-400">
                Alguma migração do diretório <code>db/</code> ainda não foi
                rodada no Neon. Veja o arquivo correspondente e execute-o no
                SQL Editor.
              </p>
            )}
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-2xl font-black text-white">Variáveis de ambiente</h2>

              <span
                className={`text-sm font-semibold ${
                  envIssues === 0 ? "text-emerald-400" : "text-red-300"
                }`}
              >
                {envIssues === 0
                  ? "Obrigatórias configuradas"
                  : `${envIssues} obrigatória(s) faltando`}
              </span>
            </div>

            <p className="mt-3 text-sm text-slate-500">
              Só confere se cada variável foi configurada — o valor nunca é
              mostrado aqui.
            </p>

            <div className="mt-6 space-y-3">
              {env.map((check) => (
                <div
                  key={check.key}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-brand-petrol p-4"
                >
                  <div>
                    <p className="text-slate-200">{check.label}</p>
                    <p className="text-xs text-slate-500">
                      {check.key} {check.required ? "(obrigatória)" : "(opcional)"}
                    </p>
                  </div>

                  <StatusBadge ok={check.configured} />
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </main>
  );
}
