import { describe, expect, it } from "vitest";
import { calculateAlert, calculateStatus } from "./reservoirStatus";

describe("calculateStatus", () => {
  it("returns Pausado regardless of level when the reservoir is paused", () => {
    expect(calculateStatus("pausado", true, 90, 35, 60)).toBe("Pausado");
    expect(calculateStatus("pausado", false, 0, 35, 60)).toBe("Pausado");
  });

  it("returns Sem sinal when there is no reading and the reservoir is active", () => {
    expect(calculateStatus("ativo", false, 0, 35, 60)).toBe("Sem sinal");
  });

  it("returns Crítico at or below the critical threshold", () => {
    expect(calculateStatus("ativo", true, 35, 35, 60)).toBe("Crítico");
    expect(calculateStatus("ativo", true, 10, 35, 60)).toBe("Crítico");
  });

  it("returns Atenção between the critical and attention thresholds", () => {
    expect(calculateStatus("ativo", true, 60, 35, 60)).toBe("Atenção");
    expect(calculateStatus("ativo", true, 36, 35, 60)).toBe("Atenção");
  });

  it("returns Normal above the attention threshold", () => {
    expect(calculateStatus("ativo", true, 61, 35, 60)).toBe("Normal");
    expect(calculateStatus("ativo", true, 100, 35, 60)).toBe("Normal");
  });
});

describe("calculateAlert", () => {
  it("returns the matching message for each status", () => {
    expect(calculateAlert("Crítico")).toMatch(/crítico/i);
    expect(calculateAlert("Atenção")).toMatch(/atenção/i);
    expect(calculateAlert("Sem sinal")).toMatch(/leitura/i);
    expect(calculateAlert("Pausado")).toMatch(/pausado/i);
    expect(calculateAlert("Normal")).toMatch(/padrão esperado/i);
  });
});
