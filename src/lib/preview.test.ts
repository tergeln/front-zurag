import { afterEach, describe, expect, it, vi } from "vitest";
import { isLocalPreview } from "./preview";

afterEach(() => vi.unstubAllEnvs());
describe("local guest preview", () => {
  it("allows a development preview without credentials", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");
    expect(isLocalPreview()).toBe(true);
  });
  it("never enables preview in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");
    expect(isLocalPreview()).toBe(false);
  });
  it("uses the real service when development credentials exist", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "test-key");
    expect(isLocalPreview()).toBe(false);
  });
});
