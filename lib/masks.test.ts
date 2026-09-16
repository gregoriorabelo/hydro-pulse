import { describe, expect, it } from "vitest";
import { formatCNPJ, formatPhone } from "./masks";

describe("formatCNPJ", () => {
  it("formats progressively as digits are typed", () => {
    expect(formatCNPJ("1")).toBe("1");
    expect(formatCNPJ("12")).toBe("12");
    expect(formatCNPJ("123")).toBe("12.3");
    expect(formatCNPJ("12345")).toBe("12.345");
    expect(formatCNPJ("123456")).toBe("12.345.6");
    expect(formatCNPJ("12345678")).toBe("12.345.678");
    expect(formatCNPJ("123456789")).toBe("12.345.678/9");
    expect(formatCNPJ("12345678000199")).toBe("12.345.678/0001-99");
  });

  it("strips non-digit characters before formatting", () => {
    expect(formatCNPJ("12.345.678/0001-99")).toBe("12.345.678/0001-99");
    expect(formatCNPJ("abc12345678000199xyz")).toBe("12.345.678/0001-99");
  });

  it("truncates input beyond 14 digits", () => {
    expect(formatCNPJ("123456780001999999")).toBe("12.345.678/0001-99");
  });
});

describe("formatPhone", () => {
  it("returns empty string for empty input", () => {
    expect(formatPhone("")).toBe("");
  });

  it("formats progressively as digits are typed", () => {
    expect(formatPhone("1")).toBe("(1");
    expect(formatPhone("11")).toBe("(11");
    expect(formatPhone("119")).toBe("(11) 9");
    expect(formatPhone("11912345")).toBe("(11) 9123-45");
    expect(formatPhone("11912345678")).toBe("(11) 91234-5678");
  });

  it("truncates input beyond 11 digits", () => {
    expect(formatPhone("119123456789999")).toBe("(11) 91234-5678");
  });
});
