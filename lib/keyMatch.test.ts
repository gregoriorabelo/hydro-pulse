import { describe, expect, it } from "vitest";
import { keysMatch } from "./keyMatch";

describe("keysMatch", () => {
  it("matches identical keys", () => {
    expect(keysMatch("abc123", "abc123")).toBe(true);
  });

  it("rejects a null provided key", () => {
    expect(keysMatch("abc123", null)).toBe(false);
  });

  it("rejects keys of different length", () => {
    expect(keysMatch("abc123", "abc1234")).toBe(false);
  });

  it("rejects same-length keys with different content", () => {
    expect(keysMatch("abc123", "xyz789")).toBe(false);
  });

  it("is case-sensitive", () => {
    expect(keysMatch("AbC123", "abc123")).toBe(false);
  });
});
