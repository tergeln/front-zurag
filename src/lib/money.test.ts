import { describe, expect, it } from "vitest";
import { bpToPercent, percentToBp, splitSale } from "./money";

describe("splitSale", () => {
  it("matches the spec example: 10,000₮ at 20% → 8,000 / 2,000", () => {
    expect(splitSale(10000, 2000)).toEqual({ photographer: 8000, platform: 2000 });
  });

  it("always adds up to the price, with the rounding remainder going to the platform", () => {
    const s = splitSale(9999, 2000);
    expect(s.photographer + s.platform).toBe(9999);
    expect(s).toEqual({ photographer: 7999, platform: 2000 });
  });

  it("handles 0% and 100% commission", () => {
    expect(splitSale(5000, 0)).toEqual({ photographer: 5000, platform: 0 });
    expect(splitSale(5000, 10000)).toEqual({ photographer: 0, platform: 5000 });
  });

  it("rejects non-integer money and invalid rates", () => {
    expect(() => splitSale(10.5, 2000)).toThrow();
    expect(() => splitSale(-1, 2000)).toThrow();
    expect(() => splitSale(100, 10001)).toThrow();
  });
});

describe("percent ↔ basis points", () => {
  it("converts both ways", () => {
    expect(bpToPercent(2000)).toBe("20");
    expect(bpToPercent(1250)).toBe("12.5");
    expect(percentToBp("20")).toBe(2000);
    expect(percentToBp("12,5")).toBe(1250);
  });

  it("rejects out-of-range or over-precise values", () => {
    expect(percentToBp("101")).toBeNull();
    expect(percentToBp("-1")).toBeNull();
    expect(percentToBp("abc")).toBeNull();
    expect(percentToBp("12.345")).toBeNull();
  });
});
