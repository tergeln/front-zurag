import { describe, expect, it } from "vitest";
import { hasRole, safeNextPath } from "./roles";

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
