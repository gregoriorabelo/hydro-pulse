import { timingSafeEqual } from "node:crypto";

// Comparação em tempo constante, pra não vazar por timing quanto de uma
// chave está correta. Usada pra autenticação de sensores.
export function keysMatch(expectedKey: string, providedKey: string | null): boolean {
  if (!providedKey) {
    return false;
  }

  const expected = Buffer.from(expectedKey);
  const provided = Buffer.from(providedKey);

  if (expected.length !== provided.length) {
    return false;
  }

  return timingSafeEqual(expected, provided);
}
