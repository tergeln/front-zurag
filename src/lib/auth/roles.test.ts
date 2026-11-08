import { describe, expect, it } from "vitest";
import { canSellPhotos, hasRole, homePath, parsePortfolioUrls, safeNextPath } from "./roles";

describe("canSellPhotos", () => {
  const photographer = { role: "photographer", status: "active" } as const;

  it("allows an approved photographer", () => {
    expect(canSellPhotos(photographer, "approved")).toBe(true);
  });

  it("blocks pending, rejected and suspended photographers", () => {
    expect(canSellPhotos(photographer, "pending")).toBe(false);
    expect(canSellPhotos(photographer, "rejected")).toBe(false);
    expect(canSellPhotos(photographer, "suspended")).toBe(false);
    expect(canSellPhotos(photographer, null)).toBe(false);
  });

  it("blocks a customer even if a profile row says approved", () => {
    expect(canSellPhotos({ role: "customer", status: "active" }, "approved")).toBe(false);
  });

  it("blocks a suspended user account", () => {
    expect(canSellPhotos({ role: "photographer", status: "suspended" }, "approved")).toBe(false);
  });
});

describe("parsePortfolioUrls", () => {
  it("accepts 1 to 5 https links, one per line", () => {
    expect(parsePortfolioUrls("https://instagram.com/a\nhttps://behance.net/b")).toEqual([
      "https://instagram.com/a",
      "https://behance.net/b",
    ]);
  });

  it("rejects empty input, http links, non-URLs and more than 5 links", () => {
    expect(parsePortfolioUrls("   ")).toBeNull();
    expect(parsePortfolioUrls("http://insecure.example")).toBeNull();
    expect(parsePortfolioUrls("not a url")).toBeNull();
    expect(parsePortfolioUrls(Array.from({ length: 6 }, (_, i) => `https://x.com/${i}`).join("\n"))).toBeNull();
  });
});

describe("hasRole", () => {
  it("lets an active admin into admin pages", () => {
    expect(hasRole({ role: "admin", status: "active" }, ["admin"])).toBe(true);
  });

  it("blocks a customer from admin pages", () => {
    expect(hasRole({ role: "customer", status: "active" }, ["admin"])).toBe(false);
  });

  it("blocks a customer from photographer pages", () => {
    expect(hasRole({ role: "customer", status: "active" }, ["photographer"])).toBe(false);
  });

  it("blocks suspended and deleted users even with the right role", () => {
    expect(hasRole({ role: "admin", status: "suspended" }, ["admin"])).toBe(false);
    expect(hasRole({ role: "photographer", status: "deleted" }, ["photographer"])).toBe(false);
  });

  it("blocks when the profile row is missing", () => {
    expect(hasRole(null, ["customer"])).toBe(false);
    expect(hasRole(undefined, ["customer"])).toBe(false);
  });

  it("allows any of several roles", () => {
    expect(hasRole({ role: "photographer", status: "active" }, ["photographer", "admin"])).toBe(true);
  });
});

describe("safeNextPath", () => {
  it("keeps same-site paths", () => {
    expect(safeNextPath("/mn/account", "/mn")).toBe("/mn/account");
  });

  it("rejects external and protocol-relative URLs", () => {
    expect(safeNextPath("https://evil.example", "/mn")).toBe("/mn");
    expect(safeNextPath("//evil.example", "/mn")).toBe("/mn");
    expect(safeNextPath("/\\evil.example", "/mn")).toBe("/mn");
    expect(safeNextPath(null, "/mn")).toBe("/mn");
  });
});

describe("homePath", () => {
  it("sends each role to its own start page", () => {
    expect(homePath("admin", "mn")).toBe("/mn/admin");
    expect(homePath("photographer", "en")).toBe("/en/photographer");
    expect(homePath("customer", "mn")).toBe("/mn/account");
    expect(homePath(undefined, "mn")).toBe("/mn/account");
  });
});
