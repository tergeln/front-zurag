import { describe, expect, it } from "vitest";
import { evaluateCheck } from "./verify";

const row = (over: Record<string, unknown> = {}) => ({ payment_id: "123", payment_status: "PAID", payment_amount: "20000.00", payment_currency: "MNT", ...over });

describe("evaluateCheck", () => {
  it("accepts a PAID row for exactly the order total", () => {
    expect(evaluateCheck({ count: 1, rows: [row()] }, 20000)).toEqual({ paid: true, paymentId: "123", amount: 20000 });
  });

  it("is not paid when QPay lists nothing", () => {
    expect(evaluateCheck({ count: 0, rows: [] }, 20000)).toEqual({ paid: false, reason: "not_paid" });
  });

  it("ignores rows that are not PAID", () => {
    expect(evaluateCheck({ rows: [row({ payment_status: "NEW" }), row({ payment_status: "FAILED" })] }, 20000).paid).toBe(false);
  });

  it("rejects underpayment and overpayment", () => {
    expect(evaluateCheck({ rows: [row({ payment_amount: "19999" })] }, 20000)).toMatchObject({ paid: false, reason: "amount_mismatch" });
    expect(evaluateCheck({ rows: [row({ payment_amount: "20001" })] }, 20000)).toMatchObject({ paid: false, reason: "amount_mismatch" });
  });

  it("adds up split payments for the same invoice", () => {
    expect(evaluateCheck({ rows: [row({ payment_id: "1", payment_amount: 5000 }), row({ payment_id: "2", payment_amount: 15000 })] }, 20000)).toEqual({
      paid: true,
      paymentId: "1,2",
      amount: 20000,
    });
  });

  it("rejects other currencies and malformed answers", () => {
    expect(evaluateCheck({ rows: [row({ payment_currency: "USD" })] }, 20000)).toMatchObject({ paid: false, reason: "currency_mismatch" });
    expect(evaluateCheck(null, 20000)).toMatchObject({ paid: false, reason: "malformed" });
    expect(evaluateCheck({ rows: "PAID" }, 20000)).toMatchObject({ paid: false, reason: "malformed" });
    expect(evaluateCheck({ rows: [row({ payment_amount: "lots" })] }, 20000)).toMatchObject({ paid: false, reason: "malformed" });
  });
});
