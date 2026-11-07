import { describe, expect, it } from "vitest";
import { isSameOrigin } from "./http";

const req = (headers: Record<string, string>) => new Request("http://localhost:3000/api/x", { method: "POST", headers });

describe("isSameOrigin", () => {
  it("accepts requests from this site", () => {
    expect(isSameOrigin(req({ origin: "http://localhost:3000", host: "localhost:3000" }))).toBe(true);
    expect(isSameOrigin(req({ origin: "https://zurag.mn", host: "internal:8080", "x-forwarded-host": "zurag.mn" }))).toBe(true);
  });

  it("rejects other sites and requests without an Origin", () => {
    expect(isSameOrigin(req({ origin: "https://evil.example", host: "localhost:3000" }))).toBe(false);
    expect(isSameOrigin(req({ host: "localhost:3000" }))).toBe(false);
    expect(isSameOrigin(req({ origin: "null", host: "localhost:3000" }))).toBe(false);
  });
});
