import { describe, expect, it } from "vitest";
import { signOrderId, verifyOrderSignature } from "./signature";

const secret = "a".repeat(64);
const order = "123e4567-e89b-12d3-a456-426614174000";

describe("callback signature", () => {
  it("verifies its own signature", async () => {
    expect(await verifyOrderSignature(order, await signOrderId(order, secret), secret)).toBe(true);
  });

  it("rejects a signature for another order, another secret, or garbage", async () => {
    const sig = await signOrderId(order, secret);
    expect(await verifyOrderSignature("123e4567-e89b-12d3-a456-426614174001", sig, secret)).toBe(false);
    expect(await verifyOrderSignature(order, sig, "b".repeat(64))).toBe(false);
    expect(await verifyOrderSignature(order, "0".repeat(64), secret)).toBe(false);
    expect(await verifyOrderSignature(order, "not-hex", secret)).toBe(false);
  });
});
