import { describe, expect, it } from "vitest";
import { calculateAlert, calculateStatus } from "./reservoirStatus";

describe("calculateStatus", () => {
  it("returns Pausado regardless of level when the reservoir is paused", () => {
    expect(calculateStatus("pausado", true, 99, 30, 60, 95)).toBe("Pausado");
    expect(calculateStatus("pausado", false, 0, 30, 60, 95)).toBe("Pausado");
  });

  it("returns Sem sinal when there is no reading and the reservoir is active", () => {
    expect(calculateStatus("ativo", false, 0, 30, 60, 95)).toBe("Sem sinal");
  });

  it("classifies levels below 30% as Crítico", () => {
    expect(calculateStatus("ativo", true, 0, 30, 60, 95)).toBe("Crítico");
    expect(calculateStatus("ativo", true, 29.9, 30, 60, 95)).toBe("Crítico");
  });

  it("classifies 30% up to below 60% as Atenção", () => {
    expect(calculateStatus("ativo", true, 30, 30, 60, 95)).toBe("Atenção");
    expect(calculateStatus("ativo", true, 59.9, 30, 60, 95)).toBe("Atenção");
  });

  it("classifies 60% through 95% as Normal", () => {
    expect(calculateStatus("ativo", true, 60, 30, 60, 95)).toBe("Normal");
    expect(calculateStatus("ativo", true, 95, 30, 60, 95)).toBe("Normal");
  });

  it("classifies levels above 95% as Transbordamento", () => {
    expect(calculateStatus("ativo", true, 95.1, 30, 60, 95)).toBe("Transbordamento");
    expect(calculateStatus("ativo", true, 100, 30, 60, 95)).toBe("Transbordamento");
  });
});

describe("calculateAlert", () => {
  it("returns the matching message for each status", () => {
    expect(calculateAlert("Crítico")).toMatch(/crítico/i);
    expect(calculateAlert("Atenção")).toMatch(/atenção/i);
    expect(calculateAlert("Transbordamento")).toMatch(/transbordamento/i);
    expect(calculateAlert("Sem sinal")).toMatch(/leitura/i);
    expect(calculateAlert("Pausado")).toMatch(/pausado/i);
    expect(calculateAlert("Normal")).toMatch(/padrão esperado/i);
  });
});
